









/*
*
* New Attempt at creating an API
*
 */



var API = {
    //base_url: "http://sas.blakefrederick.com",
    base_url: "http://ssecurity.local",
    restToken: '',
};


var ajaxRequest = (function() {

    function getToken() {
        $.ajax({
           type: "GET",
            url: API.base_url + "/rest/session/token",
            success: function(token) {
                API.restToken = token;
                console.log("Attempted to get token and succeeded.");
            },
            error: function(e) {
                console.log("Attempt to get token and failed.");
            }
        });
    }

    function sendRequest(ajaxMethod, nodeID, requestObject, onSuccess, onError) {

        var requestURL = '';

        if(ajaxMethod == "POST") {
            requestURL = API.base_url + "/entity/node";
        }
        else if(ajaxMethod == "PATCH") {
            requestURL = API.base_url + "/node/" + nodeID;
        }


        $.ajax({
            type: ajaxMethod,
            headers: {
                // @TODO: Move these credentials out of here
                "Authorization": 'Basic c3NlY3VyaXR5dXNlcjE6c3MxcGFzc3dvcmQ=',
                "X-CSRF-Token": API.restToken,
                "Content-Type": 'application/hal+json'
            },
            url: requestURL,
            data: JSON.stringify(requestObject),
            success: function(msg) {
                console.log("Ajax request succeeded.");
                onSuccess();
            },
            error: function(msg) {
                console.log("Ajax request failed.");
                console.table(msg);
                onError();
            }
        });
    }

    return {
        getToken: getToken,
        sendRequest: sendRequest,
    };


})();


/*
 * Creates the Event object for manipulating events.
 */

var Event = (function() {

    function createEvent(fields) {
        console.log("About to create a new trip.");

        var date = new Date();
        var title = "User Trip Dated " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();

        var requestObject = {
            "_links": {
                "type": {
                    "href": API.base_url + "/rest/type/node/trip"
                }
            },
            "title": [
                {"value": title}
            ],
            "field_destination_coordinate": [
                {"value": fields.userDestination}
            ],
            "field_trip_status": [
                {"value": 1}
            ],
            "field_watcher_phone_number": [
                {"value": fields.watcherPhoneNumber}
            ]
        };


        ajaxRequest.sendRequest("POST", null, requestObject, createTripSuccess, createTripError);

    }

    function updateEvent() {

        console.log("About to update trip with nodeID 1 using PATCH.");

        var requestObject = {
            "_links": {
                "type": {
                    "href": API.base_url + "/rest/type/node/trip"
                }
            },
            "field_trip_status": [
                {"value": 2}
            ]
        };

        ajaxRequest.sendRequest("PATCH", 1, requestObject, createTripSuccess, createTripError);

    }



    function createTripSuccess() {
        console.log("ran createTripSuccess");
    }

    function createTripError() {
        console.log("ran createTripError");
    }

    return {
        createEvent: createEvent,
        updateEvent: updateEvent,
        createTripSuccess: createTripSuccess,
    };

})();


/// MAIN


var fields = {
    "userDestination": "",
    "watcherPhoneNumber": "",
};


ajaxRequest.getToken();


// @TODO Does this need to instead be an object created with the new keyword?
// Event.createEvent(fields);




// @TODO Try PATCH operation. The pivitol question is:
// Do we need to first GET the Event object, modify, then PATCH or can we patch individual fields without having the complete object?



