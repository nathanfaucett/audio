(function(dependencies, undefined, global) {
    var cache = [];

    function require(index) {
        var module = cache[index],
            callback, exports;

        if (module !== undefined) {
            return module.exports;
        } else {
            callback = dependencies[index];
            exports = {};

            cache[index] = module = {
                exports: exports,
                require: require
            };

            callback.call(exports, require, exports, module, global);
            return module.exports;
        }
    }

    require.resolve = function(path) {
        return path;
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
    function(require, exports, module, global) {

        var audio = require(1);


        var source = new audio.Source(),
            clip = new audio.Clip("./laser.ogg");


        source.setClip(clip);
        source.setLoop(true);

        source.on("play", function() {
            console.log("play");
        });

        clip.load(function() {
            source.play(0.5);
        });

    },
    function(require, exports, module, global) {

        var audio = exports;


        audio.audioContext = require(2);
        audio.Clip = require(11);
        audio.Source = require(12);


    },
    function(require, exports, module, global) {

        var environment = require(3),
            eventListener = require(4);


        var window = environment.window,

            AudioContext = (
                window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext ||
                window.oAudioContext ||
                window.msAudioContext
            ),

            audioContext, AudioContextPrototype, OscillatorPrototype, BufferSourceNodePrototype, GainPrototype, onTouchStart;


        if (AudioContext) {
            audioContext = new AudioContext();

            AudioContextPrototype = AudioContext.prototype;
            AudioContextPrototype.UNLOCKED = !environment.mobile;
            AudioContextPrototype.createGain = AudioContextPrototype.createGain || AudioContextPrototype.createGainNode;
            AudioContextPrototype.createPanner = AudioContextPrototype.createPanner || AudioContextPrototype.createPannerNode;
            AudioContextPrototype.createDelay = AudioContextPrototype.createDelay || AudioContextPrototype.createDelayNode;
            AudioContextPrototype.createScriptProcessor = AudioContextPrototype.createScriptProcessor || AudioContextPrototype.createJavaScriptNode;

            OscillatorPrototype = audioContext.createOscillator().constructor.prototype;
            OscillatorPrototype.start = OscillatorPrototype.start || OscillatorPrototype.noteOn;
            OscillatorPrototype.stop = OscillatorPrototype.stop || OscillatorPrototype.stop;
            OscillatorPrototype.setPeriodicWave = OscillatorPrototype.setPeriodicWave || OscillatorPrototype.setWaveTable;

            BufferSourceNodePrototype = audioContext.createBufferSource().constructor.prototype;
            BufferSourceNodePrototype.start = BufferSourceNodePrototype.start || BufferSourceNodePrototype.noteOn;
            BufferSourceNodePrototype.stop = BufferSourceNodePrototype.stop || BufferSourceNodePrototype.stop;

            GainPrototype = audioContext.createGain().gain.constructor.prototype;
            GainPrototype.setTargetAtTime = GainPrototype.setTargetAtTime || GainPrototype.setTargetValueAtTime;

            onTouchStart = function onTouchStart(e) {
                var buffer = audioContext.createBuffer(1, 1, 22050),
                    source = audioContext.createBufferSource();

                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start(0);

                audioContext.UNLOCKED = true;

                eventListener.off(window, "touchstart", onTouchStart);
                eventListener.emit(window, "audiocontextunlock");
            };

            eventListener.on(window, "touchstart", onTouchStart);
        }


        module.exports = audioContext != null ? audioContext : false;


    },
    function(require, exports, module, global) {

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
    function(require, exports, module, global) {

        var process = require(5);
        var isObject = require(6),
            isFunction = require(8),
            environment = require(3),
            eventTable = require(9);


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
    function(require, exports, module, global) {

        // shim for using process in browser

        var process = module.exports = {};

        process.nextTick = (function() {
            var canSetImmediate = typeof window !== 'undefined' && window.setImmediate;
            var canMutationObserver = typeof window !== 'undefined' && window.MutationObserver;
            var canPost = typeof window !== 'undefined' && window.postMessage && window.addEventListener;

            if (canSetImmediate) {
                return function(f) {
                    return window.setImmediate(f)
                };
            }

            var queue = [];

            if (canMutationObserver) {
                var hiddenDiv = document.createElement("div");
                var observer = new MutationObserver(function() {
                    var queueList = queue.slice();
                    queue.length = 0;
                    queueList.forEach(function(fn) {
                        fn();
                    });
                });

                observer.observe(hiddenDiv, {
                    attributes: true
                });

                return function nextTick(fn) {
                    if (!queue.length) {
                        hiddenDiv.setAttribute('yes', 'no');
                    }
                    queue.push(fn);
                };
            }

            if (canPost) {
                window.addEventListener('message', function(ev) {
                    var source = ev.source;
                    if ((source === window || source === null) && ev.data === 'process-tick') {
                        ev.stopPropagation();
                        if (queue.length > 0) {
                            var fn = queue.shift();
                            fn();
                        }
                    }
                }, true);

                return function nextTick(fn) {
                    queue.push(fn);
                    window.postMessage('process-tick', '*');
                };
            }

            return function nextTick(fn) {
                setTimeout(fn, 0);
            };
        })();

        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;

        process.binding = function(name) {
            throw new Error('process.binding is not supported');
        };

        // TODO(shtylman)
        process.cwd = function() {
            return '/'
        };
        process.chdir = function(dir) {
            throw new Error('process.chdir is not supported');
        };


    },
    function(require, exports, module, global) {

        var isNullOrUndefined = require(7);


        module.exports = isObject;


        function isObject(value) {
            var type = typeof(value);
            return type === "function" || (!isNullOrUndefined(value) && type === "object") || false;
        }


    },
    function(require, exports, module, global) {

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
        function isNullOrUndefined(obj) {
            return (obj === null || obj === void 0);
        }


    },
    function(require, exports, module, global) {

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
    function(require, exports, module, global) {

        var isNode = require(10),
            environment = require(3);


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
    function(require, exports, module, global) {

        var isFunction = require(8);


        var isNode;


        if (typeof(Node) !== "undefined" && isFunction(Node)) {
            isNode = function isNode(value) {
                return value instanceof Node;
            };
        } else {
            isNode = function isNode(value) {
                return (
                    typeof(value) === "object" &&
                    typeof(value.nodeType) === "number" &&
                    typeof(value.nodeName) === "string"
                );
            };
        }


        module.exports = isNode;


    },
    function(require, exports, module, global) {

        var environment = require(3),
            eventListener = require(4)
        audioContext = require(2);


        var document = environment.document,
            ClipPrototype;


        module.exports = Clip;


        function Clip(src) {
            this.src = src;
            this.raw = null;
        }
        ClipPrototype = Clip.prototype;

        if (audioContext) {
            ClipPrototype.load = function(callback) {
                var _this = this,
                    request = new XMLHttpRequest();

                request.open("GET", this.src, true);
                request.responseType = "arraybuffer";

                eventListener.on(request, "load", function onLoad() {
                    audioContext.decodeAudioData(
                        request.response,
                        function onDecodeAudioData(buffer) {
                            _this.raw = buffer;
                            callback();
                        },
                        callback
                    );
                })

                request.send(null);
            };
        } else {
            ClipPrototype.load = function(callback) {
                var _this = this,
                    audioNode = new Audio();

                eventListener.on(audioNode, "canplaythrough", function onCanPlayThrough() {
                    _this.raw = audioNode;
                    callback();
                });
                eventListener.on(audioNode, "error", callback);

                audioNode.src = this.src;
            };
        }


    },
    function(require, exports, module, global) {

        var EventEmitter = require(13),
            mathf = require(29),
            vec3 = require(32),
            time = require(33),
            audioContext = require(2);


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

            if (_this.dopplerLevel === 0) {
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


    },
    function(require, exports, module, global) {

        var isFunction = require(8),
            inherits = require(14),
            fastSlice = require(28),
            keys = require(23);


        function EventEmitter(maxListeners) {
            this.__events = {};
            this.__maxListeners = maxListeners != null ? maxListeners : EventEmitter.defaultMaxListeners;
        }

        EventEmitter.prototype.on = function(name, listener) {
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

        EventEmitter.prototype.addListener = EventEmitter.prototype.on;

        EventEmitter.prototype.once = function(name, listener) {
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

        EventEmitter.prototype.listenTo = function(obj, name) {
            var _this = this;

            if (!obj || !(isFunction(obj.on) || isFunction(obj.addListener))) {
                throw new TypeError("EventEmitter.listenTo(obj, name) obj must have a on function taking (name, listener[, ctx])");
            }

            function handler() {
                _this.emitArgs(name, arguments);
            }

            obj.on(name, handler);

            return handler;
        };

        EventEmitter.prototype.off = function(name, listener) {
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

        EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

        EventEmitter.prototype.removeAllListeners = function() {
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

        function emit(eventList, args) {
            var a1, a2, a3, a4, a5,
                length = eventList.length - 1,
                i = -1,
                event;

            switch (args.length) {
                case 0:
                    while (i++ < length) {
                        if ((event = eventList[i])) {
                            event();
                        }
                    }
                    break;
                case 1:
                    a1 = args[0];
                    while (i++ < length) {
                        if ((event = eventList[i])) {
                            event(a1);
                        }
                    }
                    break;
                case 2:
                    a1 = args[0];
                    a2 = args[1];
                    while (i++ < length) {
                        if ((event = eventList[i])) {
                            event(a1, a2);
                        }
                    }
                    break;
                case 3:
                    a1 = args[0];
                    a2 = args[1];
                    a3 = args[2];
                    while (i++ < length) {
                        if ((event = eventList[i])) {
                            event(a1, a2, a3);
                        }
                    }
                    break;
                case 4:
                    a1 = args[0];
                    a2 = args[1];
                    a3 = args[2];
                    a4 = args[3];
                    while (i++ < length) {
                        if ((event = eventList[i])) {
                            event(a1, a2, a3, a4);
                        }
                    }
                    break;
                case 5:
                    a1 = args[0];
                    a2 = args[1];
                    a3 = args[2];
                    a4 = args[3];
                    a5 = args[4];
                    while (i++ < length) {
                        if ((event = eventList[i])) {
                            event(a1, a2, a3, a4, a5);
                        }
                    }
                    break;
                default:
                    while (i++ < length) {
                        if ((event = eventList[i])) {
                            event.apply(null, args);
                        }
                    }
                    break;
            }
        }

        EventEmitter.prototype.emitArgs = function(name, args) {
            var eventList = (this.__events || (this.__events = {}))[name];

            if (!eventList || !eventList.length) {
                return this;
            }

            emit(eventList, args);

            return this;
        };

        EventEmitter.prototype.emit = function(name) {
            return this.emitArgs(name, fastSlice(arguments, 1));
        };

        function createFunctionCaller(args) {
            switch (args.length) {
                case 0:
                    return function functionCaller(fn) {
                        return fn();
                    };
                case 1:
                    return function functionCaller(fn) {
                        return fn(args[0]);
                    };
                case 2:
                    return function functionCaller(fn) {
                        return fn(args[0], args[1]);
                    };
                case 3:
                    return function functionCaller(fn) {
                        return fn(args[0], args[1], args[2]);
                    };
                case 4:
                    return function functionCaller(fn) {
                        return fn(args[0], args[1], args[2], args[3]);
                    };
                case 5:
                    return function functionCaller(fn) {
                        return fn(args[0], args[1], args[2], args[3], args[4]);
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

            function next(err) {
                if (called !== true) {
                    if (err || index === length) {
                        called = true;
                        callback(err);
                    } else {
                        functionCaller(eventList[index++]);
                    }
                }
            }

            args[args.length] = next;
            functionCaller = createFunctionCaller(args);
            next();
        }

        EventEmitter.prototype.emitAsync = function(name, args, callback) {
            var eventList = (this.__events || (this.__events = {}))[name];

            args = fastSlice(arguments, 1);
            callback = args.pop();

            if (!isFunction(callback)) {
                throw new TypeError("EventEmitter.emitAsync(name [, ...args], callback) callback must be a function");
            }

            if (!eventList || !eventList.length) {
                callback();
            } else {
                emitAsync(eventList, args, callback);
            }

            return this;
        };

        EventEmitter.prototype.listeners = function(name) {
            var eventList = (this.__events || (this.__events = {}))[name];

            return eventList ? eventList.slice() : [];
        };

        EventEmitter.prototype.listenerCount = function(name) {
            var eventList = (this.__events || (this.__events = {}))[name];

            return eventList ? eventList.length : 0;
        };

        EventEmitter.prototype.setMaxListeners = function(value) {
            if ((value = +value) !== value) {
                throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
            }

            this.__maxListeners = value < 0 ? -1 : value;
            return this;
        };


        inherits.defineProperty(EventEmitter, "defaultMaxListeners", 10);


        inherits.defineProperty(EventEmitter, "listeners", function(obj, name) {
            var eventList;

            if (obj == null) {
                throw new TypeError("EventEmitter.listeners(obj, name) obj required");
            }
            eventList = obj.__events && obj.__events[name];

            return eventList ? eventList.slice() : [];
        });

        inherits.defineProperty(EventEmitter, "listenerCount", function(obj, name) {
            var eventList;

            if (obj == null) {
                throw new TypeError("EventEmitter.listenerCount(obj, name) obj required");
            }
            eventList = obj.__events && obj.__events[name];

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


        module.exports = EventEmitter;


    },
    function(require, exports, module, global) {

        var create = require(15),
            extend = require(22),
            mixin = require(26),
            defineProperty = require(27);


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
    function(require, exports, module, global) {

        var isNull = require(16),
            isNative = require(17),
            isPrimitive = require(21);


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
    function(require, exports, module, global) {

        module.exports = isNull;


        function isNull(obj) {
            return obj === null;
        }


    },
    function(require, exports, module, global) {

        var isFunction = require(8),
            isNullOrUndefined = require(7),
            escapeRegExp = require(18);


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
    function(require, exports, module, global) {

        var toString = require(19);


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
    function(require, exports, module, global) {

        var isString = require(20),
            isNullOrUndefined = require(7);


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
    function(require, exports, module, global) {

        module.exports = isString;


        function isString(obj) {
            return typeof(obj) === "string" || false;
        }


    },
    function(require, exports, module, global) {

        var isNullOrUndefined = require(7);


        module.exports = isPrimitive;


        function isPrimitive(obj) {
            var typeStr;
            return isNullOrUndefined(obj) || ((typeStr = typeof(obj)) !== "object" && typeStr !== "function") || false;
        }


    },
    function(require, exports, module, global) {

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
    function(require, exports, module, global) {

        var has = require(24),
            isNative = require(17),
            isNullOrUndefined = require(7),
            isObject = require(6);


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
    function(require, exports, module, global) {

        var isNative = require(17),
            getPrototypeOf = require(25),
            isNullOrUndefined = require(7);


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
    function(require, exports, module, global) {

        var isObject = require(6),
            isNative = require(17),
            isNullOrUndefined = require(7);


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
    function(require, exports, module, global) {

        var keys = require(23),
            isNullOrUndefined = require(7);


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
    function(require, exports, module, global) {

        var isObject = require(6),
            isFunction = require(8),
            isPrimitive = require(21),
            isNative = require(17),
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


        if (!isNative(nativeDefineProperty) || !(function() {
                var object = {};
                try {
                    nativeDefineProperty(object, "key", {
                        value: "value"
                    });
                    if (has(object, "key") && object.key === "value") {
                        return true;
                    }
                } catch (e) {}
                return false;
            }())) {
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
    function(require, exports, module, global) {

        module.exports = fastSlice;


        function fastSlice(array, offset) {
            var length, newLength, i, il, result, j;

            offset = offset || 0;

            length = array.length;
            i = offset - 1;
            il = length - 1;
            newLength = length - offset;
            result = new Array(newLength <= 0 ? 0 : newLength);
            j = 0;

            while (i++ < il) {
                result[j++] = array[i];
            }

            return result;
        }


    },
    function(require, exports, module, global) {

        var keys = require(23),
            isNaN = require(30);


        var mathf = exports,

            NativeMath = global.Math,

            NativeFloat32Array = typeof(Float32Array) !== "undefined" ? Float32Array : Array;


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
        mathf.acosh = NativeMath.acosh || (NativeMath.acosh = function acosh(x) {
            return mathf.log(x + mathf.sqrt(x * x - 1));
        });
        mathf.asin = NativeMath.asin;
        mathf.asinh = NativeMath.asinh || (NativeMath.asinh = function asinh(x) {
            if (x === -Infinity) {
                return x;
            } else {
                return mathf.log(x + mathf.sqrt(x * x + 1));
            }
        });
        mathf.atan = NativeMath.atan;
        mathf.atan2 = NativeMath.atan2;
        mathf.atanh = NativeMath.atanh || (NativeMath.atanh = function atanh(x) {
            return mathf.log((1 + x) / (1 - x)) / 2;
        });

        mathf.cbrt = NativeMath.cbrt || (NativeMath.cbrt = function cbrt(x) {
            var y = mathf.pow(mathf.abs(x), 1 / 3);
            return x < 0 ? -y : y;
        });

        mathf.ceil = NativeMath.ceil;

        mathf.clz32 = NativeMath.clz32 || (NativeMath.clz32 = function clz32(value) {
            value = +value >>> 0;
            return value ? 32 - value.toString(2).length : 32;
        });

        mathf.cos = NativeMath.cos;
        mathf.cosh = NativeMath.cosh || (NativeMath.cosh = function cosh(x) {
            return (mathf.exp(x) + mathf.exp(-x)) / 2;
        });

        mathf.exp = NativeMath.exp;

        mathf.expm1 = NativeMath.expm1 || (NativeMath.expm1 = function expm1(x) {
            return mathf.exp(x) - 1;
        });

        mathf.floor = NativeMath.floor;
        mathf.fround = NativeMath.fround || (NativeMath.fround = function fround(x) {
            return new NativeFloat32Array([x])[0];
        });

        mathf.hypot = NativeMath.hypot || (NativeMath.hypot = function hypot() {
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
        });

        mathf.imul = NativeMath.imul || (NativeMath.imul = function imul(a, b) {
            var ah = (a >>> 16) & 0xffff,
                al = a & 0xffff,
                bh = (b >>> 16) & 0xffff,
                bl = b & 0xffff;

            return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
        });

        mathf.log = NativeMath.log;

        mathf.log1p = NativeMath.log1p || (NativeMath.log1p = function log1p(x) {
            return mathf.log(1 + x);
        });

        mathf.log10 = NativeMath.log10 || (NativeMath.log10 = function log10(x) {
            return mathf.log(x) / mathf.LN10;
        });

        mathf.log2 = NativeMath.log2 || (NativeMath.log2 = function log2(x) {
            return mathf.log(x) / mathf.LN2;
        });

        mathf.max = NativeMath.max;
        mathf.min = NativeMath.min;

        mathf.pow = NativeMath.pow;

        mathf.random = NativeMath.random;
        mathf.round = NativeMath.round;

        mathf.sign = NativeMath.sign || (NativeMath.sign = function sign(x) {
            x = +x;
            if (x === 0 || isNaN(x)) {
                return x;
            } else {
                return x > 0 ? 1 : -1;
            }
        });

        mathf.sin = NativeMath.sin;
        mathf.sinh = NativeMath.sinh || (NativeMath.sinh = function sinh(x) {
            return (mathf.exp(x) - mathf.exp(-x)) / 2;
        });
        mathf.sqrt = NativeMath.sqrt;

        mathf.tan = NativeMath.tan;
        mathf.tanh = NativeMath.tanh || (NativeMath.tanh = function tanh(x) {
            if (x === Infinity) {
                return 1;
            } else if (x === -Infinity) {
                return -1;
            } else {
                return (mathf.exp(x) - mathf.exp(-x)) / (mathf.exp(x) + mathf.exp(-x));
            }
        });

        mathf.trunc = NativeMath.trunc || (NativeMath.trunc = function trunc(x) {
            return x < 0 ? mathf.ceil(x) : mathf.floor(x);
        });

        mathf.equals = function(a, b, e) {
            return mathf.abs(a - b) < (e !== void 0 ? e : mathf.EPSILON);
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

        mathf.clamp = function(x, min, max) {
            return x < min ? min : x > max ? max : x;
        };

        mathf.clampBottom = function(x, min) {
            return x < min ? min : x;
        };

        mathf.clampTop = function(x, max) {
            return x > max ? max : x;
        };

        mathf.clamp01 = function(x) {
            return x < 0 ? 0 : x > 1 ? 1 : x;
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
    function(require, exports, module, global) {

        var isNumber = require(31);


        module.exports = Number.isNaN || function isNaN(obj) {
            return isNumber(obj) && obj !== obj;
        };


    },
    function(require, exports, module, global) {

        module.exports = isNumber;


        function isNumber(obj) {
            return typeof(obj) === "number" || false;
        }


    },
    function(require, exports, module, global) {

        var mathf = require(29);


        var vec3 = exports;


        vec3.ArrayType = typeof(Float32Array) !== "undefined" ? Float32Array : mathf.ArrayType;


        vec3.create = function(x, y, z) {
            var out = new vec3.ArrayType(3);

            out[0] = x !== undefined ? x : 0;
            out[1] = y !== undefined ? y : 0;
            out[2] = z !== undefined ? z : 0;

            return out;
        };

        vec3.copy = function(out, a) {

            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];

            return out;
        };

        vec3.clone = function(a) {
            var out = new vec3.ArrayType(3);

            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];

            return out;
        };

        vec3.set = function(out, x, y, z) {

            out[0] = x !== undefined ? x : 0;
            out[1] = y !== undefined ? y : 0;
            out[2] = z !== undefined ? z : 0;

            return out;
        };

        vec3.add = function(out, a, b) {

            out[0] = a[0] + b[0];
            out[1] = a[1] + b[1];
            out[2] = a[2] + b[2];

            return out;
        };

        vec3.sub = function(out, a, b) {

            out[0] = a[0] - b[0];
            out[1] = a[1] - b[1];
            out[2] = a[2] - b[2];

            return out;
        };

        vec3.mul = function(out, a, b) {

            out[0] = a[0] * b[0];
            out[1] = a[1] * b[1];
            out[2] = a[2] * b[2];

            return out;
        };

        vec3.div = function(out, a, b) {
            var bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = a[0] * (bx !== 0 ? 1 / bx : bx);
            out[1] = a[1] * (by !== 0 ? 1 / by : by);
            out[2] = a[2] * (bz !== 0 ? 1 / bz : bz);

            return out;
        };

        vec3.sadd = function(out, a, s) {

            out[0] = a[0] + s;
            out[1] = a[1] + s;
            out[2] = a[2] + s;

            return out;
        };

        vec3.ssub = function(out, a, s) {

            out[0] = a[0] - s;
            out[1] = a[1] - s;
            out[2] = a[2] - s;

            return out;
        };

        vec3.smul = function(out, a, s) {

            out[0] = a[0] * s;
            out[1] = a[1] * s;
            out[2] = a[2] * s;

            return out;
        };

        vec3.sdiv = function(out, a, s) {
            s = s !== 0 ? 1 / s : s;

            out[0] = a[0] * s;
            out[1] = a[1] * s;
            out[2] = a[2] * s;

            return out;
        };

        vec3.lengthSqValues = function(x, y, z) {

            return x * x + y * y + z * z;
        };

        vec3.lengthValues = function(x, y, z) {
            var lsq = vec3.lengthSqValues(x, y, z);

            return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
        };

        vec3.invLengthValues = function(x, y, z) {
            var lsq = vec3.lengthSqValues(x, y, z);

            return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
        };

        vec3.cross = function(out, a, b) {
            var ax = a[0],
                ay = a[1],
                az = a[2],
                bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = ay * bz - az * by;
            out[1] = az * bx - ax * bz;
            out[2] = ax * by - ay * bx;

            return out;
        };

        vec3.dot = function(a, b) {

            return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        };

        vec3.lengthSq = function(a) {

            return vec3.dot(a, a);
        };

        vec3.length = function(a) {
            var lsq = vec3.lengthSq(a);

            return lsq !== 0 ? mathf.sqrt(lsq) : lsq;
        };

        vec3.invLength = function(a) {
            var lsq = vec3.lengthSq(a);

            return lsq !== 0 ? 1 / mathf.sqrt(lsq) : lsq;
        };

        vec3.setLength = function(out, a, length) {
            var x = a[0],
                y = a[1],
                z = a[2],
                s = length * vec3.invLengthValues(x, y, z);

            out[0] = x * s;
            out[1] = y * s;
            out[2] = z * s;

            return out;
        };

        vec3.normalize = function(out, a) {
            var x = a[0],
                y = a[1],
                z = a[2],
                invlsq = vec3.invLengthValues(x, y, z);

            out[0] = x * invlsq;
            out[1] = y * invlsq;
            out[2] = z * invlsq;

            return out;
        };

        vec3.inverse = function(out, a) {

            out[0] = a[0] * -1;
            out[1] = a[1] * -1;
            out[2] = a[2] * -1;

            return out;
        };

        vec3.lerp = function(out, a, b, x) {
            var lerp = mathf.lerp;

            out[0] = lerp(a[0], b[0], x);
            out[1] = lerp(a[1], b[1], x);
            out[2] = lerp(a[2], b[2], x);

            return out;
        };

        vec3.min = function(out, a, b) {
            var ax = a[0],
                ay = a[1],
                az = a[2],
                bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = bx < ax ? bx : ax;
            out[1] = by < ay ? by : ay;
            out[2] = bz < az ? bz : az;

            return out;
        };

        vec3.max = function(out, a, b) {
            var ax = a[0],
                ay = a[1],
                az = a[2],
                bx = b[0],
                by = b[1],
                bz = b[2];

            out[0] = bx > ax ? bx : ax;
            out[1] = by > ay ? by : ay;
            out[2] = bz > az ? bz : az;

            return out;
        };

        vec3.clamp = function(out, a, min, max) {
            var x = a[0],
                y = a[1],
                z = a[2],
                minx = min[0],
                miny = min[1],
                minz = min[2],
                maxx = max[0],
                maxy = max[1],
                maxz = max[2];

            out[0] = x < minx ? minx : x > maxx ? maxx : x;
            out[1] = y < miny ? miny : y > maxy ? maxy : y;
            out[2] = z < minz ? minz : z > maxz ? maxz : z;

            return out;
        };

        vec3.transformMat3 = function(out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2];

            out[0] = x * m[0] + y * m[3] + z * m[6];
            out[1] = x * m[1] + y * m[4] + z * m[7];
            out[2] = x * m[2] + y * m[5] + z * m[8];

            return out;
        };

        vec3.transformMat4 = function(out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2];

            out[0] = x * m[0] + y * m[4] + z * m[8] + m[12];
            out[1] = x * m[1] + y * m[5] + z * m[9] + m[13];
            out[2] = x * m[2] + y * m[6] + z * m[10] + m[14];

            return out;
        };

        vec3.transformMat4Rotation = function(out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2];

            out[0] = x * m[0] + y * m[4] + z * m[8];
            out[1] = x * m[1] + y * m[5] + z * m[9];
            out[2] = x * m[2] + y * m[6] + z * m[10];

            return out;
        };

        vec3.transformProjection = function(out, a, m) {
            var x = a[0],
                y = a[1],
                z = a[2],
                d = x * m[3] + y * m[7] + z * m[11] + m[15];

            d = d !== 0 ? 1 / d : d;

            out[0] = (x * m[0] + y * m[4] + z * m[8] + m[12]) * d;
            out[1] = (x * m[1] + y * m[5] + z * m[9] + m[13]) * d;
            out[2] = (x * m[2] + y * m[6] + z * m[10] + m[14]) * d;

            return out;
        };

        vec3.transformQuat = function(out, a, q) {
            var x = a[0],
                y = a[1],
                z = a[2],
                qx = q[0],
                qy = q[1],
                qz = q[2],
                qw = q[3],

                ix = qw * x + qy * z - qz * y,
                iy = qw * y + qz * x - qx * z,
                iz = qw * z + qx * y - qy * x,
                iw = -qx * x - qy * y - qz * z;

            out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

            return out;
        };

        vec3.positionFromMat4 = function(out, m) {

            out[0] = m[12];
            out[1] = m[13];
            out[2] = m[14];

            return out;
        };

        vec3.scaleFromMat3 = function(out, m) {

            out[0] = vec3.lengthValues(m[0], m[3], m[6]);
            out[1] = vec3.lengthValues(m[1], m[4], m[7]);
            out[2] = vec3.lengthValues(m[2], m[5], m[8]);

            return out;
        };

        vec3.scaleFromMat4 = function(out, m) {

            out[0] = vec3.lengthValues(m[0], m[4], m[8]);
            out[1] = vec3.lengthValues(m[1], m[5], m[9]);
            out[2] = vec3.lengthValues(m[2], m[6], m[10]);

            return out;
        };

        vec3.equal = function(a, b) {
            return !(
                a[0] !== b[0] ||
                a[1] !== b[1] ||
                a[2] !== b[2]
            );
        };

        vec3.notEqual = function(a, b) {
            return (
                a[0] !== b[0] ||
                a[1] !== b[1] ||
                a[2] !== b[2]
            );
        };

        vec3.str = function(out) {

            return "Vec3(" + out[0] + ", " + out[1] + ", " + out[2] + ")";
        };


    },
    function(require, exports, module, global) {

        var process = require(5);
        var environment = require(3);


        var time = exports,
            dateNow, performance, HR_TIME, START_MS, now;


        dateNow = Date.now || function now() {
            return (new Date()).getTime();
        };


        if (!environment.node) {
            performance = environment.window.performance || {};

            performance.now = (
                performance.now ||
                performance.webkitNow ||
                performance.mozNow ||
                performance.msNow ||
                performance.oNow ||
                function now() {
                    return dateNow() - START_MS;
                }
            );

            now = function now() {
                return performance.now();
            };
        } else {
            HR_TIME = process.hrtime();

            now = function now() {
                var hrtime = process.hrtime(HR_TIME),
                    ms = hrtime[0] * 1e3,
                    ns = hrtime[1] * 1e-6;

                return ms + ns;
            };
        }

        START_MS = dateNow();

        time.now = now;

        time.stamp = function stamp() {
            return START_MS + now();
        };


    }
], void 0, (new Function("return this;"))()));
