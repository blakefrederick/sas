function currentTime() {
    $('.timer').prepend("<p>" + new Date().getTime() + "</p>");
}

function promptUserTripDetails(position) {
    var userDestination = prompt("Please enter your GPS destination [latitude,longitude]", position.coords.latitude + ", " + position.coords.longitude);
    var watcherPhoneNumber = prompt("Your phone will send an SMS when you arrive at your destination. Please enter the phone number to send the SMS to. (with area code and no spaces or dashes)", "7783232713");

    startTrip(userDestination, watcherPhoneNumber);
    trackCoordinates(userDestination, watcherPhoneNumber);
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

            console.log("Distance remaining: " + distanceInKM + " KM");

            // Debug Info
            $('.current-position').html("Current position: " + currentCoordinates["lat"] + ', ' + currentCoordinates["lon"]);
            $('.user-destination').html("User destination: " + userDestination["lat"] + ', ' + userDestination['"lon']);
            $('.distance-remaining').html("Distance remaining: " + distanceInKM + "KM");


            if(distanceInKM <= distanceThresholdInKM) {
                console.log("The distance tolerance is set to " + (distanceInKM/1000).toFixed(2) + " meters.");
                $('.notifications .container').prepend("<p>The distance tolerance is set to " + (distanceInKM/1000).toFixed(2) + " meters.</p>");
                console.log("You have reached your destination (" + (distanceInKM/1000).toFixed(2) + " meters away).");
                $('.notifications .container').prepend("<p>You have reached your destination (" + (distanceInKM/1000).toFixed(2) + " meters away).</p>");

                endTrip(watchID, watcherPhoneNumber);
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