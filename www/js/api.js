/**
 * Get a Trip
 *
 * Get a trip based on trip nid, or pass in most-recent to get the most recent.
 * @TODO: Validate that the user is getting a trip the belongs to them.
 */
function getTrip(nid, successCallback) {
    $.ajax({
        url: "http://ssecurity.local/trip/" + nid,
        success: function(trip) {
            console.log("Successfully got a trip.");
            console.log("Attempting to call successCallback: " + successCallback);
            console.log("This should be the returned trip: ");
            console.table(trip);
            successCallback(trip);
        },
        error: function() {
            console.log("Error. Did not get trip for some reason.");
        }
    });
}

/**
 * Start a Trip
 *
 * Creates a Trip content type with a user destination.
 */
function startTrip(userDestination) {
    console.log("About to create a new trip.");

    var date = new Date();

    var requestObject = {
        "_links": {
            "type": {
                "href": "http://ssecurity.local/rest/type/node/trip"
            }
        },
        "title": [
            {"value": "Trip " + date.getMinutes()}
        ],
        "field_destination_coordinate": [
            {"value": userDestination}
        ],
        "field_trip_status": [
            {"value": 0}
        ]
    };

    $.ajax({
        type:"POST",
        headers: {
            "Authorization": 'Basic c3NlY3VyaXR5dXNlcjE6c3MxcGFzc3dvcmQ=',
            "X-CSRF-Token": 'F19EmnoX0RMpy9g7zvKsIRLRG6QK5a_t4mYYS9kIJtE',
            "Content-Type": 'application/hal+json'
        },
        url: "http://ssecurity.local/entity/node",
        data: JSON.stringify(requestObject),
        success: function(msg) {
            console.log("Successfully created a new trip.");
        },
        error: function(msg) {
            console.log("There was a problem. Failed to create a new trip.");
            console.table(msg);
        }
    });
}

/**
 * End a Trip
 *
 * Trigger some actions that occur upon succesfully reaching a destination.
 */
function endTrip(watchID, watcherPhoneNumber) {
    // Stop watching the user's location
    navigator.geolocation.clearWatch(watchID);
    $('.notifications .container').prepend("<p>GPS tracking has ended.</p>");
    console.log("GPS tracking has ended.");
    // Send a text message to any trip watchers.
    console.log("Now sending a text message to " + watcherPhoneNumber + ".");
    $('.notifications .container').prepend("<p>Now sending a text message to " + watcherPhoneNumber + ".</p>");
    sendSMS(watcherPhoneNumber);
    // Change the status of the trip.
    // API PATCH call goes here.
}