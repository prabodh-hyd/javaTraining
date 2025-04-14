const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// --- Configuration ---
// TODO: Update this URL if your API endpoint is different
const API_BASE_URL = 'https://bluboy.ddns.net/test1'; // Base URL from K6 script
const CREATE_TOURNAMENT_ENDPOINT = '/api/v1/admin/tournaments'; // Endpoint from K6
const BATCH_SIZE = 20;    // Adjust concurrency as needed
const INPUT_FILES = {
    firebaseData: path.join(__dirname, 'firebasedata.json'), // Source of truth for players to process
    // players: path.join(__dirname, 'players.json') // No longer needed to drive the main loop
};
// TODO: Choose a name for the output file
const OUTPUT_FILE = path.join(__dirname, 'createdTournaments.json');
// Note: app-key and client-time were NOT in the K6 headers for this request
// --- End Configuration ---

// Static payload based on the K6 script example
const TOURNAMENT_PAYLOAD = {
    "tournament_id": "11158",
    "tournament_name": "Test Tambola",
    "details": "Test Tournament for k6 to test the Tournament subscription.",
    "start_time": "1744639200", // Example: Update if needed
    "end_time": "1744640100",   // Example: Update if needed
    "game_id": "7",
    "min_player_count": 1,
    "max_player_count": 100,
    "tickets_per_player": 1,
    "tournament_type": "FREE",
    "status": "ACTIVE",
    "winning_template_id": "3",
    "allowed_games_count": 1,
    "allowed_coupon_types": "discount, free_entry",
    "player_groups": [
        "1",
        "1"
    ]
};

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
 * Creates a single tournament.
 */
async function createTournament(playerId, authToken, playerIndex) {
    const url = `${API_BASE_URL}${CREATE_TOURNAMENT_ENDPOINT}`;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };

    try {
        const response = await axios.post(url, TOURNAMENT_PAYLOAD, { headers });

        if (response.status === 201 && response.data && Array.isArray(response.data.tournament_id_list) && response.data.tournament_id_list.length > 0) {
            const createdTournamentId = response.data.tournament_id_list[0];
            return {
                playerIndex: playerIndex, // 1-based index of the *processed* player
                tournamentId: createdTournamentId,
                success: true,
                status: 201
            };
        } else {
            const errorDetail = response.data ? JSON.stringify(response.data) : 'No response data or tournament_id_list missing/invalid';
            console.error(`Player ${playerId} (Processed Index ${playerIndex}): Create Failed - Status ${response.status} - ${errorDetail}`);
            return { playerId, playerIndex, success: false, status: response.status, error: `Status ${response.status}` };
        }
    } catch (error) {
        const status = error.response?.status || 0;
        const errorMessage = error.response ? `${status} - ${JSON.stringify(error.response.data)}` : error.message;
        console.error(`Player ${playerId} (Processed Index ${playerIndex}): Create Request Error - ${errorMessage}`);
        return { playerId, playerIndex, success: false, status: status, error: errorMessage };
    }
}

// --- Main Execution Logic ---

async function main() {
    console.log("Starting tournament creation process...");

    // 1. Load Input Data
    const firebaseTokens = readJsonFile(INPUT_FILES.firebaseData);
    // players.json is no longer read directly to drive the loop

    // Validate essential file
    if (!firebaseTokens) {
        console.error("Failed to load essential input file: firebasedata.json. Exiting.");
        return;
    }

    // **MODIFICATION**: Get players directly from tokens file
    const playersWithTokens = Object.keys(firebaseTokens);

    // 2. Generate All Create Tournament Tasks based on players with tokens
    const allCreateTasks = [];

    if (playersWithTokens.length === 0) {
        console.error("No players with tokens found in firebasedata.json. Exiting.");
        return;
    }
    console.log(`Found tokens for ${playersWithTokens.length} players in firebasedata.json.`);

    // Iterate through players who HAVE tokens
    for (let i = 0; i < playersWithTokens.length; i++) {
        const playerId = playersWithTokens[i];
        const authToken = firebaseTokens[playerId]; // Token is guaranteed

        allCreateTasks.push({
            playerId,
            authToken,
            playerIndex: i + 1 // 1-based index based on *actual* players being processed
        });
    }

    const tasksToProcess = allCreateTasks;
    const totalTasks = tasksToProcess.length; // Total requests will match players with tokens

    console.log(`Generated ${totalTasks} total tournament creation tasks.`);
    if (totalTasks === 0) {
        console.log("No tasks generated. Exiting."); // Should not happen if checks above pass
        return;
    }

    // 3. Process Tasks in Batches & Collect Stats
    const createdTournamentsOutput = {};
    let completedTasks = 0;
    let requestsSucceeded = 0;
    let requestsFailed = 0;
    const requestStartTime = performance.now();

    for (let i = 0; i < totalTasks; i += BATCH_SIZE) {
        const batch = tasksToProcess.slice(i, i + BATCH_SIZE);
        const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalTasks / BATCH_SIZE);

        console.log(`Processing Batch ${currentBatchNumber}/${totalBatches} (Tasks ${i + 1} to ${i + batch.length})...`);

        const batchPromises = batch.map(task =>
            createTournament(
                task.playerId,
                task.authToken,
                task.playerIndex // Pass the correct 1-based index
            )
        );

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(result => {
            completedTasks++;
            if (result.success) {
                requestsSucceeded++;
                // Use the 1-based playerIndex (relative to processed players) as string key
                createdTournamentsOutput[result.playerIndex.toString()] = {
                    id: [result.tournamentId]
                };
            } else {
                requestsFailed++;
            }
        });

        console.log(`Batch ${currentBatchNumber} finished. ${completedTasks}/${totalTasks} tasks processed so far.`);
    }

    const requestEndTime = performance.now();

    // 4. Write Output File
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(createdTournamentsOutput, null, 2));
        console.log(`Created tournament results successfully written to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`Error writing output file ${OUTPUT_FILE}:`, error.message);
    }

    // 5. Report Timing and Stats (remains the same, based on completedTasks)
    const totalDurationMs = requestEndTime - requestStartTime;
    const totalDurationSec = totalDurationMs / 1000;
    const requestsPerSec = totalDurationSec > 0 ? (completedTasks / totalDurationSec).toFixed(6) : 0;
    const successPercentage = completedTasks > 0 ? ((requestsSucceeded / completedTasks) * 100).toFixed(2) : "0.00";
    const failurePercentage = completedTasks > 0 ? ((requestsFailed / completedTasks) * 100).toFixed(2) : "0.00";

    console.log(`\n--- Execution Summary ---`);
    const minutes = Math.floor(totalDurationSec / 60);
    const seconds = (totalDurationSec % 60).toFixed(2);
    console.log(`Total time for API requests: ${minutes}m ${seconds}s (${totalDurationMs.toFixed(0)} ms)`);

    console.log(`\n  TOTAL RESULTS\n`);
    console.log(`    checks...........................: ${successPercentage}% ✓ ${requestsSucceeded} / ${completedTasks}`);
    console.log(`    ✓ status is 201..................: ${requestsSucceeded}`);
    console.log(`    ✗ status is not 201..............: ${requestsFailed}\n`);

    console.log(`    http_reqs........................: ${completedTasks}\t${requestsPerSec}/s`);
    console.log(`    http_req_failed..................: ${failurePercentage}%\t${requestsFailed} / ${completedTasks}`);

    console.log(`\n-------------------------`);
}

main().catch(error => {
    console.error("An unexpected error occurred in the main function:", error);
});