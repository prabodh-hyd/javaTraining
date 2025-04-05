import http from 'k6/http';
import { check } from 'k6';

export default function () {

    const url = 'http://localhost:9010/api/v1/auth/verify_otp';
    const payload = JSON.stringify({
          "otp": "1234",
          "player_id": __VU,
	  "device_ip_address": "192.163.12.1",
	  "device_os_version": "android",
	  "device_unique_id": "55321124688976",
	  "installed_app_version": "1.67",
	  "latest_firebase_token": "eOHex4YNSB6j94L9FO1I-F:APA91bGgEAaYCEUgq9N6l2O1Mp643QRP-WHEmohnyWEyT3y11eS6qsL1RKtyks-7CbiF9LdYkbSoGs-U6Aiy6bnI276AjzSLeyG9P25fD4FfrxxMyQ0pUBM",
	  "rooted_device": false,
	  "location": {
	    "lat": "7.436",
	    "long": "73.656"
	  }
    });

    const params = {
	  headers: {
	    'client-time': '1234',
            'app-key': 'testKey',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    let response = http.post(url, payload, params);

    console.log(`VU ${__VU} - OTP Response: ${response.status} - ${response.body}`);

    let response_body = JSON.parse(response.body);

    let auth = response_body.auth_key;

    let firebase_url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyC-92iBazzpzemXeGGUBRspFLAaDkhKviY';

    let firebase_body = JSON.stringify({
      "token": auth,
      "returnSecureToken": true
    });

    let return_token = http.post(firebase_url, firebase_body, {
        headers: { 'Content-Type': 'application/json', 'key': 'AIzaSyC-92iBazzpzemXeGGUBRspFLAaDkhKviY' }
    });

    console.log(`VU ${__VU} - Firebase Response: ${return_token.status} - ${return_token.body}`);

    let token_response = JSON.parse(return_token.body);

    let custom_auth = token_response.idToken;

    let tournament_url = 'http://localhost:9014/api/v1/tournaments/subscribe';

    const tour_params = {
        headers: {
              'client-time': '1234',
              'app-key': 'testKey',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${custom_auth}`
          }
      };
    
    const tour_payload = JSON.stringify({
        "tournament_id": 9743
    })

    let return_tournament_response = http.post(tournament_url, tour_payload, tour_params);

    console.log(`VU ${__VU} - Tournament Response: ${return_tournament_response.status} - ${return_tournament_response.body}`);

    check(return_tournament_response, {'status is 200': (r) => r.status === 200,});
}
