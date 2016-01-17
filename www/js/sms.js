function sendSMS(phoneNumber, message) {
        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                //intent: 'INTENT'  // send SMS with the native android SMS messaging
                intent: '' // send SMS without open any other app
            }
        };

        var success = function () {
            console.log('SMS successfully sent to ' + phoneNumber);
            $('.notifications .container').prepend("<p>SMS successfully sent to " + phoneNumber + ".</p>");
            // @TODO Refactor emergency send status into separate functions
            if($(".emergency-send-status p").html() == "Sending") {
              $(".emergency-send-status").hide().html("<p>SMS sent to </p> + phoneNumber").fadeIn("slow");
            }
        };
        var error = function (e) {
          console.log("SMS messaged failed to send to " + phoneNumber + " with error " + e);
          $('.notifications .container').prepend("<p>SMS messaged failed to send to " + phoneNumber + " with error " + e + "</p>");
          // @TODO Refactor emergency send status into separate functions
          if($(".emergency-send-status p").html() == "Sending") {
            $(".emergency-send-status").hide().html("<p>Failed to send SMS to </p>" + phoneNumber).fadeIn("slow");
          }
        };
        sms.send(phoneNumber, message, options, success, error);
}