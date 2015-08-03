var environment = require("environment"),
    eventListener = require("event_listener");


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
