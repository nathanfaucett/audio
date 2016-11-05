var environment = require("@nathanfaucett/environment"),
    eventListener = require("@nathanfaucett/event_listener"),
    audio = require("../..");


var boomClip = audio.Clip.create({
        name: "clip-boom",
        src: "./content/boom.ogg"
    }),
    engineClip = audio.Clip.create({
        name: "clip-engine_loop",
        src: "./content/engine-loop.ogg"
    }),
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


var boomSource = audio.Source.create({
        volume: 1,
        clip: boomClip
    }),
    engineSource = audio.Source.create({
        volume: 0.25,
        loop: true,
        clip: engineClip
    });


function start() {

    engineSource.play();

    setTimeout(function() {
        boomSource.play();
    }, 1000);

    setTimeout(function() {
        engineSource.stop();
    }, 2000);
}
