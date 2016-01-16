function sendSMS(phoneNumber) {
        var message = "The user reached their destination.";

        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                //intent: 'INTENT'  // send SMS with the native android SMS messaging
                intent: '' // send SMS without open any other app
            }
        };

        var success = function () {
            alert('SMS successfully sent to' + phoneNumber);
        };
        var error = function (e) {
            alert('SMS send message failed:' + e);
        };
        sms.send(phoneNumber, message, options, success, error);
}