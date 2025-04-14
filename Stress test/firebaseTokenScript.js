const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks'); // Added for precise timing

// Function to get the JWT token from the first request
async function getJwtToken(player) {
  // Replace the URL and request body with your actual endpoint and payload
  //const jwtUrl = 'http://localhost:9010/api/v1/auth/verify_otp';
  const jwtUrl = 'https://bluboy.ddns.net/test1/api/v1/auth/verify_otp'; // Replace with your actual URL
  const jwtPayload = {
        otp: "1234",
        player_id: player,
        device_ip_address: "192.163.12.1",
        device_os_version: "android",
        device_unique_id: "55321124688976",
        installed_app_version: "1.67",
        latest_firebase_token: "eOHex4YNSB6j94L9FO1I-F:APA91bGgEAaYCEUgq9N6l2O1Mp643QRP-WHEmohnyWEyT3y11eS6qsL1RKtyks-7CbiF9LdYkbSoGs-U6Aiy6bnI276AjzSLeyG9P25fD4FfrxxMyQ0pUBM",
        rooted_device: false,
        location: {
            lat: "7.436",
            long: "73.656"
        }
  };

  try {
    const response = await axios.post(jwtUrl, jwtPayload, {
      headers: {
            'client-time': '1234',
            'app-key': 'testKey',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
      }
    });
    // The JWT token is returned under the key 'auth_key'
    return response.data.auth_key;
  } catch (error) {
    // Reduced console noise for JWT errors, focus on final summary
    // console.error("Error obtaining JWT token:", error.message);
    throw error; // Re-throw to be caught in the main loop
  }
}

// Function to get the Firebase token using the JWT token
async function getFirebaseToken(jwtToken) {

  const firebaseUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyC-92iBazzpzemXeGGUBRspFLAaDkhKviY';
  const firebasePayload = {
    token: jwtToken,  // Using the JWT token in the request body
    returnSecureToken: true
  };

  try {
    const response = await axios.post(firebaseUrl, firebasePayload, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    // The Firebase token is returned under the key 'idToken'
    return response.data.idToken;
  } catch (error) {
    // Reduced console noise for Firebase errors, focus on final summary
    // console.error("Error obtaining Firebase token:", error.message);
    throw error; // Re-throw to be caught in the main loop
  }
}

// Main function to execute the flow in a loop
async function main() {
  const usersFilePath = path.join(__dirname, "players.json");
  const firebaseDataPath = path.join(__dirname, "firebasedata.json");

  // Load existing data if file exists
  let tokens = {};
  const usersData = fs.readFileSync(usersFilePath, 'utf8');
  const playerIds = JSON.parse(usersData);

  // Configuration
  const BATCH_SIZE = 10; // Process 10 requests concurrently
  const MAX_REQUESTS = 10;

  // Apply the MAX_REQUESTS limit
  const idsToProcess = playerIds.slice(0, MAX_REQUESTS);
  console.log(`Processing ${idsToProcess.length} player IDs (limited by MAX_REQUESTS=${MAX_REQUESTS})`);

  const scriptStartTime = Date.now(); // For overall script duration
  console.log(`Starting process at ${new Date().toISOString()}`);

  // --- Stats Tracking ---
  let totalRequestsAttempted = 0; // Corresponds to http_reqs
  let requestsSucceeded = 0;    // Corresponds to successful checks (both tokens obtained)
  let requestsFailed = 0;       // Corresponds to failures (at JWT or Firebase step)
  const requestProcessingStartTime = performance.now(); // Start timing for RPS calculation

  // Process in batches to control concurrency
  for (let i = 0; i < idsToProcess.length; i += BATCH_SIZE) {
    const batch = idsToProcess.slice(i, i + BATCH_SIZE);
    const currentBatchNumber = Math.floor(i/BATCH_SIZE) + 1;
    console.log(`Processing batch ${currentBatchNumber}, IDs ${i} to ${i + batch.length - 1}`);

    const batchPromises = batch.map(async (playerId) => {
      let jwtToken = null; // Declare here to check if first step failed
      try {
        // Get JWT token and Firebase token
        jwtToken = await getJwtToken(playerId);
        const firebaseToken = await getFirebaseToken(jwtToken);
        //console.log(`Player ${playerId}: Tokens retrieved successfully`);

        return { playerId, firebaseToken, success: true };
      } catch (error) {
        // Log specific error type if needed, otherwise just mark as failed
        const stage = jwtToken === null ? 'JWT' : 'Firebase';
        console.error(`Player ${playerId}: Failed at ${stage} stage - ${error.message}`);
        return { playerId, success: false };
      }
    });

    console.log(`Waiting for batch ${currentBatchNumber} to complete...`);
    // Wait for all promises in this batch to complete
    const results = await Promise.all(batchPromises);

    // Update tokens object with successful results and track stats
    results.forEach(result => {
        totalRequestsAttempted++; // One attempt per player ID in the batch
      if (result.success) {
        requestsSucceeded++;
        tokens[result.playerId] = result.firebaseToken;
      } else {
        requestsFailed++;
      }
    });

    // Write incremental update to file after each batch
    const jsonData = JSON.stringify(tokens, null, 2);
    fs.writeFileSync(firebaseDataPath, jsonData);
    console.log(`Updated firebasedata.json with ${Object.keys(tokens).length} total tokens (Batch ${currentBatchNumber} finished)`);
  }

  const requestProcessingEndTime = performance.now(); // End timing for RPS
  const scriptEndTime = Date.now(); // For overall script duration

  // --- Calculate Stats ---
  const requestProcessingDurationMs = requestProcessingEndTime - requestProcessingStartTime;
  const requestProcessingDurationSec = requestProcessingDurationMs / 1000;
  const requestsPerSec = requestProcessingDurationSec > 0 ? (totalRequestsAttempted / requestProcessingDurationSec).toFixed(6) : 0;

  // Calculate percentages based on completed tasks
  const successPercentage = totalRequestsAttempted > 0 ? ((requestsSucceeded / totalRequestsAttempted) * 100).toFixed(2) : "0.00";
  const failurePercentage = totalRequestsAttempted > 0 ? ((requestsFailed / totalRequestsAttempted) * 100).toFixed(2) : "0.00";

  // Overall script duration
  const totalScriptDurationSec = (scriptEndTime - scriptStartTime) / 1000;
  const minutes = Math.floor(totalScriptDurationSec / 60);
  const seconds = (totalScriptDurationSec % 60).toFixed(2);


  console.log(`\nProcess complete. Collected ${Object.keys(tokens).length} tokens.`);
  console.log(`Total script execution time: ${minutes}m ${seconds}s`);

  // --- K6-Style Summary Output ---
  console.log(`\n--- Execution Summary ---`);
  // Timing for the request processing part
  const reqMinutes = Math.floor(requestProcessingDurationSec / 60);
  const reqSeconds = (requestProcessingDurationSec % 60).toFixed(2);
  console.log(`Total time for token requests: ${reqMinutes}m ${reqSeconds}s (${requestProcessingDurationMs.toFixed(0)} ms)`);

  // Stats Section
  console.log(`\n  TOKEN RETRIEVAL RESULTS\n`);
  console.log(`    checks...........................: ${successPercentage}% ✓ ${requestsSucceeded} / ${totalRequestsAttempted}`);
  console.log(`    ✓ both tokens obtained...........: ${requestsSucceeded}`);
  console.log(`    ✗ token retrieval failed.........: ${requestsFailed}\n`); // Failure could be JWT or Firebase step

  console.log(`    http_reqs........................: ${totalRequestsAttempted}\t${requestsPerSec}/s`); // Represents one full attempt (JWT + Firebase) per player ID
  console.log(`    http_req_failed..................: ${failurePercentage}%\t${requestsFailed} / ${totalRequestsAttempted}`); // Represents failed attempts

  console.log(`\n-------------------------`);

}

// Execute the main function
main().catch(error => {
    console.error("An unexpected error occurred outside the main processing loop:", error);
});