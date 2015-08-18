var eventListener = require("event_listener"),
    XMLHttpRequestPolyfill = require("xmlhttprequest_polyfill"),
    context = require("./context");


module.exports = load;


function load(src, callback) {
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

    request.send(null);

    return function abort() {
        request.abort();
    };
}
