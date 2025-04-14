const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks'); // Added for precise timing

// --- New Function: Get Unique ID from /auth/login ---
async function getUniqueId(mobileNumber) {
  const loginUrl = 'https://bluboy.ddns.net/test1/api/v1/auth/login';
  const loginPayload = {
    // Ensure mobile number is treated as a number if the API expects it
    mobile: Number(mobileNumber),
    // Using placeholder location, adjust if needed per mobile number
    location: { lat: '17.349271', long: '78.566871' }
  };

  try {
    const response = await axios.post(loginUrl, loginPayload, {
      headers: {
        'client-time': '1234',
        'app-key': 'testKey',              
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add this header if it's consistently required
        'NOTIFICATION-PERMISSION-STATUS': 'true',
      }
    });
    // Extract unique_id from the response data
    if (response.data && response.data.unique_id) {
        return response.data.unique_id;
    } else {
        throw new Error("unique_id not found in login response");
    }
  } catch (error) {
     // Minimal logging here, detailed logging happens in the main loop
    throw error; // Re-throw to be caught in the main loop
  }
}

// --- Modified Function: Get JWT token using unique_id ---
// Renamed parameter from player to uniqueId for clarity
async function getJwtToken(uniqueId) {
  const jwtUrl = 'https://bluboy.ddns.net/test1/api/v1/auth/verify_otp';
  // Updated payload to use unique_id instead of player_id
  const jwtPayload = {
        otp: "1234", // Assuming OTP is static for this script's purpose
        unique_id: uniqueId, // Using the unique_id obtained from login
        device_ip_address: "10.0.2.16", 
        device_os_version: "android", 
        device_unique_id: "29d8c15ff2c1a4ec", 
        installed_app_version: "4.3.042", 
        // Using a placeholder Firebase token here, adjust if needed
        latest_firebase_token: "cWzaGYjWTiaIMAwdoHrR6W:APA91bHfusx391ddZ43WUbpbVRZ1K8zyYb7KEYIOopVd0GzJ7V3iduU7aaKLdFHfzv3ubPLUlV7q_xhnEiCB9g6BBO5pfC2kPj4z0LH0YMXCD6RM-KWep8Y",
        rooted_device: false,
        location: { // Using placeholder location from cURL example
            lat: "17.4064967",
            long: "78.4772433"
        }
  };

  try {
    const response = await axios.post(jwtUrl, jwtPayload, {
      headers: {
            'client-time': '1234', 
            'app-key': 'test-key', 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Add other headers from cURL if necessary
            //'Connection': 'keep-alive',
            //'NOTIFICATION-PERMISSION-STATUS': 'true'
      }
    });
    // The JWT token is returned under the key 'auth_key'
    if (response.data && response.data.auth_key) {
        return response.data.auth_key;
    } else {
        throw new Error("auth_key not found in verify_otp response");
    }
  } catch (error) {
    // Reduced console noise for JWT errors, focus on final summary
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
    if (response.data && response.data.idToken) {
        return response.data.idToken;
    } else {
        throw new Error("idToken not found in Firebase response");
    }
  } catch (error) {
    // Reduced console noise for Firebase errors, focus on final summary
    throw error; // Re-throw to be caught in the main loop
  }
}

// --- Modified Main function ---
async function main() {
  // --- Input/Output Files ---
  // Assuming input file contains an array of mobile numbers (as strings or numbers)
  const usersFilePath = path.join(__dirname, "players_mobileno.json");
  const firebaseDataPath = path.join(__dirname, "firebasedata.json");

  // Load existing data if file exists (optional, adjust if needed)
  let tokens = {};
  // Read mobile numbers from the JSON file
  let mobileNumbers;
  try {
      const usersData = fs.readFileSync(usersFilePath, 'utf8');
      mobileNumbers = JSON.parse(usersData);
      if (!Array.isArray(mobileNumbers)) {
          throw new Error("Input file should contain a JSON array of mobile numbers.");
      }
  } catch (err) {
      console.error(`Error reading or parsing input file ${usersFilePath}:`, err.message);
      return; // Exit if input file is invalid
  }


  // --- Configuration ---
  const BATCH_SIZE = 10; // Process 10 requests concurrently
  const MAX_REQUESTS = 10; // Limit total numbers processed (adjust as needed)

  // Apply the MAX_REQUESTS limit
  const numbersToProcess = mobileNumbers.slice(0, MAX_REQUESTS);
  console.log(`Processing ${numbersToProcess.length} mobile numbers (limited by MAX_REQUESTS=${MAX_REQUESTS})`);

  const scriptStartTime = Date.now(); // For overall script duration
  console.log(`Starting process at ${new Date().toISOString()}`);

  // --- Stats Tracking ---
  let totalRequestsAttempted = 0; // Corresponds to attempts per mobile number
  let requestsSucceeded = 0;    // Corresponds to successful checks (all tokens obtained)
  let requestsFailed = 0;       // Corresponds to failures (at Login, JWT, or Firebase step)
  const requestProcessingStartTime = performance.now(); // Start timing for RPS calculation

  // Process in batches to control concurrency
  for (let i = 0; i < numbersToProcess.length; i += BATCH_SIZE) {
    const batch = numbersToProcess.slice(i, i + BATCH_SIZE);
    const currentBatchNumber = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`Processing batch ${currentBatchNumber}, numbers ${i} to ${i + batch.length - 1}`);

    const batchPromises = batch.map(async (mobileNumber) => {
      let uniqueId = null; // Track if login step succeeds
      let jwtToken = null; // Track if JWT step succeeds
      try {
        // Step 1: Get unique_id from login endpoint
        uniqueId = await getUniqueId(mobileNumber);
        if (!uniqueId) throw new Error("Failed to retrieve unique_id"); // Should not happen if getUniqueId throws

        // Step 2: Get JWT token using unique_id
        jwtToken = await getJwtToken(uniqueId);
        if (!jwtToken) throw new Error("Failed to retrieve JWT token"); // Should not happen if getJwtToken throws

        // Step 3: Get Firebase token using JWT token
        const firebaseToken = await getFirebaseToken(jwtToken);
        if (!firebaseToken) throw new Error("Failed to retrieve Firebase token"); // Should not happen if getFirebaseToken throws

        //console.log(`Mobile ${mobileNumber}: Tokens retrieved successfully`);
        return { mobileNumber, firebaseToken, success: true };

      } catch (error) {
        // Determine failure stage based on which variable is null
        let stage = 'Unknown';
        if (uniqueId === null) {
            stage = 'Login (/auth/login)';
        } else if (jwtToken === null) {
            stage = 'JWT (/auth/verify_otp)';
        } else {
            stage = 'Firebase (signInWithCustomToken)';
        }
        console.error(`Mobile ${mobileNumber}: Failed at ${stage} stage - ${error.message}`);
        // Include underlying error details if available (e.g., from Axios)
        if (error.response?.data) {
            console.error(`  -> API Response: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            console.error(`  -> No response received from API.`);
        }
        return { mobileNumber, success: false };
      }
    });

    console.log(`Waiting for batch ${currentBatchNumber} to complete...`);
    // Wait for all promises in this batch to complete
    const results = await Promise.all(batchPromises);

    // Update tokens object with successful results and track stats
    results.forEach(result => {
        totalRequestsAttempted++; // One attempt per mobile number in the batch
      if (result.success) {
        requestsSucceeded++;
        // Store mapping: mobileNumber -> firebaseToken
        tokens[result.mobileNumber] = result.firebaseToken;
      } else {
        requestsFailed++;
      }
    });

    // Write incremental update to file after each batch
    try {
        const jsonData = JSON.stringify(tokens, null, 2);
        fs.writeFileSync(firebaseDataPath, jsonData);
        console.log(`Updated ${firebaseDataPath} with ${Object.keys(tokens).length} total tokens (Batch ${currentBatchNumber} finished)`);
    } catch (writeError) {
        console.error(`Error writing to ${firebaseDataPath}:`, writeError.message);
        // Decide if you want to stop the script on write failure
    }
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
  console.log(`    ✓ all tokens obtained............: ${requestsSucceeded}`); // Wording change
  console.log(`    ✗ token retrieval failed.........: ${requestsFailed}\n`); // Failure could be Login, JWT or Firebase step

  // Wording change for http_reqs to reflect attempts per mobile number
  console.log(`    processing_attempts..............: ${totalRequestsAttempted}\t${requestsPerSec}/s`);
  console.log(`    processing_failed................: ${failurePercentage}%\t${requestsFailed} / ${totalRequestsAttempted}`);

  console.log(`\n-------------------------`);

}

// Execute the main function
main().catch(error => {
    console.error("An unexpected error occurred outside the main processing loop:", error);
});