$(document).ready( function() {

  // @TODO: Refactor everything

  /**
  * Set some intial values.
  */
  window.localStorage.setItem("watcherPhoneNumber", "Not yet set");
  window.localStorage.setItem("userDestination", "Not yet set");
  window.localStorage.setItem("emergencySMS", "7783232713");


  /**
   * Get a Trip by node ID Handler
   */
  $('.get-trip.button').click(function(e) {

    var trip;
    var nid = prompt("Enter the node ID fo the trip you'd like to retrieve.", "23");

    getTrip(nid, getUserDestination);

  });

  /**
   * Get Most Recent Trip Handler
   */
  $('.get-most-recent-trip.button').click(function(e) {
    getTrip("most-recent", processMostRecentTrip);
  });

  //@TODO Refactor this to be more generalized and move it out of here.
  function processMostRecentTrip(trip) {
    console.log("Got the most recent trip. Here it is:");
    console.table(trip);

    $('.get-most-recent-trip')
      .hide()
      .append("<p>Date: " + trip[0].created[0].value + "</p>")
      .append("<p>User: Blake</p>") // @TODO Replace with actual user
      .append("<p>ID: " + trip[0].uuid[0].value + "</p>")
      .append("<p>Destination: " + trip[0].field_destination_coordinate[0].value + "</p>")
      .append("<p>Watcher SMS: " + trip[0].field_watcher_phone_number[0].value + "</p>")
      .fadeIn("slow");

    addNotification("<p>Retrieved the most recent trip. ID: " + trip[0].uuid[0].value + "</p>");
  }

  /**
   * Post Coordinates Handler
   */
  $('.get-trip-destination.button').click(function(e) {

    console.log("Clicked Get Trip Destination button.");

    getTrip("most-recent", getUserDestination);

  });


  /**
   * Start Trip Handler
   */
  $('.start-trip.button').click(function(e) {

    startTrip();

  });


  /**
   * End Trip Handler
   */
  $('.end-trip.button').click(function(e) {

    var watcherPhoneNumber = window.localStorage.getItem('watcherPhoneNumber');
    var watchID = window.localStorage.getItem('watchID');

    endTrip("ended_by_user", watchID, watcherPhoneNumber);

    // Delete local storage items associated with the trip.

  });



  /**
   * Update Trip Handler
   */
  $('.update-trip.button').click(function(e) {

    console.log(Event);
    Event.updateEvent();

  });



  /**
   *  Get Trip Destination Handler
   */
  $('.get-trip-destination.button a').click(function(e) {
    var displayedDestination = $("<p>" + window.localStorage.getItem("userDestination") + "</p>").hide().insertAfter($(this)).fadeIn("slow");
    setTimeout(function() {
      displayedDestination.fadeOut("slow");
    }, 2000);
  });


  /**
   * Get Watcher Phone Number Handler
   */
  $('.get-watcher-phone-number.button a').click(function(e) {
    var displayedPhoneNumber = $("<p>" + window.localStorage.getItem("watcherPhoneNumber") + "</p>").hide().insertAfter($(this)).fadeIn("slow");
    setTimeout(function() {
      displayedPhoneNumber.fadeOut("slow");
    }, 2000);
  });


  /**
   * Send Emergency SMS Handler
   */
  $('.send-emergency-sms.button').click(function(e) {
    var emergencySMS = "7783232713";
    emergencySMS = window.localStorage.getItem("emergencySMS");
    var defaultMessage = "This is just a test, not an actual emergency.";

    $(".emergency-send-status").hide().html("<p>Sending</p>").fadeIn("slow");

    sendSMS(emergencySMS, defaultMessage);
  });


  /**
   * Change Emergency SMS Handler
   */
  $('.change-emergency-sms.button').click(function(e) {
    var emergencySMS = window.localStorage.getItem("emergencySMS");
    var newEmergencySMS = prompt("Enter an emergency contact SMS", emergencySMS);
    window.localStorage.setItem("emergencySMS", newEmergencySMS);
  });


  /**
   *  Device is ready
   */
  function onDeviceReady() {

    console.log("Device ready");
    $('.device-ready').html("Device ready");

    addNotification("<p>Welcome back, Blake.</p>");

    navigator.geolocation.getCurrentPosition(function(position) {
      // just to show how to access latitute and longitude
      var location = [position.coords.latitude, position.coords.longitude];
      console.log("Got location. Initial position: " + position.coords.latitude);
      $('.first-position').html("First position: " + location[0] + ", " + location[1]);
      $('.current-position').html("Current position: " + location[0] + ", " + location[1]);
    },
    function(error) {
      // error getting GPS coordinates
      alert('code: ' + error.code + ' with message: ' + error.message + '\n');
    },
    {
      enableHighAccuracy: true, maximumAge: 3000, timeout: 5000
    });


    // Debug
    appInBackground();

  }

  // Can this go above the function?
  document.addEventListener("deviceready", onDeviceReady, false);

});


function appInBackground() {

  // Android customization
  cordova.plugins.backgroundMode.setDefaults({ text:'Doing heavy tasks.'});

  cordova.plugins.backgroundMode.enable();

  // Called when background mode has been activated
  cordova.plugins.backgroundMode.onactivate = function () {
    setTimeout(function () {
      // Modify the currently displayed notification
      cordova.plugins.backgroundMode.configure({
        title: 'SAS is running in the background',
        ticker: 'Ticket goes here',
        text:'Running in background for more than 1s now.'
      });
    }, 1000);

  }


}