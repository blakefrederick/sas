/*
 * Creates the Diary object.
 */

var Diary = (function() {

  var localdev = 0;
  var devicedev = localdev ? 0 : 1;

  var endpoint = API.base_url + "/rest/type/node/diary";

  var currentDiaryStatus = 0;
  var currentDiaryId = "";
  var currentDiaryImages = [];
  var currentDiaryNotes = [];
  var currentDiaryGeolocations = [];

  function getDiary(diaryNodeId) {

    console.log("About to get a Diary object from Drupal.");

    var requestObject = {};

    ajaxRequest.sendRequest("GET", "node", diaryNodeId, requestObject, function(data){console.log(JSON.stringify(data))}, function(){console.log("error")});

    console.log(JSON.stringify(diaryNodeId));
  }


  function createDiary() {

    console.log("About to create a new Diary.");
    console.log("Endpoint is " + endpoint);

    var title = "Diary-" + getDateString();

    var requestObject = {
      "_links": {
        "type": {
          "href": endpoint
        }
      },
      "title": [
        {"value": title}
      ]
    };

    ajaxRequest.sendRequest("POST", "node", null, requestObject, createDiarySuccess, createDiaryError);
  }

  /**
   * Set variables and show/hide interface components since a Diary has successfully been created.
   *
   * @params data, textStatus, xhr
   *   AJAX debug and return info.
   */
  function createDiarySuccess(data, textStatus, xhr) {
    console.log("ran createDiarySuccess with data " + JSON.stringify(data) + " and textStatus " + JSON.stringify(textStatus) + " and xhr " + JSON.stringify(xhr));

    addNotification("<p>Created a new Diary.</p>");
    $('.pane.diary .button').show();
    $('.set-diary-publish-time').show();
    $('.start-diary.button').hide();

    setCurrentDiaryId(xhr.getResponseHeader("entity_id"));
    changeDiaryStatus(1);
    startGPSTracking();

    console.log("Current Diary has entity_id " + getCurrentDiaryId());
  }

  /**
   * Starts the GPS tracking and starts relaying this data periodically to the server.
   */
  function startGPSTracking() {

    var prevTime = Date.now;

    navigator.geolocation.watchPosition(

      // Success
      function(pos){
        var coords = {
          "accuracy": pos.coords.accuracy,
          "latitude": pos.coords.latitude,
          "longitude": pos.coords.longitude,
          "speed": pos.coords.speed,
          "timestamp": pos.timestamp
        };
        currentDiaryGeolocations.push(coords);
        console.log("Pushing new geolocation onto geolocation array: ");
        console.dir(pos);
        addNotification("<p>New GPS coordinate pushed to server.</p>");

        if(prevTime < Date.now + 2000) {
          console.log("Updating Diary geolocations field");
          var fields = {};
          fields.diaryCoordinates = {"value": JSON.stringify(getCurrentDiaryGeolocations())};
          updateDiary(currentDiaryId, fields);
        }
      },

      // Error
      function(error){
        console.log("GPS Tracking error: " + error);
      },

      // Settings
      { frequency: 2000, enableHighAccuracy: true });
  }

  /**
   * Updates the Diary with a PATCH - used for attaching uploaded files to node, for example.
   */
  function updateDiary(diaryNodeId, fields) {

    console.log("About to update Diary with nodeId " + diaryNodeId + " using PATCH.");

    var fields = fields || {};
    var endpoint = API.base_url + "/rest/type/node/diary";

    var requestObject = {
      "_links": {
        "type": {
          "href": endpoint
        }
      }
    };

    console.log("Before I update Diary, here's what fields is " + JSON.stringify(fields));

    if(typeof fields.diaryCoordinates !== 'undefined') {
      requestObject.field_diary_geolocations = fields.diaryCoordinates;
    }

    if(typeof fields.diaryNote !== 'undefined') {
      var diaryNotes = getCurrentDiaryNotes();
      diaryNotes.push(fields.diaryNote);
      requestObject.field_diary_note = diaryNotes;
    }

    if(typeof fields.diaryPhoto !== 'undefined') {
      var diaryPhotos = getCurrentDiaryImageIds();
      diaryPhotos.push(fields.diaryPhoto);
      requestObject.field_diary_photo = diaryPhotos;
    }

    if(typeof fields.publishTime !== 'undefined') {
      requestObject.field_diary_publish_time = Array(fields.publishTime);
    }

    // This is the syntax that allows for attaching new image without overwriting existing one.
    //requestObject.field_diary_photo = [{"target_id":"37"},{"target_id":"38"}];

    console.log("Hey, here is the request object " + JSON.stringify(requestObject));

    ajaxRequest.sendRequest("PATCH", "node", diaryNodeId, requestObject, updateDiarySuccess, updateDiaryError);
  }

  function endDiary() {
    $('.set-diary-publish-time.button').hide();
    $('.pane.diary .button').hide();
    $('.pane.diary input').hide();
    $('.start-diary').show();
    addNotification("<p>Ended current Diary</p>");
    changeDiaryStatus(0);
  }

  /**
   * Set the publish time for the currently active Diary.
   *
   * @param publishTime
   *   The publish time for the diary in the form 2016-03-22T01:08:00
   */
  function setPublishTime(publishTime) {
    // TODO implement better date/time conversion or restrict user input
    publishTime = publishTime.replace(/ /g,"T");
    publishTime = publishTime + ":00";
    fields.publishTime = publishTime;
    updateDiary(currentDiaryId, fields);
  }

  /**
   * POSTS an image file to Drupal. Success function attaches image to node.
   *
   * @param fields
   *   The fields object that contains the fields to be updated for this Diary node.
   */
  function createDiaryImage(fields) {

    console.log("About to create a Diary image.");

    var fields = fields || {};

    // Simulate multiple image file upload.
    if (localdev == 1) {
      var photosAdded = localStorage.getItem("photos-added");
      if(photosAdded != "1") {
        localStorage.setItem("photos-added", "1");
        // Lion png
        fields.diaryPhoto = getImage("lion");
      }
      else if(photosAdded == "1") {
        localStorage.setItem("photos-added", "2");
        // Palms png
        fields.diaryPhoto = getImage("palms");
      }
      if(photosAdded === "2") {
        localStorage.removeItem("photos-added");
      }
    }

    // User takes picture from device.
    if (devicedev == 1) {
      navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
      });
    }

    function onSuccess(imageData) {
      var endpoint = API.base_url + "/rest/type/file/file";

      fields.diaryPhoto = imageData;
      console.log("Here is the image data: " + imageData);

      var requestObject = {
        "_links": {
          "type": {
            "href": endpoint
          }
        },
        "filename":[
          {"value": "user-photo" + getDateString() + ".png"}
        ],
        "filemime":[
          {"value": "image/png"}
        ],
        "uri":[
          {"value": "private://diary"} // Files are currently be transmitted to public files directory. I think this is a bug.
        ],
        "data":[
          {"value": fields.diaryPhoto}
        ]
      };

      ajaxRequest.sendRequest("POST", "file", null, requestObject, createDiaryImageSuccess, createDiaryImageError);
    }

    function onFail(message) {
      console.log("Failed to get Diary image photo data because " + message);
    }

    // Local dev
    if(localdev == 1) {
      onSuccess(fields.diaryPhoto);
    }
  }

  /**
   * Update the Diary and attach a text note to the current Diary.
   *
   * @param note
   *   The text note to be added to the Diary.
   */
  function createNote(note) {
    var fields = {};
    fields.diaryNote = {"value": note};

    updateDiary(currentDiaryId, fields);
  }

  /**
   * Update the status of the current Diary.
   *
   * @param newStatus
   */
  function changeDiaryStatus(newStatus) {
    var statuses = {
      0: "Not Active",
      1: "Active"
    };

    currentDiaryStatus = statuses[newStatus];
    $('.diary-status .status').html(statuses[newStatus]);
  }

  function getCurrentDiaryStatus() {
    return currentDiaryStatus;
  }

  function createDiaryError(e) {
    console.log("ran createDiaryError because " + JSON.stringify(e));
    addNotification("<p>A new Diary could not be created because " + JSON.stringify(e) + "</p>");
  }

  function createDiaryImageSuccess(data, textStatus, xhr) {

    var imageFileEntityId = xhr.getResponseHeader("entity_id");
    console.log("Image successfully transmitted to server and has entity_id " + imageFileEntityId);
    addNotification("<p>Image successfully uploaded.</p>");

    // Now that the image has been transferred to the server and added to the DB, attach the file to the Diary node.
    var fields = {};
    fields.diaryPhoto = {"target_id": imageFileEntityId};

    console.log("Attempting to PATCH Diary node " + currentDiaryId + " by attaching image file on server to node.")
    updateDiary(currentDiaryId, fields);
  }

  function createDiaryImageError(e) {
    createDiaryError(e);
  }

  function getCurrentDiaryId() {
    return currentDiaryId;
  }

  function setCurrentDiaryId(entityId) {
    currentDiaryId = entityId;
  }

  function getCurrentDiaryImageIds() {
    return currentDiaryImages;
  }

  function getCurrentDiaryNotes() {
    return currentDiaryNotes;
  }

  function getCurrentDiaryGeolocations() {
    return currentDiaryGeolocations;
  }

  function addCurrentDiaryImageId(targetId) {
    currentDiaryImages.push({"target_id": targetId});
  }

  function updateDiarySuccess(data, textStatus, xhr) {
    console.log("updateDiarySuccess data: " + JSON.stringify(data));
    console.log("updateDiarySuccess textStatus: " + JSON.stringify(textStatus));
    console.log("updateDiarySuccess xhr: " + JSON.stringify(xhr));

    addNotification("<p>Successfully updated Diary.</p>");
  }

  function updateDiaryError(e) {
    console.log("Error updating Diary: " + e);
  }


  return {
    createDiary: createDiary,
    getDiary: getDiary,
    getCurrentDiaryId: getCurrentDiaryId,
    updateDiary: updateDiary,
    endDiary: endDiary,
    setPublishTime: setPublishTime,
    createDiaryImage: createDiaryImage,
    createNote: createNote,
    startGPSTracking: startGPSTracking,
    getCurrentDiaryStatus: getCurrentDiaryStatus,
    // TODO: Do these actually need to be exposed?
    createDiarySuccess: createDiarySuccess,
    createDiaryError: createDiaryError
  };

})();
