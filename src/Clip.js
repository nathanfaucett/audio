var load = require("./load");


var ClipPrototype;


module.exports = Clip;


function Clip(src) {
    this.src = src;
    this.raw = null;
}
ClipPrototype = Clip.prototype;

ClipPrototype.load = function(callback) {
    var _this = this;

    load(this.src, function onLoad(error, raw) {
        if (error) {
            callback(error);
        } else {
            _this.raw = raw;
            callback();
        }
    });

    return this;
};
