var audio = require("../..");


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