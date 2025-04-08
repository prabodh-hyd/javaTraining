import http from 'k6/http';
import { check } from 'k6';

// Load firebasedata.json once at the top level (not VU-specific)
const tokens = JSON.parse(open('firebasedata.json'));
const ids = JSON.parse(open(`validateTambola.json`));
const players = JSON.parse(open('players.json'));

export default function () {
    // Get the player ID for this VU inside the default function
    let playerId = __VU.toString();
    console.log(playerId);

    if (!ids) {
        console.log(`VU ${__VU} - Error: No data found for player_id ${playerId} in validateTambola data`);
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

    const submission_id = ids[playerId]["submission_id"];

    const gameurl = 'http://localhost:9012/api/v1/game/tambola/validate';

    const params = {
        headers: {
            'client-time': '1234',
            'app-key': 'test-key',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            'submission-id': submission_id, // Fixed: Use submission_id instead of tournament_id
        }
    };

    // Fire off the request
    let response = http.get(gameurl, params);
    console.log(`VU ${__VU} - Validate Response: ${response.status} - ${response.body}`);

    // Check if it worked
    check(response, {
        'status is 200': (r) => r.status === 200
    });
}