function getDomain() {
    return "http://sas.blakefrederick.com/"; // live
}

function getXCSRFToken() {
    return "r3JhefG83JEzHOxe8whGnxhV7MJs8hlsqvRkmQg_fyU"; //live
}

/**
 * Get a Trip
 *
 * Get a trip based on trip nid, or pass in most-recent to get the most recent.
 * @TODO: Validate that the user is getting a trip the belongs to them.
 */
function getTrip(nid, successCallback) {
    $.ajax({
        url: "http://sas.blakefrederick.com/trip/" + nid,
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
                "href": "http://sas.blakefrederick.com/rest/type/node/trip"
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
        //beforeSend: function (request)
        //{
        //    request.setRequestHeader("Authorization", "Basic c3NlY3VyaXR5dXNlcjE6c3MxcGFzc3dvcmQ=");
        //    request.setRequestHeader("X-CSRF-Token", "4n9aNNxPzbn3Lrb99ySVexBucIfKm8MmN8sE7LUAZTU");
        //    request.setRequestHeader("Content-Type", "application/hal+json");
        //},
        headers: {
            "Authorization": 'Basic c3NlY3VyaXR5dXNlcjE6c3MxcGFzc3dvcmQ=',
            //"X-CSRF-Token": 'ZxpVJi1QFGR1EAgrNQ8ZuZDkq-5uYie-gukYpcZoKFQ', // local
            "X-CSRF-Token": 'r3JhefG83JEzHOxe8whGnxhV7MJs8hlsqvRkmQg_fyU', // live
            "Content-Type": 'application/hal+json'
        },
        url: "http://sas.blakefrederick.com/entity/node",
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
function endTrip() {

}