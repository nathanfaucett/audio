var isBoolean = require("is_boolean"),
    isNumber = require("is_number"),
    EventEmitter = require("event_emitter"),
    mathf = require("mathf"),
    now = require("now");


var AudioSourcePrototype;


module.exports = AudioSource;


function AudioSource() {
    var _this = this;

    EventEmitter.call(this, -1);

    this.clip = null;

    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.panningModel = "HRTF";
    this.distanceModel = "inverse";

    this.refDistance = 1.0;
    this.maxDistance = 10000.0;
    this.rolloffFactor = 1.0;

    this.coneInnerAngle = 360.0;
    this.coneOuterAngle = 0.0;
    this.coneOuterGain = 0.0;

    this.playing = false;
    this.paused = false;

    this.__source = null;
    this.__startTime = 0.0;

    this.__onEnd = function onEnd() {
        _this.__source = null;
        _this.playing = false;
        _this.paused = false;
        _this.currentTime = 0.0;
        _this.__startTime = 0.0;
        _this.emit("end");
    };
}
EventEmitter.extend(AudioSource);
AudioSourcePrototype = AudioSource.prototype;

AudioSource.create = function(options) {
    return (new AudioSource()).construct(options);
};

AudioSourcePrototype.construct = function(options) {

    if (options) {
        if (options.clip) {
            this.clip = options.clip;
        }

        if (isBoolean(options.ambient)) {
            this.ambient = options.ambient;
        }
        if (isBoolean(options.loop)) {
            this.loop = options.loop;
        }

        if (isNumber(options.volume)) {
            this.volume = options.volume;
        }
        if (isNumber(options.dopplerLevel)) {
            this.dopplerLevel = options.dopplerLevel;
        }
    }

    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this.__source = null;
    this.__startTime = 0.0;

    return this;
};

AudioSourcePrototype.destructor = function() {

    this.clip = null;

    this.ambient = false;
    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this.__source = null;
    this.__startTime = 0.0;

    return this;
};

AudioSourcePrototype.setClip = function(value) {
    this.clip = value;
    return this;
};

AudioSourcePrototype.setAmbient = function(value) {
    this.ambient = !!value;
    return this;
};

AudioSourcePrototype.setDopplerLevel = function(value) {
    this.dopplerLevel = mathf.clampBottom(value, 0);
    return this;
};

AudioSourcePrototype.setVolume = function(value) {
    var source = this.__source;

    this.volume = mathf.clamp01(value || 0);

    if (source) {
        source.volume = this.volume;
    }

    return this;
};

AudioSourcePrototype.setPanningModel = function(value) {
    this.panningModel = value;
    return this;
};

AudioSourcePrototype.setDistanceModel = function(value) {
    this.distanceModel = value;
    return this;
};

AudioSourcePrototype.setRefDistance = function(value) {
    this.refDistance = value;
    return this;
};

AudioSourcePrototype.setMaxDistance = function(value) {
    this.maxDistance = value;
    return this;
};

AudioSourcePrototype.setRolloffFactor = function(value) {
    this.rolloffFactor = value;
    return this;
};

AudioSourcePrototype.setConeInnerAngle = function(value) {
    this.coneInnerAngle = value || 0;
    return this;
};

AudioSourcePrototype.setConeOuterAngle = function(value) {
    this.coneOuterAngle = value || 0;
    return this;
};

AudioSourcePrototype.setConeOuterGain = function(value) {
    this.coneOuterGain = value || 0;
    return this;
};

AudioSourcePrototype.setLoop = function(value) {
    this.loop = !!value;
    return this;
};

AudioSourcePrototype.setPosition = function( /* position */ ) {
    return this;
};

AudioSourcePrototype.setVelocity = function( /* velocity */ ) {
    return this;
};

AudioSourcePrototype.setOrientation = function( /* orientation */ ) {
    return this;
};

function AudioSource_reset(_this) {
    var source = _this.__source = document.createElement("audio");

    source.src = _this.clip.src;
    source.onended = _this.__onEnd;
    source.volume = _this.volume;
    source.loop = _this.loop;
}

AudioSourcePrototype.play = function(delay, offset, duration) {
    var _this = this,
        clip = this.clip,
        currentTime, clipDuration;

    if (clip && clip.raw && (!this.playing || this.paused)) {
        currentTime = this.currentTime;
        clipDuration = clip.raw.duration;

        delay = delay || 0.0;
        offset = offset || currentTime;
        duration = mathf.clamp(duration || clipDuration || 0.0, 0.0, clipDuration);

        AudioSource_reset(this);

        this.playing = true;
        this.paused = false;
        this.__startTime = now() * 0.001;
        this.currentTime = offset;

        if (this.loop) {
            this.__source.play();
        } else {
            this.__source.play();
        }

        if (delay === 0.0) {
            this.emit("play");
        } else {
            setTimeout(function() {
                _this.emit("play");
            }, delay * 1000);
        }
    }

    return this;
};

AudioSourcePrototype.pause = function() {
    var clip = this.clip;

    if (clip && clip.raw && this.playing && !this.paused) {
        this.paused = true;
        this.currentTime = (now() - this.__startTime) * 0.001;
        this.__source.pause();
        this.emit("pause");
    }

    return this;
};

AudioSourcePrototype.stop = function() {
    var clip = this.clip;

    if (this.playing && clip && clip.raw) {
        this.__source.pause();
        this.emit("stop");
        this.__onEnd();
    }

    return this;
};

AudioSourcePrototype.toJSON = function(json) {

    json = json || {};

    json.loop = this.loop;
    json.volume = this.volume;
    json.dopplerLevel = this.dopplerLevel;
    json.currentTime = this.currentTime;

    json.panningModel = this.panningModel;
    json.distanceModel = this.distanceModel;

    json.refDistance = this.refDistance;
    json.maxDistance = this.maxDistance;
    json.rolloffFactor = this.rolloffFactor;

    json.coneInnerAngle = this.coneInnerAngle;
    json.coneOuterAngle = this.coneOuterAngle;
    json.coneOuterGain = this.coneOuterGain;

    return json;
};

AudioSourcePrototype.fromJSON = function(json) {

    this.loop = json.loop;
    this.volume = json.volume;
    this.dopplerLevel = json.dopplerLevel;
    this.currentTime = json.currentTime;

    this.panningModel = json.panningModel;
    this.distanceModel = json.distanceModel;

    this.refDistance = json.refDistance;
    this.maxDistance = json.maxDistance;
    this.rolloffFactor = json.rolloffFactor;

    this.coneInnerAngle = json.coneInnerAngle;
    this.coneOuterAngle = json.coneOuterAngle;
    this.coneOuterGain = json.coneOuterGain;

    return json;
};
