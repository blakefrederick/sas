/*
 * API related values that are accessed "globally"
 */

var API = {
    base_url: window.location.origin,
    restToken: ''
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
                // @TODO: Move these credentials out of here once user login functions
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




/// MAIN


var fields = {
    "userDestination": "",
    "watcherPhoneNumber": "",
};


ajaxRequest.getToken();


// @TODO Does this need to instead be an object created with the new keyword?
// Event.createEvent(fields);




