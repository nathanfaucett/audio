(function(dependencies, chunks, undefined, global) {
    
    var cache = [];
    

    function Module() {
        this.id = null;
        this.filename = null;
        this.dirname = null;
        this.exports = {};
        this.loaded = false;
    }

    Module.prototype.require = require;

    function require(index) {
        var module = cache[index],
            callback, exports;

        if (module !== undefined) {
            return module.exports;
        } else {
            callback = dependencies[index];

            cache[index] = module = new Module();
            exports = module.exports;

            callback.call(exports, require, exports, module, undefined, global);
            module.loaded = true;

            return module.exports;
        }
    }

    require.resolve = function(path) {
        return path;
    };

    

    require.async = function async(index, callback) {
        callback(require(index));
    };

    

    if (typeof(define) === "function" && define.amd) {
        define([], function() {
            return require(0);
        });
    } else if (typeof(module) !== "undefined" && module.exports) {
        module.exports = require(0);
    } else {
        
        require(0);
        
    }
}([
function(require, exports, module, undefined, global) {
/* index.js */

var environment = require(1),
    eventListener = require(2),
    audio = require(3);


var boomClip = new audio.Clip("./content/boom.ogg"),
    engineClip = new audio.Clip("./content/engine-loop.ogg"),
    loading = 3;


function check() {
    loading -= 1;
    if (loading === 0) {
        start();
    }
}

boomClip.load(check);
engineClip.load(check);
eventListener.on(environment.window, "load", check);


function start() {
    var boomSource = audio.Source.create({
            volume: 1,
            clip: boomClip
        }),
        engineSource = audio.Source.create({
            volume: 0.25,
            loop: true,
            clip: engineClip
        });

    engineSource.play();

    setTimeout(function() {
        boomSource.play();
    }, 1000);

    setTimeout(function() {
        engineSource.stop();
    }, 2000);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/environment/src/index.js */

var environment = exports,

    hasWindow = typeof(window) !== "undefined",
    userAgent = hasWindow ? window.navigator.userAgent : "";


environment.worker = typeof(importScripts) !== "undefined";

environment.browser = environment.worker || !!(
    hasWindow &&
    typeof(navigator) !== "undefined" &&
    window.document
);

environment.node = !environment.worker && !environment.browser;

environment.mobile = environment.browser && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

environment.window = (
    hasWindow ? window :
    typeof(global) !== "undefined" ? global :
    typeof(self) !== "undefined" ? self : {}
);

environment.pixelRatio = environment.window.devicePixelRatio || 1;

environment.document = typeof(document) !== "undefined" ? document : {};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/event_listener/src/index.js */

var process = require(4);
var isObject = require(5),
    isFunction = require(6),
    environment = require(1),
    eventTable = require(7);


var eventListener = module.exports,

    reSpliter = /[\s]+/,

    window = environment.window,
    document = environment.document,

    listenToEvent, captureEvent, removeEvent, dispatchEvent;


window.Event = window.Event || function EmptyEvent() {};


eventListener.on = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        listenToEvent(target, eventTypes[i], callback);
    }
};

eventListener.capture = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        captureEvent(target, eventTypes[i], callback);
    }
};

eventListener.off = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        removeEvent(target, eventTypes[i], callback);
    }
};

eventListener.emit = function(target, eventType, event) {

    return dispatchEvent(target, eventType, isObject(event) ? event : {});
};

eventListener.getEventConstructor = function(target, eventType) {
    var getter = eventTable[eventType];
    return isFunction(getter) ? getter(target) : window.Event;
};


if (isFunction(document.addEventListener)) {

    listenToEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, false);
    };

    captureEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, true);
    };

    removeEvent = function(target, eventType, callback) {

        target.removeEventListener(eventType, callback, false);
    };

    dispatchEvent = function(target, eventType, event) {
        var getter = eventTable[eventType],
            EventType = isFunction(getter) ? getter(target) : window.Event;

        return !!target.dispatchEvent(new EventType(eventType, event));
    };
} else if (isFunction(document.attachEvent)) {

    listenToEvent = function(target, eventType, callback) {

        target.attachEvent("on" + eventType, callback);
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType, callback) {

        target.detachEvent("on" + eventType, callback);
    };

    dispatchEvent = function(target, eventType, event) {
        var doc = target.ownerDocument || document;

        return !!target.fireEvent("on" + eventType, doc.createEventObject(event));
    };
} else {

    listenToEvent = function(target, eventType, callback) {

        target["on" + eventType] = callback;
        return target;
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType) {

        target["on" + eventType] = null;
        return true;
    };

    dispatchEvent = function(target, eventType, event) {
        var onType = "on" + eventType;

        if (isFunction(target[onType])) {
            event.type = eventType;
            return !!target[onType](event);
        }

        return false;
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../src/index.js */

var audio = exports;


audio.context = require(14);
audio.load = require(15);
audio.Clip = require(16);
audio.Source = require(17);


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/process/browser.js */

// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_object/src/index.js */

var isNull = require(8);


module.exports = isObject;


function isObject(value) {
    var type = typeof(value);
    return type === "function" || (!isNull(value) && type === "object") || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_function/src/index.js */

var objectToString = Object.prototype.toString,
    isFunction;


if (objectToString.call(function() {}) === "[object Object]") {
    isFunction = function isFunction(value) {
        return value instanceof Function;
    };
} else if (typeof(/./) === "function" || (typeof(Uint8Array) !== "undefined" && typeof(Uint8Array) !== "function")) {
    isFunction = function isFunction(value) {
        return objectToString.call(value) === "[object Function]";
    };
} else {
    isFunction = function isFunction(value) {
        return typeof(value) === "function" || false;
    };
}


module.exports = isFunction;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/event_listener/src/event_table.js */

var isNode = require(9),
    environment = require(1);


var window = environment.window,

    XMLHttpRequest = window.XMLHttpRequest,
    OfflineAudioContext = window.OfflineAudioContext;


function returnEvent() {
    return window.Event;
}


module.exports = {
    abort: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    afterprint: returnEvent,

    animationend: function() {
        return window.AnimationEvent || window.Event;
    },
    animationiteration: function() {
        return window.AnimationEvent || window.Event;
    },
    animationstart: function() {
        return window.AnimationEvent || window.Event;
    },

    audioprocess: function() {
        return window.AudioProcessingEvent || window.Event;
    },

    beforeprint: returnEvent,
    beforeunload: function() {
        return window.BeforeUnloadEvent || window.Event;
    },
    beginevent: function() {
        return window.TimeEvent || window.Event;
    },

    blocked: returnEvent,
    blur: function() {
        return window.FocusEvent || window.Event;
    },

    cached: returnEvent,
    canplay: returnEvent,
    canplaythrough: returnEvent,
    chargingchange: returnEvent,
    chargingtimechange: returnEvent,
    checking: returnEvent,

    click: function() {
        return window.MouseEvent || window.Event;
    },

    close: returnEvent,
    compassneedscalibration: function() {
        return window.SensorEvent || window.Event;
    },
    complete: function(target) {
        if (OfflineAudioContext && target instanceof OfflineAudioContext) {
            return window.OfflineAudioCompletionEvent || window.Event;
        } else {
            return window.Event;
        }
    },

    compositionend: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionstart: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionupdate: function() {
        return window.CompositionEvent || window.Event;
    },

    contextmenu: function() {
        return window.MouseEvent || window.Event;
    },
    copy: function() {
        return window.ClipboardEvent || window.Event;
    },
    cut: function() {
        return window.ClipboardEvent || window.Event;
    },

    dblclick: function() {
        return window.MouseEvent || window.Event;
    },
    devicelight: function() {
        return window.DeviceLightEvent || window.Event;
    },
    devicemotion: function() {
        return window.DeviceMotionEvent || window.Event;
    },
    deviceorientation: function() {
        return window.DeviceOrientationEvent || window.Event;
    },
    deviceproximity: function() {
        return window.DeviceProximityEvent || window.Event;
    },

    dischargingtimechange: returnEvent,

    DOMActivate: function() {
        return window.UIEvent || window.Event;
    },
    DOMAttributeNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMAttrModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMCharacterDataModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMContentLoaded: returnEvent,
    DOMElementNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMFocusIn: function() {
        return window.FocusEvent || window.Event;
    },
    DOMFocusOut: function() {
        return window.FocusEvent || window.Event;
    },
    DOMNodeInserted: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeInsertedIntoDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemoved: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemovedFromDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMSubtreeModified: function() {
        return window.FocusEvent || window.Event;
    },
    downloading: returnEvent,

    drag: function() {
        return window.DragEvent || window.Event;
    },
    dragend: function() {
        return window.DragEvent || window.Event;
    },
    dragenter: function() {
        return window.DragEvent || window.Event;
    },
    dragleave: function() {
        return window.DragEvent || window.Event;
    },
    dragover: function() {
        return window.DragEvent || window.Event;
    },
    dragstart: function() {
        return window.DragEvent || window.Event;
    },
    drop: function() {
        return window.DragEvent || window.Event;
    },

    durationchange: returnEvent,
    ended: returnEvent,

    endEvent: function() {
        return window.TimeEvent || window.Event;
    },
    error: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else if (isNode(target)) {
            return window.UIEvent || window.Event;
        } else {
            return window.Event;
        }
    },
    focus: function() {
        return window.FocusEvent || window.Event;
    },
    focusin: function() {
        return window.FocusEvent || window.Event;
    },
    focusout: function() {
        return window.FocusEvent || window.Event;
    },

    fullscreenchange: returnEvent,
    fullscreenerror: returnEvent,

    gamepadconnected: function() {
        return window.GamepadEvent || window.Event;
    },
    gamepaddisconnected: function() {
        return window.GamepadEvent || window.Event;
    },

    hashchange: function() {
        return window.HashChangeEvent || window.Event;
    },

    input: returnEvent,
    invalid: returnEvent,

    keydown: function() {
        return window.KeyboardEvent || window.Event;
    },
    keyup: function() {
        return window.KeyboardEvent || window.Event;
    },
    keypress: function() {
        return window.KeyboardEvent || window.Event;
    },

    languagechange: returnEvent,
    levelchange: returnEvent,

    load: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    loadeddata: returnEvent,
    loadedmetadata: returnEvent,

    loadend: function() {
        return window.ProgressEvent || window.Event;
    },
    loadstart: function() {
        return window.ProgressEvent || window.Event;
    },

    message: function() {
        return window.MessageEvent || window.Event;
    },

    mousedown: function() {
        return window.MouseEvent || window.Event;
    },
    mouseenter: function() {
        return window.MouseEvent || window.Event;
    },
    mouseleave: function() {
        return window.MouseEvent || window.Event;
    },
    mousemove: function() {
        return window.MouseEvent || window.Event;
    },
    mouseout: function() {
        return window.MouseEvent || window.Event;
    },
    mouseover: function() {
        return window.MouseEvent || window.Event;
    },
    mouseup: function() {
        return window.MouseEvent || window.Event;
    },

    noupdate: returnEvent,
    obsolete: returnEvent,
    offline: returnEvent,
    online: returnEvent,
    open: returnEvent,
    orientationchange: returnEvent,

    pagehide: function() {
        return window.PageTransitionEvent || window.Event;
    },
    pageshow: function() {
        return window.PageTransitionEvent || window.Event;
    },

    paste: function() {
        return window.ClipboardEvent || window.Event;
    },
    pause: returnEvent,
    pointerlockchange: returnEvent,
    pointerlockerror: returnEvent,
    play: returnEvent,
    playing: returnEvent,

    popstate: function() {
        return window.PopStateEvent || window.Event;
    },
    progress: function() {
        return window.ProgressEvent || window.Event;
    },

    ratechange: returnEvent,
    readystatechange: returnEvent,

    repeatevent: function() {
        return window.TimeEvent || window.Event;
    },

    reset: returnEvent,

    resize: function() {
        return window.UIEvent || window.Event;
    },
    scroll: function() {
        return window.UIEvent || window.Event;
    },

    seeked: returnEvent,
    seeking: returnEvent,

    select: function() {
        return window.UIEvent || window.Event;
    },
    show: function() {
        return window.MouseEvent || window.Event;
    },
    stalled: returnEvent,
    storage: function() {
        return window.StorageEvent || window.Event;
    },
    submit: returnEvent,
    success: returnEvent,
    suspend: returnEvent,

    SVGAbort: function() {
        return window.SVGEvent || window.Event;
    },
    SVGError: function() {
        return window.SVGEvent || window.Event;
    },
    SVGLoad: function() {
        return window.SVGEvent || window.Event;
    },
    SVGResize: function() {
        return window.SVGEvent || window.Event;
    },
    SVGScroll: function() {
        return window.SVGEvent || window.Event;
    },
    SVGUnload: function() {
        return window.SVGEvent || window.Event;
    },
    SVGZoom: function() {
        return window.SVGEvent || window.Event;
    },
    timeout: function() {
        return window.ProgressEvent || window.Event;
    },

    timeupdate: returnEvent,

    touchcancel: function() {
        return window.TouchEvent || window.Event;
    },
    touchend: function() {
        return window.TouchEvent || window.Event;
    },
    touchenter: function() {
        return window.TouchEvent || window.Event;
    },
    touchleave: function() {
        return window.TouchEvent || window.Event;
    },
    touchmove: function() {
        return window.TouchEvent || window.Event;
    },
    touchstart: function() {
        return window.TouchEvent || window.Event;
    },

    transitionend: function() {
        return window.TransitionEvent || window.Event;
    },
    unload: function() {
        return window.UIEvent || window.Event;
    },

    updateready: returnEvent,
    upgradeneeded: returnEvent,

    userproximity: function() {
        return window.SensorEvent || window.Event;
    },

    visibilitychange: returnEvent,
    volumechange: returnEvent,
    waiting: returnEvent,

    wheel: function() {
        return window.WheelEvent || window.Event;
    }
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_null/src/index.js */

module.exports = isNull;


function isNull(value) {
    return value === null;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_node/src/index.js */

var isString = require(10),
    isNullOrUndefined = require(11),
    isNumber = require(12),
    isFunction = require(6);


var isNode;


if (typeof(Node) !== "undefined" && isFunction(Node)) {
    isNode = function isNode(value) {
        return value instanceof Node;
    };
} else {
    isNode = function isNode(value) {
        return (!isNullOrUndefined(value) &&
            isNumber(value.nodeType) &&
            isString(value.nodeName)
        );
    };
}


module.exports = isNode;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_string/src/index.js */

module.exports = isString;


function isString(value) {
    return typeof(value) === "string" || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_null_or_undefined/src/index.js */

var isNull = require(8),
    isUndefined = require(13);


module.exports = isNullOrUndefined;

/**
  isNullOrUndefined accepts any value and returns true
  if the value is null or undefined. For all other values
  false is returned.
  
  @param {Any}        any value to test
  @returns {Boolean}  the boolean result of testing value

  @example
    isNullOrUndefined(null);   // returns true
    isNullOrUndefined(undefined);   // returns true
    isNullOrUndefined("string");    // returns false
**/
function isNullOrUndefined(value) {
    return isNull(value) || isUndefined(value);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_number/src/index.js */

module.exports = isNumber;


function isNumber(value) {
    return typeof(value) === "number" || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_undefined/src/index.js */

module.exports = isUndefined;


function isUndefined(value) {
    return value === void(0);
}


},
function(require, exports, module, undefined, global) {
/* ../../src/context.js */

var isNullOrUndefined = require(11),
    environment = require(1),
    eventListener = require(2);


var window = environment.window,

    AudioContext = (
        window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext ||
        window.oAudioContext ||
        window.msAudioContext
    ),

    context, AudioContextPrototype, OscillatorPrototype, BufferSourceNodePrototype, GainPrototype, onTouchStart;


if (AudioContext) {
    context = new AudioContext();


    AudioContextPrototype = AudioContext.prototype;
    AudioContextPrototype.UNLOCKED = !environment.mobile;
    AudioContextPrototype.createGain = AudioContextPrototype.createGain || AudioContextPrototype.createGainNode;
    AudioContextPrototype.createPanner = AudioContextPrototype.createPanner || AudioContextPrototype.createPannerNode;
    AudioContextPrototype.createDelay = AudioContextPrototype.createDelay || AudioContextPrototype.createDelayNode;
    AudioContextPrototype.createScriptProcessor = AudioContextPrototype.createScriptProcessor || AudioContextPrototype.createJavaScriptNode;

    OscillatorPrototype = context.createOscillator().constructor.prototype;
    OscillatorPrototype.start = OscillatorPrototype.start || OscillatorPrototype.noteOn;
    OscillatorPrototype.stop = OscillatorPrototype.stop || OscillatorPrototype.stop;
    OscillatorPrototype.setPeriodicWave = OscillatorPrototype.setPeriodicWave || OscillatorPrototype.setWaveTable;

    BufferSourceNodePrototype = context.createBufferSource().constructor.prototype;
    BufferSourceNodePrototype.start = BufferSourceNodePrototype.start || BufferSourceNodePrototype.noteOn;
    BufferSourceNodePrototype.stop = BufferSourceNodePrototype.stop || BufferSourceNodePrototype.stop;

    GainPrototype = context.createGain().gain.constructor.prototype;
    GainPrototype.setTargetAtTime = GainPrototype.setTargetAtTime || GainPrototype.setTargetValueAtTime;

    onTouchStart = function onTouchStart() {
        var source = context.createBufferSource();

        source.buffer = context.createBuffer(1, 1, 22050);
        source.connect(context.destination);
        source.start(0);

        context.UNLOCKED = true;

        eventListener.off(window, "touchstart", onTouchStart);
        eventListener.emit(window, "audiocontextunlock");
    };

    eventListener.on(window, "touchstart", onTouchStart);
}


module.exports = isNullOrUndefined(context) ? false : context;


},
function(require, exports, module, undefined, global) {
/* ../../src/load.js */

var HttpError = require(18),
    environment = require(1),
    eventListener = require(2),
    XMLHttpRequestPolyfill = require(19),
    context = require(14);


var document = environment.document,
    load;


if (context) {
    load = function load(src, callback) {
        var request = new XMLHttpRequestPolyfill();

        request.open("GET", src, true);
        request.responseType = "arraybuffer";

        eventListener.on(request, "load", function onLoad() {
            context.decodeAudioData(
                request.response,
                function onDecodeAudioData(buffer) {
                    callback(undefined, buffer);
                },
                callback
            );
        });

        eventListener.on(request, "error", function onError() {
            callback(new HttpError(404));
        });

        request.send(null);

        return function abort() {
            request.abort();
        };
    };
} else {
    load = function load(src, callback) {
        var audio = document.createElement("audio");

        eventListener.on(audio, "canplaythrough", function onLoad() {
            callback(undefined, audio);
        });

        eventListener.on(audio, "error", function onError() {
            callback(new HttpError(404));
        });

        audio.src = src;

        return function abort() {
            audio.pause();
            audio.src = "";
        };
    };
}


module.exports = load;


},
function(require, exports, module, undefined, global) {
/* ../../src/Clip.js */

var load = require(15);


var ClipPrototype;


module.exports = Clip;


function Clip(src) {
    this.src = src;
    this.raw = null;
}
ClipPrototype = Clip.prototype;

ClipPrototype.load = function(callback) {
    var _this = this;

    load(this.src, function onLoad(error, raw) {
        if (error) {
            callback(error);
        } else {
            _this.raw = raw;
            callback();
        }
    });

    return this;
};


},
function(require, exports, module, undefined, global) {
/* ../../src/Source.js */

var context = require(14);


if (context) {
    module.exports = require(40);
} else {
    module.exports = require(41);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/http_error/src/index.js */

var objectForEach = require(20),
    inherits = require(21),
    STATUS_CODES = require(22);


var STATUS_NAMES = {},
    STATUS_STRINGS = {},
    HttpErrorPrototype;


module.exports = HttpError;


objectForEach(STATUS_CODES, function eachStatus(status, statusCode) {
    var name;

    if (statusCode < 400) {
        return;
    }

    name = status.replace(/\s+/g, "");

    if (!(/\w+Error$/.test(name))) {
        name += "Error";
    }

    STATUS_NAMES[statusCode] = name;
    STATUS_STRINGS[statusCode] = status;
});


function HttpError(statusCode, message, fileName, lineNumber) {
    if (message instanceof Error) {
        message = message.message;
    }

    if (statusCode instanceof Error) {
        message = statusCode.message;
        statusCode = 500;
    } else if (typeof(statusCode) === "string") {
        message = statusCode;
        statusCode = 500;
    } else {
        statusCode = statusCode || 500;
    }

    Error.call(this, message, fileName, lineNumber);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

    this.name = STATUS_NAMES[statusCode] || "UnknownHttpError";
    this.statusCode = statusCode;
    this.message = this.name + ": " + statusCode + " " + (message || STATUS_STRINGS[statusCode]);
}
inherits(HttpError, Error);
HttpErrorPrototype = HttpError.prototype;

HttpErrorPrototype.toString = function() {
    return this.message;
};

HttpErrorPrototype.toJSON = function(json) {
    json = json || {};

    json.name = this.name;
    json.statusCode = this.statusCode;
    json.message = this.message;

    return json;
};

HttpErrorPrototype.fromJSON = function(json) {

    this.name = json.name;
    this.statusCode = json.statusCode;
    this.message = json.message;

    return this;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/xmlhttprequest_polyfill/src/index.js */

var extend = require(30),
    environment = require(1),
    emptyFunction = require(34),
    createXMLHttpRequest = require(35),
    toUint8Array = require(36);


var window = environment.window,

    NativeXMLHttpRequest = window.XMLHttpRequest,
    NativeActiveXObject = window.ActiveXObject,

    XMLHttpRequestPolyfill = (
        NativeXMLHttpRequest ||
        (function getRequestObject(types) {
            var i = -1,
                il = types.length - 1,
                instance, type;

            while (i++ < il) {
                try {
                    type = types[i];
                    instance = new NativeActiveXObject(type);
                    break;
                } catch (e) {}
                type = null;
            }

            if (!type) {
                throw new Error("XMLHttpRequest not supported by this browser");
            }

            return createXMLHttpRequest(function createNativeObject() {
                return new NativeActiveXObject(type);
            });
        }([
            "Msxml2.XMLHTTP",
            "Msxml3.XMLHTTP",
            "Microsoft.XMLHTTP"
        ]))
    ),

    XMLHttpRequestPolyfillPrototype = XMLHttpRequestPolyfill.prototype;


if (!(XMLHttpRequestPolyfillPrototype.addEventListener || XMLHttpRequestPolyfillPrototype.attachEvent)) {
    XMLHttpRequestPolyfill = createXMLHttpRequest(function createNativeObject() {
        return new NativeXMLHttpRequest();
    });
    XMLHttpRequestPolyfillPrototype = XMLHttpRequestPolyfill.prototype;
}

XMLHttpRequestPolyfillPrototype.nativeSetRequestHeader = XMLHttpRequestPolyfillPrototype.setRequestHeader || emptyFunction;

XMLHttpRequestPolyfillPrototype.setRequestHeader = function(key, value) {
    (this.__requestHeaders || (this.__requestHeaders = {}))[key] = value;
    this.nativeSetRequestHeader(key, value);
};

XMLHttpRequestPolyfillPrototype.getRequestHeader = function(key) {
    return (this.__requestHeaders || (this.__requestHeaders = {}))[key];
};

XMLHttpRequestPolyfillPrototype.getRequestHeaders = function() {
    return extend({}, this.__requestHeaders);
};

if (!XMLHttpRequestPolyfillPrototype.setTimeout) {
    XMLHttpRequestPolyfillPrototype.setTimeout = function(ms) {
        this.timeout = ms;
    };
}

if (!XMLHttpRequestPolyfillPrototype.setWithCredentials) {
    XMLHttpRequestPolyfillPrototype.setWithCredentials = function(value) {
        this.withCredentials = !!value;
    };
}

if (!XMLHttpRequestPolyfillPrototype.sendAsBinary) {
    XMLHttpRequestPolyfillPrototype.sendAsBinary = function(str) {
        return this.send(toUint8Array(str));
    };
}


module.exports = XMLHttpRequestPolyfill;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/object-for_each/src/index.js */

var keys = require(23);


module.exports = objectForEach;


function objectForEach(object, callback) {
    var objectKeys = keys(object),
        i = -1,
        il = objectKeys.length - 1,
        key;

    while (i++ < il) {
        key = objectKeys[i];

        if (callback(object[key], key, object) === false) {
            break;
        }
    }

    return object;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/inherits/src/index.js */

var create = require(29),
    extend = require(30),
    mixin = require(31),
    defineProperty = require(32);


var descriptor = {
    configurable: true,
    enumerable: false,
    writable: true,
    value: null
};


module.exports = inherits;


function inherits(child, parent) {

    mixin(child, parent);

    if (child.__super) {
        child.prototype = extend(create(parent.prototype), child.__super, child.prototype);
    } else {
        child.prototype = extend(create(parent.prototype), child.prototype);
    }

    defineNonEnumerableProperty(child, "__super", parent.prototype);
    defineNonEnumerableProperty(child.prototype, "constructor", child);

    child.defineStatic = defineStatic;
    child.super_ = parent;

    return child;
}
inherits.defineProperty = defineNonEnumerableProperty;

function defineNonEnumerableProperty(object, name, value) {
    descriptor.value = value;
    defineProperty(object, name, descriptor);
    descriptor.value = null;
}

function defineStatic(name, value) {
    defineNonEnumerableProperty(this, name, value);
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/status_codes/src/browser.js */

module.exports = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I\"m a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Unordered Collection",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    509: "Bandwidth Limit Exceeded",
    510: "Not Extended",
    511: "Network Authentication Required"
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/keys/src/index.js */

var has = require(24),
    isNative = require(25),
    isNullOrUndefined = require(11),
    isObject = require(5);


var nativeKeys = Object.keys;


module.exports = keys;


function keys(value) {
    if (isNullOrUndefined(value)) {
        return [];
    } else {
        return nativeKeys(isObject(value) ? value : Object(value));
    }
}

if (!isNative(nativeKeys)) {
    nativeKeys = function(value) {
        var localHas = has,
            out = [],
            i = 0,
            key;

        for (key in value) {
            if (localHas(value, key)) {
                out[i++] = key;
            }
        }

        return out;
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/keys/node_modules/has/src/index.js */

var isNative = require(25),
    getPrototypeOf = require(26),
    isNullOrUndefined = require(11);


var nativeHasOwnProp = Object.prototype.hasOwnProperty,
    baseHas;


module.exports = has;


function has(object, key) {
    if (isNullOrUndefined(object)) {
        return false;
    } else {
        return baseHas(object, key);
    }
}

if (isNative(nativeHasOwnProp)) {
    baseHas = function baseHas(object, key) {
        return nativeHasOwnProp.call(object, key);
    };
} else {
    baseHas = function baseHas(object, key) {
        var proto = getPrototypeOf(object);

        if (isNullOrUndefined(proto)) {
            return key in object;
        } else {
            return (key in object) && (!(key in proto) || proto[key] !== object[key]);
        }
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/keys/node_modules/is_native/src/index.js */

var isFunction = require(6),
    isNullOrUndefined = require(11),
    escapeRegExp = require(27);


var reHostCtor = /^\[object .+?Constructor\]$/,

    functionToString = Function.prototype.toString,

    reNative = RegExp("^" +
        escapeRegExp(Object.prototype.toString)
        .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ),

    isHostObject;


module.exports = isNative;


function isNative(value) {
    return !isNullOrUndefined(value) && (
        isFunction(value) ?
        reNative.test(functionToString.call(value)) : (
            typeof(value) === "object" && (
                (isHostObject(value) ? reNative : reHostCtor).test(value) || false
            )
        )
    ) || false;
}

try {
    String({
        "toString": 0
    } + "");
} catch (e) {
    isHostObject = function isHostObject() {
        return false;
    };
}

isHostObject = function isHostObject(value) {
    return !isFunction(value.toString) && typeof(value + "") === "string";
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/get_prototype_of/src/index.js */

var isObject = require(5),
    isNative = require(25),
    isNullOrUndefined = require(11);


var nativeGetPrototypeOf = Object.getPrototypeOf,
    baseGetPrototypeOf;


module.exports = getPrototypeOf;


function getPrototypeOf(value) {
    if (isNullOrUndefined(value)) {
        return null;
    } else {
        return baseGetPrototypeOf(value);
    }
}

if (isNative(nativeGetPrototypeOf)) {
    baseGetPrototypeOf = function baseGetPrototypeOf(value) {
        return nativeGetPrototypeOf(isObject(value) ? value : Object(value)) || null;
    };
} else {
    if ("".__proto__ === String.prototype) {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.__proto__ || null;
        };
    } else {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.constructor ? value.constructor.prototype : null;
        };
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/escape_regexp/src/index.js */

var toString = require(28);


var reRegExpChars = /[.*+?\^${}()|\[\]\/\\]/g,
    reHasRegExpChars = new RegExp(reRegExpChars.source);


module.exports = escapeRegExp;


function escapeRegExp(string) {
    string = toString(string);
    return (
        (string && reHasRegExpChars.test(string)) ?
        string.replace(reRegExpChars, "\\$&") :
        string
    );
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/to_string/src/index.js */

var isString = require(10),
    isNullOrUndefined = require(11);


module.exports = toString;


function toString(value) {
    if (isString(value)) {
        return value;
    } else if (isNullOrUndefined(value)) {
        return "";
    } else {
        return value + "";
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/create/src/index.js */

var isNull = require(8),
    isNative = require(25),
    isPrimitive = require(33);


var nativeCreate = Object.create;


module.exports = create;


function create(object) {
    return nativeCreate(isPrimitive(object) ? null : object);
}

if (!isNative(nativeCreate)) {
    nativeCreate = function nativeCreate(object) {
        var newObject;

        function F() {
            this.constructor = F;
        }

        if (isNull(object)) {
            newObject = new F();
            newObject.constructor = newObject.__proto__ = null;
            delete newObject.__proto__;
            return newObject;
        } else {
            F.prototype = object;
            return new F();
        }
    };
}


module.exports = create;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/extend/src/index.js */

var keys = require(23);


module.exports = extend;


function extend(out) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        baseExtend(out, arguments[i]);
    }

    return out;
}

function baseExtend(a, b) {
    var objectKeys = keys(b),
        i = -1,
        il = objectKeys.length - 1,
        key;

    while (i++ < il) {
        key = objectKeys[i];
        a[key] = b[key];
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/mixin/src/index.js */

var keys = require(23),
    isNullOrUndefined = require(11);


module.exports = mixin;


function mixin(out) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        baseMixin(out, arguments[i]);
    }

    return out;
}

function baseMixin(a, b) {
    var objectKeys = keys(b),
        i = -1,
        il = objectKeys.length - 1,
        key, value;

    while (i++ < il) {
        key = objectKeys[i];

        if (isNullOrUndefined(a[key]) && !isNullOrUndefined((value = b[key]))) {
            a[key] = value;
        }
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/define_property/src/index.js */

var isObject = require(5),
    isFunction = require(6),
    isPrimitive = require(33),
    isNative = require(25),
    has = require(24);


var nativeDefineProperty = Object.defineProperty;


module.exports = defineProperty;


function defineProperty(object, name, descriptor) {
    if (isPrimitive(descriptor) || isFunction(descriptor)) {
        descriptor = {
            value: descriptor
        };
    }
    return nativeDefineProperty(object, name, descriptor);
}

defineProperty.hasGettersSetters = true;

if (!isNative(nativeDefineProperty) || !(function() {
        var object = {},
            value = {};

        try {
            nativeDefineProperty(object, "key", {
                value: value
            });
            if (has(object, "key") && object.key === value) {
                return true;
            } else {
                return false;
            }
        } catch (e) {}

        return false;
    }())) {

    defineProperty.hasGettersSetters = false;

    nativeDefineProperty = function defineProperty(object, name, descriptor) {
        if (!isObject(object)) {
            throw new TypeError("defineProperty(object, name, descriptor) called on non-object");
        }
        if (has(descriptor, "get") || has(descriptor, "set")) {
            throw new TypeError("defineProperty(object, name, descriptor) this environment does not support getters or setters");
        }
        object[name] = descriptor.value;
    };
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_primitive/src/index.js */

var isNullOrUndefined = require(11);


module.exports = isPrimitive;


function isPrimitive(obj) {
    var typeStr;
    return isNullOrUndefined(obj) || ((typeStr = typeof(obj)) !== "object" && typeStr !== "function") || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/empty_function/src/index.js */

module.exports = emptyFunction;


function emptyFunction() {}

function makeEmptyFunction(value) {
    return function() {
        return value;
    };
}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function() {
    return this;
};
emptyFunction.thatReturnsArgument = function(argument) {
    return argument;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/xmlhttprequest_polyfill/src/createXMLHttpRequest.js */

var EventEmitter = require(37),
    toUint8Array = require(36);


module.exports = createXMLHttpRequest;


function createXMLHttpRequest(createNativeObject) {
    var XMLHttpRequestPrototype;


    function XMLHttpRequest() {
        var _this = this,
            nativeObject = createNativeObject();

        EventEmitter.call(this, -1);

        this.__requestHeaders = {};
        this.__nativeObject = nativeObject;

        this.onabort = null;
        this.onerror = null;
        this.onload = null;
        this.onloadend = null;
        this.onloadstart = null;
        this.onprogress = null;
        this.onreadystatechange = null;
        this.ontimeout = null;
        this.readyState = 0;
        this.response = "";
        this.responseText = "";
        this.responseType = "";
        this.responseURL = "";
        this.responseXML = null;
        this.status = 0;
        this.statusText = "";
        this.timeout = 0;
        this.withCredentials = false;

        nativeObject.onreadystatechange = function(e) {
            return XMLHttpRequest_onReadyStateChange(_this, e);
        };

        nativeObject.ontimeout = function(e) {
            if (_this.ontimeout) {
                _this.ontimeout(e);
            }
            _this.emit("timeout");
        };

        nativeObject.onerror = function(e) {
            if (_this.onerror) {
                _this.onerror(e);
            }
            _this.emit("error");
        };
    }
    EventEmitter.extend(XMLHttpRequest);
    XMLHttpRequestPrototype = XMLHttpRequest.prototype;

    function XMLHttpRequest_onReadyStateChange(_this, e) {
        var nativeObject = _this.__nativeObject,
            response;

        _this.readyState = nativeObject.readyState;

        if (_this.onreadystatechange) {
            _this.onreadystatechange(e);
        }
        _this.emit("readystatechange", e);

        switch (nativeObject.readyState) {
            case 3:
                if (_this.onprogress) {
                    _this.onprogress();
                }
                _this.emit("progress", e);
                break;
            case 4:
                response = nativeObject.response || "";

                if (_this.responseType === "arraybuffer") {
                    response = toUint8Array(response);
                }

                _this.response = response;
                _this.responseText = nativeObject.responseText || _this.response;
                _this.responseType = nativeObject.responseType || "";
                _this.responseURL = nativeObject.responseURL || "";
                _this.responseXML = nativeObject.responseXML || _this.response;
                _this.status = nativeObject.status || 0;
                _this.statusText = nativeObject.statusText || "";

                if (_this.onload) {
                    _this.onload();
                }
                _this.emit("load", e);
                if (_this.onloadend) {
                    _this.onloadend();
                }
                _this.emit("loadend", e);
                break;
        }

        return _this;
    }

    XMLHttpRequestPrototype.attachEvent = function(type, fn) {
        return this.on(type.slice(2), fn);
    };
    XMLHttpRequestPrototype.detachEvent = function(type, fn) {
        return this.off(type.slice(2), fn);
    };

    XMLHttpRequestPrototype.addEventListener = XMLHttpRequestPrototype.on;
    XMLHttpRequestPrototype.removeEventListener = XMLHttpRequestPrototype.off;

    XMLHttpRequestPrototype.dispatchEvent = function(event) {
        return this.emit(event.type, event);
    };

    XMLHttpRequestPrototype.fireEvent = function(type, event) {
        return this.emit("on" + type, event);
    };

    XMLHttpRequestPrototype.abort = function() {
        try {
            if (this.onabort) {
                this.onabort();
            }
            _this.emit("abort", {});
            this.__nativeObject.abort();
        } catch (e) {}
    };

    XMLHttpRequestPrototype.setTimeout = function(ms) {
        this.timeout = ms;
        try {
            this.__nativeObject.timeout = ms;
        } catch (e) {}
    };

    XMLHttpRequestPrototype.setWithCredentials = function(value) {
        value = !!value;
        this.withCredentials = value;
        try {
            this.__nativeObject.withCredentials = value;
        } catch (e) {}
    };

    XMLHttpRequestPrototype.getAllResponseHeaders = function() {
        try {
            return this.__nativeObject.getAllResponseHeaders();
        } catch (e) {
            return null;
        }
    };

    XMLHttpRequestPrototype.getResponseHeader = function(header) {
        try {
            return this.__nativeObject.getResponseHeader(header);
        } catch (e) {
            return null;
        }
    };

    XMLHttpRequestPrototype.getResponseHeader = function(header) {
        try {
            return this.__nativeObject.getResponseHeader(header);
        } catch (e) {
            return null;
        }
    };

    XMLHttpRequestPrototype.open = function(method, url, async, user, password) {
        if (this.readyState === 0) {
            this.readyState = 1;
            return this.__nativeObject.open(method, url, async, user, password);
        } else {
            return undefined;
        }
    };

    XMLHttpRequestPrototype.overrideMimeType = function(mimetype) {
        try {
            return this.__nativeObject.overrideMimeType(mimetype);
        } catch (e) {}
    };

    XMLHttpRequestPrototype.send = function(data) {
        try {
            return this.__nativeObject.send(data);
        } catch (e) {}
    };

    XMLHttpRequestPrototype.setRequestHeader = function(key, value) {
        try {
            return this.__nativeObject.setRequestHeader(key, value);
        } catch (e) {}
    };

    return XMLHttpRequest;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/xmlhttprequest_polyfill/src/toUint8Array.js */

var environment = require(1);


var Uint8Array = environment.window.Uint8Array || Array;


module.exports = toUint8Array;


function toUint8Array(str) {
    var length = str.length,
        ui8 = new Uint8Array(length),
        i = -1,
        il = length - 1;

    while (i++ < il) {
        ui8[i] = str.charCodeAt(i) & 0xff;
    }

    return ui8;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/event_emitter/src/index.js */

var isFunction = require(6),
    inherits = require(21),
    fastSlice = require(38),
    keys = require(23),
    isNumber = require(12),
    isNullOrUndefined = require(11);


var EventEmitterPrototype;


module.exports = EventEmitter;


function EventEmitter(maxListeners) {
    this.__events = {};
    this.__maxListeners = isNumber(maxListeners) ? +maxListeners : EventEmitter.defaultMaxListeners;
}
EventEmitterPrototype = EventEmitter.prototype;

EventEmitterPrototype.on = function(name, listener) {
    var events, eventList, maxListeners;

    if (!isFunction(listener)) {
        throw new TypeError("EventEmitter.on(name, listener) listener must be a function");
    }

    events = this.__events || (this.__events = {});
    eventList = (events[name] || (events[name] = []));
    maxListeners = this.__maxListeners || -1;

    eventList[eventList.length] = listener;

    if (maxListeners !== -1 && eventList.length > maxListeners) {
        console.error(
            "EventEmitter.on(type, listener) possible EventEmitter memory leak detected. " + maxListeners + " listeners added"
        );
    }

    return this;
};

EventEmitterPrototype.addEventListener = EventEmitterPrototype.addListener = EventEmitterPrototype.on;

EventEmitterPrototype.once = function(name, listener) {
    var _this = this;

    function once() {

        _this.off(name, once);

        switch (arguments.length) {
            case 0:
                return listener();
            case 1:
                return listener(arguments[0]);
            case 2:
                return listener(arguments[0], arguments[1]);
            case 3:
                return listener(arguments[0], arguments[1], arguments[2]);
            case 4:
                return listener(arguments[0], arguments[1], arguments[2], arguments[3]);
            default:
                return listener.apply(null, arguments);
        }
    }

    this.on(name, once);

    return once;
};

EventEmitterPrototype.listenTo = function(value, name) {
    var _this = this;

    if (!value || !(isFunction(value.on) || isFunction(value.addListener))) {
        throw new TypeError("EventEmitter.listenTo(value, name) value must have a on function taking (name, listener[, ctx])");
    }

    function handler() {
        _this.emitArgs(name, arguments);
    }

    value.on(name, handler);

    return handler;
};

EventEmitterPrototype.off = function(name, listener) {
    var events = this.__events || (this.__events = {}),
        eventList, event, i;

    eventList = events[name];
    if (!eventList) {
        return this;
    }

    if (!listener) {
        i = eventList.length;

        while (i--) {
            this.emit("removeListener", name, eventList[i]);
        }
        eventList.length = 0;
        delete events[name];
    } else {
        i = eventList.length;

        while (i--) {
            event = eventList[i];

            if (event === listener) {
                this.emit("removeListener", name, event);
                eventList.splice(i, 1);
            }
        }

        if (eventList.length === 0) {
            delete events[name];
        }
    }

    return this;
};

EventEmitterPrototype.removeEventListener = EventEmitterPrototype.removeListener = EventEmitterPrototype.off;

EventEmitterPrototype.removeAllListeners = function() {
    var events = this.__events || (this.__events = {}),
        objectKeys = keys(events),
        i = -1,
        il = objectKeys.length - 1,
        key, eventList, j;

    while (i++ < il) {
        key = objectKeys[i];
        eventList = events[key];

        if (eventList) {
            j = eventList.length;

            while (j--) {
                this.emit("removeListener", key, eventList[j]);
                eventList.splice(j, 1);
            }
        }

        delete events[key];
    }

    return this;
};

EventEmitterPrototype.dispatchEvent = function(event) {
    return this.emitArg(event.type, event);
};

EventEmitterPrototype.attachEvent = function(type, listener) {
    return this.on(type.slice(2), listener);
};

EventEmitterPrototype.detachEvent = function(type, listener) {
    return this.off(type.slice(2), listener);
};

EventEmitterPrototype.fireEvent = function(type, event) {
    return this.emitArg(type.slice(2), event);
};

function emit0(eventList) {
    var i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event();
        }
    }
}

function emit1(eventList, a0) {
    var i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0);
        }
    }
}

function emit2(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1);
        }
    }
}

function emit3(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        a2 = args[2],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1, a2);
        }
    }
}

function emit4(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        a2 = args[2],
        a3 = args[3],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1, a2, a3);
        }
    }
}

function emit5(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        a2 = args[2],
        a3 = args[3],
        a4 = args[4],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1, a2, a3, a4);
        }
    }
}

function emitApply(eventList, args) {
    var i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event.apply(null, args);
        }
    }
}

function emit(eventList, args) {
    switch (args.length) {
        case 0:
            emit0(eventList);
            break;
        case 1:
            emit1(eventList, args[0]);
            break;
        case 2:
            emit2(eventList, args);
            break;
        case 3:
            emit3(eventList, args);
            break;
        case 4:
            emit4(eventList, args);
            break;
        case 5:
            emit5(eventList, args);
            break;
        default:
            emitApply(eventList, args);
            break;
    }
}

EventEmitterPrototype.emitArg = function(name, arg) {
    var eventList = (this.__events || (this.__events = {}))[name];

    if (!eventList || !eventList.length) {
        return this;
    } else {
        emit1(eventList, arg);
        return this;
    }
};

EventEmitterPrototype.emitArgs = function(name, args) {
    var eventList = (this.__events || (this.__events = {}))[name];

    if (!eventList || !eventList.length) {
        return this;
    } else {
        emit(eventList, args);
        return this;
    }
};

EventEmitterPrototype.emit = function(name) {
    return this.emitArgs(name, fastSlice(arguments, 1));
};

function createFunctionCaller(args) {
    var a0, a1, a2, a3, a4;
    switch (args.length) {
        case 0:
            return function functionCaller(fn) {
                return fn();
            };
        case 1:
            a0 = args[0];
            return function functionCaller(fn) {
                return fn(a0);
            };
        case 2:
            a0 = args[0];
            a1 = args[1];
            return function functionCaller(fn) {
                return fn(a0, a1);
            };
        case 3:
            a0 = args[0];
            a1 = args[1];
            a2 = args[2];
            return function functionCaller(fn) {
                return fn(a0, a1, a2);
            };
        case 4:
            a0 = args[0];
            a1 = args[1];
            a2 = args[2];
            a3 = args[3];
            return function functionCaller(fn) {
                return fn(a0, a1, a2, a3);
            };
        case 5:
            a0 = args[0];
            a1 = args[1];
            a2 = args[2];
            a3 = args[3];
            a4 = args[4];
            return function functionCaller(fn) {
                return fn(a0, a1, a2, a3, a4);
            };
        default:
            return function functionCaller(fn) {
                return fn.apply(null, args);
            };
    }
}

function emitAsync(eventList, args, callback) {
    var length = eventList.length,
        index = 0,
        called = false,
        functionCaller;

    function next(error) {
        if (called !== true) {
            if (error || index === length) {
                called = true;
                callback(error);
            } else {
                functionCaller(eventList[index++]);
            }
        }
    }

    args[args.length] = next;
    functionCaller = createFunctionCaller(args);
    next();
}

EventEmitterPrototype.emitAsync = function(name, args, callback) {
    var eventList = (this.__events || (this.__events = {}))[name];

    args = fastSlice(arguments, 1);
    callback = args.pop();

    if (!isFunction(callback)) {
        throw new TypeError("EventEmitter.emitAsync(name [, ...args], callback) callback must be a function");
    } else {
        if (!eventList || !eventList.length) {
            callback();
        } else {
            emitAsync(eventList, args, callback);
        }
        return this;
    }
};

EventEmitterPrototype.listeners = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];
    return eventList ? eventList.slice() : [];
};

EventEmitterPrototype.listenerCount = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];
    return eventList ? eventList.length : 0;
};

EventEmitterPrototype.setMaxListeners = function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    this.__maxListeners = value < 0 ? -1 : value;
    return this;
};

inherits.defineProperty(EventEmitter, "defaultMaxListeners", 10);

inherits.defineProperty(EventEmitter, "listeners", function(value, name) {
    var eventList;

    if (isNullOrUndefined(value)) {
        throw new TypeError("EventEmitter.listeners(value, name) value required");
    }
    eventList = value.__events && value.__events[name];

    return eventList ? eventList.slice() : [];
});

inherits.defineProperty(EventEmitter, "listenerCount", function(value, name) {
    var eventList;

    if (isNullOrUndefined(value)) {
        throw new TypeError("EventEmitter.listenerCount(value, name) value required");
    }
    eventList = value.__events && value.__events[name];

    return eventList ? eventList.length : 0;
});

inherits.defineProperty(EventEmitter, "setMaxListeners", function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    EventEmitter.defaultMaxListeners = value < 0 ? -1 : value;
    return value;
});

EventEmitter.extend = function(child) {
    inherits(child, this);
    return child;
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/fast_slice/src/index.js */

var clamp = require(39),
    isNumber = require(12);


module.exports = fastSlice;


function fastSlice(array, offset) {
    var length = array.length,
        newLength, i, il, result, j;

    offset = clamp(isNumber(offset) ? offset : 0, 0, length);
    i = offset - 1;
    il = length - 1;
    newLength = length - offset;
    result = new Array(newLength);
    j = 0;

    while (i++ < il) {
        result[j++] = array[i];
    }

    return result;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/clamp/src/index.js */

module.exports = clamp;


function clamp(x, min, max) {
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    } else {
        return x;
    }
}


},
function(require, exports, module, undefined, global) {
/* ../../src/WebAudioSource.js */

var isBoolean = require(42),
    isNumber = require(12),
    EventEmitter = require(37),
    mathf = require(43),
    now = require(44),
    context = require(14);


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


},
function(require, exports, module, undefined, global) {
/* ../../src/AudioSource.js */

var isBoolean = require(42),
    isNumber = require(12),
    EventEmitter = require(37),
    mathf = require(43),
    now = require(44);


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


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_boolean/src/index.js */

module.exports = isBoolean;


function isBoolean(value) {
    return typeof(value) === "boolean" || false;
}


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/mathf/src/index.js */

var keys = require(23),
    clamp = require(39),
    isNaNPolyfill = require(45);


var mathf = exports,

    NativeMath = global.Math,

    hasFloat32Array = typeof(Float32Array) !== "undefined",
    NativeFloat32Array = hasFloat32Array ? Float32Array : Array;


mathf.ArrayType = NativeFloat32Array;

mathf.PI = NativeMath.PI;
mathf.TAU = mathf.PI * 2;
mathf.TWO_PI = mathf.TAU;
mathf.HALF_PI = mathf.PI * 0.5;
mathf.FOURTH_PI = mathf.PI * 0.25;

mathf.EPSILON = Number.EPSILON || NativeMath.pow(2, -52);

mathf.TO_RADS = mathf.PI / 180;
mathf.TO_DEGS = 180 / mathf.PI;

mathf.E = NativeMath.E;
mathf.LN2 = NativeMath.LN2;
mathf.LN10 = NativeMath.LN10;
mathf.LOG2E = NativeMath.LOG2E;
mathf.LOG10E = NativeMath.LOG10E;
mathf.SQRT1_2 = NativeMath.SQRT1_2;
mathf.SQRT2 = NativeMath.SQRT2;

mathf.abs = NativeMath.abs;

mathf.acos = NativeMath.acos;
mathf.acosh = NativeMath.acosh || function acosh(x) {
    return mathf.log(x + mathf.sqrt(x * x - 1));
};
mathf.asin = NativeMath.asin;
mathf.asinh = NativeMath.asinh || function asinh(x) {
    if (x === -Infinity) {
        return x;
    } else {
        return mathf.log(x + mathf.sqrt(x * x + 1));
    }
};
mathf.atan = NativeMath.atan;
mathf.atan2 = NativeMath.atan2;
mathf.atanh = NativeMath.atanh || function atanh(x) {
    return mathf.log((1 + x) / (1 - x)) / 2;
};

mathf.cbrt = NativeMath.cbrt || function cbrt(x) {
    var y = mathf.pow(mathf.abs(x), 1 / 3);
    return x < 0 ? -y : y;
};

mathf.ceil = NativeMath.ceil;

mathf.clz32 = NativeMath.clz32 || function clz32(value) {
    value = +value >>> 0;
    return value ? 32 - value.toString(2).length : 32;
};

mathf.cos = NativeMath.cos;
mathf.cosh = NativeMath.cosh || function cosh(x) {
    return (mathf.exp(x) + mathf.exp(-x)) / 2;
};

mathf.exp = NativeMath.exp;

mathf.expm1 = NativeMath.expm1 || function expm1(x) {
    return mathf.exp(x) - 1;
};

mathf.floor = NativeMath.floor;
mathf.fround = NativeMath.fround || (hasFloat32Array ?
    function fround(x) {
        return new NativeFloat32Array([x])[0];
    } :
    function fround(x) {
        return x;
    }
);

mathf.hypot = NativeMath.hypot || function hypot() {
    var y = 0,
        i = -1,
        il = arguments.length - 1,
        value;

    while (i++ < il) {
        value = arguments[i];

        if (value === Infinity || value === -Infinity) {
            return Infinity;
        } else {
            y += value * value;
        }
    }

    return mathf.sqrt(y);
};

mathf.imul = NativeMath.imul || function imul(a, b) {
    var ah = (a >>> 16) & 0xffff,
        al = a & 0xffff,
        bh = (b >>> 16) & 0xffff,
        bl = b & 0xffff;

    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
};

mathf.log = NativeMath.log;

mathf.log1p = NativeMath.log1p || function log1p(x) {
    return mathf.log(1 + x);
};

mathf.log10 = NativeMath.log10 || function log10(x) {
    return mathf.log(x) / mathf.LN10;
};

mathf.log2 = NativeMath.log2 || function log2(x) {
    return mathf.log(x) / mathf.LN2;
};

mathf.max = NativeMath.max;
mathf.min = NativeMath.min;

mathf.pow = NativeMath.pow;

mathf.random = NativeMath.random;
mathf.round = NativeMath.round;

mathf.sign = NativeMath.sign || function sign(x) {
    x = +x;
    if (x === 0 || isNaNPolyfill(x)) {
        return x;
    } else {
        return x > 0 ? 1 : -1;
    }
};

mathf.sin = NativeMath.sin;
mathf.sinh = NativeMath.sinh || function sinh(x) {
    return (mathf.exp(x) - mathf.exp(-x)) / 2;
};

mathf.sqrt = NativeMath.sqrt;

mathf.tan = NativeMath.tan;
mathf.tanh = NativeMath.tanh || function tanh(x) {
    if (x === Infinity) {
        return 1;
    } else if (x === -Infinity) {
        return -1;
    } else {
        return (mathf.exp(x) - mathf.exp(-x)) / (mathf.exp(x) + mathf.exp(-x));
    }
};

mathf.trunc = NativeMath.trunc || function trunc(x) {
    return x < 0 ? mathf.ceil(x) : mathf.floor(x);
};

mathf.equals = function(a, b, e) {
    return mathf.abs(a - b) < (e !== void(0) ? e : mathf.EPSILON);
};

mathf.modulo = function(a, b) {
    var r = a % b;
    return (r * b < 0) ? r + b : r;
};

mathf.standardRadian = function(x) {
    return mathf.modulo(x, mathf.TWO_PI);
};

mathf.standardAngle = function(x) {
    return mathf.modulo(x, 360);
};

mathf.snap = function(x, y) {
    var m = x % y;
    return m < (y * 0.5) ? x - m : x + y - m;
};

mathf.clamp = clamp;

mathf.clampBottom = function(x, min) {
    return x < min ? min : x;
};

mathf.clampTop = function(x, max) {
    return x > max ? max : x;
};

mathf.clamp01 = function(x) {
    if (x < 0) {
        return 0;
    } else if (x > 1) {
        return 1;
    } else {
        return x;
    }
};

mathf.truncate = function(x, n) {
    var p = mathf.pow(10, n),
        num = x * p;

    return (num < 0 ? mathf.ceil(num) : mathf.floor(num)) / p;
};

mathf.lerp = function(a, b, x) {
    return a + (b - a) * x;
};

mathf.lerpRadian = function(a, b, x) {
    return mathf.standardRadian(a + (b - a) * x);
};

mathf.lerpAngle = function(a, b, x) {
    return mathf.standardAngle(a + (b - a) * x);
};

mathf.lerpCos = function(a, b, x) {
    var ft = x * mathf.PI,
        f = (1 - mathf.cos(ft)) * 0.5;

    return a * (1 - f) + b * f;
};

mathf.lerpCubic = function(v0, v1, v2, v3, x) {
    var P, Q, R, S, Px, Qx, Rx;

    v0 = v0 || v1;
    v3 = v3 || v2;

    P = (v3 - v2) - (v0 - v1);
    Q = (v0 - v1) - P;
    R = v2 - v0;
    S = v1;

    Px = P * x;
    Qx = Q * x;
    Rx = R * x;

    return (Px * Px * Px) + (Qx * Qx) + Rx + S;
};

mathf.smoothStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * (3 - 2 * x);
        }
    }
};

mathf.smootherStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * x * (x * (x * 6 - 15) + 10);
        }
    }
};

mathf.pingPong = function(x, length) {
    length = +length || 1;
    return length - mathf.abs(x % (2 * length) - length);
};

mathf.degsToRads = function(x) {
    return mathf.standardRadian(x * mathf.TO_RADS);
};

mathf.radsToDegs = function(x) {
    return mathf.standardAngle(x * mathf.TO_DEGS);
};

mathf.randInt = function(min, max) {
    return mathf.round(min + (mathf.random() * (max - min)));
};

mathf.randFloat = function(min, max) {
    return min + (mathf.random() * (max - min));
};

mathf.randSign = function() {
    return mathf.random() < 0.5 ? 1 : -1;
};

mathf.shuffle = function(array) {
    var i = array.length,
        j, x;

    while (i) {
        j = (mathf.random() * i--) | 0;
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }

    return array;
};

mathf.randArg = function() {
    return arguments[(mathf.random() * arguments.length) | 0];
};

mathf.randChoice = function(array) {
    return array[(mathf.random() * array.length) | 0];
};

mathf.randChoiceObject = function(object) {
    var objectKeys = keys(object);
    return object[objectKeys[(mathf.random() * objectKeys.length) | 0]];
};

mathf.isPowerOfTwo = function(x) {
    return (x & -x) === x;
};

mathf.floorPowerOfTwo = function(x) {
    var i = 2,
        prev;

    while (i < x) {
        prev = i;
        i *= 2;
    }

    return prev;
};

mathf.ceilPowerOfTwo = function(x) {
    var i = 2;

    while (i < x) {
        i *= 2;
    }

    return i;
};

var n225 = 0.39269908169872414,
    n675 = 1.1780972450961724,
    n1125 = 1.9634954084936207,
    n1575 = 2.748893571891069,
    n2025 = 3.5342917352885173,
    n2475 = 4.319689898685966,
    n2925 = 5.105088062083414,
    n3375 = 5.8904862254808625,

    RIGHT = "right",
    UP_RIGHT = "up_right",
    UP = "up",
    UP_LEFT = "up_left",
    LEFT = "left",
    DOWN_LEFT = "down_left",
    DOWN = "down",
    DOWN_RIGHT = "down_right";

mathf.directionAngle = function(a) {
    a = mathf.standardRadian(a);

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};

mathf.direction = function(x, y) {
    var a = mathf.standardRadian(mathf.atan2(y, x));

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/now/src/browser.js */

var Date_now = Date.now || function Date_now() {
        return (new Date()).getTime();
    },
    START_TIME = Date_now(),
    performance = global.performance || {};


function now() {
    return performance.now();
}

performance.now = (
    performance.now ||
    performance.webkitNow ||
    performance.mozNow ||
    performance.msNow ||
    performance.oNow ||
    function now() {
        return Date_now() - START_TIME;
    }
);

now.getStartTime = function getStartTime() {
    return START_TIME;
};


START_TIME -= now();


module.exports = now;


},
function(require, exports, module, undefined, global) {
/* ../../node_modules/is_nan/src/index.js */

var isNumber = require(12);


module.exports = Number.isNaN || function isNaN(value) {
    return isNumber(value) && value !== value;
};


}], null, void(0), (new Function("return this;"))()));
