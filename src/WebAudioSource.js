var EventEmitter = require("event_emitter"),
    mathf = require("mathf"),
    vec3 = require("vec3"),
    time = require("time"),
    audioContext = require("./audioContext");


var WebAudioSourcePrototype;


module.exports = WebAudioSource;


function WebAudioSource() {
    var _this = this;

    EventEmitter.call(this, -1);

    this.clip = null;

    this.currentTime = 0;
    this.loop = false;
    this.volume = 1;
    this.dopplerLevel = 0;

    this.playing = false;
    this.paused = false;

    this.__source = null;
    this.__gain = null;
    this.__panner = null;

    this.__startTime = 0;

    this.__onEnd = function onEnd() {
        _this.__source = null;
        _this.__gain = null;
        _this.__panner = null;
        _this.playing = false;
        _this.paused = false;
        _this.currentTime = 0;
        _this.__startTime = 0;
        _this.emit("end");
    };
}
EventEmitter.extend(WebAudioSource);
WebAudioSourcePrototype = WebAudioSource.prototype;

WebAudioSourcePrototype.destructor = function() {

    this.clip = null;

    this.ambient = false;
    this.currentTime = 0;
    this.loop = false;
    this.volume = 1;
    this.dopplerLevel = 0;

    this.playing = false;
    this.paused = false;

    this.__source = null;
    this.__gain = null;
    this.__panner = null;

    this.__startTime = 0;

    return this;
};

WebAudioSourcePrototype.setClip = function(value) {
    this.clip = value;
    return this;
};

WebAudioSourcePrototype.setAmbient = function(value) {
    this.ambient = !!value;
    return this;
};

WebAudioSourcePrototype.setDopplerLevel = function(value) {
    this.dopplerLevel = mathf.clampBottom(value, 0);
    return this;
};

WebAudioSourcePrototype.setVolume = function(value) {
    var gain = this.__gain;

    this.volume = mathf.clamp01(value || 0);

    if (gain) {
        gain.gain.value = this.volume;
    }

    return this;
};

WebAudioSourcePrototype.setLoop = function(value) {
    this.loop = !!value;
    return this;
};

WebAudioSourcePrototype.setPosition = function(position) {
    var panner = this.__panner;

    if (panner) {
        panner.setPosition(position[0], position[1], position[2]);
    }

    return this;
};

WebAudioSource_reset = function(_this) {
    var source = _this.__source = audioContext.createBufferSource(),
        gain = _this.__gain = audioContext.createGain(),
        panner;

    if (_this.ambient === true) {
        gain.connect(audioContext.destination);
        source.connect(gain);
    } else {
        panner = _this.__panner = audioContext.createPanner();
        gain.connect(audioContext.destination);
        panner.connect(gain);
        source.connect(panner);
    }

    source.buffer = _this.clip.raw;
    source.onended = _this.__onEnd;

    gain.gain.value = _this.volume;
    source.loop = _this.loop;
};

WebAudioSourcePrototype.play = function(delay, offset, duration) {
    var _this = this,
        clip = this.clip,
        currentTime, clipDuration, maxLength;

    if (clip && clip.raw && (!this.playing || this.paused)) {
        currentTime = this.currentTime;
        clipDuration = clip.raw.duration;

        delay = delay || 0;
        offset = offset || currentTime;
        duration = duration || clipDuration;
        duration = duration > clipDuration ? clipDuration : duration;

        WebAudioSource_reset(this);

        this.playing = true;
        this.paused = false;
        this.__startTime = time.now();
        this.currentTime = offset;

        this.__source.start(delay, offset, duration);

        if (delay === 0) {
            this.emit("play");
        } else {
            setTimeout(function() {
                _this.emit("play");
            }, delay * 1000);
        }
    }

    return this;
};

WebAudioSourcePrototype.pause = function() {
    var clip = this.clip;

    if (clip && clip.raw && this.playing && !this.paused) {
        this.paused = true;
        this.currentTime = time.now() - this.__startTime;
        this.__source.stop(this.currentTime);
        this.emit("pause");
    }

    return this;
};

WebAudioSourcePrototype.stop = function() {
    var clip = this.clip;

    if (this.playing && clip && clip.raw) {
        this.__source.stop(0);
        this.emit("stop");
        this.__onEnd();
    }

    return this;
};
