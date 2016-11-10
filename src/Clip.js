var assets = require("@nathanfaucett/assets"),
    HttpError = require("@nathanfaucett/http_error"),
    eventListener = require("@nathanfaucett/event_listener"),
    XMLHttpRequestPolyfill = require("@nathanfaucett/xmlhttprequest_polyfill"),
    context = require("./context");


var Asset = assets.Asset,
    ClipPrototype;


module.exports = Clip;


function Clip() {
    Asset.call(this);
}
Asset.extend(Clip, "audio.Clip");
ClipPrototype = Clip.prototype;

if (context) {
    ClipPrototype.loadSrc = function loadSrc(src, callback) {
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
    ClipPrototype.loadSrc = function loadSrc(src, callback) {
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