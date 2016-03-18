/*
 * Creates the Event object for manipulating events.
 *
 * Trip == Event
 */

var Event = (function() {

  var endpoint = API.base_url + "/rest/type/node/event";

  function createEvent(fields) {
    console.log("About to create a new Event.");

    var date = new Date();
    var title = "User Event Dated " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();

    var requestObject = {
      "_links": {
        "type": {
          "href": endpoint
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


    ajaxRequest.sendRequest("POST", null, requestObject, createEventSuccess, createEventError);

  }

  function updateEvent() {

    console.log("About to update trip with nodeID 1 using PATCH.");

    var requestObject = {
      "_links": {
        "type": {
          "href": endpoint
        }
      },
      "field_trip_status": [
        {"value": 2}
      ]
    };

    ajaxRequest.sendRequest("PATCH", 1, requestObject, createEventSuccess, createEventError);

  }

  function createEventSuccess() {
    console.log("ran createEventSuccess");
  }

  function createEventError() {
    console.log("ran createEventError");
  }

  return {
    createEvent: createEvent,
    updateEvent: updateEvent,
    createEventSuccess: createEventSuccess,
    createEventError: createEventError,
  };

})();
