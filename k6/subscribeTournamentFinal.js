import { writeString } from 'k6/x/file';
import http from 'k6/http';
import { check } from 'k6';

const tokens = JSON.parse(open('firebasedata.json'));
const players = JSON.parse(open('players.json'));
const ids = JSON.parse(open(`createdTournaments2.json`));// Change the file according to your testing needs to subscribe to the tournament
export default function () {
    // Load the JSON file from the same directory
    
    if (tokens === null) {
        console.log(`VU ${__VU} - Error: Couldn’t load tokens.json. Check if it exists in /home/prabodh/create/`);
        return;  // Exit the function gracefully
    }

    // Get the player ID for this VU (convert __VU to string since JSON keys are strings)
    let playerId = __VU.toString();
    
    // Grab the auth token for this player
    const authToken = tokens[players[__VU - 1]];
    
    // If no token exists for this player, log it and skip. Just a precautionary measure.
    if (!authToken) {
        console.log(`Yo, VU ${__VU} - No token found for player_id ${playerId}, skipping this one`);
        return;
    }
    
    const tournament_id = ids["id"][0];
    // Set up the tournament subscription request
    const tournamentUrl = 'http://localhost:9014/api/v1/tournaments/subscribe';
    const params = {
        headers: {
            'client-time': '1234',
            'app-key': 'test-key', 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`  // Sending the token in the header
        }
    };
    
    const payload = JSON.stringify({
        "tournament_id": tournament_id
    });
    
    // Fire off the request
    let response = http.post(tournamentUrl, payload, params);
    console.log(`VU ${__VU} - Tournament Response: ${response.status} - ${response.body}`);

    let jsonResponse = JSON.parse(response.body); // This converts the response object to a JSON string

    let data = {};

    data["tournament_id"] = jsonResponse.tournament_id;
    data["subscription_id"] = jsonResponse.subscription_id;
    data["lifepackId"] = jsonResponse.lifepackId;

    let getJsonified = JSON.stringify(data, null, 2);
    console.log(getJsonified);

    playerId = players[__VU - 1];
    // Write the response to a file
    // Use writeString to write the JSON data to a file
    // The file will be named according to the player ID
    // and will be saved in the current directory

    writeString(`subscribedTournaments${playerId}.json`, getJsonified);
    console.log("File is created, check it out!");
    
    // Check if it worked
    check(response, {
        'status is 200': (r) => r.status === 200
    });
}