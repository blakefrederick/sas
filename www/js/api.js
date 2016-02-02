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
 * Create a Trip
 *
 * Creates a Trip content type with a user destination.
 */
function createTrip(userDestination, watcherPhoneNumber) {
    console.log("About to create a new trip.");

    var date = new Date();
    var title = "User Trip Dated " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();

    var requestObject = {
        "_links": {
            "type": {
                "href": "http://sas.blakefrederick.com/rest/type/node/trip"
            }
        },
        "title": [
            {"value": title}
        ],
        "field_destination_coordinate": [
            {"value": userDestination}
        ],
        "field_trip_status": [
            {"value": 1}
        ],
        "field_watcher_phone_number": [
            {"value": watcherPhoneNumber}
        ]
    };

    $.ajax({
        type:"POST",
        headers: {
            "Authorization": 'Basic c3NlY3VyaXR5dXNlcjE6c3MxcGFzc3dvcmQ=',
            "X-CSRF-Token": 'r3JhefG83JEzHOxe8whGnxhV7MJs8hlsqvRkmQg_fyU',
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


var blah = (function() {
    hey: 'hey';

})();

var event = {

};

var entry = {

};

var coordinates = {

};


var API = {
    base_url: "http://sas.blakefrederick.com",
};





(function() {



    console.log(API);

    var event = (function() {

        function createEvent() {
            console.log("creating an event");
        }

        function render() {

        }

        return {
            createEvent: createEvent,
        };

    })();




    event.createEvent();

}());


