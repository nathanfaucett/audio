var isBoolean = require("is_boolean"),
    isNumber = require("is_number"),
    EventEmitter = require("event_emitter"),
    mathf = require("mathf"),
    now = require("now"),
    context = require("./context");


var WebAudioSourcePrototype;


module.exports = WebAudioSource;


function WebAudioSource() {
    var _this = this;

    EventEmitter.call(this, -1);

    this.clip = null;

    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this.__source = null;
    this.__gain = null;
    this.__panner = null;

    this.__startTime = 0.0;

    this.__onEnd = function onEnd() {
        _this.__source = null;
        _this.__gain = null;
        _this.__panner = null;
        _this.playing = false;
        _this.paused = false;
        _this.currentTime = 0.0;
        _this.__startTime = 0.0;
        _this.emit("end");
    };
}
EventEmitter.extend(WebAudioSource);
WebAudioSourcePrototype = WebAudioSource.prototype;

WebAudioSource.create = function(options) {
    return (new WebAudioSource()).construct(options);
};

WebAudioSourcePrototype.construct = function(options) {

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
    this.__gain = null;
    this.__panner = null;

    this.__startTime = 0.0;

    return this;
};

WebAudioSourcePrototype.destructor = function() {

    this.clip = null;

    this.ambient = false;
    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this.__source = null;
    this.__gain = null;
    this.__panner = null;

    this.__startTime = 0.0;

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
    var gainNode = this.__gain;

    this.volume = mathf.clamp01(value || 0);

    if (gainNode) {
        gainNode.gain.value = this.volume;
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

WebAudioSourcePrototype.setVelocity = function(velocity) {
    var panner = this.__panner;

    if (panner) {
        panner.setVelocity(velocity[0], velocity[1], velocity[2]);
    }

    return this;
};

WebAudioSourcePrototype.setOrientation = function(orientation) {
    var panner = this.__panner;

    if (panner) {
        panner.setOrientation(orientation[0], orientation[1], orientation[2]);
    }

    return this;
};

function WebAudioSource_reset(_this) {
    var source = _this.__source = context.createBufferSource(),
        gainNode = _this.__gain = context.createGain(),
        pannerNode;

    if (_this.ambient === true) {
        gainNode.connect(context.destination);
        source.connect(gainNode);
    } else {
        pannerNode = _this.__panner = context.createPanner();

        pannerNode.panningModel = "HRTF";
        pannerNode.distanceModel = "inverse";

        pannerNode.rolloffFactor = 1;
        pannerNode.coneInnerAngle = 360;
        pannerNode.coneOuterAngle = 0;
        pannerNode.coneOuterGain = 0;

        pannerNode.connect(gainNode);
        gainNode.connect(context.destination);
        source.connect(pannerNode);
    }

    source.buffer = _this.clip.raw;
    source.onended = _this.__onEnd;

    gainNode.gain.value = _this.volume;
    source.loop = _this.loop;
}

WebAudioSourcePrototype.play = function(delay, offset, duration) {
    var _this = this,
        clip = this.clip,
        currentTime, clipDuration;

    if (clip && clip.raw && (!this.playing || this.paused)) {
        currentTime = this.currentTime;
        clipDuration = clip.raw.duration;

        delay = delay || 0.0;
        offset = offset || currentTime;
        duration = mathf.clamp(duration || clipDuration || 0.0, 0.0, clipDuration);

        WebAudioSource_reset(this);

        this.playing = true;
        this.paused = false;
        this.__startTime = now() * 0.001;
        this.currentTime = offset;

        if (this.loop) {
            this.__source.start(delay, offset);
        } else {
            this.__source.start(delay, offset, duration);
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

WebAudioSourcePrototype.pause = function() {
    var clip = this.clip;

    if (clip && clip.raw && this.playing && !this.paused) {
        this.paused = true;
        this.currentTime = (now() - this.__startTime) * 0.001;
        this.__source.stop();
        this.emit("pause");
    }

    return this;
};

WebAudioSourcePrototype.stop = function() {
    var clip = this.clip;

    if (this.playing && clip && clip.raw) {
        this.__source.stop();
        this.emit("stop");
        this.__onEnd();
    }

    return this;
};
