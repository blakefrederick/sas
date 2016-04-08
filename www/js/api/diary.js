// @TODO Can this object be split into multiple files? It is becoming unruly.

/**
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
  var foregroundGeolocationWatch;
  var prevTime = Date.now();

  /**
   * Debug function to view JSON of an existing Diary
   * @param diaryNodeId - Drupal node ID of the Diary content to retrieve
   */
  function getDiary(diaryNodeId) {
    console.log("About to get a Diary object from Drupal.");
    var requestObject = {};
    ajaxRequest.sendRequest("GET", "node", diaryNodeId, requestObject, function(data){console.log(JSON.stringify(data))}, function(){console.log("error")});
    console.log(JSON.stringify(diaryNodeId));
  }

  /**
   * Create a new Diary. Only one Diary can be active at a time.
   */
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
    $('.start-diary.button').hide();

    setCurrentDiaryId(xhr.getResponseHeader("entity_id"));
    changeDiaryStatus(1);
    startGPSTracking();
    if(devicedev == 1) {
      backgroundGeoLocation.start();
    }
    console.log("Current Diary has entity_id " + getCurrentDiaryId());
  }

  /**
   * Starts the GPS tracking and starts relaying this data periodically to the server.
   */
  function startGPSTracking() {
    foregroundGeolocationWatch = navigator.geolocation.watchPosition(
      pushGPSCoordinates,
      geolocationError,
      { frequency: settings.GPS.frequency, enableHighAccuracy: settings.GPS.enableHighAccuracy }
    );
  }

  /**
   * The app has recorded a new GPS position. Push it to the server.
   * @param position Object
   */
  function pushGPSCoordinates(position) {
    var coords = {
      "accuracy": position.coords.accuracy,
      "latitude": position.coords.latitude,
      "longitude": position.coords.longitude,
      "speed": position.coords.speed,
      "timestamp": position.timestamp
    };
    currentDiaryGeolocations.push(coords);
    console.log("Pushing new geolocation onto geolocation array: ");
    console.dir(position);
    addNotification("<p>New GPS coordinate recorded.</p>");

    if(prevTime + 3000 < Date.now()) {
      console.log("Updating Diary geolocations field");
      var fields = {};
      fields.diaryCoordinates = {"value": JSON.stringify(getCurrentDiaryGeolocations())};
      prevTime = Date.now();
      updateDiary(currentDiaryId, fields);
    }
  }

  /**
   * The app has recorded a new GPS position while in the background. Push it to the server.
   * @TODO Amalgamate this function with pushGPSCoordinates
   */
  function backgroundPushGPSCoordinates(position) {
    console.log("Here's what the background GPS position object looks like: " + JSON.stringify(position));

    var prevTime = Date.now;
    var coords = {
      "accuracy": position.accuracy,
      "latitude": position.latitude,
      "longitude": position.longitude,
      "speed": position.speed,
      "timestamp": position.time
    };
    currentDiaryGeolocations.push(coords);
    console.log("Pushing new geolocation onto geolocation array: ");
    console.dir(position);
    addNotification("<p>New background GPS coordinate recorded.</p>");

    // if(prevTime < Date.now + 3000) {
      console.log("Updating Diary geolocations field");
      var fields = {};
      fields.diaryCoordinates = {"value": JSON.stringify(getCurrentDiaryGeolocations())};
      updateDiary(currentDiaryId, fields);
    // }

    /*
     IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
     and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
     IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
     */
    backgroundGeoLocation.finish();
  }

  /**
   * The app failed to record a new GPS position.
   * @param error Object
   */
  function geolocationError(error) {
    console.log("Failed to watchPosition (GPS) with error: " + JSON.stringify(error));
  }

  /**
   * The app failed to record a new GPS position while in the background.
   * @param error Object
   */
  function backgroundGeolocationError(error) {
    console.log("backgroundGeolocationError: " + JSON.stringify(error));
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
      addNotification("<p>Adding note to Diary.</p>");
    }

    if(typeof fields.diaryPhoto !== 'undefined') {
      var diaryPhotos = getCurrentDiaryImageIds();
      diaryPhotos.push(fields.diaryPhoto);
      requestObject.field_diary_photo = diaryPhotos;
      addNotification("<p>Adding photo to Diary.</p>");
    }

    if(typeof fields.publishTime !== 'undefined') {
      requestObject.field_diary_publish_time = Array(fields.publishTime);
      addNotification("<p>Setting Diary publish time.</p>");
    }

    console.log("Hey, here is the request object " + JSON.stringify(requestObject));
    ajaxRequest.sendRequest("PATCH", "node", diaryNodeId, requestObject, updateDiarySuccess, updateDiaryError);
  }

  /**
   * Ends the currently running Diary so that no new content can be added to it.
   */
  function endDiary() {
    // @TODO Abstract all these hide/show tasks
    $('.set-diary-publish-time.button').hide();
    $('.pane.diary .button').hide();
    $('.pane.diary input').hide();
    $('.set-diary-publish-time').hide();
    $('.start-diary').show();
    addNotification("<p>Ended current Diary</p>");
    changeDiaryStatus(0);
    // Shut down GPS tracking
    if(devicedev == 1) {
      backgroundGeoLocation.stop();
    }
    console.log("Here's what foregroundGeolocationWatch is: " + foregroundGeolocationWatch);
    navigator.geolocation.clearWatch(foregroundGeolocationWatch);
  }

  /**
   * Set the publish time for the currently active Diary.
   *
   * @param publishTime
   *   The publish time for the diary in the form 2016-03-22T01:08:00
   */
  function setPublishTime(publishTime) {
    // TODO implement better date/time conversion or restrict user input
    //publishTime = publishTime.replace(/ /g,"T");
    //publishTime = publishTime + ":00";
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

    // DEBUG: Pretend like the user successfully took a photo.
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
    backgroundPushGPSCoordinates: backgroundPushGPSCoordinates,
    backgroundGeolocationError: backgroundGeolocationError,
    getCurrentDiaryStatus: getCurrentDiaryStatus,
    // TODO: Do these actually need to be exposed?
    createDiarySuccess: createDiarySuccess,
    createDiaryError: createDiaryError
  };

})();
