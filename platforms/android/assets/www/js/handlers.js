$(document).ready( function() {

  // @TODO: Refactor everything

  /**
  * Set some intial values.
  */
  window.localStorage.setItem("watcherPhoneNumber", "Not yet set");
  window.localStorage.setItem("userDestination", "Not yet set");
  window.localStorage.setItem("emergencySMS", "7783232713");

  /**
   * Date picker.
   */
  $('#diary-publish-time').datetimepicker({
    format: 'YYYY-MM-DDTHH:mm:ss'
  });

  $('.button.set-diary-publish-time').on("touch", function() {
    $('#diary-publish-time').trigger("touch");
  });


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
   * Create Diary Handler
   */
  $('.start-diary.button').click(function(e) {
    Diary.createDiary();
  });


  /**
   * Get Diary Handler
   */
  $('.get-diary.button').click(function(e) {
    var desiredDiaryId = $('#diary-id').val();
    if(typeof desiredDiaryId == 'undefined') {
      desiredDiaryId = getCurrentDiaryId();
    }
    console.log("desiredDiaryId before getting Diary is: " + JSON.stringify(desiredDiaryId));
    Diary.getDiary(desiredDiaryId);
  });


  /**
   * Add Diary Photo Handler
   */
  $('.add-photo.button').click(function(e) {
    Diary.createDiaryImage();
  });

  /**
   * Set Diary Publish Time Button Handler
   */
  $('.set-diary-publish-time.button').click(function(e) {
    $('.form-group.set-diary-publish-time').show();
    $('.form-group #diary-publish-time').show();
    $('.form-group.set-diary-publish-time .button').visible();
    $('input#diary-publish-time').trigger("touch");
  });

  /**
   * Diary Publish Time Input Field Handler
   */
  $('.set-diary-publish-time input').click(function(e) {
    $('.set-diary-publish-time .button').visible();
  });

  /**
   * Confirm Set Diary Publish Time Handler
   */
  $('.confirm-diary-publish-time.button').click(function(e) {
    var publishTime = $('input#diary-publish-time').val();
    console.log("Diary publish time set to " + publishTime + ". About to call Diary.setPublishTime");

    Diary.setPublishTime(moment(publishTime).utc().format('YYYY-MM-DDTHH:mm:ss'));

    $('.form-group.set-diary-publish-time').hide();
    // @TODO this should really happen after updateDiarySuccess function has been called, but we'll cheat for now
    addNotification("<p>Diary publish time updated to " + publishTime + "</p>");
    $('.diary-publish-time .publish-time').html(publishTime.replace("T", " "));
    $('.diary-publish-time').show();
  });

  /**
   * Publish Diary now.
   * @TODO Combine with Confirm Set Diary Publish Time Handler function.
   */
  $('.publish-diary-now.button').click(function(e) {
    var now = moment();
    $('#diary-publish-time').data("DateTimePicker").date(now);
    var publishTime = $('input#diary-publish-time').val();

    Diary.setPublishTime(moment(publishTime).utc().format('YYYY-MM-DDTHH:mm:ss'));

    $('.form-group.set-diary-publish-time').hide();
    // @TODO this should really happen after updateDiarySuccess function has been called, but we'll cheat for now
    addNotification("<p>Diary published.</p>");
  });

  /**
   * Add Diary Note Handler
   */
  $('.add-note.button').click(function(e) {
    var note = prompt("Add Note", "");
    Diary.createNote(note);
  });

  /**
   * End Diary Handler
   */
  $('.end-diary.button').click(function(e) {
    Diary.endDiary();
    $('.diary-publish-time').hide();
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

});
