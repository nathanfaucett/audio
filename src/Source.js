var SourcePrototype;


module.exports = Source;


function Source() {
    this.__clip = null;
}
SourcePrototype = Source.prototype;

SourcePrototype.setClip = function(clip) {
    this.__clip = clip;
    return this;
};

SourcePrototype.play = function(offset) {
    return this;
};
