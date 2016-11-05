var isBoolean = require("@nathanfaucett/is_boolean"),
    isNumber = require("@nathanfaucett/is_number"),
    isString = require("@nathanfaucett/is_string"),
    EventEmitter = require("@nathanfaucett/event_emitter"),
    mathf = require("@nathanfaucett/mathf"),
    now = require("@nathanfaucett/now"),
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

    this._source = null;
    this._gain = null;
    this._panner = null;

    this._startTime = 0.0;

    this._onEnd = function onEnd() {
        _this._source = null;
        _this._gain = null;
        _this._panner = null;
        _this.playing = false;
        _this.paused = false;
        _this.currentTime = 0.0;
        _this._startTime = 0.0;
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

        if (isString(options.panningModel)) {
            this.panningModel = options.panningModel;
        }
        if (isString(options.distanceModel)) {
            this.distanceModel = options.distanceModel;
        }

        if (isNumber(options.refDistance)) {
            this.refDistance = options.refDistance;
        }
        if (isNumber(options.maxDistance)) {
            this.maxDistance = options.maxDistance;
        }
        if (isNumber(options.rolloffFactor)) {
            this.rolloffFactor = options.rolloffFactor;
        }

        if (isNumber(options.coneInnerAngle)) {
            this.coneInnerAngle = options.coneInnerAngle;
        }
        if (isNumber(options.coneOuterAngle)) {
            this.coneOuterAngle = options.coneOuterAngle;
        }
        if (isNumber(options.coneOuterGain)) {
            this.coneOuterGain = options.coneOuterGain;
        }
    }

    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this._source = null;
    this._gain = null;
    this._panner = null;

    this._startTime = 0.0;

    return this;
};

WebAudioSourcePrototype.destructor = function() {

    this.clip = null;

    this.ambient = false;
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

    this._source = null;
    this._gain = null;
    this._panner = null;

    this._startTime = 0.0;

    return this;
};

WebAudioSourcePrototype.setClip = function(value) {
    this.clip = value;
    return this;
};

WebAudioSourcePrototype.setPanningModel = function(value) {
    var panner = this._panner;

    this.panningModel = value;

    if (panner) {
        panner.panningModel = this.panningModel;
    }

    return this;
};

WebAudioSourcePrototype.setDistanceModel = function(value) {
    var panner = this._panner;

    this.distanceModel = value;

    if (panner) {
        panner.distanceModel = this.distanceModel;
    }

    return this;
};

WebAudioSourcePrototype.setRefDistance = function(value) {
    var panner = this._panner;

    this.refDistance = value;

    if (panner) {
        panner.refDistance = this.refDistance;
    }

    return this;
};

WebAudioSourcePrototype.setMaxDistance = function(value) {
    var panner = this._panner;

    this.maxDistance = value;

    if (panner) {
        panner.maxDistance = this.maxDistance;
    }

    return this;
};

WebAudioSourcePrototype.setRolloffFactor = function(value) {
    var panner = this._panner;

    this.rolloffFactor = value;

    if (panner) {
        panner.rolloffFactor = this.rolloffFactor;
    }

    return this;
};

WebAudioSourcePrototype.setConeInnerAngle = function(value) {
    var panner = this._panner;

    this.coneInnerAngle = value || 0;

    if (panner) {
        panner.coneInnerAngle = this.coneInnerAngle;
    }

    return this;
};

WebAudioSourcePrototype.setConeOuterAngle = function(value) {
    var panner = this._panner;

    this.coneOuterAngle = value || 0;

    if (panner) {
        panner.coneOuterAngle = this.coneOuterAngle;
    }

    return this;
};

WebAudioSourcePrototype.setConeOuterGain = function(value) {
    var panner = this._panner;

    this.coneOuterGain = value || 0;

    if (panner) {
        panner.coneOuterGain = this.coneOuterGain;
    }

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
    var gainNode = this._gain;

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
    var panner = this._panner;

    if (panner) {
        panner.setPosition(position[0], position[1], position[2]);
    }

    return this;
};

WebAudioSourcePrototype.setVelocity = function(velocity) {
    var panner = this._panner;

    if (panner) {
        panner.setVelocity(velocity[0], velocity[1], velocity[2]);
    }

    return this;
};

WebAudioSourcePrototype.setOrientation = function(orientation) {
    var panner = this._panner;

    if (panner) {
        panner.setOrientation(orientation[0], orientation[1], orientation[2]);
    }

    return this;
};

function WebAudioSource_reset(_this) {
    var source = _this._source = context.createBufferSource(),
        gainNode = _this._gain = context.createGain(),
        pannerNode;

    if (_this.ambient === true) {
        gainNode.connect(context.destination);
        source.connect(gainNode);
    } else {
        pannerNode = _this._panner = context.createPanner();

        pannerNode.panningModel = _this.panningModel;
        pannerNode.distanceModel = _this.distanceModel;

        pannerNode.refDistance = _this.refDistance;
        pannerNode.maxDistance = _this.maxDistance;
        pannerNode.rolloffFactor = _this.rolloffFactor;

        pannerNode.coneInnerAngle = _this.coneInnerAngle;
        pannerNode.coneOuterAngle = _this.coneOuterAngle;
        pannerNode.coneOuterGain = _this.coneOuterGain;

        pannerNode.setOrientation(0, 0, 1);

        pannerNode.connect(gainNode);
        gainNode.connect(context.destination);
        source.connect(pannerNode);
    }

    source.buffer = _this.clip.data;
    source.onended = _this._onEnd;

    gainNode.gain.value = _this.volume;
    source.loop = _this.loop;
}

WebAudioSourcePrototype.play = function(delay, offset, duration) {
    var _this = this,
        clip = this.clip,
        currentTime, clipDuration;

    if (clip && clip.data && (!this.playing || this.paused)) {
        currentTime = this.currentTime;
        clipDuration = clip.data.duration;

        delay = delay || 0.0;
        offset = offset || currentTime;
        duration = mathf.clamp(duration || clipDuration || 0.0, 0.0, clipDuration);

        WebAudioSource_reset(this);

        this.playing = true;
        this.paused = false;
        this._startTime = now() * 0.001;
        this.currentTime = offset;

        if (this.loop) {
            this._source.start(delay, offset);
        } else {
            this._source.start(delay, offset, duration);
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

    if (clip && clip.data && this.playing && !this.paused) {
        this.paused = true;
        this.currentTime = (now() - this._startTime) * 0.001;
        this._source.stop();
        this.emit("pause");
    }

    return this;
};

WebAudioSourcePrototype.stop = function() {
    var clip = this.clip;

    if (this.playing && clip && clip.data) {
        this._source.stop();
        this.emit("stop");
        this._onEnd();
    }

    return this;
};

WebAudioSourcePrototype.toJSON = function(json) {

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

WebAudioSourcePrototype.fromJSON = function(json) {

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
