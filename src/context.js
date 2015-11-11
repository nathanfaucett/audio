var isNullOrUndefined = require("is_null_or_undefined"),
    environment = require("environment"),
    eventListener = require("event_listener");


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
