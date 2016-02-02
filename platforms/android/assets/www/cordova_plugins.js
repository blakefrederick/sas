cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-device/www/device.js",
        "id": "cordova-plugin-device.device",
        "pluginId": "cordova-plugin-device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/com.cordova.plugins.sms/www/sms.js",
        "id": "com.cordova.plugins.sms.Sms",
        "pluginId": "com.cordova.plugins.sms",
        "clobbers": [
            "window.sms"
        ]
    },
    {
        "file": "plugins/de.appplant.cordova.plugin.background-mode/www/background-mode.js",
        "id": "de.appplant.cordova.plugin.background-mode.BackgroundMode",
        "pluginId": "de.appplant.cordova.plugin.background-mode",
        "clobbers": [
            "cordova.plugins.backgroundMode",
            "plugin.backgroundMode"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.0",
    "cordova-plugin-device": "1.1.0",
    "cordova-plugin-console": "1.0.2",
    "com.cordova.plugins.sms": "0.1.6",
    "de.appplant.cordova.plugin.background-mode": "0.6.4"
}
// BOTTOM OF METADATA
});