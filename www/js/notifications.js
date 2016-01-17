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

    $('.notifications .container').hide().append(notification).fadeIn(2500);

}