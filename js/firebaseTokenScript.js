const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
    console.error("Error obtaining JWT token:", error.message);
    throw error;
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
    console.error("Error obtaining Firebase token:", error.message);
    throw error;
  }
}

// Main function to execute the flow in a loop
async function main() {
  const usersFilePath = path.join(__dirname, "users.json");
  const firebaseDataPath = path.join(__dirname, "firebasedata.json");
  
  // Load existing data if file exists
  let tokens = {};
  const usersData = fs.readFileSync(usersFilePath, 'utf8');
  const playerIds = JSON.parse(usersData);

  // Configuration
  const BATCH_SIZE = 500; // Process 10 requests concurrently
  const MAX_REQUESTS = 500;
  
  // Apply the MAX_REQUESTS limit
  const idsToProcess = playerIds.slice(0, MAX_REQUESTS);
  console.log(`Processing ${idsToProcess.length} player IDs (limited by MAX_REQUESTS=${MAX_REQUESTS})`);
  
  const startTime = Date.now();
  console.log(`Starting process at ${new Date().toISOString()}`);

  // Process in batches to control concurrency
  for (let i = 0; i < idsToProcess.length; i += BATCH_SIZE) {
    const batch = idsToProcess.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}, IDs ${i} to ${i + batch.length - 1}`);
    
    const batchPromises = batch.map(async (playerId) => {
      try {
        // Get JWT token and Firebase token
        const jwtToken = await getJwtToken(playerId);
        const firebaseToken = jwtToken;//await getFirebaseToken(jwtToken);
        //console.log(`Player ${playerId}: Tokens retrieved successfully`);
        
        return { playerId, firebaseToken, success: true };
      } catch (error) {
        console.error(`Player ${playerId}: Failed - ${error.message}`);
        return { playerId, success: false };
      }
    });
    
    console.log(`Waiting for batch ${Math.floor(i/BATCH_SIZE) + 1} to complete...`);
    // Wait for all promises in this batch to complete
    const results = await Promise.all(batchPromises);
    
    // Update tokens object with successful results
    results.forEach(result => {
      if (result.success) {
        tokens[result.playerId] = result.firebaseToken;
      }
    });
    
    // Write incremental update to file after each batch
    const jsonData = JSON.stringify(tokens, null, 2);
    fs.writeFileSync(firebaseDataPath, jsonData);
    console.log(`Updated firebasedata.json with ${Object.keys(tokens).length} total tokens`);
  }
  
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;
  
  console.log(`Process complete. Collected ${Object.keys(tokens).length} tokens.`);
  console.log(`Total execution time: ${minutes}m ${seconds.toFixed(2)}s`);
}

// Execute the main function
main();
