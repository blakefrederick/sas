$(document).ready( function() {

  //var timer =  setInterval(currentTime, 1000);

  /**
   * Get a Trip by node ID.
   */
  $('.get-trip.button').click(function(e) {

    var trip;
    var nid = prompt("Enter the node ID fo the trip you'd like to retrieve.", "23");

    getTrip(nid, getUserDestination);

  });


  /**
   * Post Coordinates
   */
  $('.get-trip-destination.button').click(function(e) {

    console.log("Clicked Get Trip Destination button.");

    getTrip("most-recent", getUserDestination);

  });


  /**
   * Start Trip
   */
  $('.start-trip.button').click(function(e) {

    var userDestination = '';
    var watcherPhoneNumber = '7783232713';

    navigator.geolocation.getCurrentPosition(
      function(position) {

        //addNotification("<p>Getting current GPS position.</p>");

        // Ask the user for their trip destination
        userDestination = promptUserDestination(position);
        // Ask the user who to contact when the trip ends
        watcherPhoneNumber = promptWatcherPhoneNumber(watcherPhoneNumber);

        addNotification("<p>An SMS will be sent to " + watcherPhoneNumber + " when your trip is complete.</p>");
        addNotification("<p>Your trip will end when you reach your destination or if you end the trip manually.</p>");

        createTrip(userDestination, watcherPhoneNumber);
        trackCoordinates(userDestination, watcherPhoneNumber);

        addNotification("<p>Trip initiated.</p>");

        $('.trip-status .status').hide().html("Started").fadeIn("slow");
        window.setTimeout(function() {
          $('.trip-status .status').hide().html("In Progress").fadeIn("slow");
        }, 1500);

        // Allow the user to end their trip.
        $('.button.start-trip').hide();
        $(".button.end-trip").show();
      },

      function(error) {
        addNotification("<p>Error. Could not get initial GPS location");
      }
    );

  });

  /**
   * End Trip
   */
  $('.end-trip.button').click(function(e) {

    var watcherPhoneNumber = window.localStorage.getItem('watcherPhoneNumber');
    var watchID = window.localStorage.getItem('watchID');

    $('.end-trip.button').hide();
    $('.start-trip.button').show();

    endTrip("ended_by_user", watchID, watcherPhoneNumber);

    // Delete local storage items associated with the trip.

  });

  function onDeviceReady() {

    console.log("Device ready");
    $('.device-ready').html("Device ready");

    navigator.geolocation.getCurrentPosition(function(position) {
      // just to show how to access latitute and longitude
      var location = [position.coords.latitude, position.coords.longitude];
      console.log("Got location. Initial position: " + position.coords.latitude);
      $('.first-position').html("First recorded position: " + location[0] + ", " + location[1]);
      $('.current-position').html("Current position: " + location[0] + ", " + location[1]);
    },
    function(error) {
      // error getting GPS coordinates
      alert('code: ' + error.code + ' with message: ' + error.message + '\n');
    },
    {
      enableHighAccuracy: true, maximumAge: 3000, timeout: 5000
    });


    $(".track-coordinates").click(function() {

      trackCoordinates();

    });


  }

  document.addEventListener("deviceready", onDeviceReady, false);

});
