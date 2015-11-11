var environment = require("environment"),
    eventListener = require("event_listener"),
    audio = require("../..");


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
            clip: boomClip
        }),
        engineSource = audio.Source.create({
            loop: true,
            clip: engineClip
        });

    engineSource.play();
    setTimeout(function() {
        engineSource.pause();
    }, 1000);
}
