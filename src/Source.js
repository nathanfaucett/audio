var context = require("./context");


if (context) {
    module.exports = require("./WebAudioSource");
} else {
    module.exports = require("./AudioSource");
}