const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// --- Configuration ---
// TODO: Update this URL for testing in different environments.
const API_BASE_URL = 'https://bluboy.ddns.net/test1'; // URL for the game service
const VALIDATE_ENDPOINT = '/api/v1/game/tambola/validate'; // Same endpoint, using GET
const BATCH_SIZE = 20;    // Adjust concurrency as needed
const INPUT_FILES = {
    firebaseData: path.join(__dirname, 'firebasedata.json'),
    validations: path.join(__dirname, 'validationResults.json') // Input from previous step
};
// TODO: Choose a name for the output file
const OUTPUT_FILE = path.join(__dirname, 'validationStatus.json');
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
 * Gets the status of a Tambola validation claim.
 */
async function getValidationStatus(playerId, authToken, submissionId, tournamentIndex) {
    const url = `${API_BASE_URL}${VALIDATE_ENDPOINT}`;
    const headers = {
        'client-time': '1234',
        'app-key': APP_KEY,
        // 'Content-Type': 'application/json', // Not usually needed for GET
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'submission-id': submissionId.toString() // Send submission ID in header
    };

    try {
        // GET request with custom headers
        const response = await axios.get(url, { headers });

        // Expecting validations_status in the response
        if (response.status === 200 && response.data && response.data.validations_status !== undefined) {
            return {
                playerId: playerId,
                tournamentIndex: tournamentIndex, // For structuring output
                validations_status: response.data.validations_status, // Extract status
                success: true,
                status: 200
            };
        } else {
            const errorDetail = response.data ? JSON.stringify(response.data) : 'No response data or validations_status missing';
            console.error(`Player ${playerId} -> Submission ${submissionId}: Status Check Failed - Status ${response.status} - ${errorDetail}`);
            return { playerId, submissionId, tournamentIndex, success: false, status: response.status, error: `Status ${response.status}` };
        }
    } catch (error) {
        const status = error.response?.status || 0;
        const errorMessage = error.response ? `${status} - ${JSON.stringify(error.response.data)}` : error.message;
        console.error(`Player ${playerId} -> Submission ${submissionId}: Status Check Request Error - ${errorMessage}`);
        return { playerId, submissionId, tournamentIndex, success: false, status: status, error: errorMessage };
    }
}

// --- Main Execution Logic ---

async function main() {
    console.log("Starting validation status check process...");

    // 1. Load Input Data
    const firebaseTokens = readJsonFile(INPUT_FILES.firebaseData);
    const validationResults = readJsonFile(INPUT_FILES.validations);

    // Validate essential files
    if (!firebaseTokens || !validationResults) {
        console.error("Failed to load essential input files: firebasedata.json or validationResults.json. Exiting.");
        return;
    }

    // 2. Generate All Status Check Tasks
    const allStatusTasks = [];
    const playerIdsWithValidations = Object.keys(validationResults);

    if (playerIdsWithValidations.length === 0) {
        console.error("No players found in validationResults.json. Exiting.");
        return;
    }
     console.log(`Found validation submissions for ${playerIdsWithValidations.length} players.`);

    for (const playerId of playerIdsWithValidations) {
        const authToken = firebaseTokens[playerId];
        if (!authToken) {
            console.warn(`No token found for player ${playerId}. Skipping status checks for this player.`);
            continue;
        }

        const playerValidations = validationResults[playerId];
        const tournamentIndices = Object.keys(playerValidations); // '1', '2', ...

        for (const tournamentIndex of tournamentIndices) {
            const validationData = playerValidations[tournamentIndex];
            // Validate essential data from validationResults.json
            if (!validationData || validationData.submission_id === undefined) {
                console.warn(`Skipping invalid/incomplete validation entry for Player ${playerId}, Index ${tournamentIndex}`);
                continue;
            }

            const submissionId = validationData.submission_id;

            allStatusTasks.push({
                playerId,
                authToken,
                submissionId,
                tournamentIndex // Pass the original index key ('1', '2', ...)
            });
        }
    }

    const tasksToProcess = allStatusTasks;
    const totalTasks = tasksToProcess.length;

    console.log(`Generated ${totalTasks} total validation status check tasks.`);
    if (totalTasks === 0) {
        console.log("No valid tasks generated. Exiting.");
        return;
    }

    // 3. Process Tasks in Batches & Collect Stats
    const statusResultsOutput = {}; // Store results for file
    let completedTasks = 0;
    let requestsSucceeded = 0; // Count successful (status 200) requests
    let requestsFailed = 0;    // Count failed (non-200 status) requests
    const requestStartTime = performance.now();

    for (let i = 0; i < totalTasks; i += BATCH_SIZE) {
        const batch = tasksToProcess.slice(i, i + BATCH_SIZE);
        const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(totalTasks / BATCH_SIZE);

        console.log(`Processing Batch ${currentBatchNumber}/${totalBatches} (Tasks ${i + 1} to ${i + batch.length})...`);

        const batchPromises = batch.map(task =>
            getValidationStatus(
                task.playerId,
                task.authToken,
                task.submissionId,
                task.tournamentIndex
            )
        );

        const batchResults = await Promise.all(batchPromises);

        // Process results and update stats
        batchResults.forEach(result => {
            completedTasks++; // Increment for every processed request
            if (result.success) {
                requestsSucceeded++;
                const { playerId, tournamentIndex, validations_status } = result;
                if (!statusResultsOutput[playerId]) {
                    statusResultsOutput[playerId] = {};
                }
                // Store the extracted status
                statusResultsOutput[playerId][tournamentIndex] = {
                    validations_status: validations_status
                };
            } else {
                requestsFailed++;
            }
            // Failed results are already logged in getValidationStatus
        });

        console.log(`Batch ${currentBatchNumber} finished. ${completedTasks}/${totalTasks} tasks processed so far.`);
    }

    const requestEndTime = performance.now();

    // 4. Write Output File
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(statusResultsOutput, null, 2));
        console.log(`Validation status results successfully written to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`Error writing output file ${OUTPUT_FILE}:`, error.message);
    }

    // 5. Report Timing and Stats
    const totalDurationMs = requestEndTime - requestStartTime;
    const totalDurationSec = totalDurationMs / 1000;
    const requestsPerSec = totalDurationSec > 0 ? (completedTasks / totalDurationSec).toFixed(6) : 0;
    const successPercentage = completedTasks > 0 ? ((requestsSucceeded / completedTasks) * 100).toFixed(2) : "0.00";
    const failurePercentage = completedTasks > 0 ? ((requestsFailed / completedTasks) * 100).toFixed(2) : "0.00";


    console.log(`\n--- Execution Summary ---`);
    // Timing
    const minutes = Math.floor(totalDurationSec / 60);
    const seconds = (totalDurationSec % 60).toFixed(2);
    console.log(`Total time for API requests: ${minutes}m ${seconds}s (${totalDurationMs.toFixed(0)} ms)`);

    // Stats Section
    console.log(`\n  TOTAL RESULTS\n`);
    console.log(`    checks...........................: ${successPercentage}% ✓ ${requestsSucceeded} / ${completedTasks}`);
    console.log(`    ✓ status is 200..................: ${requestsSucceeded}`);
    console.log(`    ✗ status is not 200..............: ${requestsFailed}\n`); // Simple check based on success/fail

    console.log(`    http_reqs........................: ${completedTasks}\t${requestsPerSec}/s`);
    console.log(`    http_req_failed..................: ${failurePercentage}%\t${requestsFailed} / ${completedTasks}`);


    console.log(`\n-------------------------`);
}

// Execute the main function
main().catch(error => {
    console.error("An unexpected error occurred in the main function:", error);
});