const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// --- Configuration ---
// TODO: Update this URL to your Game Service endpoint if testing in a different environment
const API_BASE_URL = 'https://bluboy.ddns.net/test1'; // URL for the game service
const GAME_START_ENDPOINT = '/api/v1/game/start';
const BATCH_SIZE = 20;    // Adjust concurrency as needed
const INPUT_FILES = {
    firebaseData: path.join(__dirname, 'firebasedata.json'),
    subscriptions: path.join(__dirname, 'subscriptionResults.json') // Input from subscription step
};
// TODO: Choose a name for the output file
const OUTPUT_FILE = path.join(__dirname, 'gameStartResults.json');
const APP_KEY = '6bc41d032fb5a6f2c22488d8337cf85837c18518'; //
const GAME_ID_PAYLOAD = 7; // Hardcoded game_id cause it's only tambola for now.
// --- End Configuration ---

// --- Helper Functions ---

function readJsonFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
             console.error(`Error: Input file not found: ${filePath}`);
             return null;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading or parsing file ${filePath}:`, error.message);
        return null;
    }
}


/**
 * Sends a request to start the game for a tournament subscription.
 * Returns score_id along with identifiers needed for structuring results.
 */
async function startGame(playerId, authToken, tournamentId, tournamentIndex) {
    const url = `${API_BASE_URL}${GAME_START_ENDPOINT}`;
    const payload = {
        "tournament_id": tournamentId,
        "game_id": GAME_ID_PAYLOAD
    };
    const headers = {
        // Using a dynamic timestamp might be more realistic if the server uses it
        'client-time': '1234',
        'app-key': APP_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Connection: 'keep-alive',
        'NOTIFICATION-PERMISSION-STATUS': 'true', // Note: Axios handles connection management, this header might not be necessary client-side
        Authorization: `Bearer ${authToken}`
    };

    try {
        const response = await axios.post(url, payload, { headers });

        // Success requires status 200 AND score_id to be present
        if (response.status === 200 && response.data && response.data.score_id !== undefined) {
            return {
                playerId: playerId,
                tournamentIndex: tournamentIndex, // Needed to structure the output object
                score_id: response.data.score_id, // The essential data for this step's output
                success: true,
                status: response.status // Include status for clarity
            };
        } else {
            const errorDetail = response.data ? JSON.stringify(response.data) : 'No response data or score_id missing';
            const status = response.status;
            console.error(`Player ${playerId} -> T ${tournamentId}: GameStart Failed - Status ${status} - ${errorDetail}`);
            return { playerId, tournamentId, tournamentIndex, success: false, status: status, error: `Status ${status}` };
        }
    } catch (error) {
        const status = error.response?.status || 0;
        const errorMessage = error.response ? `${status} - ${JSON.stringify(error.response.data)}` : error.message;
        console.error(`Player ${playerId} -> T ${tournamentId}: GameStart Request Error - ${errorMessage}`);
        // Include tournamentId in failure case for better logging context if needed
        return { playerId, tournamentId, tournamentIndex, success: false, status: status, error: errorMessage };
    }
}


// --- Main Execution Logic ---

async function main() {
    console.log("Starting game start process...");

    // 1. Load Input Data
    const firebaseTokens = readJsonFile(INPUT_FILES.firebaseData);
    const subscriptionResults = readJsonFile(INPUT_FILES.subscriptions);

    if (!firebaseTokens || !subscriptionResults) {
        console.error("Failed to load firebasedata.json or subscriptionResults.json. Exiting.");
        return;
    }

    // 2. Generate All Game Start Tasks
    const allGameStartTasks = [];
    const playerIdsWithSubscriptions = Object.keys(subscriptionResults);

    if (playerIdsWithSubscriptions.length === 0) {
        console.error("No players found in subscriptionResults.json. Exiting.");
        return;
    }
     console.log(`Found subscriptions for ${playerIdsWithSubscriptions.length} players.`);

    for (const playerId of playerIdsWithSubscriptions) {
        const authToken = firebaseTokens[playerId];
        if (!authToken) {
            console.warn(`No token found in firebasedata.json for player ${playerId}. Skipping game start for this player.`);
            continue;
        }

        const playerSubscriptions = subscriptionResults[playerId];
        const tournamentIndices = Object.keys(playerSubscriptions);

        for (const tournamentIndex of tournamentIndices) {
             const subscriptionData = playerSubscriptions[tournamentIndex];
             // Need to ensure tournament_id exists in input to make the API call
             if (!subscriptionData || !subscriptionData.tournament_id) {
                 console.warn(`Skipping entry for Player ${playerId}, Index ${tournamentIndex} due to missing tournament_id in input`);
                 continue;
             }

            const tournamentId = subscriptionData.tournament_id;

            allGameStartTasks.push({
                playerId,
                authToken,
                tournamentId, // Still needed for the API call
                tournamentIndex // Passed as string from JSON key
            });
        }
    }

    const tasksToProcess = allGameStartTasks;
    const totalTasks = tasksToProcess.length;

    console.log(`Generated ${totalTasks} total game start tasks.`);
    if (totalTasks === 0) {
        console.log("No valid tasks generated. Exiting.");
        return;
    }

    // 3. Process Tasks in Batches & Collect Stats
    const gameStartResults = {}; // Store results
    let completedTasks = 0; // Total requests *attempted*
    let requestsSucceeded = 0; // Count successful (status 200 w/ score_id) requests
    let requestsFailed = 0;    // Count failed (non-200, missing score_id, or network error) requests
    const requestStartTime = performance.now();

    for (let i = 0; i < totalTasks; i += BATCH_SIZE) {
        const batch = tasksToProcess.slice(i, i + BATCH_SIZE);
        const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalTasks / BATCH_SIZE);

        console.log(`Processing Batch ${currentBatchNumber}/${totalBatches} (Tasks ${i + 1} to ${i + batch.length})...`);

        const batchPromises = batch.map(task =>
            startGame(
                task.playerId,
                task.authToken,
                task.tournamentId,
                task.tournamentIndex // Pass tournamentIndex (string)
            )
        );

        const batchResults = await Promise.all(batchPromises);

        // Process results from the completed batch and update stats
        batchResults.forEach(result => {
            completedTasks++; // Increment for every processed request attempt
            if (result.success) {
                // Success means status 200 AND score_id present
                requestsSucceeded++;
                const { playerId, tournamentIndex, score_id } = result;
                if (!gameStartResults[playerId]) {
                    gameStartResults[playerId] = {};
                }
                // Use the tournamentIndex (which is a string key from subscriptions)
                gameStartResults[playerId][tournamentIndex] = {
                    score_id: score_id // Persist only the score_id
                };
            } else {
                requestsFailed++;
                // Failed results are already logged in startGame
            }
        });

        console.log(`Batch ${currentBatchNumber} finished. ${completedTasks}/${totalTasks} tasks processed so far.`);
    }

    const requestEndTime = performance.now();

    // 4. Write Output File
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gameStartResults, null, 2));
        console.log(`Game start results (score_id only) successfully written to ${OUTPUT_FILE}`);
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

    // Stats Section (Checking for Status 200 and score_id)
    console.log(`\n  GAME START RESULTS\n`);
    console.log(`    checks...........................: ${successPercentage}% ✓ ${requestsSucceeded} / ${completedTasks}`);
    console.log(`    ✓ status is 200 w/ score_id....: ${requestsSucceeded}`); // Success check
    console.log(`    ✗ failed or missing score_id...: ${requestsFailed}\n`);    // Failure check

    console.log(`    http_reqs........................: ${completedTasks}\t${requestsPerSec}/s`);
    console.log(`    http_req_failed..................: ${failurePercentage}%\t${requestsFailed} / ${completedTasks}`);

    console.log(`\n-------------------------`);
}

// Execute the main function
main().catch(error => {
    console.error("An unexpected error occurred in the main function:", error);
});