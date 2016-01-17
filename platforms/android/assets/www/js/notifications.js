var notifications = [];

function addNotification(notification) {

    //notifications.push(notification);
    //
    //setInterval(function(){
    //    if(notifications.length > 0) {
    //
    //    }
    //    else {
    //        //
    //    }
    //}, 2000);

    var displayedNotification = $(notification).hide().prependTo('.notifications .container').fadeIn(2000);

    setTimeout(function(){
        displayedNotification.fadeOut(4000);
    }, 9000);
}