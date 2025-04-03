import { writeString } from 'k6/x/file';
import http from 'k6/http';
import { check } from 'k6';

const tokens = JSON.parse(open('firebasedata.json'));
export default function () {
    // Load the JSON file from the same directory
    

    if (tokens === null) {
        console.log(`VU ${__VU} - Error: Couldn’t load tokens.json. Check if it exists in /home/prabodh/create/`);
        return;  // Exit the function gracefully
    }
    
    // Get the player ID for this VU (convert __VU to string since JSON keys are strings)
    const playerId = __VU.toString();
    
    // Grab the auth token for this player
    const authToken = tokens[playerId];
    
    // If no token exists for this player, log it and skip. Just a precautionary measure.
    if (!authToken) {
        console.log(`Yo, VU ${__VU} - No token found for player_id ${playerId}, skipping this one`);
        return;
    }
    
    // Set up the tournament subscription request
    const tournamentUrl = 'http://localhost:9022/api/v1/admin/tournaments';
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`  // Sending the token in the header
        }
    };
    
    const payload = JSON.stringify({
        "tournament_id": "9646",
        "tournament_name": "Test Tambola",
        "details": "Test Tournament for k6 to test the Tournament subscription.",
        "start_time": "1743750300",
        "end_time": "1743751200",
        "game_id": "7",
        "min_player_count": 1,
        "max_player_count": 100,
        "tickets_per_player": 1,
        "tournament_type": "FREE",
        "status": "ACTIVE",
        "winning_template_id": "3",
        "allowed_games_count": 10,
        "allowed_coupon_types": "discount, free_entry",
        "player_groups": [
            "1",
            "1"
        ]
    });
    
    // Fire off the request
    let response = http.post(tournamentUrl, payload, params);
    console.log(`VU ${__VU} - Tournament Response: ${response.status} - ${response.body}`);
    
    let jsonResponse = JSON.parse(response.body); // This converts the response object to a JSON string

    let tournament_id = jsonResponse.tournament_id_list;

    let data = {};

    data[playerId] = tournament_id;

    let getJsonified = JSON.stringify(data, null, 2);
    console.log(getJsonified);

    writeString(`createdTournaments${playerId}.json`, getJsonified);
    console.log("File is created, check it out!");
    // Check if it worked
    check(response, {
        'status is 201': (r) => r.status === 201
    });
}