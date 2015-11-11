var HttpError = require("http_error"),
    environment = require("environment"),
    eventListener = require("event_listener"),
    XMLHttpRequestPolyfill = require("xmlhttprequest_polyfill"),
    context = require("./context");


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
