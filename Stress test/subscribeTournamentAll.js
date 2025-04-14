const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks'); // For more precise timing

// --- Configuration ---
const API_BASE_URL = 'https://bluboy.ddns.net/test1'; // Change if you want to test in another environment
const SUBSCRIBE_ENDPOINT = '/api/v1/tournaments/subscribe';
const BATCH_SIZE = 20;    // <<<--- CHANGE THIS VALUE FOR CONCURRENT REQUESTS PER BATCH
const INPUT_FILES = {
    firebaseData: path.join(__dirname, 'firebasedata.json'), // Primary source for players now
    tournaments: path.join(__dirname, 'createdTournaments.json')
};
const OUTPUT_FILE = path.join(__dirname, 'subscriptionResults.json');
// --- End Configuration ---

// --- Helper Functions ---

/**
 * Reads and parses a JSON file.
 * @param {string} filePath - Path to the JSON file.
 * @returns {object | Array | null} Parsed JSON data or null on error.
 */
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
 * Makes a single tournament subscription request.
 * @param {string} playerId - The ID of the player subscribing (will be string from JSON key).
 * @param {string} authToken - The Firebase auth token for the player.
 * @param {number} tournamentId - The ID of the tournament to subscribe to.
 * @param {number} tournamentIndex - The 0-based index of the tournament in the list.
 * @returns {Promise<object>} - Promise resolving with { playerId, tournamentId, tournamentIndex (1-based), subscriptionId, success: true, status: 200 } or { success: false, status, error }
 */
async function subscribeToTournament(playerId, authToken, tournamentId, tournamentIndex) {
    const url = `${API_BASE_URL}${SUBSCRIBE_ENDPOINT}`;
    const payload = { "tournament_id": tournamentId };
    const headers = {
        'client-time': '1234',
        'app-key': 'test-key', // Note: K6 used 'testKey', ensure this is correct for subscribe
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    try {
        const response = await axios.post(url, payload, { headers });
        // Success is strictly status 200 based on common API practices for this type of action
        if (response.status === 200 && response.data) {
            return {
                playerId: playerId, // Already a string
                tournamentId: response.data.tournament_id,
                subscriptionId: response.data.subscription_id,
                tournamentIndex: tournamentIndex + 1, // 1-based index for output
                success: true,
                status: response.status // Include status for clarity
            };
        } else {
            // Log non-200 responses as errors for tracking
            const errorDetail = response.data ? JSON.stringify(response.data) : 'No response data';
            console.error(`Player ${playerId} -> T ${tournamentId}: Subscribe Failed - Status ${response.status} - ${errorDetail}`);
            return { playerId, tournamentId, tournamentIndex, success: false, status: response.status, error: `Status ${response.status}` };
        }
    } catch (error) {
        const status = error.response?.status || 0;
        const errorMessage = error.response ? `${status} - ${JSON.stringify(error.response.data)}` : error.message;
        console.error(`Player ${playerId} -> T ${tournamentId}: Subscribe Request Error - ${errorMessage}`);
        return { playerId, tournamentId, tournamentIndex, success: false, status: status, error: errorMessage };
    }
}


// --- Main Execution Logic ---

async function main() {
    console.log("Starting tournament subscription process...");

    // 1. Load Input Data
    const firebaseTokens = readJsonFile(INPUT_FILES.firebaseData);
    const createdTournamentsData = readJsonFile(INPUT_FILES.tournaments);

    if (!firebaseTokens || !createdTournamentsData) {
        console.error("Failed to load firebasedata.json or createdTournaments.json. Exiting.");
        return;
    }

    // Extract all tournament IDs into a flat list
    const allTournamentIds = Object.values(createdTournamentsData).flatMap(entry => entry.id);
    if (!allTournamentIds || allTournamentIds.length === 0) {
        console.error("No tournament IDs found in createdTournaments.json. Exiting.");
        return;
    }

    // Get players directly from the keys of the firebaseTokens object
    const playerIdsWithTokens = Object.keys(firebaseTokens);
    if (playerIdsWithTokens.length === 0) {
        console.error("No player IDs found in firebasedata.json (no tokens loaded). Exiting.");
        return;
    }

    console.log(`Loaded tokens for ${playerIdsWithTokens.length} players from firebasedata.json.`);
    console.log(`Loaded ${allTournamentIds.length} tournaments.`);

    // 2. Generate All Subscription Tasks
    const allSubscriptionTasks = [];
    for (const playerId of playerIdsWithTokens) {
        const authToken = firebaseTokens[playerId]; // Token is guaranteed to exist here
        for (let i = 0; i < allTournamentIds.length; i++) {
            const tournamentId = allTournamentIds[i];
            allSubscriptionTasks.push({
                playerId: playerId, // Player ID is already the string key
                authToken,
                tournamentId,
                tournamentIndex: i // 0-based index internally
            });
        }
    }

    const tasksToProcess = allSubscriptionTasks;
    const totalTasks = tasksToProcess.length;

    console.log(`Generated ${totalTasks} total subscription tasks (${playerIdsWithTokens.length} players * ${allTournamentIds.length} tournaments).`);
    if (totalTasks === 0) {
        console.log("No tasks generated. Exiting.");
        return;
    }

    // 3. Process Tasks in Batches & Collect Stats
    const subscriptionResults = {};
    let completedTasks = 0; // Total requests *attempted*
    let requestsSucceeded = 0; // Count successful (status 200) requests
    let requestsFailed = 0;    // Count failed (non-200 status or network error) requests
    const requestStartTime = performance.now();

    for (let i = 0; i < totalTasks; i += BATCH_SIZE) {
        const batch = tasksToProcess.slice(i, i + BATCH_SIZE);
        const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalTasks / BATCH_SIZE);

        console.log(`Processing Batch ${currentBatchNumber}/${totalBatches} (Tasks ${i + 1} to ${i + batch.length})...`);

        const batchPromises = batch.map(task =>
            subscribeToTournament(task.playerId, task.authToken, task.tournamentId, task.tournamentIndex)
        );

        const batchResults = await Promise.all(batchPromises);

        // Process results and update stats
        batchResults.forEach(result => {
            completedTasks++; // Increment for every processed request attempt
            if (result.success) {
                // Success means status 200 and valid response structure
                requestsSucceeded++;
                const { playerId, tournamentId, subscriptionId, tournamentIndex } = result;
                if (!subscriptionResults[playerId]) {
                    subscriptionResults[playerId] = {};
                }
                subscriptionResults[playerId][tournamentIndex.toString()] = { // Use 1-based index as key
                    tournament_id: tournamentId,
                    subscription_id: subscriptionId
                };
            } else {
                requestsFailed++;
                // Failed results are already logged in subscribeToTournament
            }
        });

        console.log(`Batch ${currentBatchNumber} finished. ${completedTasks}/${totalTasks} tasks processed so far.`);
    }

    const requestEndTime = performance.now();

    // 4. Write Output File
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(subscriptionResults, null, 2));
        console.log(`Subscription results successfully written to ${OUTPUT_FILE}`);
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

    // Stats Section (Checking for Status 200)
    console.log(`\n  SUBSCRIPTION RESULTS\n`);
    console.log(`    checks...........................: ${successPercentage}% ✓ ${requestsSucceeded} / ${completedTasks}`);
    console.log(`    ✓ status is 200..................: ${requestsSucceeded}`); // Check is specifically for 200
    console.log(`    ✗ status is not 200..............: ${requestsFailed}\n`);

    console.log(`    http_reqs........................: ${completedTasks}\t${requestsPerSec}/s`);
    console.log(`    http_req_failed..................: ${failurePercentage}%\t${requestsFailed} / ${completedTasks}`);

    console.log(`\n-------------------------`);
}

// Execute the main function
main().catch(error => {
    console.error("An unexpected error occurred in the main function:", error);
});