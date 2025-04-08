Okay where do we start yeah this folder contains the scripts to execute the flow from getting the firebase tokens to validating tambola submission status.
So the order is:
firebaseTokenScript.js - node JS
tournamentCreate.js - k6
singleTournamentsFile.js - node JS
subscribeTournamentFinal.js or subscribeTournamentIndividual.js based on how you want to subscribe to the tournaments, make all subscribe to one tournament or each one subscribes to a single tournament that they created your choice. - k6
singleTournamentSubscribeFile.js - node JS
getTambolaTicket.js - k6
singleGetTambolaTicketFile.js - node JS
validateTambolaStatus.js - k6
singleValidateTambola.js - node JS
validateTambolaSubmission.js - k6

Ignore the other scripts.

These node js files in the middle are to consolidate the multiple number of files the k6 script creates so that the next k6 script which has input can be parsed from one single file rather than going round and round in loop iterations to load all the files to the script.

Make sure the k6 is installed correctly, still bombarded by errors? Reinstall it correctly this time. More errors? Read this again.

Also don't forget to change the values in the script for the number of players you want to test I tested for 2 and 10 users make sure the number is consistent across the scripts node and k6, you can find where to change the number pretty easily by looking at the script.

For now I'm passing the virtual users and iterations as command line arguments if we were to introduce time and gracefully influx & deflux the users number we need to use the options function and need to change the k6 scripts a little as I'm using __VU as a variable to navigate.