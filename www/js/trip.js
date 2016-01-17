function currentTime() {
    $('.timer').prepend("<p>" + new Date().getTime() + "</p>");
}

function promptUserTripDetails(position) {
    var userDestination = prompt("Please enter your GPS destination [latitude,longitude]", position.coords.latitude + ", " + position.coords.longitude);
    var watcherPhoneNumber = prompt("Your phone will send an SMS when you arrive at your destination. Please enter the phone number to send the SMS to. (with area code and no spaces or dashes)", "7783232713");

    window.localStorage.setItem('watcherPhoneNumber', watcherPhoneNumber);

    // @Todo: Pull these function calls out of this function and put them in the Start Trip click handler.
    createTrip(userDestination, watcherPhoneNumber);
    trackCoordinates(userDestination, watcherPhoneNumber);
}


function promptUserDestination(defaultPosition) {
    var userDestination = prompt("Please enter your GPS destination [latitude, longitude]", defaultPosition.coords.latitude + ", " + defaultPosition.coords.longitude);

    window.localStorage.setItem('userDestination', userDestination);

    return userDestination;
}


function promptWatcherPhoneNumber(defaultWatcherPhoneNumber) {
    var watcherPhoneNumber = prompt("Please enter a phone number to send an SMS to once your trip is complete (inc. area code, no spaces or dashes)", defaultWatcherPhoneNumber);

    window.localStorage.setItem('watcherPhoneNumber', watcherPhoneNumber);

    return watcherPhoneNumber;
}


function getUserDestination(trip) {
    console.log("User destination is: " + trip[0].field_destination_coordinate[0].value);
    return trip[0].field_destination_coordinate[0].value;
}

function getMostRecentTrip() {
    getTrip("most-recent").then(function(trip) {
        return trip;
    });
}


/**
 * Start Trip
 *
 * Get initial position and ask the user for some trip details.
 */
function startTrip(){
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
}


/**
 * Track Coordinates
 *
 * Tracks GPS coordinates continually and constantly polls to see if we've reached
 * our destination.
 */
function trackCoordinates(userDestination, watcherPhoneNumber) {

    var watchID = null;    // ID of the geolocation
    var tracking_data = []; // Array containing GPS position objects
    var distanceThresholdInKM = 0.03;

    // Start tracking the User
    watchID = navigator.geolocation.watchPosition(

        // Success
        function(position){
            tracking_data.push(position);
            console.log("Current position: ");
            console.table(position);
            console.log("User trip destination: " + userDestination);

            // Check if we've reached our destination
            var currentCoordinates = getCurrentCoordinates(position);
            var destinationCoordinates = getCoordinates(userDestination);
            var distanceInKM = distance(currentCoordinates["lat"], currentCoordinates["lon"],
                                        destinationCoordinates["lat"], destinationCoordinates["lon"]);
            var distanceinM = (distanceInKM * 1000).toFixed(6);

            console.log("Distance remaining: " + (distanceInKM/1000).toFixed(6) + " M.");

            // Debug Info
            $('.current-position').html("Current position: " + currentCoordinates["lat"] + ', ' + currentCoordinates["lon"]);
            $('.user-destination').html("User destination: " + destinationCoordinates["lat"] + ', ' + destinationCoordinates["lon"]);
            $('.distance-remaining').html("Distance remaining: " + distanceinM + " meters");

            if(distanceInKM <= distanceThresholdInKM) {
                console.log("You have reached your destination (" + distanceinM + " meters away).");
                addNotification("<p>You have reached your destination (" + distanceinM + " meters away).</p>");
                console.log("(The distance tolerance is set to " + distanceinM + " meters.)");
                addNotification("<p>(The distance tolerance is set to " + distanceinM + " meters.)</p>");

                endTrip("success", watchID, watcherPhoneNumber);
            }
        },
        function(error){
            console.log(error);
        },
        {
            frequency: 3000,
            enableHighAccuracy: true
        }
    );

    window.localStorage.setItem('watchID', watchID);

}

/**
 * End a Trip
 *
 * Trigger some actions that occur upon succesfully reaching a destination.
 */
function endTrip(status, watchID, watcherPhoneNumber) {

    var SMSBody = '';

    // Stop watching the user's location
    navigator.geolocation.clearWatch(watchID);
    addNotification("<p>GPS tracking has ended.</p>");
    console.log("GPS tracking has ended.");

    switch(status) {
        case "success":
            SMSBody = "Blake successfully reached his destination.";
            addNotification("<p>You successfully reached your destination.</p>");
            $('.trip-status .status').html("Ended. Destination reached.").fadeIn();
            break;
        case "ended_by_user":
            SMSBody = "Blake manually ended his trip.";
            addNotification("<p>You ended your trip.</p>");
            $('.trip-status .status').html("Ended by user").fadeIn();
            break;
        default:
            SMSBody = "GPS tracking of the user you were watching ended. The user did not necessarily reach their destination.";
            break;
    }

    $('.end-trip.button').hide();
    $('.start-trip.button').show();

    // Send a text message to any trip watchers.
    console.log("Now sending a text message to " + watcherPhoneNumber + ".");
    addNotification("<p>Now sending a text message to " + watcherPhoneNumber + ".</p>");
    sendSMS(watcherPhoneNumber, SMSBody);

    // Change the status of the trip.
    // API PATCH call goes here.
}


function getCurrentCoordinates(position) {
    var currentCoordinates = [];
    currentCoordinates["lat"] = position.coords.latitude;
    currentCoordinates["lon"] = position.coords.longitude;
    return currentCoordinates;
}


function getCoordinates(userDestination) {
    var coordinates = userDestination.split(',');
    coordinates["lat"] = parseFloat(coordinates[0]);
    coordinates["lon"] = parseFloat(coordinates[1]);
    return coordinates;
}

/**
 * Get the distance in KM between two coordinate pairs.
 */
function distance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = toRad(lat2 - lat1);  // Javascript functions in radians
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var distanceInKM = R * c; // Distance in km
    return distanceInKM;
}

/**
 * Helper function to convert degrees to radians.
 */
function toRad(degrees){
    return degrees * Math.PI / 180;
}