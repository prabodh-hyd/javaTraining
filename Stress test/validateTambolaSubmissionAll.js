const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// --- Configuration ---
// TODO: Update this URL when testing Game Service endpoint in different environments.
const API_BASE_URL = 'https://bluboy.ddns.net/test1'; // URL for the game service
const VALIDATE_ENDPOINT = '/api/v1/game/tambola/validate';
const BATCH_SIZE = 20;    // Adjust concurrency as needed
const INPUT_FILES = {
    firebaseData: path.join(__dirname, 'firebasedata.json'),
    tickets: path.join(__dirname, 'tambolaTickets.json'), // Primary driver for tasks
    gameStart: path.join(__dirname, 'gameStartResults.json') // Optional file for score_id(for now cause that game/start doesn't seem to work at all).
};
// TODO: Choose a name for the output file
const OUTPUT_FILE = path.join(__dirname, 'validationResults.json');
const APP_KEY = 'test-key';
// Hardcoded values from K6 payload
const CLAIM_TYPE = "THIRD_ROW";
const LAST_CALLOUT_INDEX = 90;
const DEFAULT_SCORE_ID = 300; // Default if score_id is missing
// --- End Configuration ---

// --- Helper Functions ---

function readJsonFile(filePath) {
    try {
        // Attempt to read the file first to handle non-existence gracefully
        if (!fs.existsSync(filePath)) {
             console.warn(`Warning: Input file not found: ${filePath}. Proceeding without it.`);
             return null; // Return null if file doesn't exist
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Log error if file exists but fails to parse
        console.error(`Error reading or parsing file ${filePath}:`, error.message);
        return null; // Return null on parsing errors as well
    }
}

/**
 * Sends a Tambola validation claim request.
 */
async function validateClaim(playerId, authToken, tournamentId, subscriptionId, ticketId, scoreId, lifepackId, tournamentIndex) {
    const url = `${API_BASE_URL}${VALIDATE_ENDPOINT}`;
    const payload = {
        "ticket_id": ticketId,
        "claim_type": CLAIM_TYPE,
        "tournament_id": tournamentId,
        "subscription_id": subscriptionId,
        "score_id": scoreId, // Will be the actual or default value
        "last_callout_index": LAST_CALLOUT_INDEX,
        "lifepack_id": lifepackId // Should have been defaulted in the previous step if needed
    };
    const headers = {
        'client-time': '1234', // *** Original hardcoded value ***
        'app-key': APP_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    try {
        const response = await axios.post(url, payload, { headers });

        // Expecting submission_id in the response based on K6 script
        if (response.status === 200 && response.data && response.data.submission_id !== undefined) {
            return {
                playerId: playerId,
                tournamentIndex: tournamentIndex, // For structuring output
                submission_id: response.data.submission_id, // Extract submission_id
                success: true,
                status: response.status // Include status for clarity
            };
        } else {
            const errorDetail = response.data ? JSON.stringify(response.data) : 'No response data or submission_id missing';
            const status = response.status;
            console.error(`Player ${playerId} -> T ${tournamentId}, Index ${tournamentIndex}: Validation Failed - Status ${status} - ${errorDetail}`);
            return { playerId, tournamentId, tournamentIndex, success: false, status: status, error: `Status ${status}` };
        }
    } catch (error) {
        const status = error.response?.status || 0;
        const errorMessage = error.response ? `${status} - ${JSON.stringify(error.response.data)}` : error.message;
        console.error(`Player ${playerId} -> T ${tournamentId}, Index ${tournamentIndex}: Validation Request Error - ${errorMessage}`);
        return { playerId, tournamentId, tournamentIndex, success: false, status: status, error: errorMessage };
    }
}

// --- Main Execution Logic ---

async function main() {
    console.log("Starting Tambola validation claim process...");

    // 1. Load Input Data
    const firebaseTokens = readJsonFile(INPUT_FILES.firebaseData);
    const tambolaTickets = readJsonFile(INPUT_FILES.tickets);
    // Attempt to load gameStartResults, may be null if file missing/invalid
    const gameStartResults = readJsonFile(INPUT_FILES.gameStart);

    // Validate essential files
    if (!firebaseTokens || !tambolaTickets) {
        console.error("Failed to load essential input files: firebasedata.json or tambolaTickets.json. Exiting.");
        return;
    }
    // Log if gameStartResults failed to load (handled by readJsonFile warning already)
    if (!gameStartResults) {
         console.warn("Proceeding without data from gameStartResults.json. Score ID will default.");
    }


    // 2. Generate All Validation Tasks
    const allValidationTasks = [];
    const playerIdsWithTickets = Object.keys(tambolaTickets);

    if (playerIdsWithTickets.length === 0) {
        console.error("No players found in tambolaTickets.json. Exiting.");
        return;
    }
     console.log(`Found ticket data for ${playerIdsWithTickets.length} players.`);

    // Log score_id defaulting reasons only once for clarity if file failed completely
    let gameStartFileLoadFailed = !gameStartResults;
    const loggedMissingPlayers = new Set();
    const loggedMissingIndices = new Set();
    const loggedMissingScoreIds = new Set();

    for (const playerId of playerIdsWithTickets) {
        const authToken = firebaseTokens[playerId];
        if (!authToken) {
            console.warn(`No token found for player ${playerId}. Skipping validation claims for this player.`);
            continue;
        }

        const playerTickets = tambolaTickets[playerId];
        const tournamentIndices = Object.keys(playerTickets); // '1', '2', ...

        for (const tournamentIndex of tournamentIndices) {
            const ticketData = playerTickets[tournamentIndex];
            // Validate essential data from tambolaTickets.json for this entry
            if (!ticketData || ticketData.tournament_id === undefined || ticketData.subscription_id === undefined || ticketData.ticket_id === undefined || ticketData.lifepackId === undefined) {
                console.warn(`Skipping invalid/incomplete ticket entry for Player ${playerId}, Index ${tournamentIndex}`);
                continue;
            }

            const { tournament_id, subscription_id, ticket_id, lifepackId } = ticketData;

            // Determine score_id with fallback and logging logic
            let score_id;
            let scoreIdFound = false;
            let reason = '';

            if (gameStartResults && gameStartResults[playerId] && gameStartResults[playerId][tournamentIndex] && gameStartResults[playerId][tournamentIndex].score_id !== undefined) {
                 score_id = gameStartResults[playerId][tournamentIndex].score_id;
                 scoreIdFound = true;
            } else {
                 score_id = DEFAULT_SCORE_ID; // Assign default first
                 // Determine the specific reason only if not found
                 if (gameStartFileLoadFailed) {
                     reason = `gameStartResults.json failed to load or is null.`;
                     // No need to log per task if file failed entirely
                 } else if (!gameStartResults[playerId]) {
                     reason = `Player ${playerId} not found in gameStartResults.json.`;
                     if (!loggedMissingPlayers.has(playerId)) { console.warn(reason); loggedMissingPlayers.add(playerId); }
                 } else if (!gameStartResults[playerId][tournamentIndex]) {
                      const key = `${playerId}-${tournamentIndex}`;
                      reason = `Index ${tournamentIndex} not found for player ${playerId} in gameStartResults.json.`;
                      if (!loggedMissingIndices.has(key)) { console.warn(reason); loggedMissingIndices.add(key); }
                 } else { // score_id field missing
                      const key = `${playerId}-${tournamentIndex}`;
                      reason = `score_id missing for player ${playerId}, index ${tournamentIndex} in gameStartResults.json.`;
                      if (!loggedMissingScoreIds.has(key)) { console.warn(reason); loggedMissingScoreIds.add(key); }
                 }
            }

            allValidationTasks.push({
                playerId,
                authToken,
                tournamentId: tournament_id,
                subscriptionId: subscription_id,
                ticketId: ticket_id,
                scoreId: score_id, // Use found or default value
                lifepackId: lifepackId,
                tournamentIndex // Pass the original index key ('1', '2', ...)
            });
        }
    }

    const tasksToProcess = allValidationTasks;
    const totalTasks = tasksToProcess.length;

    console.log(`Generated ${totalTasks} total validation claim tasks.`);
    if (totalTasks === 0) {
        console.log("No valid tasks generated. Exiting.");
        return;
    }

    // 3. Process Tasks in Batches & Collect Stats
    const validationResults = {}; // Store results
    let completedTasks = 0; // Total requests *attempted*
    let requestsSucceeded = 0; // Count successful (status 200 w/ submission_id) requests
    let requestsFailed = 0;    // Count failed (non-200, missing submission_id, or network error) requests
    const requestStartTime = performance.now();

    for (let i = 0; i < totalTasks; i += BATCH_SIZE) {
        const batch = tasksToProcess.slice(i, i + BATCH_SIZE);
        const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalTasks / BATCH_SIZE);

        console.log(`Processing Batch ${currentBatchNumber}/${totalBatches} (Tasks ${i + 1} to ${i + batch.length})...`);

        const batchPromises = batch.map(task =>
            validateClaim(
                task.playerId,
                task.authToken,
                task.tournamentId,
                task.subscriptionId,
                task.ticketId,
                task.scoreId,
                task.lifepackId,
                task.tournamentIndex
            )
        );

        const batchResults = await Promise.all(batchPromises);

        // Process results from the completed batch and update stats
        batchResults.forEach(result => {
            completedTasks++; // Increment for every processed request attempt
            if (result.success) {
                // Success means status 200 AND submission_id present
                requestsSucceeded++;
                const { playerId, tournamentIndex, submission_id } = result;
                if (!validationResults[playerId]) {
                    validationResults[playerId] = {};
                }
                // Store only submission_id
                validationResults[playerId][tournamentIndex] = {
                    submission_id: submission_id
                };
            } else {
                requestsFailed++;
                // Failed results are logged in validateClaim
            }
        });

        console.log(`Batch ${currentBatchNumber} finished. ${completedTasks}/${totalTasks} tasks processed so far.`);
    }

    const requestEndTime = performance.now();

    // 4. Write Output File
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(validationResults, null, 2));
        console.log(`Validation claim results (submission_id only) successfully written to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`Error writing output file ${OUTPUT_FILE}:`, error.message);
    }

    // 5. Report Timing and Stats (k6 Style)
    const totalDurationMs = requestEndTime - requestStartTime;
    const totalDurationSec = totalDurationMs / 1000;
    const requestsPerSec = totalDurationSec > 0 ? (completedTasks / totalDurationSec).toFixed(6) : 0;
    // Calculate percentages based on completed tasks
    const successPercentage = completedTasks > 0 ? ((requestsSucceeded / completedTasks) * 100).toFixed(2) : "0.00";
    const failurePercentage = completedTasks > 0 ? ((requestsFailed / completedTasks) * 100).toFixed(2) : "0.00";

    console.log(`\n--- Execution Summary ---`);
    // Timing
    const minutes = Math.floor(totalDurationSec / 60);
    const seconds = (totalDurationSec % 60).toFixed(2);
    console.log(`Total time for API requests: ${minutes}m ${seconds}s (${totalDurationMs.toFixed(0)} ms)`);

    // Stats Section (Checking for Status 200 and submission_id)
    console.log(`\n  TAMBOLA VALIDATION RESULTS\n`);
    console.log(`    checks...........................: ${successPercentage}% ✓ ${requestsSucceeded} / ${completedTasks}`);
    console.log(`    ✓ status is 200 w/ submission_id: ${requestsSucceeded}`); // Success check
    console.log(`    ✗ failed or missing submission_id: ${requestsFailed}\n`);    // Failure check

    console.log(`    http_reqs........................: ${completedTasks}\t${requestsPerSec}/s`);
    console.log(`    http_req_failed..................: ${failurePercentage}%\t${requestsFailed} / ${completedTasks}`);

    console.log(`\n-------------------------`);
}

// Execute the main function
main().catch(error => {
    console.error("An unexpected error occurred in the main function:", error);
});