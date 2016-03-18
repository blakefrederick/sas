/*
 * Creates the Diary object.
 */

var Diary = (function() {

  var endpoint = API.base_url + "/rest/type/node/diary";

  // What kinds of Diary entries are there?
  // Photo
  // Notes
  // Audio
  // Location data

  function createDiary(fields) {
    console.log("About to create a new Diary.");

    var date = new Date();
    var title = "User Trip Dated " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes();

    var requestObject = {
      "_links": {
        "type": {
          "href": endpoint
        }
      },
      "title": [
        {"value": title}
      ],
      "field_diary_photo": [
        {"value": fields.userDestination}
      ]
    };


    ajaxRequest.sendRequest("POST", null, requestObject, createDiarySuccess, createDiaryError);

  }

  function updateDiary() {

    console.log("About to update Diary with nodeID 1 using PATCH.");

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

    ajaxRequest.sendRequest("PATCH", 1, requestObject, createDiarySuccess, createDiaryError);

  }

  function createDiarySuccess() {
    console.log("ran createDiarySuccess");
  }

  function createDiaryError() {
    console.log("ran createDiaryError");
  }

  return {
    createDiary: createDiary,
    updateDiary: updateDiary,
    createDiarySuccess: createDiarySuccess,
    createDiaryError: createDiaryError
  };

})();
