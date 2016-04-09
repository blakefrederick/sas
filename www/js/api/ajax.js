/**
 * API related values that are accessed "globally"
 */
var API = new function() {

    var localdev = 1;
    var devicedev = localdev ? 0 : 1;

    if(localdev == 1) {
        this.base_url = window.location.origin;
    }
    // DEV Site - needed for testing actual devices
    if(devicedev == 1) {
        this.base_url = "http://sas.blakefrederick.com";
    }

    this.endpointFile = this.base_url + "/rest/type/node/event";
    this.restToken = '';
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

    function sendRequest(ajaxMethod, entityType, nodeID, requestObject, onSuccess, onError) {

        var requestURL = '';

        if(ajaxMethod == "POST") {
            requestURL = API.base_url + "/entity/node";
        }
        else if(ajaxMethod == "PATCH") {
            requestURL = API.base_url + "/node/" + nodeID;
        }
        else if(ajaxMethod == "GET") {
            requestURL = API.base_url + "/diary/" + nodeID;
        }

        if(entityType == "file") {
            requestURL = API.base_url + "/entity/file";
        }

        console.log("entityType is " + entityType);
        console.log("requestURL is " + requestURL);

        var ajaxRequestObject = {
            type: ajaxMethod,
            headers: {
                // @TODO: Move these credentials out of here once user login functions
                "Authorization": 'Basic c3NlY3VyaXR5dXNlcjE6c3MxcGFzc3dvcmQ=',
                "X-CSRF-Token": API.restToken,
                "Content-Type": 'application/hal+json'
            },
            url: requestURL,
            data: JSON.stringify(requestObject),
            success: function(data, textStatus, jqXHR) {
                console.log("Ajax request succeeded.");
                onSuccess(data, textStatus, jqXHR);
            },
            error: function(msg) {
                console.log("Ajax request failed.");
                console.table(msg);
                onError(msg);
            }
        };

        // For some reason GET does not like the Authorization header to be included.
        if(ajaxMethod == "GET") {
            delete ajaxRequestObject.headers.Authorization;
            delete ajaxRequestObject.data;
        }

        $.ajax(ajaxRequestObject);
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




