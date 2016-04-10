/**
 * App settings (not necessarily exposed to the user).
 */
var settings = new function() {
  this.GPS = {
    "frequency": 6000,
    "enableHighAccuracy": true,
    "background": {
      "desiredAccuracy": 10, // <- [0, 10, 100, 1000]. Lower == more accuracy, more battery power required
      "stationaryRadius": 2, // <- Min meters device needs to travel after stationary to restart tracking
      "distanceFilter": 2, // <- Min metersa device must move horizontally before an update event is generated
      notificationTitle: 'SAS',
      notificationText: 'GPS tracking active',
      notificationIcon: '',
      notificationIconColor: '',
    },
  };
};
