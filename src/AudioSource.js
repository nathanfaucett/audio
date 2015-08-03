var time = require("time");


var AudioSourcePrototype;


module.exports = AudioSource;


function AudioSource() {
    this.__time = 0;
    this.__audio = null;
}
AudioSourcePrototype = AudioSource.prototype;

AudioSourcePrototype.setClip = function(audio) {
    this.__audio = audio;
    return this;
};

AudioSourcePrototype.play = function(offset) {
    return this;
};
