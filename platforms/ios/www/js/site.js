$(document).ready( function() {

  /**
   * Get a Trip by node ID.
   */

  $('.get-trip.button').click(function(e) {

    var trip;
    var nid = prompt("Enter the node ID fo the trip you'd like to retrieve.", "23");
    trip = getTrip(nid);
    console.table("Here's the trip you retrieved: " + trip);

    getUserDestination(trip);

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

    navigator.geolocation.getCurrentPosition(function(position) {
      // @TODO: Replace this with a Google maps selector
      promptUserTripDetails(position);
    });

  });


  function onDeviceReady() {

    console.log("Device ready");
    $('.device-ready').html("Device ready");

    navigator.geolocation.getCurrentPosition(function(position) {
      // just to show how to access latitute and longitude
      var location = [position.coords.latitude, position.coords.longitude];
      console.log("Got location. Initial position: " + position.coords.latitude);
      $('.first-position').html("First recorded position: " + location[0] + ", " + location[1]);
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