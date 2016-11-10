var context = require("./context");


var audio = exports;


audio.context = context;
audio.Clip = require("./Clip");
audio.Source = require("./Source");

audio.setOrientation = function(ox, oy, oz, ux, uy, uz) {
    if (context) {
        context.listener.setOrientation(ox, oy, oz, ux, uy, uz);
    }
};

audio.setPosition = function(x, y, z) {
    if (context) {
        context.listener.setPosition(x, y, z);
    }
};

audio.setSpeedOfSound = function(speed) {
    if (context) {
        context.listener.speedOfSound = speed;
    }
};

audio.setDopplerFactor = function(dopplerFactor) {
    if (context) {
        context.listener.dopplerFactor = dopplerFactor;
    }
};