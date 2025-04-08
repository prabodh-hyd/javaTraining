import http from 'k6/http';
import { check } from 'k6';

const tokens = JSON.parse(open('firebasedata.json'));
const players = JSON.parse(open('players.json'));
const ids = JSON.parse(open(`createdTournaments.json`));

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
    
    const tournament_id = ids[playerId]["id"][0];
    // Set up the tournament subscription request
    const gameurl = 'http://localhost:9012/api/v1/game/start';
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
        "tournament_id": tournament_id,
        "game_id": 7
    });

    let response = http.post(gameurl, payload, params);
    
    console.log(`VU ${__VU} - Tournament Response: ${response.status} - ${response.body}`);

       // Only parse JSON if the response is successful (status 200)
        if (response.status === 200) {
            try {
                let jsonResponse = JSON.parse(response.body);
                let data = {
                    "score_id": jsonResponse.score_id
                };
                let getJsonified = JSON.stringify(data, null, 2);
                console.log(getJsonified);
                playerId = players[__VU - 1];
                // Write the response to a file
                // Use writeString to write the JSON data to a file
                // The file will be named according to the player ID
                // and will be saved in the current directory
                writeString(`gameStart${playerId}.json`, getJsonified);
                console.log("File is created, check it out!");
            } catch (e) {
                console.error(`VU ${__VU} - Error parsing JSON: ${e.message}`);
            }
        } else {
            // Log non-200 responses for debugging
            console.log(`VU ${__VU} - Non-200 response: ${response.status} - ${response.body}`);
        }

    check(response, {
        'status is 200': (r) => r.status === 200
    });
}