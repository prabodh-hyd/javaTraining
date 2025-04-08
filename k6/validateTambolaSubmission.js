import { writeString } from 'k6/x/file';
import http from 'k6/http';
import { check } from 'k6';

// Load firebasedata.json once at the top level (not VU-specific)
const tokens = JSON.parse(open('firebasedata.json'));
const ids = JSON.parse(open(`getTambolaTicket.json`));
const players = JSON.parse(open('players.json'));

export default function () {
    // Get the player ID for this VU inside the default function
    let playerId = __VU.toString();
    console.log(playerId);

    if (!ids) {
        console.log(`VU ${__VU} - Error: No data found for player_id ${playerId} in getTambolaTicket data`);
        return;
    }

    if (tokens === null) {
        console.log(`VU ${__VU} - Error: Couldn’t load tokens.json. Check if it exists in /home/prabodh/create/`);
        return;  // Exit the function gracefully
    }

    // Grab the auth token for this player
    const authToken = tokens[players[__VU - 1]];

    if (!authToken) {
        console.log(`Yo, VU ${__VU} - No token found for player_id ${playerId}, skipping this one`);
        return;
    }

    const tournament_id = ids[playerId]["tournament_id"];
    const subscription_id = ids[playerId]["subscription_id"];
    const lifepackId = ids[playerId]["lifepackId"];
    const ticket_id = ids[playerId]["ticket-id"];

    const gameurl = 'http://localhost:9012/api/v1/game/tambola/validate';

    const params = {
        headers: {
            'client-time': '1234',
            'app-key': 'test-key',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    const payload = JSON.stringify({
        "ticket_id": ticket_id,
        "claim_type": "THIRD_ROW",
        "tournament_id": tournament_id,
        "subscription_id": subscription_id,
        "score_id": 300,
        "last_callout_index": 90,
        "lifepack_id": lifepackId
    });

    let response = http.post(gameurl, payload, params);

    console.log(`VU ${__VU} - Tournament Response: ${response.status} - ${response.body}`);

    // Only parse JSON if the response is successful (status 200)
    if (response.status === 200) {
        try {
            let jsonResponse = JSON.parse(response.body);
            let data = {
                "submission_id": jsonResponse.submission_id
            };
            let getJsonified = JSON.stringify(data, null, 2);
            console.log(getJsonified);
            playerId = players[__VU - 1];
            // Write the response to a file
            // Use writeString to write the JSON data to a file
            // The file will be named according to the player ID
            // and will be saved in the current directory
            writeString(`validateTambola${playerId}.json`, getJsonified);
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