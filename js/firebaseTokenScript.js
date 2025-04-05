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
  // Object to store tokens; keys will be iteration numbers i.e; player ID's, values are Firebase tokens
  let tokens = {};

  // Define the number of iterations; For now I'm going with the 2 iteration to first test on the two people
  const iterations = 2;
  const usersFilePath = path.join(__dirname, "users.json");
  const usersData = fs.readFileSync(usersFilePath, 'utf8');
  const playerIds = JSON.parse(usersData);  

  // Loop through the number of iterations limit count
  let requestCount = 500;

  for (const playerId of playerIds) {
    
    let i = playerId; // Use the player ID as the key

    requestCount--;
    if (requestCount < 0) {
      break;
    }

    if (requestCount % 100 === 0) {
      console.log(`Remaining requests: ${requestCount} - playerId: ${playerId}`);
    }

    try {
      // First, get the JWT token
      // This await waits for the respective execution to complete in this case HTTP resquests
      const jwtToken = await getJwtToken(playerId);
      
      console.log(`Iteration ${i}: JWT token received`);

      // Next, use the JWT token to get the Firebase token
      const firebaseToken = await getFirebaseToken(jwtToken);
      
      // Save the Firebase token with iteration number as key because we are going to use them as the corresponsding player ID's.
      tokens[i] = firebaseToken;
    } catch (error) {
      console.error(`Iteration ${i}: An error occurred. Skipping this iteration.`);
    }
  }
  // Doing the pretty print to be more readable and to be more viually appealing.
  let jsonData = JSON.stringify(tokens, null, 2);

  // Print the final JSON object
  console.log("Final tokens JSON:", jsonData);
  // Getting the current directory we can add the different directory as the second parameter and use mkdir process.
  const filePath = path.join(__dirname, "firebasedata.json");

  fs.writeFile(filePath, jsonData, (err) => {
  if (err) {
      console.error("Error writing the file:", err);
  } else {
      console.log(`JSON file has been saved at: ${filePath}`);
  }
  });
}

// Execute the main function
main();
