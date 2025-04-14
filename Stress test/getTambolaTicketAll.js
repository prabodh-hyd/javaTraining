const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// --- Configuration ---
const API_BASE_URL = 'https://bluboy.ddns.net/test1'; // URL for the game service
const GET_TICKET_ENDPOINT = '/api/v1/game/tambola/ticket';
const BATCH_SIZE = 20;    // Adjust concurrency as needed
const INPUT_FILES = {
    firebaseData: path.join(__dirname, 'firebasedata.json'),
    subscriptions: path.join(__dirname, 'subscriptionResults.json') // Input from previous step
};
// TODO: Choose a name for the output file
const OUTPUT_FILE = path.join(__dirname, 'tambolaTickets.json');
// Ensure this App Key is correct for the Tambola Ticket endpoint
const APP_KEY = 'test-key';
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
 * Gets a Tambola ticket for a given subscription.
 */
async function getTambolaTicket(playerId, authToken, tournamentId, subscriptionId, lifepackId, tournamentIndex) {
    const url = `${API_BASE_URL}${GET_TICKET_ENDPOINT}`;
    const headers = {
        'client-time': '1234', // *** Original hardcoded value ***
        'app-key': APP_KEY,
        // 'Content-Type': 'application/json', // Content-Type is not typically needed for GET
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'tournament-id': tournamentId.toString(), // Ensure headers are strings
        'lifepack-id': lifepackId.toString()   // Ensure headers are strings
    };

    try {
        // For GET requests with custom headers, pass them in the config object
        const response = await axios.get(url, { headers });

        // Success requires status 200 AND ticket-id to be present
        if (response.status === 200 && response.data && response.data['ticket-id'] !== undefined) {
            return {
                playerId: playerId,
                tournamentIndex: tournamentIndex, // Keep original index for structuring output
                tournament_id: tournamentId,
                subscription_id: subscriptionId,
                lifepackId: lifepackId, // Include the lifepackId used in the request
                ticket_id: response.data['ticket-id'], // Extract ticket ID
                success: true,
                status: response.status // Include status for clarity
            };
        } else {
            const errorDetail = response.data ? JSON.stringify(response.data) : 'No response data or ticket-id missing';
            const status = response.status;
            console.error(`Player ${playerId} -> T ${tournamentId}: TicketGet Failed - Status ${status} - ${errorDetail}`);
            return { playerId, tournamentId, tournamentIndex, success: false, status: status, error: `Status ${status}` };
        }
    } catch (error) {
        const status = error.response?.status || 0;
        const errorMessage = error.response ? `${status} - ${JSON.stringify(error.response.data)}` : error.message;
        console.error(`Player ${playerId} -> T ${tournamentId}: TicketGet Request Error - ${errorMessage}`);
        return { playerId, tournamentId, tournamentIndex, success: false, status: status, error: errorMessage };
    }
}

// --- Main Execution Logic ---

async function main() {
    console.log("Starting Tambola ticket retrieval process...");

    // 1. Load Input Data
    const firebaseTokens = readJsonFile(INPUT_FILES.firebaseData);
    const subscriptionResults = readJsonFile(INPUT_FILES.subscriptions);

    if (!firebaseTokens || !subscriptionResults) {
        console.error("Failed to load firebasedata.json or subscriptionResults.json. Exiting.");
        return;
    }

    // 2. Generate All Ticket Retrieval Tasks
    const allTicketTasks = [];
    const playerIdsWithSubscriptions = Object.keys(subscriptionResults);

    if (playerIdsWithSubscriptions.length === 0) {
        console.error("No players found in subscriptionResults.json. Exiting.");
        return;
    }
     console.log(`Found subscriptions for ${playerIdsWithSubscriptions.length} players.`);

    for (const playerId of playerIdsWithSubscriptions) {
        const authToken = firebaseTokens[playerId];
        if (!authToken) {
            console.warn(`No token found in firebasedata.json for player ${playerId}. Skipping tickets for this player.`);
            continue; // Skip player if no token
        }

        const playerSubscriptions = subscriptionResults[playerId];
        const tournamentIndices = Object.keys(playerSubscriptions); // These are '1', '2', ...

        for (const tournamentIndex of tournamentIndices) {
            const subscriptionData = playerSubscriptions[tournamentIndex];
            if (!subscriptionData || !subscriptionData.tournament_id || !subscriptionData.subscription_id) {
                 console.warn(`Skipping invalid subscription entry for Player ${playerId}, Index ${tournamentIndex}`);
                 continue;
            }

            const tournamentId = subscriptionData.tournament_id;
            const subscriptionId = subscriptionData.subscription_id;
            // Read lifepackId from input, default to 0 if null or undefined
            // Ensure lifepackId is treated correctly (might be 0, null, or a number)
            const lifepackId = subscriptionData.lifepackId ?? 0;

            allTicketTasks.push({
                playerId,
                authToken,
                tournamentId,
                subscriptionId,
                lifepackId, // Use the potentially defaulted value
                tournamentIndex // Pass the original index key ('1', '2', ...)
            });
        }
    }

    const tasksToProcess = allTicketTasks;
    const totalTasks = tasksToProcess.length;

    console.log(`Generated ${totalTasks} total ticket retrieval tasks.`);
    if (totalTasks === 0) {
        console.log("No valid tasks generated. Exiting.");
        return;
    }

    // 3. Process Tasks in Batches & Collect Stats
    const ticketResults = {}; // Store results in the desired nested format
    let completedTasks = 0; // Total requests *attempted*
    let requestsSucceeded = 0; // Count successful (status 200 w/ ticket-id) requests
    let requestsFailed = 0;    // Count failed (non-200, missing ticket-id, or network error) requests
    const requestStartTime = performance.now();

    for (let i = 0; i < totalTasks; i += BATCH_SIZE) {
        const batch = tasksToProcess.slice(i, i + BATCH_SIZE);
        const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalTasks / BATCH_SIZE);

        console.log(`Processing Batch ${currentBatchNumber}/${totalBatches} (Tasks ${i + 1} to ${i + batch.length})...`);

        const batchPromises = batch.map(task =>
            getTambolaTicket( // This now correctly uses the hardcoded client-time
                task.playerId,
                task.authToken,
                task.tournamentId,
                task.subscriptionId,
                task.lifepackId,
                task.tournamentIndex // Pass the index key
            )
        );

        const batchResults = await Promise.all(batchPromises);

        // Process results from the completed batch and update stats
        batchResults.forEach(result => {
            completedTasks++; // Increment for every processed request attempt
            if (result.success) {
                // Success means status 200 AND ticket-id present
                requestsSucceeded++;
                const { playerId, tournamentIndex, tournament_id, subscription_id, lifepackId, ticket_id } = result;
                // Initialize player object if it doesn't exist
                if (!ticketResults[playerId]) {
                    ticketResults[playerId] = {};
                }
                // Store result using original tournament index key ('1', '2', ...)
                ticketResults[playerId][tournamentIndex] = {
                    tournament_id: tournament_id,
                    subscription_id: subscription_id,
                    lifepackId: lifepackId, // Store the lifepackId used
                    ticket_id: ticket_id
                };
            } else {
                requestsFailed++;
                // Failed results are already logged in getTambolaTicket
            }
        });

        console.log(`Batch ${currentBatchNumber} finished. ${completedTasks}/${totalTasks} tasks processed so far.`);
    }

    const requestEndTime = performance.now();

    // 4. Write Output File
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(ticketResults, null, 2));
        console.log(`Tambola ticket results successfully written to ${OUTPUT_FILE}`);
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

    // Stats Section (Checking for Status 200 and ticket-id)
    console.log(`\n  TAMBOLA TICKET RESULTS\n`);
    console.log(`    checks...........................: ${successPercentage}% ✓ ${requestsSucceeded} / ${completedTasks}`);
    console.log(`    ✓ status is 200 w/ ticket-id...: ${requestsSucceeded}`); // Success check
    console.log(`    ✗ failed or missing ticket-id..: ${requestsFailed}\n`);    // Failure check

    console.log(`    http_reqs........................: ${completedTasks}\t${requestsPerSec}/s`);
    console.log(`    http_req_failed..................: ${failurePercentage}%\t${requestsFailed} / ${completedTasks}`);

    console.log(`\n-------------------------`);
}

// Execute the main function
main().catch(error => {
    console.error("An unexpected error occurred in the main function:", error);
});