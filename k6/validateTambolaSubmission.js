import { writeString } from 'k6/x/file';
import http from 'k6/http';
import { check } from 'k6';

// Load firebasedata.json once at the top level (not VU-specific)
const tokens = JSON.parse(open('firebasedata.json'));
const ids = JSON.parse(open('getTambolaTicket.json'));
const players = JSON.parse(open('players.json'));
// Attempt to load games.json ONCE
let games = null; // Initialize games variable in init context
let gamesLoadError = null; // Variable to store potential loading error message
try {
    games = JSON.parse(open('games.json'));
    // Optional: Log success only if needed during debugging
    // console.log("Init context: Successfully loaded and parsed games.json");
} catch (e) {
    gamesLoadError = e.message; // Store the error message
    // Log the error ONCE during init
    console.error(`Init context ERROR: Could not load or parse games.json - ${gamesLoadError}. VUs will use default score_id.`);
    // 'games' remains null
}

export default function () {
    // Get the player ID for this VU inside the default function
    let playerId = __VU.toString();
    console.log(playerId);

    if (!ids) {
        console.log(`VU ${__VU} - Error: No data found for player_id ${playerId} in getTambolaTicket data`);
        return;
    }

    if (tokens === null) {
        console.log(`VU ${__VU} - Error: Couldn’t load firebasedata.json. Check if it exists in /home/prabodh/create/k6/`);
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
    const lifepackIdValue = ids[playerId]["lifepackId"];
    const lifepackId = lifepackIdValue == null ? 0 : lifepackIdValue; // Use 0 if null or undefined
    const ticket_id = ids[playerId]["ticket-id"];
    // --- Determine score_id using data loaded in init context ---
    let score_id;
    // Check if games loaded successfully *and* if the player/score_id exists
    if (games && games[playerId] && games[playerId]["score_id"] !== undefined) {
        // Successfully loaded games.json in init, and player/score_id exists
        score_id = games[playerId]["score_id"];
    } else {
        // Need to determine *why* we're using the default
        if (gamesLoadError) {
            // Log specific reason: File failed to load in init
            // This log will appear **per iteration** if the file failed to load initially.
            // Consider if you want this per-iteration log or rely on the init context log.
             console.log(`VU ${__VU} - Warning: games.json failed to load during init (${gamesLoadError}). Using default score_id 300.`);
        } else if (!games) {
             // Should not happen if gamesLoadError logic is correct, but as safety.
             console.log(`VU ${__VU} - Warning: games data is unexpectedly null. Using default score_id 300.`);
        } else if (!games[playerId]) {
            // Log specific reason: Player data missing in the loaded file
            console.log(`VU ${__VU} - Warning: Player ${playerId} not found in loaded games.json. Using default score_id 300.`);
        } else { // games[playerId]['score_id'] === undefined
            // Log specific reason: Score ID missing for the player in the loaded file
            console.log(`VU ${__VU} - Warning: Player ${playerId} found, but score_id is missing in loaded games.json. Using default score_id 300.`);
        }
        score_id = 300; // Assign default value
    }
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
        "score_id": score_id,
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
