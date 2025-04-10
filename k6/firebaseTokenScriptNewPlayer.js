const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Starting mobile number
let mobileNumber = 9177770644;

// Function to get the unique_ID for the new player
async function getUniqueID(phoneNumber) {
  const jwtUrl = 'https://bluboy.ddns.net/test1/api/v1/auth/login';
  const jwtPayload = {
    "mobile": phoneNumber,
    "location": {
      "lat": "17.349271",
      "long": "78.566871"
    }
  };

  try {
    const response = await axios.post(jwtUrl, jwtPayload, {
      headers: {
        'client-time': '1733156642463',
        'app-key': 'testKey',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    });
    return response.data.unique_id;
  } catch (error) {
    console.error(`Error obtaining unique ID for ${phoneNumber}:`, error.message);
    throw error;
  }
}

// Function to get the JWT token from the first request
async function getJwtToken(Id) {
  const jwtUrl = 'https://bluboy.ddns.net/test1/api/v1/auth/verify_otp';
  const jwtPayload = {
    "device_ip_address": "10.0.2.16",
    "device_os_version": "deviceUniqueId",
    "device_unique_id": "29d8c15ff2c1a4ec",
    "installed_app_version": "4.3.042",
    "latest_firebase_token": "cWzaGYjWTiaIMAwdoHrR6W:APA91bHfusx391ddZ43WUbpbVRZ1K8zyYb7KEYIOopVd0GzJ7V3iduU7aaKLdFHfzv3ubPLUlV7q_xhnEiCB9g6BBO5pfC2kPj4z0LH0YMXCD6RM-KWep8Y",
    "location": {"lat": "17.4064967", "long": "78.4772433"},
    "otp": "1234",
    "unique_id": Id,
    "rooted_device": false
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
    token: jwtToken,
    returnSecureToken: true
  };

  try {
    const response = await axios.post(firebaseUrl, firebasePayload, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response.data.idToken;
  } catch (error) {
    console.error("Error obtaining Firebase token:", error.message);
    throw error;
  }
}

// Main function with batch processing
async function main(batchSize = 2, maxRequests = 2) {
  const firebaseDataPath = path.join(__dirname, "firebasedata.json");
  const playersFilePath = path.join(__dirname, "players.json"); // Define path for players.json
  
  // Load existing tokens if file exists
  let tokens = {};
  if (fs.existsSync(firebaseDataPath)) {
    const existingData = fs.readFileSync(firebaseDataPath, 'utf8');
    tokens = JSON.parse(existingData);
  }

  const startTime = Date.now();
  console.log(`Starting process at ${new Date().toISOString()}`);
  console.log(`Configuration: Batch Size = ${batchSize}, Max Requests = ${maxRequests}`);

  // Generate array of mobile numbers to process
  const mobileNumbers = Array.from(
    { length: maxRequests },
    () => mobileNumber++
  );

  // Process in batches
  for (let i = 0; i < mobileNumbers.length; i += batchSize) {
    const batch = mobileNumbers.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}: Mobile numbers ${batch[0]} to ${batch[batch.length - 1]}`);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (phoneNumber) => {
      try {
        const uniqueId = await getUniqueID(phoneNumber);
        const jwtToken = await getJwtToken(uniqueId);
        const firebaseToken = await getFirebaseToken(jwtToken);
        return { phoneNumber, firebaseToken, success: true };
      } catch (error) {
        console.error(`Failed to process ${phoneNumber}: ${error.message}`);
        return { phoneNumber, success: false };
      }
    });
    
    const results = await Promise.all(batchPromises);
    
    // Update tokens with successful results
    results.forEach(result => {
      if (result.success) {
        tokens[result.phoneNumber] = result.firebaseToken;
      }
    });
    
    // Write to file after each batch
    const jsonData = JSON.stringify(tokens, null, 2);
    fs.writeFileSync(firebaseDataPath, jsonData);
    console.log(`Batch ${Math.floor(i/batchSize) + 1} completed. Total tokens: ${Object.keys(tokens).length}`);
  }

  try {
    const playersJsonData = JSON.stringify(mobileNumbers); // Convert the array generated earlier
    fs.writeFileSync(playersFilePath, playersJsonData);
    // console.log(`Generated ${playersFilePath}`); // Optional: uncomment if you want confirmation
  } catch (fileError) {
    console.error(`Failed to write ${playersFilePath}:`, fileError);
  }

  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;
  
  console.log(`Process complete. Collected ${Object.keys(tokens).length} tokens`);
  console.log(`Total execution time: ${minutes}m ${seconds.toFixed(2)}s`);
}

// Execute the main function with custom batch size and max requests
main(2, 2).catch(error => {
  console.error('Main process failed:', error);
});