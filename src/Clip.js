var environment = require("environment"),
    eventListener = require("event_listener")
audioContext = require("./audioContext");


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
