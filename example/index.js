(function(dependencies, chunks, undefined, global) {
    
    var cache = [],
        cacheCallbacks = {};
    

    function Module() {
        this.id = null;
        this.filename = null;
        this.dirname = null;
        this.exports = {};
        this.loaded = false;
    }

    Module.prototype.require = require;

    function require(index) {
        var module = cache[index],
            callback, exports;

        if (module !== undefined) {
            return module.exports;
        } else {
            callback = dependencies[index];

            cache[index] = module = new Module();
            exports = module.exports;

            callback.call(exports, require, exports, module, undefined, global);
            module.loaded = true;

            return module.exports;
        }
    }

    require.resolve = function(path) {
        return path;
    };

    
    require.async = function async(index, callback) {
        var module = cache[index],
            callbacks, node;

        if (module) {
            callback(module.exports);
        } else if ((callbacks = cacheCallbacks[index])) {
            callbacks[callbacks.length] = callback;
        } else {
            node = document.createElement("script");
            callbacks = cacheCallbacks[index] = [callback];

            node.type = "text/javascript";
            node.charset = "utf-8";
            node.async = true;

            function onLoad() {
                var i = -1,
                    il = callbacks.length - 1;

                while (i++ < il) {
                    callbacks[i](require(index));
                }
                delete cacheCallbacks[index];
            }

            if (node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf("[native code") < 0)) {
                node.attachEvent("onreadystatechange", onLoad);
            } else {
                node.addEventListener("load", onLoad, false);
            }

            node.src = chunks[index];

            document.head.appendChild(node);
        }
    };

    global["bPpIIzw4-jiB9-4Vl1-H6fi-840FnvjgMzcSf"] = function(asyncDependencies) {
        var i = -1,
            il = asyncDependencies.length - 1,
            dependency, index;

        while (i++ < il) {
            dependency = asyncDependencies[i];
            index = dependency[0];

            if (dependencies[index] === null) {
                dependencies[index] = dependency[1];
            }
        }
    };

    

    if (typeof(define) === "function" && define.amd) {
        define([], function() {
            return require(0);
        });
    } else if (typeof(module) !== "undefined" && module.exports) {
        module.exports = require(0);
    } else {
        
        require(0);
        
    }
}([
function(require, exports, module, undefined, global) {
/*@=-/var/www/html/node/_engine/js-audio/example/src/index.js-=@*/
var environment = require(1),
    eventListener = require(2),
    audio = require(3);


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

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/environment@0.0.2/src/index.js-=@*/
var Buffer = require(4).Buffer;
var process = require(5);
var environment = exports,

    hasWindow = typeof(window) !== "undefined",
    userAgent = hasWindow ? window.navigator.userAgent : "";


environment.worker = typeof(importScripts) !== "undefined";

environment.browser = environment.worker || !!(
    hasWindow &&
    typeof(navigator) !== "undefined" &&
    window.document
);

environment.node = (!hasWindow &&
    typeof(process) !== "undefined" &&
    typeof(process.versions) !== "undefined" &&
    typeof(process.versions.node) !== "undefined" &&
    typeof(Buffer) !== "undefined"
);

environment.mobile = environment.browser && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());

environment.window = (
    hasWindow ? window :
    typeof(global) !== "undefined" ? global :
    typeof(self) !== "undefined" ? self : {}
);

environment.pixelRatio = environment.window.devicePixelRatio || 1;

environment.document = typeof(document) !== "undefined" ? document : {};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/event_listener@0.0.2/src/index.js-=@*/
var process = require(5);
var isObject = require(9),
    isFunction = require(10),
    environment = require(1),
    eventTable = require(11);


var eventListener = module.exports,

    reSpliter = /[\s]+/,

    window = environment.window,
    document = environment.document,

    listenToEvent, captureEvent, removeEvent, dispatchEvent;


window.Event = window.Event || function EmptyEvent() {};


eventListener.on = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        listenToEvent(target, eventTypes[i], callback);
    }
};

eventListener.capture = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        captureEvent(target, eventTypes[i], callback);
    }
};

eventListener.off = function(target, eventType, callback) {
    var eventTypes = eventType.split(reSpliter),
        i = eventTypes.length;

    while (i--) {
        removeEvent(target, eventTypes[i], callback);
    }
};

eventListener.emit = function(target, eventType, event) {

    return dispatchEvent(target, eventType, isObject(event) ? event : {});
};

eventListener.getEventConstructor = function(target, eventType) {
    var getter = eventTable[eventType];
    return isFunction(getter) ? getter(target) : window.Event;
};


if (isFunction(document.addEventListener)) {

    listenToEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, false);
    };

    captureEvent = function(target, eventType, callback) {

        target.addEventListener(eventType, callback, true);
    };

    removeEvent = function(target, eventType, callback) {

        target.removeEventListener(eventType, callback, false);
    };

    dispatchEvent = function(target, eventType, event) {
        var getter = eventTable[eventType],
            EventType = isFunction(getter) ? getter(target) : window.Event;

        return !!target.dispatchEvent(new EventType(eventType, event));
    };
} else if (isFunction(document.attachEvent)) {

    listenToEvent = function(target, eventType, callback) {

        target.attachEvent("on" + eventType, callback);
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType, callback) {

        target.detachEvent("on" + eventType, callback);
    };

    dispatchEvent = function(target, eventType, event) {
        var doc = target.ownerDocument || document;

        return !!target.fireEvent("on" + eventType, doc.createEventObject(event));
    };
} else {

    listenToEvent = function(target, eventType, callback) {

        target["on" + eventType] = callback;
        return target;
    };

    captureEvent = function() {
        if (process.env.NODE_ENV === "development") {
            throw new Error(
                "Attempted to listen to events during the capture phase on a " +
                "browser that does not support the capture phase. Your application " +
                "will not receive some events."
            );
        }
    };

    removeEvent = function(target, eventType) {

        target["on" + eventType] = null;
        return true;
    };

    dispatchEvent = function(target, eventType, event) {
        var onType = "on" + eventType;

        if (isFunction(target[onType])) {
            event.type = eventType;
            return !!target[onType](event);
        }

        return false;
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/audio@0.0.1/src/index.js-=@*/
var context = require(18);


var audio = exports;


audio.context = context;
audio.Clip = require(19);
audio.Source = require(20);

audio.setOrientation = function(ox, oy, oz, ux, uy, uz) {
    if (context) {
        context.listener.setOrientation(ox, oy, oz, ux, uy, uz);
    }
};

audio.setPosition = function(x, y, z) {
    if (context) {
        context.listener.setPosition(x, y, z);
    }
};

audio.setSpeedOfSound = function(speed) {
    if (context) {
        context.listener.speedOfSound = speed;
    }
};

audio.setDopplerFactor = function(dopplerFactor) {
    if (context) {
        context.listener.dopplerFactor = dopplerFactor;
    }
};
},
function(require, exports, module, undefined, global) {
/*@=-buffer@3.6.0/index.js-=@*/
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require(6)
var ieee754 = require(7)
var isArray = require(8)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

},
function(require, exports, module, undefined, global) {
/*@=-process@0.11.9/browser.js-=@*/
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},
function(require, exports, module, undefined, global) {
/*@=-base64-js@0.0.8/lib/b64.js-=@*/
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},
function(require, exports, module, undefined, global) {
/*@=-ieee754@1.1.8/index.js-=@*/
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},
function(require, exports, module, undefined, global) {
/*@=-isarray@1.0.0/index.js-=@*/
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_object@0.0.1/src/index.js-=@*/
var isNull = require(12);


module.exports = isObject;


function isObject(value) {
    var type = typeof(value);
    return type === "function" || (!isNull(value) && type === "object") || false;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_function@0.0.1/src/index.js-=@*/
var objectToString = Object.prototype.toString,
    isFunction;


if (objectToString.call(function() {}) === "[object Object]") {
    isFunction = function isFunction(value) {
        return value instanceof Function;
    };
} else if (typeof(/./) === "function" || (typeof(Uint8Array) !== "undefined" && typeof(Uint8Array) !== "function")) {
    isFunction = function isFunction(value) {
        return objectToString.call(value) === "[object Function]";
    };
} else {
    isFunction = function isFunction(value) {
        return typeof(value) === "function" || false;
    };
}


module.exports = isFunction;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/event_listener@0.0.2/src/event_table.js-=@*/
var isNode = require(13),
    environment = require(1);


var window = environment.window,

    XMLHttpRequest = window.XMLHttpRequest,
    OfflineAudioContext = window.OfflineAudioContext;


function returnEvent() {
    return window.Event;
}


module.exports = {
    abort: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    afterprint: returnEvent,

    animationend: function() {
        return window.AnimationEvent || window.Event;
    },
    animationiteration: function() {
        return window.AnimationEvent || window.Event;
    },
    animationstart: function() {
        return window.AnimationEvent || window.Event;
    },

    audioprocess: function() {
        return window.AudioProcessingEvent || window.Event;
    },

    beforeprint: returnEvent,
    beforeunload: function() {
        return window.BeforeUnloadEvent || window.Event;
    },
    beginevent: function() {
        return window.TimeEvent || window.Event;
    },

    blocked: returnEvent,
    blur: function() {
        return window.FocusEvent || window.Event;
    },

    cached: returnEvent,
    canplay: returnEvent,
    canplaythrough: returnEvent,
    chargingchange: returnEvent,
    chargingtimechange: returnEvent,
    checking: returnEvent,

    click: function() {
        return window.MouseEvent || window.Event;
    },

    close: returnEvent,
    compassneedscalibration: function() {
        return window.SensorEvent || window.Event;
    },
    complete: function(target) {
        if (OfflineAudioContext && target instanceof OfflineAudioContext) {
            return window.OfflineAudioCompletionEvent || window.Event;
        } else {
            return window.Event;
        }
    },

    compositionend: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionstart: function() {
        return window.CompositionEvent || window.Event;
    },
    compositionupdate: function() {
        return window.CompositionEvent || window.Event;
    },

    contextmenu: function() {
        return window.MouseEvent || window.Event;
    },
    copy: function() {
        return window.ClipboardEvent || window.Event;
    },
    cut: function() {
        return window.ClipboardEvent || window.Event;
    },

    dblclick: function() {
        return window.MouseEvent || window.Event;
    },
    devicelight: function() {
        return window.DeviceLightEvent || window.Event;
    },
    devicemotion: function() {
        return window.DeviceMotionEvent || window.Event;
    },
    deviceorientation: function() {
        return window.DeviceOrientationEvent || window.Event;
    },
    deviceproximity: function() {
        return window.DeviceProximityEvent || window.Event;
    },

    dischargingtimechange: returnEvent,

    DOMActivate: function() {
        return window.UIEvent || window.Event;
    },
    DOMAttributeNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMAttrModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMCharacterDataModified: function() {
        return window.MutationEvent || window.Event;
    },
    DOMContentLoaded: returnEvent,
    DOMElementNameChanged: function() {
        return window.MutationNameEvent || window.Event;
    },
    DOMFocusIn: function() {
        return window.FocusEvent || window.Event;
    },
    DOMFocusOut: function() {
        return window.FocusEvent || window.Event;
    },
    DOMNodeInserted: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeInsertedIntoDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemoved: function() {
        return window.MutationEvent || window.Event;
    },
    DOMNodeRemovedFromDocument: function() {
        return window.MutationEvent || window.Event;
    },
    DOMSubtreeModified: function() {
        return window.FocusEvent || window.Event;
    },
    downloading: returnEvent,

    drag: function() {
        return window.DragEvent || window.Event;
    },
    dragend: function() {
        return window.DragEvent || window.Event;
    },
    dragenter: function() {
        return window.DragEvent || window.Event;
    },
    dragleave: function() {
        return window.DragEvent || window.Event;
    },
    dragover: function() {
        return window.DragEvent || window.Event;
    },
    dragstart: function() {
        return window.DragEvent || window.Event;
    },
    drop: function() {
        return window.DragEvent || window.Event;
    },

    durationchange: returnEvent,
    ended: returnEvent,

    endEvent: function() {
        return window.TimeEvent || window.Event;
    },
    error: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else if (isNode(target)) {
            return window.UIEvent || window.Event;
        } else {
            return window.Event;
        }
    },
    focus: function() {
        return window.FocusEvent || window.Event;
    },
    focusin: function() {
        return window.FocusEvent || window.Event;
    },
    focusout: function() {
        return window.FocusEvent || window.Event;
    },

    fullscreenchange: returnEvent,
    fullscreenerror: returnEvent,

    gamepadconnected: function() {
        return window.GamepadEvent || window.Event;
    },
    gamepaddisconnected: function() {
        return window.GamepadEvent || window.Event;
    },

    hashchange: function() {
        return window.HashChangeEvent || window.Event;
    },

    input: returnEvent,
    invalid: returnEvent,

    keydown: function() {
        return window.KeyboardEvent || window.Event;
    },
    keyup: function() {
        return window.KeyboardEvent || window.Event;
    },
    keypress: function() {
        return window.KeyboardEvent || window.Event;
    },

    languagechange: returnEvent,
    levelchange: returnEvent,

    load: function(target) {
        if (XMLHttpRequest && target instanceof XMLHttpRequest) {
            return window.ProgressEvent || window.Event;
        } else {
            return window.UIEvent || window.Event;
        }
    },

    loadeddata: returnEvent,
    loadedmetadata: returnEvent,

    loadend: function() {
        return window.ProgressEvent || window.Event;
    },
    loadstart: function() {
        return window.ProgressEvent || window.Event;
    },

    message: function() {
        return window.MessageEvent || window.Event;
    },

    mousedown: function() {
        return window.MouseEvent || window.Event;
    },
    mouseenter: function() {
        return window.MouseEvent || window.Event;
    },
    mouseleave: function() {
        return window.MouseEvent || window.Event;
    },
    mousemove: function() {
        return window.MouseEvent || window.Event;
    },
    mouseout: function() {
        return window.MouseEvent || window.Event;
    },
    mouseover: function() {
        return window.MouseEvent || window.Event;
    },
    mouseup: function() {
        return window.MouseEvent || window.Event;
    },

    noupdate: returnEvent,
    obsolete: returnEvent,
    offline: returnEvent,
    online: returnEvent,
    open: returnEvent,
    orientationchange: returnEvent,

    pagehide: function() {
        return window.PageTransitionEvent || window.Event;
    },
    pageshow: function() {
        return window.PageTransitionEvent || window.Event;
    },

    paste: function() {
        return window.ClipboardEvent || window.Event;
    },
    pause: returnEvent,
    pointerlockchange: returnEvent,
    pointerlockerror: returnEvent,
    play: returnEvent,
    playing: returnEvent,

    popstate: function() {
        return window.PopStateEvent || window.Event;
    },
    progress: function() {
        return window.ProgressEvent || window.Event;
    },

    ratechange: returnEvent,
    readystatechange: returnEvent,

    repeatevent: function() {
        return window.TimeEvent || window.Event;
    },

    reset: returnEvent,

    resize: function() {
        return window.UIEvent || window.Event;
    },
    scroll: function() {
        return window.UIEvent || window.Event;
    },

    seeked: returnEvent,
    seeking: returnEvent,

    select: function() {
        return window.UIEvent || window.Event;
    },
    show: function() {
        return window.MouseEvent || window.Event;
    },
    stalled: returnEvent,
    storage: function() {
        return window.StorageEvent || window.Event;
    },
    submit: returnEvent,
    success: returnEvent,
    suspend: returnEvent,

    SVGAbort: function() {
        return window.SVGEvent || window.Event;
    },
    SVGError: function() {
        return window.SVGEvent || window.Event;
    },
    SVGLoad: function() {
        return window.SVGEvent || window.Event;
    },
    SVGResize: function() {
        return window.SVGEvent || window.Event;
    },
    SVGScroll: function() {
        return window.SVGEvent || window.Event;
    },
    SVGUnload: function() {
        return window.SVGEvent || window.Event;
    },
    SVGZoom: function() {
        return window.SVGEvent || window.Event;
    },
    timeout: function() {
        return window.ProgressEvent || window.Event;
    },

    timeupdate: returnEvent,

    touchcancel: function() {
        return window.TouchEvent || window.Event;
    },
    touchend: function() {
        return window.TouchEvent || window.Event;
    },
    touchenter: function() {
        return window.TouchEvent || window.Event;
    },
    touchleave: function() {
        return window.TouchEvent || window.Event;
    },
    touchmove: function() {
        return window.TouchEvent || window.Event;
    },
    touchstart: function() {
        return window.TouchEvent || window.Event;
    },

    transitionend: function() {
        return window.TransitionEvent || window.Event;
    },
    unload: function() {
        return window.UIEvent || window.Event;
    },

    updateready: returnEvent,
    upgradeneeded: returnEvent,

    userproximity: function() {
        return window.SensorEvent || window.Event;
    },

    visibilitychange: returnEvent,
    volumechange: returnEvent,
    waiting: returnEvent,

    wheel: function() {
        return window.WheelEvent || window.Event;
    }
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_null@0.0.1/src/index.js-=@*/
module.exports = isNull;


function isNull(value) {
    return value === null;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_node@0.0.1/src/index.js-=@*/
var isString = require(14),
    isNullOrUndefined = require(15),
    isNumber = require(16),
    isFunction = require(10);


var isNode;


if (typeof(Node) !== "undefined" && isFunction(Node)) {
    isNode = function isNode(value) {
        return value instanceof Node;
    };
} else {
    isNode = function isNode(value) {
        return (!isNullOrUndefined(value) &&
            isNumber(value.nodeType) &&
            isString(value.nodeName)
        );
    };
}


module.exports = isNode;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_string@0.0.1/src/index.js-=@*/
module.exports = isString;


function isString(value) {
    return typeof(value) === "string" || false;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_null_or_undefined@0.0.1/src/index.js-=@*/
var isNull = require(12),
    isUndefined = require(17);


module.exports = isNullOrUndefined;

/**
  isNullOrUndefined accepts any value and returns true
  if the value is null or undefined. For all other values
  false is returned.
  
  @param {Any}        any value to test
  @returns {Boolean}  the boolean result of testing value

  @example
    isNullOrUndefined(null);   // returns true
    isNullOrUndefined(undefined);   // returns true
    isNullOrUndefined("string");    // returns false
**/
function isNullOrUndefined(value) {
    return isNull(value) || isUndefined(value);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_number@0.0.1/src/index.js-=@*/
module.exports = isNumber;


function isNumber(value) {
    return typeof(value) === "number" || false;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_undefined@0.0.1/src/index.js-=@*/
module.exports = isUndefined;


function isUndefined(value) {
    return value === void(0);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/audio@0.0.1/src/context.js-=@*/
var isNullOrUndefined = require(15),
    environment = require(1),
    eventListener = require(2);


var window = environment.window,

    AudioContext = (
        window.AudioContext ||
        window.webkitAudioContext ||
        window.mozAudioContext ||
        window.oAudioContext ||
        window.msAudioContext
    ),

    context, AudioContextPrototype, OscillatorPrototype, BufferSourceNodePrototype, GainPrototype, onTouchStart;


if (AudioContext) {
    context = new AudioContext();

    AudioContextPrototype = AudioContext.prototype;
    AudioContextPrototype.UNLOCKED = !environment.mobile;
    AudioContextPrototype.createGain = AudioContextPrototype.createGain || AudioContextPrototype.createGainNode;
    AudioContextPrototype.createPanner = AudioContextPrototype.createPanner || AudioContextPrototype.createPannerNode;
    AudioContextPrototype.createDelay = AudioContextPrototype.createDelay || AudioContextPrototype.createDelayNode;
    AudioContextPrototype.createScriptProcessor = AudioContextPrototype.createScriptProcessor || AudioContextPrototype.createJavaScriptNode;

    OscillatorPrototype = context.createOscillator().constructor.prototype;
    OscillatorPrototype.start = OscillatorPrototype.start || OscillatorPrototype.noteOn;
    OscillatorPrototype.stop = OscillatorPrototype.stop || OscillatorPrototype.stop;
    OscillatorPrototype.setPeriodicWave = OscillatorPrototype.setPeriodicWave || OscillatorPrototype.setWaveTable;

    BufferSourceNodePrototype = context.createBufferSource().constructor.prototype;
    BufferSourceNodePrototype.start = BufferSourceNodePrototype.start || BufferSourceNodePrototype.noteOn;
    BufferSourceNodePrototype.stop = BufferSourceNodePrototype.stop || BufferSourceNodePrototype.stop;

    GainPrototype = context.createGain().gain.constructor.prototype;
    GainPrototype.setTargetAtTime = GainPrototype.setTargetAtTime || GainPrototype.setTargetValueAtTime;

    onTouchStart = function onTouchStart() {
        var source = context.createBufferSource();

        source.buffer = context.createBuffer(1, 1, 22050);
        source.connect(context.destination);
        source.start(0);

        context.UNLOCKED = true;

        eventListener.off(window, "touchstart", onTouchStart);
        eventListener.emit(window, "audiocontextunlock");
    };

    eventListener.on(window, "touchstart", onTouchStart);
}


module.exports = isNullOrUndefined(context) ? false : context;
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/audio@0.0.1/src/Clip.js-=@*/
var assets = require(21),
    HttpError = require(22),
    eventListener = require(2),
    XMLHttpRequestPolyfill = require(23),
    context = require(18);


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
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/audio@0.0.1/src/Source.js-=@*/
var context = require(18);


if (context) {
    module.exports = require(101);
} else {
    module.exports = require(102);
}
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/assets@0.0.1/src/index.js-=@*/
exports.Asset = require(24);
exports.Assets = require(25);
exports.JSONAsset = require(26);
exports.TextAsset = require(27);
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/http_error@0.0.2/src/index.js-=@*/
var objectForEach = require(32),
    inherits = require(35),
    STATUS_CODES = require(100);


var STATUS_NAMES = {},
    STATUS_STRINGS = {},
    HttpErrorPrototype;


module.exports = HttpError;


objectForEach(STATUS_CODES, function eachStatus(status, statusCode) {
    var name;

    if (statusCode < 400) {
        return;
    }

    name = status.replace(/\s+/g, "");

    if (!(/\w+Error$/.test(name))) {
        name += "Error";
    }

    STATUS_NAMES[statusCode] = name;
    STATUS_STRINGS[statusCode] = status;
});


function HttpError(statusCode, message, fileName, lineNumber) {
    if (message instanceof Error) {
        message = message.message;
    }

    if (statusCode instanceof Error) {
        message = statusCode.message;
        statusCode = 500;
    } else if (typeof(statusCode) === "string") {
        message = statusCode;
        statusCode = 500;
    } else {
        statusCode = statusCode || 500;
    }

    Error.call(this, message, fileName, lineNumber);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

    this.name = STATUS_NAMES[statusCode] || "UnknownHttpError";
    this.statusCode = statusCode;
    this.message = this.name + ": " + statusCode + " " + (message || STATUS_STRINGS[statusCode]);
}
inherits(HttpError, Error);
HttpErrorPrototype = HttpError.prototype;

HttpErrorPrototype.toString = function() {
    return this.message;
};

HttpErrorPrototype.toJSON = function(json) {
    json = json || {};

    json.name = this.name;
    json.statusCode = this.statusCode;
    json.message = this.message;

    return json;
};

HttpErrorPrototype.fromJSON = function(json) {

    this.name = json.name;
    this.statusCode = json.statusCode;
    this.message = json.message;

    return this;
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/index.js-=@*/
var extend = require(44),
    EventEmitter = require(36),
    EventPolyfill = require(91),
    ProgressEventPolyfill = require(92),
    tryCallFunction = require(93),
    trySetValue = require(94),
    emitEvent = require(95),
    toUint8Array = require(96),
    createNativeXMLHttpRequest = require(97);


var hasNativeProgress = false,
    XMLHttpRequestPolyfillPrototype;


module.exports = XMLHttpRequestPolyfill;


function XMLHttpRequestPolyfill(options) {
    var _this = this,
        nativeXMLHttpRequest = createNativeXMLHttpRequest(options || {});

    EventEmitter.call(this, -1);

    this.__requestHeaders = {};
    this.__nativeXMLHttpRequest = nativeXMLHttpRequest;

    this.onabort = null;
    this.onerror = null;
    this.onload = null;
    this.onloadend = null;
    this.onloadstart = null;
    this.onprogress = null;
    this.onreadystatechange = null;
    this.ontimeout = null;

    this.readyState = 0;
    this.response = "";
    this.responseText = "";
    this.responseType = "";
    this.responseURL = "";
    this.responseXML = null;
    this.status = 0;
    this.statusText = "";
    this.timeout = 0;
    this.withCredentials = false;

    nativeXMLHttpRequest.onreadystatechange = function(e) {
        return XMLHttpRequestPolyfill_onReadyStateChange(_this, e || {});
    };

    nativeXMLHttpRequest.ontimeout = function(e) {
        emitEvent(_this, "timeout", new EventPolyfill("timeout", e || {}));
    };

    nativeXMLHttpRequest.onerror = function(e) {
        emitEvent(_this, "error", new EventPolyfill("error", e || {}));
    };

    if ("onprogress" in nativeXMLHttpRequest) {
        hasNativeProgress = true;
        nativeXMLHttpRequest.onprogress = function(e) {
            emitEvent(_this, "progress", new ProgressEventPolyfill("progress", e || {}));
        };
    }
}
EventEmitter.extend(XMLHttpRequestPolyfill);
XMLHttpRequestPolyfillPrototype = XMLHttpRequestPolyfill.prototype;


function XMLHttpRequestPolyfill_onReadyStateChange(_this, e) {
    var nativeXMLHttpRequest = _this.__nativeXMLHttpRequest,
        response;

    _this.readyState = nativeXMLHttpRequest.readyState;

    switch (nativeXMLHttpRequest.readyState) {
        case 1:
            emitEvent(_this, "loadstart", new EventPolyfill("loadstart", e));
            break;
        case 3:
            XMLHttpRequestPolyfill_onProgress(_this, e);
            break;
        case 4:
            response = nativeXMLHttpRequest.response || "";

            _this.response = response;

            _this.status = nativeXMLHttpRequest.status || 0;
            _this.statusText = nativeXMLHttpRequest.statusText || "";

            if (nativeXMLHttpRequest.responseType !== "arraybuffer") {
                _this.responseText = nativeXMLHttpRequest.responseText || response;
                _this.responseXML = nativeXMLHttpRequest.responseXML || response;
            } else {
                _this.responseText = "";
                _this.responseXML = "";
            }

            _this.responseType = nativeXMLHttpRequest.responseType || "";
            _this.responseURL = nativeXMLHttpRequest.responseURL || "";

            emitEvent(_this, "load", new EventPolyfill("load", e));
            emitEvent(_this, "loadend", new EventPolyfill("loadend", e));

            break;
    }

    emitEvent(_this, "readystatechange", new EventPolyfill("readystatechange", e));

    return _this;
}

function XMLHttpRequestPolyfill_onProgress(_this, e) {
    var event;

    if (!hasNativeProgress) {
        event = new ProgressEventPolyfill("progress", e);

        event.lengthComputable = false;
        event.loaded = 1;
        event.total = 1;

        emitEvent(_this, "progress", event);

        return event;
    }
}

XMLHttpRequestPolyfillPrototype.abort = function() {
    emitEvent(this, "abort", new EventPolyfill("abort", {}));
    tryCallFunction(this.__nativeXMLHttpRequest, "abort");
};

XMLHttpRequestPolyfillPrototype.setTimeout = function(ms) {
    this.timeout = ms;
    trySetValue(this.__nativeXMLHttpRequest, "timeout", ms);
};

XMLHttpRequestPolyfillPrototype.setWithCredentials = function(value) {
    value = !!value;
    this.withCredentials = value;
    trySetValue(this.__nativeXMLHttpRequest, "withCredentials", value);
};

XMLHttpRequestPolyfillPrototype.getAllResponseHeaders = function() {
    return tryCallFunction(this.__nativeXMLHttpRequest, "getAllResponseHeaders");
};

XMLHttpRequestPolyfillPrototype.getResponseHeader = function(header) {
    return tryCallFunction(this.__nativeXMLHttpRequest, "getResponseHeader", header);
};

XMLHttpRequestPolyfillPrototype.open = function(method, url, async, user, password) {
    if (this.readyState === 0) {
        this.readyState = 1;
        return tryCallFunction(this.__nativeXMLHttpRequest, "open", method, url, async, user, password);
    } else {
        return undefined;
    }
};

XMLHttpRequestPolyfillPrototype.overrideMimeType = function(mimetype) {
    tryCallFunction(this.__nativeXMLHttpRequest, "overrideMimeType", mimetype);
};

XMLHttpRequestPolyfillPrototype.send = function(data) {
    this.__nativeXMLHttpRequest.responseType = this.responseType;
    tryCallFunction(this.__nativeXMLHttpRequest, "send", data);
};

XMLHttpRequestPolyfillPrototype.setRequestHeader = function(key, value) {
    this.__requestHeaders[key] = value;
    tryCallFunction(this.__nativeXMLHttpRequest, "setRequestHeader", key, value);
};

XMLHttpRequestPolyfillPrototype.getRequestHeader = function(key) {
    return this.__requestHeaders[key];
};

XMLHttpRequestPolyfillPrototype.getRequestHeaders = function() {
    return extend({}, this.__requestHeaders);
};

XMLHttpRequestPolyfillPrototype.sendAsBinary = function(string) {
    return this.send(toUint8Array(string));
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/assets@0.0.1/src/Asset.js-=@*/
var Class = require(28),
    keys = require(29),
    isArray = require(30),
    isObject = require(9),
    isString = require(14),
    arrayForEach = require(31),
    objectForEach = require(32);


var ClassPrototype = Class.prototype,
    AssetPrototype;


module.exports = Asset;


function Asset() {

    Class.call(this);

    this.name = null;
    this.src = null;
    this.data = null;
}
Class.extend(Asset, "assets.Asset");
AssetPrototype = Asset.prototype;

AssetPrototype.construct = function(options) {

    ClassPrototype.construct.call(this);

    options = options || {};

    this.name = options.name || null;
    this.src = options.src || null;

    return this;
};

AssetPrototype.destructor = function() {

    ClassPrototype.destructor.call(this);

    this.name = null;
    this.src = null;
    this.data = null;

    return this;
};

AssetPrototype.setSrc = function(src) {
    this.src = src;
    return this;
};

AssetPrototype.parse = function(data) {
    return data;
};

AssetPrototype.loadSrc = function(src, callback) {
    callback(new Error("Asset.load(callback) is not defined for " + this));
    return this;
};

AssetPrototype.load = function(callback) {
    var _this = this,
        src = this.src;

    function finalCallback(error, data) {
        if (error) {
            _this.emit("error", error);
            callback(error);
        } else {
            _this.data = data;
            _this.emit("load");
            callback();
        }
    }

    if (isArray(src)) {
        Asset_loadArray(this, src, finalCallback);
    } else if (isObject(src)) {
        Asset_loadObject(this, src, finalCallback);
    } else if (isString(src)) {
        this.loadSrc(src, function onLoad(error, data) {
            if (error) {
                finalCallback(error);
            } else {
                finalCallback(undefined, _this.parse(data));
            }
        });
    } else {
        finalCallback(undefined, this.data);
    }

    return this;
};

function Asset_loadArray(_this, srcs, callback) {
    var length = srcs.length,
        data = new Array(length),
        index = 0,
        called = false;

    function done(error) {
        index += 1;
        if (error || index === length) {
            if (!called) {
                called = true;
                callback(error, data);
            }
        }
    }

    arrayForEach(srcs, function onEach(src, index) {
        _this.loadSrc(src, function onLoad(error, value) {
            if (error) {
                done(error);
            } else {
                data[index] = _this.parse(value);
                done();
            }
        });
    });
}

function Asset_loadObject(_this, srcs, callback) {
    var srcKeys = keys(srcs),
        length = srcKeys.length,
        data = {},
        index = 0,
        called = false;

    function done(error) {
        index += 1;
        if (error || index === length) {
            if (!called) {
                called = true;
                callback(error, data);
            }
        }
    }

    objectForEach(srcs, function onEach(src, key) {
        _this.loadSrc(src, function onLoad(error, value) {
            if (error) {
                done(error);
            } else {
                data[key] = _this.parse(value);
                done();
            }
        });
    });
}
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/assets@0.0.1/src/Assets.js-=@*/
var Class = require(28),
    indexOf = require(76),
    isNullOrUndefined = require(15);


var ClassPrototype = Class.prototype,
    AssetsPrototype;


module.exports = Assets;


function Assets() {

    Class.call(this);

    this._notLoaded = [];
    this._array = [];
    this._hash = {};
}
Class.extend(Assets, "assets.Assets");
AssetsPrototype = Assets.prototype;

AssetsPrototype.construct = function() {

    ClassPrototype.construct.call(this);

    return this;
};

AssetsPrototype.destructor = function() {
    var array = this._array,
        hash = this._hash,
        i = -1,
        il = array.length - 1,
        asset;

    ClassPrototype.destructor.call(this);

    while (i++ < il) {
        asset = array[i];
        asset.destructor();

        array.splice(i, 1);
        delete hash[asset.name];
    }

    this._notLoaded.length = 0;

    return this;
};

AssetsPrototype.has = function(name) {
    return !!this._hash[name];
};

AssetsPrototype.get = function(name) {
    return this._hash[name];
};

AssetsPrototype.add = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Assets_add(this, arguments[i]);
    }

    return this;
};

function Assets_add(_this, asset) {
    var name = asset.name,
        hash = _this._hash,
        notLoaded = _this._notLoaded,
        array = _this._array;

    if (!hash[name]) {
        hash[name] = asset;
        array[array.length] = asset;

        if (!isNullOrUndefined(asset.src)) {
            notLoaded[notLoaded.length] = asset;
        }
    } else {
        throw new Error("Assets add(...assets) Assets already has member named " + name);
    }
}

AssetsPrototype.remove = function() {
    var i = -1,
        il = arguments.length - 1;

    while (i++ < il) {
        Assets_remove(this, arguments[i]);
    }

    return this;
};

function Assets_remove(_this, asset) {
    var name = asset.name,
        hash = _this._hash,
        notLoaded = _this._notLoaded,
        array = _this._array,
        index;

    if (hash[name]) {
        delete hash[name];
        array.splice(indexOf(array, asset), 1);

        if ((index = indexOf(notLoaded, asset))) {
            notLoaded.splice(index, 1);
        }
    } else {
        throw new Error("Assets remove(...assets) Assets do not have a member named " + name);
    }
}

AssetsPrototype.load = function(callback) {
    var _this = this,
        notLoaded = this._notLoaded,
        length = notLoaded.length,
        i, il, called, done;

    if (length === 0) {
        callback();
    } else {
        i = -1;
        il = length - 1;
        called = false;

        done = function done(err) {
            if (called) {
                return;
            }
            if (err || --length === 0) {
                called = true;
                if (callback) {
                    callback(err);
                }
                _this.emit("load");
            }
        };

        while (i++ < il) {
            notLoaded[i].load(done);
        }
        notLoaded.length = 0;
    }

    return this;
};
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/assets@0.0.1/src/JSONAsset.js-=@*/
var request = require(78),
    HttpError = require(22),
    Asset = require(24);


var REQUEST_HEADERS = {
        "Content-Type": "application/json"
    },
    JSONAssetPrototype;


module.exports = JSONAsset;


function JSONAsset() {
    Asset.call(this);
}
Asset.extend(JSONAsset, "assets.JSONAsset");
JSONAssetPrototype = JSONAsset.prototype;

JSONAssetPrototype.loadSrc = function(src, callback) {
    request.get(src, {
        requestHeaders: REQUEST_HEADERS,
        success: function onSuccess(response) {
            callback(undefined, response.data);
        },
        error: function onError(response) {
            var error = new HttpError(response.statusCode, src);
            callback(error);
        }
    });
    return this;
};
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/assets@0.0.1/src/TextAsset.js-=@*/
var request = require(78),
    HttpError = require(22),
    Asset = require(24);


var REQUEST_HEADERS = {
        "Content-Type": "text/plain"
    },
    TextAssetPrototype;


module.exports = TextAsset;


function TextAsset() {
    Asset.call(this);
}
Asset.extend(TextAsset, "assets.TextAsset");
TextAssetPrototype = TextAsset.prototype;

TextAssetPrototype.loadSrc = function(src, callback) {
    request.get(src, {
        requestHeaders: REQUEST_HEADERS,
        success: function onSuccess(response) {
            callback(undefined, response.data);
        },
        error: function onError(response) {
            var error = new HttpError(response.statusCode, src);
            callback(error);
        }
    });
    return this;
};
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/class@0.0.1/src/index.js-=@*/
var has = require(33),
    isNull = require(12),
    isFunction = require(10),
    apply = require(34),
    inherits = require(35),
    EventEmitter = require(36),
    createPool = require(37),
    uuid = require(38);


var GLOBAL_CLASSES = global.__GLOBAL_CLASSES__ || (global.__GLOBAL_CLASSES__ = {}),
    ClassPrototype;


module.exports = Class;


function Class() {

    EventEmitter.call(this, -1);

    this._id = null;
}
EventEmitter.extend(Class);
createPool(Class);
ClassPrototype = Class.prototype;

Class.extend = function(Child, className) {
    if (has(Class.__classes, className)) {
        throw new Error("extend(Child, className) class named " + className + " already defined");
    } else {
        Class.__classes[className] = Child;

        inherits(Child, this);
        createPool(Child);
        Child.className = Child.prototype.className = className;

        if (isFunction(this.onExtend)) {
            apply(this.onExtend, arguments, this);
        }

        return Child;
    }
};

Class.inherit = Class.extend;

Class.__classes = GLOBAL_CLASSES;

Class.hasClass = function(className) {
    return has(Class.__classes, className);
};

Class.getClass = function(className) {
    if (Class.hasClass(className)) {
        return Class.__classes[className];
    } else {
        throw new Error("getClass(className) class named " + className + " is not defined");
    }
};

Class.newClass = function(className) {
    return new(Class.getClass(className))();
};

Class.fromJSON = function(json) {
    return (Class.newClass(json.className)).fromJSON(json);
};

Class.className = ClassPrototype.className = "Class";

Class.create = function() {
    var instance = new this();
    return apply(instance.construct, arguments, instance);
};

ClassPrototype.construct = function() {

    this._id = uuid.v4();

    return this;
};

ClassPrototype.destructor = function() {

    this._id = null;

    return this;
};

ClassPrototype.generateNewId = function() {

    this._id = uuid.v4();

    return this;
};

ClassPrototype.getId = function() {
    return this._id;
};

ClassPrototype.toJSON = function(json) {
    json = json || {};

    json._id = this._id;
    json.className = this.className;

    return json;
};

ClassPrototype.fromJSON = function( /* json */ ) {

    if (isNull(this._id)) {
        this.generateNewId();
    }

    return this;
};
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/keys@0.0.2/src/index.js-=@*/
var has = require(33),
    isNative = require(39),
    isNullOrUndefined = require(15),
    isObject = require(9);


var nativeKeys = Object.keys;


module.exports = keys;


function keys(value) {
    if (isNullOrUndefined(value)) {
        return [];
    } else {
        return nativeKeys(isObject(value) ? value : Object(value));
    }
}

if (!isNative(nativeKeys)) {
    nativeKeys = function keys(value) {
        var localHas = has,
            out = [],
            i = 0,
            key;

        for (key in value) {
            if (localHas(value, key)) {
                out[i++] = key;
            }
        }

        return out;
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_array@0.0.1/src/index.js-=@*/
var isNative = require(39),
    isLength = require(72),
    isObject = require(9);


var objectToString = Object.prototype.toString,
    nativeIsArray = Array.isArray,
    isArray;


if (isNative(nativeIsArray)) {
    isArray = nativeIsArray;
} else {
    isArray = function isArray(value) {
        return (
            isObject(value) &&
            isLength(value.length) &&
            objectToString.call(value) === "[object Array]"
        ) || false;
    };
}


module.exports = isArray;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/array-for_each@0.0.1/src/index.js-=@*/
module.exports = arrayForEach;


function arrayForEach(array, callback) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        if (callback(array[i], i, array) === false) {
            break;
        }
    }

    return array;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/object-for_each@0.0.2/src/index.js-=@*/
var keys = require(29);


module.exports = objectForEach;


function objectForEach(object, callback) {
    var objectKeys = keys(object),
        i = -1,
        il = objectKeys.length - 1,
        key;

    while (i++ < il) {
        key = objectKeys[i];

        if (callback(object[key], key, object) === false) {
            break;
        }
    }

    return object;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/has@0.0.2/src/index.js-=@*/
var isNative = require(39),
    getPrototypeOf = require(40),
    isNullOrUndefined = require(15);


var nativeHasOwnProp = Object.prototype.hasOwnProperty,
    baseHas;


module.exports = has;


function has(object, key) {
    if (isNullOrUndefined(object)) {
        return false;
    } else {
        return baseHas(object, key);
    }
}

if (isNative(nativeHasOwnProp)) {
    baseHas = function baseHas(object, key) {
        if (object.hasOwnProperty) {
            return object.hasOwnProperty(key);
        } else {
            return nativeHasOwnProp.call(object, key);
        }
    };
} else {
    baseHas = function baseHas(object, key) {
        var proto = getPrototypeOf(object);

        if (isNullOrUndefined(proto)) {
            return key in object;
        } else {
            return (key in object) && (!(key in proto) || proto[key] !== object[key]);
        }
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/apply@0.0.1/src/index.js-=@*/
var isNullOrUndefined = require(15);


module.exports = apply;


function apply(fn, args, thisArg) {
    if (isNullOrUndefined(thisArg)) {
        return applyNoThisArg(fn, args);
    } else {
        return applyThisArg(fn, args, thisArg);
    }
}

function applyNoThisArg(fn, args) {
    switch (args.length) {
        case 0:
            return fn();
        case 1:
            return fn(args[0]);
        case 2:
            return fn(args[0], args[1]);
        case 3:
            return fn(args[0], args[1], args[2]);
        case 4:
            return fn(args[0], args[1], args[2], args[3]);
        case 5:
            return fn(args[0], args[1], args[2], args[3], args[4]);
        default:
            return fn.apply(null, args);
    }
}

function applyThisArg(fn, args, thisArg) {
    switch (args.length) {
        case 0:
            return fn.call(thisArg);
        case 1:
            return fn.call(thisArg, args[0]);
        case 2:
            return fn.call(thisArg, args[0], args[1]);
        case 3:
            return fn.call(thisArg, args[0], args[1], args[2]);
        case 4:
            return fn.call(thisArg, args[0], args[1], args[2], args[3]);
        case 5:
            return fn.call(thisArg, args[0], args[1], args[2], args[3], args[4]);
        default:
            return fn.apply(thisArg, args);
    }
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/inherits@0.0.3/src/index.js-=@*/
var create = require(43),
    extend = require(44),
    mixin = require(45),
    defineProperty = require(46);


var descriptor = {
    configurable: true,
    enumerable: false,
    writable: true,
    value: null
};


module.exports = inherits;


function inherits(child, parent) {

    mixin(child, parent);

    if (child.__super) {
        child.prototype = extend(create(parent.prototype), child.__super, child.prototype);
    } else {
        child.prototype = extend(create(parent.prototype), child.prototype);
    }

    defineNonEnumerableProperty(child, "__super", parent.prototype);
    defineNonEnumerableProperty(child.prototype, "constructor", child);

    child.defineStatic = defineStatic;
    child.super_ = parent;

    return child;
}
inherits.defineProperty = defineNonEnumerableProperty;

function defineNonEnumerableProperty(object, name, value) {
    descriptor.value = value;
    defineProperty(object, name, descriptor);
    descriptor.value = null;
}

function defineStatic(name, value) {
    defineNonEnumerableProperty(this, name, value);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/event_emitter@0.0.3/src/index.js-=@*/
var isFunction = require(10),
    inherits = require(35),
    fastSlice = require(50),
    keys = require(29),
    isNumber = require(16),
    isNullOrUndefined = require(15);


var EventEmitterPrototype;


module.exports = EventEmitter;


function EventEmitter(maxListeners) {
    this.__events = {};
    this.__maxListeners = isNumber(maxListeners) ? +maxListeners : EventEmitter.defaultMaxListeners;
}
EventEmitterPrototype = EventEmitter.prototype;

EventEmitterPrototype.on = function(name, listener) {
    var events, eventList, maxListeners;

    if (!isFunction(listener)) {
        throw new TypeError("EventEmitter.on(name, listener) listener must be a function");
    }

    events = this.__events || (this.__events = {});
    eventList = (events[name] || (events[name] = []));
    maxListeners = this.__maxListeners || -1;

    eventList[eventList.length] = listener;

    if (maxListeners !== -1 && eventList.length > maxListeners) {
        console.error(
            "EventEmitter.on(type, listener) possible EventEmitter memory leak detected. " + maxListeners + " listeners added"
        );
    }

    return this;
};

EventEmitterPrototype.addEventListener = EventEmitterPrototype.addListener = EventEmitterPrototype.on;

EventEmitterPrototype.once = function(name, listener) {
    var _this = this;

    function once() {

        _this.off(name, once);

        switch (arguments.length) {
            case 0:
                return listener();
            case 1:
                return listener(arguments[0]);
            case 2:
                return listener(arguments[0], arguments[1]);
            case 3:
                return listener(arguments[0], arguments[1], arguments[2]);
            case 4:
                return listener(arguments[0], arguments[1], arguments[2], arguments[3]);
            default:
                return listener.apply(null, arguments);
        }
    }

    this.on(name, once);

    return once;
};

EventEmitterPrototype.listenTo = function(value, name) {
    var _this = this;

    if (!value || !(isFunction(value.on) || isFunction(value.addListener))) {
        throw new TypeError("EventEmitter.listenTo(value, name) value must have a on function taking (name, listener[, ctx])");
    }

    function handler() {
        _this.emitArgs(name, arguments);
    }

    value.on(name, handler);

    return handler;
};

EventEmitterPrototype.off = function(name, listener) {
    var events = this.__events || (this.__events = {}),
        eventList, event, i;

    eventList = events[name];
    if (!eventList) {
        return this;
    }

    if (!listener) {
        i = eventList.length;

        while (i--) {
            this.emit("removeListener", name, eventList[i]);
        }
        eventList.length = 0;
        delete events[name];
    } else {
        i = eventList.length;

        while (i--) {
            event = eventList[i];

            if (event === listener) {
                this.emit("removeListener", name, event);
                eventList.splice(i, 1);
            }
        }

        if (eventList.length === 0) {
            delete events[name];
        }
    }

    return this;
};

EventEmitterPrototype.removeEventListener = EventEmitterPrototype.removeListener = EventEmitterPrototype.off;

EventEmitterPrototype.removeAllListeners = function() {
    var events = this.__events || (this.__events = {}),
        objectKeys = keys(events),
        i = -1,
        il = objectKeys.length - 1,
        key, eventList, j;

    while (i++ < il) {
        key = objectKeys[i];
        eventList = events[key];

        if (eventList) {
            j = eventList.length;

            while (j--) {
                this.emit("removeListener", key, eventList[j]);
                eventList.splice(j, 1);
            }
        }

        delete events[key];
    }

    return this;
};

EventEmitterPrototype.dispatchEvent = function(event) {
    return this.emitArg(event.type, event);
};

EventEmitterPrototype.attachEvent = function(type, listener) {
    return this.on(type.slice(2), listener);
};

EventEmitterPrototype.detachEvent = function(type, listener) {
    return this.off(type.slice(2), listener);
};

EventEmitterPrototype.fireEvent = function(type, event) {
    return this.emitArg(type.slice(2), event);
};

function emit0(eventList) {
    var i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event();
        }
    }
}

function emit1(eventList, a0) {
    var i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0);
        }
    }
}

function emit2(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1);
        }
    }
}

function emit3(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        a2 = args[2],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1, a2);
        }
    }
}

function emit4(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        a2 = args[2],
        a3 = args[3],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1, a2, a3);
        }
    }
}

function emit5(eventList, args) {
    var a0 = args[0],
        a1 = args[1],
        a2 = args[2],
        a3 = args[3],
        a4 = args[4],
        i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event(a0, a1, a2, a3, a4);
        }
    }
}

function emitApply(eventList, args) {
    var i = -1,
        il = eventList.length - 1,
        event;

    while (i++ < il) {
        if ((event = eventList[i])) {
            event.apply(null, args);
        }
    }
}

function emit(eventList, args) {
    switch (args.length) {
        case 0:
            emit0(eventList);
            break;
        case 1:
            emit1(eventList, args[0]);
            break;
        case 2:
            emit2(eventList, args);
            break;
        case 3:
            emit3(eventList, args);
            break;
        case 4:
            emit4(eventList, args);
            break;
        case 5:
            emit5(eventList, args);
            break;
        default:
            emitApply(eventList, args);
            break;
    }
}

EventEmitterPrototype.emitArg = function(name, arg) {
    var eventList = (this.__events || (this.__events = {}))[name];

    if (!eventList || !eventList.length) {
        return this;
    } else {
        emit1(eventList, arg);
        return this;
    }
};

EventEmitterPrototype.emitArgs = function(name, args) {
    var eventList = (this.__events || (this.__events = {}))[name];

    if (!eventList || !eventList.length) {
        return this;
    } else {
        emit(eventList, args);
        return this;
    }
};

EventEmitterPrototype.emit = function(name) {
    return this.emitArgs(name, fastSlice(arguments, 1));
};

function createFunctionCaller(args) {
    var a0, a1, a2, a3, a4;
    switch (args.length) {
        case 0:
            return function functionCaller(fn) {
                return fn();
            };
        case 1:
            a0 = args[0];
            return function functionCaller(fn) {
                return fn(a0);
            };
        case 2:
            a0 = args[0];
            a1 = args[1];
            return function functionCaller(fn) {
                return fn(a0, a1);
            };
        case 3:
            a0 = args[0];
            a1 = args[1];
            a2 = args[2];
            return function functionCaller(fn) {
                return fn(a0, a1, a2);
            };
        case 4:
            a0 = args[0];
            a1 = args[1];
            a2 = args[2];
            a3 = args[3];
            return function functionCaller(fn) {
                return fn(a0, a1, a2, a3);
            };
        case 5:
            a0 = args[0];
            a1 = args[1];
            a2 = args[2];
            a3 = args[3];
            a4 = args[4];
            return function functionCaller(fn) {
                return fn(a0, a1, a2, a3, a4);
            };
        default:
            return function functionCaller(fn) {
                return fn.apply(null, args);
            };
    }
}

function emitAsync(eventList, args, callback) {
    var length = eventList.length,
        index = 0,
        called = false,
        functionCaller;

    function next(error) {
        if (called !== true) {
            if (error || index === length) {
                called = true;
                callback(error);
            } else {
                functionCaller(eventList[index++]);
            }
        }
    }

    args[args.length] = next;
    functionCaller = createFunctionCaller(args);
    next();
}

EventEmitterPrototype.emitAsync = function(name, args, callback) {
    var eventList = (this.__events || (this.__events = {}))[name];

    args = fastSlice(arguments, 1);
    callback = args.pop();

    if (!isFunction(callback)) {
        throw new TypeError("EventEmitter.emitAsync(name [, ...args], callback) callback must be a function");
    } else {
        if (!eventList || !eventList.length) {
            callback();
        } else {
            emitAsync(eventList, args, callback);
        }
        return this;
    }
};

EventEmitterPrototype.listeners = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];
    return eventList ? eventList.slice() : [];
};

EventEmitterPrototype.listenerCount = function(name) {
    var eventList = (this.__events || (this.__events = {}))[name];
    return eventList ? eventList.length : 0;
};

EventEmitterPrototype.setMaxListeners = function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    this.__maxListeners = value < 0 ? -1 : value;
    return this;
};

inherits.defineProperty(EventEmitter, "defaultMaxListeners", 10);

inherits.defineProperty(EventEmitter, "listeners", function(value, name) {
    var eventList;

    if (isNullOrUndefined(value)) {
        throw new TypeError("EventEmitter.listeners(value, name) value required");
    }
    eventList = value.__events && value.__events[name];

    return eventList ? eventList.slice() : [];
});

inherits.defineProperty(EventEmitter, "listenerCount", function(value, name) {
    var eventList;

    if (isNullOrUndefined(value)) {
        throw new TypeError("EventEmitter.listenerCount(value, name) value required");
    }
    eventList = value.__events && value.__events[name];

    return eventList ? eventList.length : 0;
});

inherits.defineProperty(EventEmitter, "setMaxListeners", function(value) {
    if ((value = +value) !== value) {
        throw new TypeError("EventEmitter.setMaxListeners(value) value must be a number");
    }

    EventEmitter.defaultMaxListeners = value < 0 ? -1 : value;
    return value;
});

EventEmitter.extend = function(child) {
    inherits(child, this);
    return child;
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/create_pool@0.0.3/src/index.js-=@*/
var isFunction = require(10),
    isNumber = require(16),
    defineProperty = require(52);


var descriptor = {
    configurable: false,
    enumerable: false,
    writable: false,
    value: null
};


module.exports = createPool;


function createPool(Constructor, poolSize) {

    addProperty(Constructor, "instancePool", []);
    addProperty(Constructor, "getPooled", createPooler(Constructor));
    addProperty(Constructor, "release", createReleaser(Constructor));

    poolSize = poolSize || Constructor.poolSize;
    Constructor.poolSize = isNumber(poolSize) ? (poolSize < -1 ? -1 : poolSize) : -1;

    return Constructor;
}

function addProperty(object, name, value) {
    descriptor.value = value;
    defineProperty(object, name, descriptor);
    descriptor.value = null;
}

function createPooler(Constructor) {
    switch (Constructor.length) {
        case 0:
            return createNoArgumentPooler(Constructor);
        case 1:
            return createOneArgumentPooler(Constructor);
        case 2:
            return createTwoArgumentsPooler(Constructor);
        case 3:
            return createThreeArgumentsPooler(Constructor);
        case 4:
            return createFourArgumentsPooler(Constructor);
        case 5:
            return createFiveArgumentsPooler(Constructor);
        default:
            return createApplyPooler(Constructor);
    }
}

function createNoArgumentPooler(Constructor) {
    return function pooler() {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            return instance;
        } else {
            return new Constructor();
        }
    };
}

function createOneArgumentPooler(Constructor) {
    return function pooler(a0) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0);
            return instance;
        } else {
            return new Constructor(a0);
        }
    };
}

function createTwoArgumentsPooler(Constructor) {
    return function pooler(a0, a1) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1);
            return instance;
        } else {
            return new Constructor(a0, a1);
        }
    };
}

function createThreeArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2);
            return instance;
        } else {
            return new Constructor(a0, a1, a2);
        }
    };
}

function createFourArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2, a3) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2, a3);
            return instance;
        } else {
            return new Constructor(a0, a1, a2, a3);
        }
    };
}

function createFiveArgumentsPooler(Constructor) {
    return function pooler(a0, a1, a2, a3, a4) {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.call(instance, a0, a1, a2, a3, a4);
            return instance;
        } else {
            return new Constructor(a0, a1, a2, a3, a4);
        }
    };
}

function createApplyConstructor(Constructor) {
    function F(args) {
        return Constructor.apply(this, args);
    }
    F.prototype = Constructor.prototype;

    return function applyConstructor(args) {
        return new F(args);
    };
}

function createApplyPooler(Constructor) {
    var applyConstructor = createApplyConstructor(Constructor);

    return function pooler() {
        var instancePool = Constructor.instancePool,
            instance;

        if (instancePool.length) {
            instance = instancePool.pop();
            Constructor.apply(instance, arguments);
            return instance;
        } else {
            return applyConstructor(arguments);
        }
    };
}

function createReleaser(Constructor) {
    return function releaser(instance) {
        var instancePool = Constructor.instancePool;

        if (isFunction(instance.destructor)) {
            instance.destructor();
        }
        if (Constructor.poolSize === -1 || instancePool.length < Constructor.poolSize) {
            instancePool[instancePool.length] = instance;
        }
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/index.js-=@*/
var v1 = require(53),
    v3 = require(54),
    v4 = require(55),
    v5 = require(56);


var V1 = 1,
    V2 = 2,
    V3 = 3,
    V4 = 4,
    V5 = 5;


module.exports = uuid;


uuid.V1 = V1;
uuid.V2 = V2;
uuid.V3 = V3;
uuid.V4 = V4;
uuid.V5 = V5;


function uuid(type, options, buffer, offset) {
    var domain;

    switch (type) {
        case V3:
            domain = options;
            options = buffer;
            return v3(domain, options);
        case V4:
            return v4(options, buffer, offset);
        case V5:
            domain = options;
            options = buffer;
            return v5(domain, options);
        default:
            return v1(options, buffer, offset);
    }
}


uuid.v1 = v1;
uuid.v2 = v1;
uuid.v3 = v3;
uuid.v4 = v4;
uuid.v5 = v5;

uuid.toString = require(57);
uuid.parse = require(58);

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_native@0.0.2/src/index.js-=@*/
var isFunction = require(10),
    isNullOrUndefined = require(15),
    escapeRegExp = require(41);


var reHostCtor = /^\[object .+?Constructor\]$/,

    functionToString = Function.prototype.toString,

    reNative = RegExp("^" +
        escapeRegExp(Object.prototype.toString)
        .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ),

    isHostObject;


module.exports = isNative;


function isNative(value) {
    return !isNullOrUndefined(value) && (
        isFunction(value) ?
        reNative.test(functionToString.call(value)) : (
            typeof(value) === "object" && (
                (isHostObject(value) ? reNative : reHostCtor).test(value) || false
            )
        )
    ) || false;
}

try {
    String({
        "toString": 0
    } + "");
} catch (e) {
    isHostObject = function isHostObject() {
        return false;
    };
}

isHostObject = function isHostObject(value) {
    return !isFunction(value.toString) && typeof(value + "") === "string";
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/get_prototype_of@0.0.1/src/index.js-=@*/
var isObject = require(9),
    isNative = require(39),
    isNullOrUndefined = require(15);


var nativeGetPrototypeOf = Object.getPrototypeOf,
    baseGetPrototypeOf;


module.exports = getPrototypeOf;


function getPrototypeOf(value) {
    if (isNullOrUndefined(value)) {
        return null;
    } else {
        return baseGetPrototypeOf(value);
    }
}

if (isNative(nativeGetPrototypeOf)) {
    baseGetPrototypeOf = function baseGetPrototypeOf(value) {
        return nativeGetPrototypeOf(isObject(value) ? value : Object(value)) || null;
    };
} else {
    if ("".__proto__ === String.prototype) {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.__proto__ || null;
        };
    } else {
        baseGetPrototypeOf = function baseGetPrototypeOf(value) {
            return value.constructor ? value.constructor.prototype : null;
        };
    }
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/escape_regexp@0.0.1/src/index.js-=@*/
var toString = require(42);


var reRegExpChars = /[.*+?\^${}()|\[\]\/\\]/g,
    reHasRegExpChars = new RegExp(reRegExpChars.source);


module.exports = escapeRegExp;


function escapeRegExp(string) {
    string = toString(string);
    return (
        (string && reHasRegExpChars.test(string)) ?
        string.replace(reRegExpChars, "\\$&") :
        string
    );
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/to_string@0.0.1/src/index.js-=@*/
var isString = require(14),
    isNullOrUndefined = require(15);


module.exports = toString;


function toString(value) {
    if (isString(value)) {
        return value;
    } else if (isNullOrUndefined(value)) {
        return "";
    } else {
        return value + "";
    }
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/create@0.0.2/src/index.js-=@*/
var isNull = require(12),
    isNative = require(39),
    isPrimitive = require(47);


var nativeCreate = Object.create;


module.exports = create;


function create(object) {
    return nativeCreate(isPrimitive(object) ? null : object);
}

if (!isNative(nativeCreate)) {
    nativeCreate = function nativeCreate(object) {
        var newObject;

        function F() {
            this.constructor = F;
        }

        if (isNull(object)) {
            F.prototype = null;
            newObject = new F();
            newObject.constructor = newObject.__proto__ = null;
            delete newObject.__proto__;
            return newObject;
        } else {
            F.prototype = object;
            return new F();
        }
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/extend@0.0.2/src/index.js-=@*/
var keys = require(48),
    isNative = require(39);


var nativeAssign = Object.assign,
    extend, baseExtend;


if (isNative(nativeAssign)) {
    extend = nativeAssign;
} else {
    extend = function extend(out) {
        var i = 0,
            il = arguments.length - 1;

        while (i++ < il) {
            baseExtend(out, arguments[i]);
        }

        return out;
    };
    baseExtend = function baseExtend(a, b) {
        var objectKeys = keys(b),
            i = -1,
            il = objectKeys.length - 1,
            key;

        while (i++ < il) {
            key = objectKeys[i];
            a[key] = b[key];
        }
    };
}


module.exports = extend;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/mixin@0.0.2/src/index.js-=@*/
var keys = require(29),
    isNullOrUndefined = require(15);


module.exports = mixin;


function mixin(out) {
    var i = 0,
        il = arguments.length - 1;

    while (i++ < il) {
        baseMixin(out, arguments[i]);
    }

    return out;
}

function baseMixin(a, b) {
    var objectKeys = keys(b),
        i = -1,
        il = objectKeys.length - 1,
        key, value;

    while (i++ < il) {
        key = objectKeys[i];

        if (isNullOrUndefined(a[key]) && !isNullOrUndefined((value = b[key]))) {
            a[key] = value;
        }
    }
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/define_property@0.0.2/src/index.js-=@*/
var isObject = require(9),
    isFunction = require(10),
    isPrimitive = require(47),
    isNative = require(39),
    has = require(49);


var nativeDefineProperty = Object.defineProperty;


module.exports = defineProperty;


function defineProperty(object, name, descriptor) {
    if (isPrimitive(descriptor) || isFunction(descriptor)) {
        descriptor = {
            value: descriptor
        };
    }
    return nativeDefineProperty(object, name, descriptor);
}

defineProperty.hasGettersSetters = true;

if (!isNative(nativeDefineProperty) || !(function() {
        var object = {},
            value = {};

        try {
            nativeDefineProperty(object, "key", {
                value: value
            });
            if (has(object, "key") && object.key === value) {
                return true;
            } else {
                return false;
            }
        } catch (e) {}

        return false;
    }())) {

    defineProperty.hasGettersSetters = false;

    nativeDefineProperty = function defineProperty(object, name, descriptor) {
        if (!isObject(object)) {
            throw new TypeError("defineProperty(object, name, descriptor) called on non-object");
        }
        if (has(descriptor, "get") || has(descriptor, "set")) {
            throw new TypeError("defineProperty(object, name, descriptor) this environment does not support getters or setters");
        }
        object[name] = descriptor.value;
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_primitive@0.0.2/src/index.js-=@*/
var isNullOrUndefined = require(15);


module.exports = isPrimitive;


function isPrimitive(obj) {
    var typeStr;
    return isNullOrUndefined(obj) || ((typeStr = typeof(obj)) !== "object" && typeStr !== "function") || false;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/keys@0.0.1/src/index.js-=@*/
var has = require(49),
    isNative = require(39),
    isNullOrUndefined = require(15),
    isObject = require(9);


var nativeKeys = Object.keys;


module.exports = keys;


function keys(value) {
    if (isNullOrUndefined(value)) {
        return [];
    } else {
        return nativeKeys(isObject(value) ? value : Object(value));
    }
}

if (!isNative(nativeKeys)) {
    nativeKeys = function keys(value) {
        var localHas = has,
            out = [],
            i = 0,
            key;

        for (key in value) {
            if (localHas(value, key)) {
                out[i++] = key;
            }
        }

        return out;
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/has@0.0.1/src/index.js-=@*/
var isNative = require(39),
    getPrototypeOf = require(40),
    isNullOrUndefined = require(15);


var nativeHasOwnProp = Object.prototype.hasOwnProperty,
    baseHas;


module.exports = has;


function has(object, key) {
    if (isNullOrUndefined(object)) {
        return false;
    } else {
        return baseHas(object, key);
    }
}

if (isNative(nativeHasOwnProp)) {
    baseHas = function baseHas(object, key) {
        if (object.hasOwnProperty) {
            return object.hasOwnProperty(key);
        } else {
            return nativeHasOwnProp.call(object, key);
        }
    };
} else {
    baseHas = function baseHas(object, key) {
        var proto = getPrototypeOf(object);

        if (isNullOrUndefined(proto)) {
            return key in object;
        } else {
            return (key in object) && (!(key in proto) || proto[key] !== object[key]);
        }
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/fast_slice@0.0.1/src/index.js-=@*/
var clamp = require(51),
    isNumber = require(16);


module.exports = fastSlice;


function fastSlice(array, offset) {
    var length = array.length,
        newLength, i, il, result, j;

    offset = clamp(isNumber(offset) ? offset : 0, 0, length);
    i = offset - 1;
    il = length - 1;
    newLength = length - offset;
    result = new Array(newLength);
    j = 0;

    while (i++ < il) {
        result[j++] = array[i];
    }

    return result;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/clamp@0.0.1/src/index.js-=@*/
module.exports = clamp;


function clamp(x, min, max) {
    if (x < min) {
        return min;
    } else if (x > max) {
        return max;
    } else {
        return x;
    }
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/define_property@0.0.3/src/index.js-=@*/
var isObject = require(9),
    isFunction = require(10),
    isPrimitive = require(47),
    isNative = require(39),
    has = require(33);


var nativeDefineProperty = Object.defineProperty;


module.exports = defineProperty;


function defineProperty(object, name, descriptor) {
    if (isPrimitive(descriptor) || isFunction(descriptor)) {
        descriptor = {
            value: descriptor
        };
    }
    return nativeDefineProperty(object, name, descriptor);
}

defineProperty.hasGettersSetters = true;

if (!isNative(nativeDefineProperty) || !(function() {
        var object = {},
            value = {};

        try {
            nativeDefineProperty(object, "key", {
                value: value
            });
            if (has(object, "key") && object.key === value) {
                return true;
            } else {
                return false;
            }
        } catch (e) {}

        return false;
    }())) {

    defineProperty.hasGettersSetters = false;

    nativeDefineProperty = function defineProperty(object, name, descriptor) {
        if (!isObject(object)) {
            throw new TypeError("defineProperty(object, name, descriptor) called on non-object");
        }
        if (has(descriptor, "get") || has(descriptor, "set")) {
            throw new TypeError("defineProperty(object, name, descriptor) this environment does not support getters or setters");
        }
        object[name] = descriptor.value;
    };
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/v1.js-=@*/
var now = require(59),
    isNullOrUndefinded = require(15),
    NativeUint8Array = require(60),
    nodeId = require(61),
    emptyObject = require(62),
    seedBytes = require(63),
    toString = require(57);


var CLOCKSEQ = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff,
    LAST_MSECS = 0,
    LAST_NSECS = 0;


module.exports = v1;


function v1(options, buffer, offset) {
    var b = buffer || new NativeUint8Array(16),
        clockseq, msecs, nsecs, dt, tl, tmh, node, n;

    i = buffer && offset || 0;
    options = options || emptyObject;

    clockseq = isNullOrUndefinded(options.clockseq) ? CLOCKSEQ : options.clockseq;
    msecs = isNullOrUndefinded(options.msecs) ? now.stamp() : options.msecs;
    nsecs = isNullOrUndefinded(options.nsecs) ? LAST_NSECS + 1 : options.nsecs;
    dt = (msecs - LAST_MSECS) + (nsecs - LAST_NSECS) / 10000;

    if (dt < 0 && isNullOrUndefinded(options.clockseq)) {
        clockseq = clockseq + 1 & 0x3fff;
    }
    if ((dt < 0 || msecs > LAST_MSECS) && isNullOrUndefinded(options.nsecs)) {
        nsecs = 0;
    }
    if (nsecs >= 10000) {
        throw new Error("v1([options [, buffer [, offset]]]): Can't create more than 10M uuids/sec");
    }

    LAST_MSECS = msecs;
    LAST_NSECS = nsecs;
    CLOCKSEQ = clockseq;

    // Convert from unix epoch to gregorian epoch
    msecs += 12219292800000;

    tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    b[i++] = clockseq >>> 8 | 0x80;
    b[i++] = clockseq & 0xff;

    node = options.node || nodeId;
    n = -1;
    while (n++ < 5) {
        b[i + n] = node[n];
    }

    return buffer ? buffer : toString(b);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/v3.js-=@*/
var md5 = require(66),
    toString = require(57);


var md5Options = {
    asBytes: true
};


module.exports = v3;


function v3(domain /*, options */ ) {
    return toString(md5(domain, md5Options));
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/v4.js-=@*/
var Buffer = require(4).Buffer;
var isString = require(14),
    getRandomBytes = require(64),
    toString = require(57),
    emptyObject = require(62);


module.exports = v4;


function v4(options, buffer, offset) {
    var random, i;

    offset = buffer && offset || 0;

    if (isString(options)) {
        buffer = (options === "binary") ? new Buffer(16) : null;
        options = null;
    }
    options = options || emptyObject;

    random = options.random || (options.getRandomBytes || getRandomBytes)(16);
    random[6] = (random[6] & 0x0f) | 0x40;
    random[8] = (random[8] & 0x3f) | 0x80;

    if (buffer) {
        i = -1;
        while (i++ < 15) {
            buffer[offset + i] = random[i];
        }
    }

    return buffer || toString(random);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/v5.js-=@*/
var sha1 = require(73),
    toString = require(57);


var sha1Options = {
    asBytes: true
};


module.exports = v5;


function v5(domain /*, options */ ) {
    return toString(sha1(domain, sha1Options));
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/toString.js-=@*/
var byteToHex = require(65);


module.exports = toString;


function toString(buffer, offset) {
    var i = offset || 0,
        localByteToHex = byteToHex;

    return (
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]] +
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]] + '-' +
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]] + '-' +
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]] + '-' +
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]] + '-' +
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]] +
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]] +
        localByteToHex[buffer[i++]] + localByteToHex[buffer[i++]]
    );
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/parse.js-=@*/
var hexToByte = require(75);


var reByte = /[0-9a-f]{2}/g;


module.exports = parse;


function parse(string, buffer, offset) {
    var i;

    offset = buffer ? (offset || 0) : 0;
    i = offset;

    buffer = buffer || [];
    string.toLowerCase().replace(reByte, function(oct) {
        if (i < 16) {
            buffer[offset + i++] = hexToByte[oct];
        }
    });

    while (i < 16) {
        buffer[offset + i++] = 0;
    }

    return buffer;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/now@0.0.3/src/browser.js-=@*/
var Date_now = Date.now || function Date_now() {
        return (new Date()).getTime();
    },
    START_TIME = Date_now(),
    performance = global.performance || {};


function now() {
    return performance.now();
}

performance.now = (
    performance.now ||
    performance.webkitNow ||
    performance.mozNow ||
    performance.msNow ||
    performance.oNow ||
    function now() {
        return Date_now() - START_TIME;
    }
);

now.getStartTime = function getStartTime() {
    return START_TIME;
};

now.stamp = function stamp() {
    return START_TIME + now();
};

now.hrtime = function hrtime(previousTimestamp) {
    var clocktime = now() * 1e-3,
        seconds = Math.floor(clocktime),
        nanoseconds = Math.floor((clocktime % 1) * 1e9);

    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];

        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1e9;
        }
    }

    return [seconds, nanoseconds];
};


START_TIME -= now();


module.exports = now;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/NativeUint8Array.js-=@*/
module.exports = typeof(Uint8Array) !== "undefined" ? Uint8Array : Array;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/nodeId.js-=@*/
var seedBytes = require(63);


module.exports = [
    seedBytes[0] | 0x01,
    seedBytes[1],
    seedBytes[2],
    seedBytes[3],
    seedBytes[4],
    seedBytes[5]
];

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/emptyObject.js-=@*/


},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/seedBytes.js-=@*/
var getRandomBytes = require(64);


module.exports = getRandomBytes(16);

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/get_random_bytes@0.0.3/src/browser.js-=@*/
var isFunction = require(10);


var globalCrypto = global.crypto || global.msCrypto,
    NativeUint8Array = typeof(Uint8Array) !== "undefined" ? Uint8Array : Array,
    getRandomBytes;


if (globalCrypto && isFunction(globalCrypto.getRandomValues)) {
    getRandomBytes = function getRandomBytes(size) {
        return globalCrypto.getRandomValues(new NativeUint8Array(size));
    };
} else {
    getRandomBytes = function getRandomBytes(size) {
        var bytes = new NativeUint8Array(size),
            i = -1,
            il = size - 1,
            r;

        while (i++ < il) {
            if ((i & 0x03) === 0) {
                r = Math.random() * 0x100000000;
            }
            bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return bytes;
    };
}


module.exports = getRandomBytes;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/byteToHex.js-=@*/
module.exports = [];

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/md5@0.0.1/src/index.js-=@*/
var Buffer = require(4).Buffer;
var isArray = require(30),
    fastSlice = require(50),
    crypto = require(67),
    hex = require(68),
    utf8 = require(69),
    bin = require(70),
    words = require(71);


module.exports = md5Wrap;


function md5Wrap(message, options) {
    var digestbytes;

    if (message == null) {
        throw new TypeError("");
    } else {
        digestbytes = words.wordsToBytes(md5(message, options));
        return options && options.asBytes ? digestbytes : (
            options && options.asString ? bin.bytesToString(digestbytes) : hex.bytesToString(digestbytes)
        );
    }
}

function FF(a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
}

function GG(a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
}

function HH(a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
}

function II(a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
}

function md5(message, options) {
    var m, l, a, b, c, d, i, il, aa, bb, cc, dd;

    if (message.constructor === String) {
        if (options && options.encoding === "binary") {
            message = bin.stringToBytes(message);
        } else {
            message = utf8.stringToBytes(message);
        }
    } else if (Buffer.isBuffer(message)) {
        message = fastSlice(message, 0);
    } else if (!isArray(message)) {
        message = message.toString();
    }

    m = words.bytesToWords(message);
    l = message.length * 8;
    a = 1732584193;
    b = -271733879;
    c = -1732584194;
    d = 271733878;

    i = -1;
    il = m.length - 1;
    while (i++ < il) {
        m[i] = ((m[i] << 8) | (m[i] >>> 24)) & 0x00FF00FF | ((m[i] << 24) | (m[i] >>> 8)) & 0xFF00FF00;
    }

    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    il = m.length;
    for (i = 0; i < il; i += 16) {
        aa = a;
        bb = b;
        cc = c;
        dd = d;

        a = FF(a, b, c, d, m[i + 0], 7, -680876936);
        d = FF(d, a, b, c, m[i + 1], 12, -389564586);
        c = FF(c, d, a, b, m[i + 2], 17, 606105819);
        b = FF(b, c, d, a, m[i + 3], 22, -1044525330);
        a = FF(a, b, c, d, m[i + 4], 7, -176418897);
        d = FF(d, a, b, c, m[i + 5], 12, 1200080426);
        c = FF(c, d, a, b, m[i + 6], 17, -1473231341);
        b = FF(b, c, d, a, m[i + 7], 22, -45705983);
        a = FF(a, b, c, d, m[i + 8], 7, 1770035416);
        d = FF(d, a, b, c, m[i + 9], 12, -1958414417);
        c = FF(c, d, a, b, m[i + 10], 17, -42063);
        b = FF(b, c, d, a, m[i + 11], 22, -1990404162);
        a = FF(a, b, c, d, m[i + 12], 7, 1804603682);
        d = FF(d, a, b, c, m[i + 13], 12, -40341101);
        c = FF(c, d, a, b, m[i + 14], 17, -1502002290);
        b = FF(b, c, d, a, m[i + 15], 22, 1236535329);

        a = GG(a, b, c, d, m[i + 1], 5, -165796510);
        d = GG(d, a, b, c, m[i + 6], 9, -1069501632);
        c = GG(c, d, a, b, m[i + 11], 14, 643717713);
        b = GG(b, c, d, a, m[i + 0], 20, -373897302);
        a = GG(a, b, c, d, m[i + 5], 5, -701558691);
        d = GG(d, a, b, c, m[i + 10], 9, 38016083);
        c = GG(c, d, a, b, m[i + 15], 14, -660478335);
        b = GG(b, c, d, a, m[i + 4], 20, -405537848);
        a = GG(a, b, c, d, m[i + 9], 5, 568446438);
        d = GG(d, a, b, c, m[i + 14], 9, -1019803690);
        c = GG(c, d, a, b, m[i + 3], 14, -187363961);
        b = GG(b, c, d, a, m[i + 8], 20, 1163531501);
        a = GG(a, b, c, d, m[i + 13], 5, -1444681467);
        d = GG(d, a, b, c, m[i + 2], 9, -51403784);
        c = GG(c, d, a, b, m[i + 7], 14, 1735328473);
        b = GG(b, c, d, a, m[i + 12], 20, -1926607734);

        a = HH(a, b, c, d, m[i + 5], 4, -378558);
        d = HH(d, a, b, c, m[i + 8], 11, -2022574463);
        c = HH(c, d, a, b, m[i + 11], 16, 1839030562);
        b = HH(b, c, d, a, m[i + 14], 23, -35309556);
        a = HH(a, b, c, d, m[i + 1], 4, -1530992060);
        d = HH(d, a, b, c, m[i + 4], 11, 1272893353);
        c = HH(c, d, a, b, m[i + 7], 16, -155497632);
        b = HH(b, c, d, a, m[i + 10], 23, -1094730640);
        a = HH(a, b, c, d, m[i + 13], 4, 681279174);
        d = HH(d, a, b, c, m[i + 0], 11, -358537222);
        c = HH(c, d, a, b, m[i + 3], 16, -722521979);
        b = HH(b, c, d, a, m[i + 6], 23, 76029189);
        a = HH(a, b, c, d, m[i + 9], 4, -640364487);
        d = HH(d, a, b, c, m[i + 12], 11, -421815835);
        c = HH(c, d, a, b, m[i + 15], 16, 530742520);
        b = HH(b, c, d, a, m[i + 2], 23, -995338651);

        a = II(a, b, c, d, m[i + 0], 6, -198630844);
        d = II(d, a, b, c, m[i + 7], 10, 1126891415);
        c = II(c, d, a, b, m[i + 14], 15, -1416354905);
        b = II(b, c, d, a, m[i + 5], 21, -57434055);
        a = II(a, b, c, d, m[i + 12], 6, 1700485571);
        d = II(d, a, b, c, m[i + 3], 10, -1894986606);
        c = II(c, d, a, b, m[i + 10], 15, -1051523);
        b = II(b, c, d, a, m[i + 1], 21, -2054922799);
        a = II(a, b, c, d, m[i + 8], 6, 1873313359);
        d = II(d, a, b, c, m[i + 15], 10, -30611744);
        c = II(c, d, a, b, m[i + 6], 15, -1560198380);
        b = II(b, c, d, a, m[i + 13], 21, 1309151649);
        a = II(a, b, c, d, m[i + 4], 6, -145523070);
        d = II(d, a, b, c, m[i + 11], 10, -1120210379);
        c = II(c, d, a, b, m[i + 2], 15, 718787259);
        b = II(b, c, d, a, m[i + 9], 21, -343485551);

        a = (a + aa) >>> 0;
        b = (b + bb) >>> 0;
        c = (c + cc) >>> 0;
        d = (d + dd) >>> 0;
    }

    return crypto.endian([a, b, c, d]);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/crypto_browser@0.0.1/src/index.js-=@*/
var process = require(5);
var isNumber = require(16),
    isFunction = require(10);


var crypto = exports,

    NativeUint8Array = typeof(Uint8Array) !== "undefined" ? Uint8Array : Array,
    globalCrypto = global.crypto || global.msCrypto,
    randomBytes;


crypto.rotl = function(n, b) {
    return (n << b) | (n >>> (32 - b));
};

crypto.rotr = function(n, b) {
    return (n << (32 - b)) | (n >>> b);
};

function endian(n) {
    return crypto.rotl(n, 8) & 0x00FF00FF | crypto.rotl(n, 24) & 0xFF00FF00;
}

function endianArray(array) {
    var i = -1,
        il = array.length - 1;

    while (i++ < il) {
        array[i] = endian(array[i]);
    }

    return array;
}

crypto.endian = function(n) {
    if (isNumber(n)) {
        return endian(n);
    } else {
        return endianArray(n);
    }
};

if (globalCrypto && isFunction(globalCrypto.getRandomValues)) {
    randomBytes = function(size) {
        return crypto.getRandomValues(new NativeUint8Array(size));
    };
} else {
    randomBytes = function(size) {
        var bytes = new NativeUint8Array(size),
            i = size;

        while (i--) {
            bytes[i] = (Math.random() * 256) | 0;
        }

        return bytes;
    };
}

crypto.randomBytes = function(size, callback) {
    if (!isNumber(size)) {
        throw new TypeError("randomBytes(size[, callback]) size must be a number");
    } else {
        if (isFunction(callback)) {
            process.nextTick(function() {
                callback(undefined, randomBytes(size));
            });
            return undefined;
        } else {
            return randomBytes(size);
        }
    }
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/hex_encoding@0.0.1/src/index.js-=@*/
var hex = exports,
    NativeUint8Array = typeof(Uint8Array) !== "undefined" ? Uint8Array : Array;


hex.stringToBytes = function(str) {
    var length = str.length,
        i = 0,
        il = length,
        bytes = new NativeUint8Array(length * 0.5),
        index = 0;

    while (i < il) {
        bytes[index] = parseInt(str.substr(i, 2), 16);
        index += 1;
        i += 2;
    }

    return bytes;
};

hex.bytesToString = function(bytes) {
    var str = "",
        i = -1,
        il = bytes.length - 1;

    while (i++ < il) {
        str += (bytes[i] >>> 4).toString(16);
        str += (bytes[i] & 0xF).toString(16);
    }

    return str;
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/utf8_encoding@0.0.1/src/index.js-=@*/
var bin = require(70);


var utf8 = exports;


utf8.stringToBytes = function(str) {
    return bin.stringToBytes(unescape(encodeURIComponent(str)));
};

utf8.bytesToString = function(bytes) {
    return decodeURIComponent(escape(bin.bytesToString(bytes)));
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/bin_encoding@0.0.1/src/index.js-=@*/
var bin = exports,
    NativeUint8Array = typeof(Uint8Array) !== "undefined" ? Uint8Array : Array;


bin.stringToBytes = function(str) {
    var length = str.length,
        i = -1,
        il = length - 1,
        bytes = new NativeUint8Array(length),
        index = 0;

    while (i++ < il) {
        bytes[index] = str.charCodeAt(i) & 0xFF;
        index += 1;
    }

    return bytes;
};

bin.bytesToString = function(bytes) {
    var str = "",
        i = -1,
        il = bytes.length - 1;

    while (i++ < il) {
        str += String.fromCharCode(bytes[i]);
    }

    return str;
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/words_encoding@0.0.1/src/index.js-=@*/
var words = exports;


words.wordsToBytes = function(words) {
    var bytes = [],
        i = 0,
        il = words.length * 32;

    while (i < il) {
        bytes.push((words[i >>> 5] >>> (24 - i % 32)) & 0xFF);
        i += 8;
    }

    return bytes;
};

words.bytesToWords = function(bytes) {
    var words = [],
        i = -1,
        il = bytes.length - 1,
        b = 0;

    while (i++ < il) {
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
        b += 8;
    }

    return words;
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_length@0.0.1/src/index.js-=@*/
var isNumber = require(16);


var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;


module.exports = isLength;


function isLength(value) {
    return isNumber(value) && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/sha1@0.0.3/src/index.js-=@*/
var isArrayLike = require(74),
    isString = require(14),
    fastSlice = require(50),
    hex = require(68),
    utf8 = require(69),
    bin = require(70),
    words = require(71);


var ARRAY = new Array(80);


module.exports = sha1Wrap;


function sha1Wrap(message, options) {
    var digestbytes = words.wordsToBytes(sha1(message));

    return (
        options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        hex.bytesToString(digestbytes)
    );
}

sha1Wrap.blocksize = 16;
sha1Wrap.digestsize = 20;

function sha1(message) {
    var m, l, w, H0, H1, H2, H3, H4, a, b, c, d, e, i, il, j, n, t;

    if (isString(String)) {
        message = utf8.stringToBytes(message);
    } else if (isArrayLike(message)) {
        message = fastSlice(message, 0);
    } else {
        message = message.toString();
    }

    m = words.bytesToWords(message);
    l = message.length * 8;
    w = ARRAY;
    H0 = 1732584193;
    H1 = -271733879;
    H2 = -1732584194;
    H3 = 271733878;
    H4 = -1009589776;

    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (i = 0, il = m.length; i < il; i += 16) {
        a = H0;
        b = H1;
        c = H2;
        d = H3;
        e = H4;

        for (j = 0; j < 80; j++) {
            if (j < 16) {
                w[j] = m[i + j];
            } else {
                n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
                w[j] = (n << 1) | (n >>> 31);
            }

            t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                (H1 ^ H2 ^ H3) - 899497514
            );

            H4 = H3;
            H3 = H2;
            H2 = (H1 << 30) | (H1 >>> 2);
            H1 = H0;
            H0 = t;
        }

        H0 += a;
        H1 += b;
        H2 += c;
        H3 += d;
        H4 += e;
    }

    return [H0, H1, H2, H3, H4];
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_array_like@0.0.2/src/index.js-=@*/
var isLength = require(72),
    isFunction = require(10),
    isObject = require(9);


module.exports = isArrayLike;


function isArrayLike(value) {
    return !isFunction(value) && isObject(value) && isLength(value.length);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/uuid@0.0.2/src/hexToByte.js-=@*/
var byteToHex = require(65);


var hexToByte = exports,
    i, il;


for (i = 0, il = 256; i < il; i++) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
    hexToByte[byteToHex[i]] = i;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/index_of@0.0.1/src/index.js-=@*/
var isEqual = require(77);


module.exports = indexOf;


function indexOf(array, value, fromIndex) {
    var i = (fromIndex || 0) - 1,
        il = array.length - 1;

    while (i++ < il) {
        if (isEqual(array[i], value)) {
            return i;
        }
    }

    return -1;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_equal@0.0.1/src/index.js-=@*/
module.exports = isEqual;


function isEqual(a, b) {
    return !(a !== b && !(a !== a && b !== b));
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/request@0.0.9/src/browser.js-=@*/
module.exports = require(79)(require(80));

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/request@0.0.9/src/create.js-=@*/
var methods = require(81),
    arrayForEach = require(31),
    EventEmitter = require(36),
    defaults = require(82);


module.exports = function createRequest(request) {

    arrayForEach(methods, function(method) {
        var upper = method.toUpperCase();

        request[method] = function(url, options) {
            options = options || {};

            options.url = url;
            options.method = upper;

            return request(options);
        };
    });
    request.mSearch = request["m-search"];

    arrayForEach(["post", "patch", "put"], function(method) {
        var upper = method.toUpperCase();

        request[method] = function(url, data, options) {
            options = options || {};

            options.url = url;
            options.data = data;
            options.method = upper;

            return request(options);
        };
    });

    request.defaults = defaults.values;
    request.plugins = new EventEmitter(-1);

    return request;
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/request@0.0.9/src/requestBrowser.js-=@*/
var PromisePolyfill = require(83),
    XMLHttpRequestPolyfill = require(23),
    isFunction = require(10),
    isString = require(14),
    isNull = require(12),
    objectForEach = require(32),
    trim = require(84),
    extend = require(44),
    Response = require(85),
    defaults = require(82),
    camelcaseHeader = require(86),
    parseContentType = require(87);


var supportsFormData = typeof(FormData) !== "undefined";


defaults.values.XMLHttpRequest = XMLHttpRequestPolyfill;


function parseResponseHeaders(responseHeaders) {
    var headers = {},
        raw = responseHeaders.split("\n");

    objectForEach(raw, function(header) {
        var tmp = header.split(":"),
            key = tmp[0],
            value = tmp[1];

        if (key && value) {
            key = camelcaseHeader(key);
            value = trim(value);

            if (key === "Content-Length") {
                value = +value;
            }

            headers[key] = value;
        }
    });

    return headers;
}


function addEventListener(xhr, event, listener) {
    if (isFunction(xhr.addEventListener)) {
        xhr.addEventListener(event, listener, false);
    } else if (isFunction(xhr.attachEvent)) {
        xhr.attachEvent("on" + event, listener);
    } else {
        xhr["on" + event] = listener;
    }
}

function request(options) {
    var xhr = new defaults.values.XMLHttpRequest(),
        plugins = request.plugins,
        canSetRequestHeader = isFunction(xhr.setRequestHeader),
        canOverrideMimeType = isFunction(xhr.overrideMimeType),
        defer = null,
        isFormData;

    options = defaults(options);

    plugins.emit("before", xhr, options);

    isFormData = (supportsFormData && options.data instanceof FormData);

    if (options.isPromise) {
        defer = PromisePolyfill.defer();
    }

    function onSuccess(response) {
        plugins.emit("response", response, xhr, options);
        plugins.emit("load", response, xhr, options);

        if (options.isPromise) {
            defer.resolve(response);
        } else {
            if (!isNull(options.success)) {
                options.success(response);
            }
        }
    }

    function onError(response) {
        plugins.emit("response", response, xhr, options);
        plugins.emit("error", response, xhr, options);

        if (options.isPromise) {
            defer.reject(response);
        } else {
            if (!isNull(options.error)) {
                options.error(response);
            }
        }
    }

    function onComplete() {
        var statusCode = +xhr.status,
            responseText = xhr.responseText,
            response = new Response();

        response.url = xhr.responseURL || options.url;
        response.method = options.method;

        response.statusCode = statusCode;

        response.responseHeaders = xhr.getAllResponseHeaders ? parseResponseHeaders(xhr.getAllResponseHeaders()) : {};
        response.requestHeaders = options.headers ? extend({}, options.headers) : {};

        response.data = null;

        if (responseText) {
            if (options.transformResponse) {
                response.data = options.transformResponse(responseText);
            } else {
                if (parseContentType(response.responseHeaders["Content-Type"]) === "application/json") {
                    try {
                        response.data = JSON.parse(responseText);
                    } catch (e) {
                        response.data = e;
                        onError(response);
                        return;
                    }
                } else if (responseText) {
                    response.data = responseText;
                }
            }
        }

        if ((statusCode > 199 && statusCode < 301) || statusCode === 304) {
            onSuccess(response);
        } else {
            onError(response);
        }
    }

    function onReadyStateChange() {
        switch (+xhr.readyState) {
            case 1:
                plugins.emit("request", xhr, options);
                break;
            case 4:
                onComplete();
                break;
        }
    }

    addEventListener(xhr, "readystatechange", onReadyStateChange);

    if (options.withCredentials && options.async) {
        xhr.withCredentials = options.withCredentials;
    }

    xhr.open(
        options.method,
        options.url,
        options.async,
        options.username,
        options.password
    );

    if (canSetRequestHeader) {
        if (options.headers && options.headers["Content-Type"] && isFormData) {
            delete options.headers["Content-Type"];
        }

        objectForEach(options.headers, function(value, key) {
            if (isString(value)) {
                if (key === "Content-Type" && canOverrideMimeType) {
                    xhr.overrideMimeType(value);
                }
                xhr.setRequestHeader(key, value);
            }
        });
    }

    if (options.transformRequest) {
        options.data = options.transformRequest(options.data);
    } else if (options.data) {
        if (!isString(options.data) && !isFormData) {
            if (options.headers["Content-Type"] === "application/json") {
                options.data = JSON.stringify(options.data);
            } else {
                options.data = options.data + "";
            }
        }
    }

    xhr.send(options.data);

    return isNull(defer) ? undefined : defer.promise;
}


module.exports = request;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/methods@0.0.1/src/browser.js-=@*/
module.exports = [
    "checkout",
    "connect",
    "copy",
    "delete",
    "get",
    "head",
    "lock",
    "m-search",
    "merge",
    "mkactivity",
    "mkcalendar",
    "mkcol",
    "move",
    "notify",
    "options",
    "patch",
    "post",
    "propfind",
    "proppatch",
    "purge",
    "put",
    "report",
    "search",
    "subscribe",
    "trace",
    "unlock",
    "unsubscribe"
];

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/request@0.0.9/src/defaults.js-=@*/
var extend = require(44),
    isString = require(14),
    isFunction = require(10);


function defaults(options) {

    options = extend({}, defaults.values, options);

    options.url = isString(options.url || (options.url = options.src)) ? options.url : null;
    options.method = isString(options.method) ? options.method.toUpperCase() : "GET";

    options.transformRequest = isFunction(options.transformRequest) ? options.transformRequest : null;
    options.transformResponse = isFunction(options.transformResponse) ? options.transformResponse : null;

    options.withCredentials = options.withCredentials != null ? !!options.withCredentials : false;
    options.headers = extend({}, defaults.values.headers, options.headers);
    options.async = options.async != null ? !!options.async : true;

    options.success = isFunction(options.success) ? options.success : null;
    options.error = isFunction(options.error) ? options.error : null;
    options.isPromise = !isFunction(options.success) && !isFunction(options.error);

    options.user = isString(options.user) ? options.user : undefined;
    options.password = isString(options.password) ? options.password : undefined;

    return options;
}

defaults.values = {
    url: "",
    method: "GET",
    data: null,
    headers: {
        Accept: "*/*",
        "X-Requested-With": "XMLHttpRequest"
    }
};


module.exports = defaults;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/promise_polyfill@0.0.4/src/index.js-=@*/
var process = require(5);
var isNull = require(12),
    isArray = require(30),
    isObject = require(9),
    isFunction = require(10),
    apply = require(34),
    WeakMapPolyfill = require(88),
    fastSlice = require(50),
    Iterator = require(89);


var PromisePolyfill, PromisePolyfillPrototype, PrivatePromise, Defer;


if (
    typeof(Promise) !== "undefined" &&
    (function isValidPromise() {
        try {
            new Promise(function resolver(resolve) {
                resolve(true);
            }).then(function onThen() {});
            return true;
        } catch (e) {
            return false;
        }
    }())
) {
    PromisePolyfill = Promise;
    PromisePolyfillPrototype = PromisePolyfill.prototype;
} else {
    PrivatePromise = (function createPrivatePromise() {

        function PrivatePromise(resolver) {
            var _this = this;

            this.handlers = [];
            this.state = null;
            this.value = null;

            handleResolve(
                resolver,
                function resolve(newValue) {
                    resolveValue(_this, newValue);
                },
                function reject(newValue) {
                    rejectValue(_this, newValue);
                }
            );
        }

        PrivatePromise.store = new WeakMapPolyfill();

        PrivatePromise.handle = function(_this, onFulfilled, onRejected, resolve, reject) {
            handle(_this, new Handler(onFulfilled, onRejected, resolve, reject));
        };

        function Handler(onFulfilled, onRejected, resolve, reject) {
            this.onFulfilled = isFunction(onFulfilled) ? onFulfilled : null;
            this.onRejected = isFunction(onRejected) ? onRejected : null;
            this.resolve = resolve;
            this.reject = reject;
        }

        function handleResolve(resolver, onFulfilled, onRejected) {
            var done = false;

            try {
                resolver(
                    function(value) {
                        if (!done) {
                            done = true;
                            onFulfilled(value);
                        }
                    },
                    function(reason) {
                        if (!done) {
                            done = true;
                            onRejected(reason);
                        }
                    }
                );
            } catch (err) {
                if (!done) {
                    done = true;
                    onRejected(err);
                }
            }
        }

        function resolveValue(_this, newValue) {
            try {
                if (newValue === _this) {
                    throw new TypeError("A promise cannot be resolved with itself");
                } else {
                    if (newValue && (isObject(newValue) || isFunction(newValue))) {
                        if (isFunction(newValue.then)) {
                            handleResolve(
                                function resolver(resolve, reject) {
                                    newValue.then(resolve, reject);
                                },
                                function resolve(newValue) {
                                    resolveValue(_this, newValue);
                                },
                                function reject(newValue) {
                                    rejectValue(_this, newValue);
                                }
                            );
                            return;
                        }
                    }
                    _this.state = true;
                    _this.value = newValue;
                    finale(_this);
                }
            } catch (error) {
                rejectValue(_this, error);
            }
        }

        function rejectValue(_this, newValue) {
            _this.state = false;
            _this.value = newValue;
            finale(_this);
        }

        function finale(_this) {
            var handlers = _this.handlers,
                i = -1,
                il = handlers.length - 1;

            while (i++ < il) {
                handle(_this, handlers[i]);
            }

            handlers.length = 0;
        }

        function handle(_this, handler) {
            var state = _this.state;

            if (isNull(_this.state)) {
                _this.handlers.push(handler);
            } else {
                process.nextTick(function onNextTick() {
                    var callback = state ? handler.onFulfilled : handler.onRejected,
                        value = _this.value,
                        out;

                    if (isNull(callback)) {
                        if (state) {
                            handler.resolve(value);
                        } else {
                            handler.reject(value);
                        }
                    } else {
                        try {
                            out = callback(value);
                            handler.resolve(out);
                        } catch (err) {
                            handler.reject(err);
                        }
                    }
                });
            }
        }

        return PrivatePromise;
    }());

    PromisePolyfill = function Promise(resolver) {

        if (!isFunction(resolver)) {
            throw new TypeError("Promise(resolver) You must pass a resolver function as the first argument to the promise constructor");
        }

        PrivatePromise.store.set(this, new PrivatePromise(resolver));
    };

    PromisePolyfillPrototype = PromisePolyfill.prototype;

    PromisePolyfillPrototype.then = function(onFulfilled, onRejected) {
        var _this = PrivatePromise.store.get(this);

        return new PromisePolyfill(function resolver(resolve, reject) {
            PrivatePromise.handle(_this, onFulfilled, onRejected, resolve, reject);
        });
    };
}

if (!isFunction(PromisePolyfillPrototype["catch"])) {
    PromisePolyfillPrototype["catch"] = function(reject) {
        return this.then(null, reject);
    };
}

if (!isFunction(PromisePolyfill.resolve)) {
    PromisePolyfill.resolve = function(value) {
        if (value instanceof PromisePolyfill) {
            return value;
        }

        return new PromisePolyfill(function resolver(resolve) {
            resolve(value);
        });
    };
}

if (!isFunction(PromisePolyfill.reject)) {
    PromisePolyfill.reject = function(value) {
        return new PromisePolyfill(function resolver(resolve, reject) {
            reject(value);
        });
    };
}

if (!isFunction(PromisePolyfill.defer)) {
    Defer = function Defer() {
        var _this = this;

        this.resolve = null;
        this.reject = null;

        this.promise = new PromisePolyfill(function resolver(resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    };

    PromisePolyfill.defer = function() {
        return new Defer();
    };
}

if (!isFunction(PromisePolyfill.all)) {
    PromisePolyfill.all = function(value) {
        var values = (arguments.length === 1 && isArray(value)) ? value : fastSlice(arguments);

        return new PromisePolyfill(function resolver(resolve, reject) {
            var iterator = Iterator.getIterator(values),
                called = false,
                count = 0,
                it, step, value, resolveFn, rejectFn, results;

            if (iterator) {
                it = iterator.call(values);

                resolveFn = function resolveFn(value) {
                    if (!called) {
                        results = results || [];
                        results[results.length] = value;

                        if (--count === 0) {
                            called = true;
                            resolve(results);
                        }
                    }
                };
                rejectFn = function rejectFn(value) {
                    if (!called) {
                        called = true;
                        reject(value);
                    }
                };

                while (!(step = it.next()).done) {
                    count++;
                    value = step.value;

                    if (value && isFunction(value.then)) {
                        value.then(resolveFn, rejectFn);
                    } else {
                        resolveFn(value);
                    }
                }
            } else {
                reject(new Error("Invalid Iterator " + typeof(values)));
            }
        });
    };
}

if (!isFunction(PromisePolyfill.race)) {
    PromisePolyfill.race = function(value) {
        var values = (arguments.length === 1 && isArray(value)) ? value : fastSlice(arguments);

        return new PromisePolyfill(function resolver(resolve, reject) {
            var iterator = Iterator.getIterator(values),
                it, step, value;

            if (iterator) {
                it = iterator.call(values);

                while (!(step = it.next()).done) {
                    value = step.value;

                    if (value && isFunction(value.then)) {
                        value.then(resolve, reject);
                    } else {
                        resolve(value);
                    }
                }
            } else {
                reject(new Error("Invalid Iterator " + typeof(values)));
            }
        });
    };
}

if (!isFunction(PromisePolyfill.promisify)) {
    PromisePolyfill.promisify = function(fn, thisArg) {
        return function promisified() {
            var defer = PromisePolyfill.defer(),
                args = fastSlice(arguments);

            function callback(error, value) {
                if (error) {
                    return defer.reject(error);
                } else {
                    if (arguments.length < 3) {
                        return defer.resolve(value);
                    } else {
                        return defer.resolve(fastSlice(arguments, 1));
                    }
                }
            }

            args[args.length] = callback;
            apply(fn, args, thisArg);

            return defer.promise;
        };
    };
}


module.exports = PromisePolyfill;
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/trim@0.0.1/src/index.js-=@*/
var isNative = require(39),
    toString = require(42);


var StringPrototype = String.prototype,

    reTrim = /^[\s\xA0]+|[\s\xA0]+$/g,
    reTrimLeft = /^[\s\xA0]+/g,
    reTrimRight = /[\s\xA0]+$/g,

    baseTrim, baseTrimLeft, baseTrimRight;


module.exports = trim;


if (isNative(StringPrototype.trim)) {
    baseTrim = function baseTrim(str) {
        return str.trim();
    };
} else {
    baseTrim = function baseTrim(str) {
        return str.replace(reTrim, "");
    };
}

if (isNative(StringPrototype.trimLeft)) {
    baseTrimLeft = function baseTrimLeft(str) {
        return str.trimLeft();
    };
} else {
    baseTrimLeft = function baseTrimLeft(str) {
        return str.replace(reTrimLeft, "");
    };
}

if (isNative(StringPrototype.trimRight)) {
    baseTrimRight = function baseTrimRight(str) {
        return str.trimRight();
    };
} else {
    baseTrimRight = function baseTrimRight(str) {
        return str.replace(reTrimRight, "");
    };
}


function trim(str) {
    return baseTrim(toString(str));
}

trim.left = function trimLeft(str) {
    return baseTrimLeft(toString(str));
};

trim.right = function trimRight(str) {
    return baseTrimRight(toString(str));
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/request@0.0.9/src/Response.js-=@*/
module.exports = Response;


function Response() {
    this.data = null;
    this.method = null;
    this.requestHeaders = null;
    this.responseHeaders = null;
    this.statusCode = null;
    this.url = null;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/request@0.0.9/src/camelcaseHeader.js-=@*/
var arrayMap = require(98),
    capitalizeString = require(99);


module.exports = function camelcaseHeader(str) {
    return arrayMap(str.toLowerCase().split("-"), capitalizeString).join("-");
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/request@0.0.9/src/parseContentType.js-=@*/
module.exports = function parseContentType(str) {
    var index;

    if (str) {
        if ((index = str.indexOf(";")) !== -1) {
            str = str.substring(0, index);
        }
        if ((index = str.indexOf(",")) !== -1) {
            return str.substring(0, index);
        }

        return str;
    }

    return "application/octet-stream";
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/weak_map_polyfill@0.0.2/src/index.js-=@*/
var isNative = require(39),
    isPrimitive = require(47),
    createStore = require(90);


var NativeWeakMap = typeof(WeakMap) !== "undefined" ? WeakMap : null,
    WeakMapPolyfill, WeakMapPolyfillPrototype;


if (isNative(NativeWeakMap)) {
    WeakMapPolyfill = NativeWeakMap;
    WeakMapPolyfillPrototype = WeakMapPolyfill.prototype;
} else {
    WeakMapPolyfill = function WeakMap() {
        this.__store = createStore();
    };
    WeakMapPolyfillPrototype = WeakMapPolyfill.prototype;
    WeakMapPolyfillPrototype.constructor = WeakMapPolyfill;

    WeakMapPolyfillPrototype.get = function(key) {
        return this.__store.get(key);
    };

    WeakMapPolyfillPrototype.set = function(key, value) {
        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        } else {
            this.__store.set(key, value);
        }
    };

    WeakMapPolyfillPrototype.has = function(key) {
        return this.__store.has(key);
    };

    WeakMapPolyfillPrototype["delete"] = function(key) {
        return this.__store.remove(key);
    };

    WeakMapPolyfillPrototype.length = 0;
}

WeakMapPolyfillPrototype.remove = WeakMapPolyfillPrototype["delete"];


module.exports = WeakMapPolyfill;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/iterator@0.0.2/src/index.js-=@*/
var apply = require(34),
    isFunction = require(10),
    isUndefined = require(17);


var KEYS = 0,
    VALUES = 1,
    ENTRIES = 2,

    ITERATOR_SYMBOL = typeof(Symbol) === "function" ? Symbol.iterator : false,
    EMPTY = new Iterator(createDone),

    IteratorPrototype;


module.exports = Iterator;


function Iterator(next) {
    this.next = next;
}
IteratorPrototype = Iterator.prototype;

Iterator.EMPTY = EMPTY;

function IteratorValue(value, done) {
    this.value = value;
    this.done = done;
}
Iterator.Value = IteratorValue;

function createValue(type, key, value, result) {
    var iteratorValue = (
        type === KEYS ? key :
        type === VALUES ? value : [key, value]
    );

    if (isUndefined(result)) {
        result = new IteratorValue(iteratorValue, false);
    } else {
        result.value = iteratorValue;
    }

    return result;
}
Iterator.createValue = createValue;

function createDone() {
    return new IteratorValue(undefined, true);
}
Iterator.createDone = createDone;

function getIterator(iterable) {
    var iteratorFn = iterable && (ITERATOR_SYMBOL && iterable[ITERATOR_SYMBOL] || iterable.iterator);

    if (isFunction(iteratorFn)) {
        return iteratorFn;
    } else {
        return void(0);
    }
}
Iterator.getIterator = function(iterable) {
    var iteratorFn = getIterator(iterable);

    if (iteratorFn) {
        return function fn() {
            return apply(iteratorFn, arguments, iterable);
        };
    } else {
        return void(0);
    }
};

function hasIterator(iterable) {
    return !!getIterator(iterable);
}
Iterator.hasIterator = hasIterator;

function isIterator(iterator) {
    return !!(iterator && isFunction(iterator.next));
}
Iterator.isIterator = isIterator;

Iterator.KEYS = KEYS;
Iterator.VALUES = VALUES;
Iterator.ENTRIES = ENTRIES;

IteratorPrototype.toString = function() {
    return "[Iterator]";
};
IteratorPrototype.inspect = IteratorPrototype.toSource = IteratorPrototype.toString;

IteratorPrototype.iterator = function() {
    return this;
};
IteratorPrototype[ITERATOR_SYMBOL] = IteratorPrototype.iterator;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/create_store@0.0.2/src/index.js-=@*/
var has = require(33),
    defineProperty = require(52),
    isPrimitive = require(47);


var emptyStore = {
        value: undefined
    },
    ObjectPrototype = Object.prototype;


module.exports = createStore;


function createStore() {
    var privateKey = {},
        size = 0;


    function get(key) {
        var store;

        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        } else {
            store = key.valueOf(privateKey);

            if (!store || store.identity !== privateKey) {
                store = emptyStore;
            }

            return store;
        }
    }

    function set(key) {
        var store;

        if (isPrimitive(key)) {
            throw new TypeError("Invalid value used as key");
        } else {
            store = key.valueOf(privateKey);

            if (!store || store.identity !== privateKey) {
                store = privateStore(key, privateKey);
                size += 1;
            }

            return store;
        }
    }

    return {
        get: function(key) {
            return get(key).value;
        },
        set: function(key, value) {
            set(key).value = value;
        },
        has: function(key) {
            var store = get(key);
            return store !== emptyStore ? has(store, "value") : false;
        },
        remove: function(key) {
            var store = get(key);

            if (store !== emptyStore) {
                size -= 1;
                return store.remove();
            } else {
                return false;
            }
        },
        clear: function() {
            privateKey = {};
            size = 0;
        },
        size: function() {
            return size;
        }
    };
}

function privateStore(key, privateKey) {
    var keyValueOf = key.valueOf || ObjectPrototype.valueOf,
        store = {
            identity: privateKey,
            remove: function remove() {
                if (key.valueOf === valueOf) {
                    key.valueOf = keyValueOf;
                }
                return delete store.value;
            }
        };

    function valueOf(value) {
        if (value !== privateKey) {
            return keyValueOf.apply(this, arguments);
        } else {
            return store;
        }
    }

    defineProperty(key, "valueOf", {
        value: valueOf,
        configurable: true,
        enumerable: false,
        writable: true
    });

    return store;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/EventPolyfill.js-=@*/
var tryCallFunction = require(93);


var EventPolyfillPrototype;


module.exports = EventPolyfill;


function EventPolyfill(type, nativeEvent) {

    this.__nativeEvent = nativeEvent;

    this.type = type;
    this.bubbles = nativeEvent.bubbles;
    this.cancelBubble = nativeEvent.cancelBubble;
    this.cancelable = nativeEvent.cancelable;
    this.currentTarget = nativeEvent.currentTarget;
    this.defaultPrevented = nativeEvent.defaultPrevented;
    this.eventPhase = nativeEvent.eventPhase;
    this.isTrusted = nativeEvent.isTrusted;
    this.path = nativeEvent.path;
    this.returnValue = nativeEvent.returnValue;
    this.srcElement = nativeEvent.srcElement;
    this.target = nativeEvent.target;
    this.timeStamp = nativeEvent.timeStamp;
}
EventPolyfillPrototype = EventPolyfill.prototype;

EventPolyfillPrototype.AT_TARGET = 2;
EventPolyfillPrototype.BLUR = 8192;
EventPolyfillPrototype.BUBBLING_PHASE = 3;
EventPolyfillPrototype.CAPTURING_PHASE = 1;
EventPolyfillPrototype.CHANGE = 32768;
EventPolyfillPrototype.CLICK = 64;
EventPolyfillPrototype.DBLCLICK = 128;
EventPolyfillPrototype.DRAGDROP = 2048;
EventPolyfillPrototype.FOCUS = 4096;
EventPolyfillPrototype.KEYDOWN = 256;
EventPolyfillPrototype.KEYPRESS = 1024;
EventPolyfillPrototype.KEYUP = 512;
EventPolyfillPrototype.MOUSEDOWN = 1;
EventPolyfillPrototype.MOUSEDRAG = 32;
EventPolyfillPrototype.MOUSEMOVE = 16;
EventPolyfillPrototype.MOUSEOUT = 8;
EventPolyfillPrototype.MOUSEOVER = 4;
EventPolyfillPrototype.MOUSEUP = 2;
EventPolyfillPrototype.NONE = 0;
EventPolyfillPrototype.SELECT = 16384;

EventPolyfillPrototype.preventDefault = function() {
    return tryCallFunction(this.__nativeEvent, "preventDefault");
};

EventPolyfillPrototype.stopImmediatePropagation = function() {
    return tryCallFunction(this.__nativeEvent, "stopImmediatePropagation");
};

EventPolyfillPrototype.stopPropagation = function() {
    return tryCallFunction(this.__nativeEvent, "stopPropagation");
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/ProgressEventPolyfill.js-=@*/
var inherits = require(35),
    EventPolyfill = require(91);


module.exports = ProgressEventPolyfill;


function ProgressEventPolyfill(type, nativeEvent) {

    EventPolyfill.call(this, type, nativeEvent);

    this.lengthComputable = nativeEvent.lengthComputable;
    this.loaded = nativeEvent.loaded;
    this.total = nativeEvent.total;
}
inherits(ProgressEventPolyfill, EventPolyfill);

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/tryCallFunction.js-=@*/
module.exports = tryCallFunction;


function tryCallFunction(object, name, a0, a1, a2, a3, a4) {
    try {
        return object[name](a0, a1, a2, a3, a4);
    } catch (e) {}
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/trySetValue.js-=@*/
module.exports = trySetValue;


function trySetValue(object, name, key, value) {
    try {
        return (object[name][key] = value);
    } catch (e) {}
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/emitEvent.js-=@*/
module.exports = emitEvent;


function emitEvent(object, type, event) {
    var onevent = "on" + type;

    if (object[onevent]) {
        object[onevent](event);
    }

    object.emitArg(type, event);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/toUint8Array.js-=@*/
var environment = require(1);


var Uint8Array = environment.window.Uint8Array || Array;


module.exports = toUint8Array;


function toUint8Array(string) {
    var length = string.length,
        ui8 = new Uint8Array(length),
        i = -1,
        il = length - 1;

    while (i++ < il) {
        ui8[i] = string.charCodeAt(i) & 0xff;
    }

    return ui8;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/xmlhttprequest_polyfill@0.0.4/src/createNativeXMLHttpRequest.js-=@*/
var environment = require(1);


var window = environment.window,
    NativeXMLHttpRequest = window.XMLHttpRequest,

    createNativeXMLHttpRequest, NativeActiveXObjectType;


if (NativeXMLHttpRequest) {
    createNativeXMLHttpRequest = function createNativeXMLHttpRequest(options) {
        return new NativeXMLHttpRequest(options);
    };
} else {
    (function getNativeActiveXObject(types) {
        var NativeActiveXObject = window.ActiveXObject,
            i = -1,
            il = types.length - 1,
            instance, type;

        while (i++ < il) {
            try {
                type = types[i];
                instance = new NativeActiveXObject(type);
                break;
            } catch (e) {}
            type = null;
        }

        if (!type) {
            throw new Error("XMLHttpRequest not supported by this browser");
        }

        NativeActiveXObjectType = type;
    }([
        "Msxml2.XMLHTTP",
        "Msxml3.XMLHTTP",
        "Microsoft.XMLHTTP"
    ]));

    createNativeXMLHttpRequest = function createNativeXMLHttpRequest() {
        return new NativeActiveXObject(NativeActiveXObjectType);
    };
}


module.exports = createNativeXMLHttpRequest;

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/array-map@0.0.1/src/index.js-=@*/
module.exports = arrayMap;


function arrayMap(array, callback) {
    var length = array.length,
        i = -1,
        il = length - 1,
        results = new Array(length);

    while (i++ < il) {
        results[i] = callback(array[i], i, array);
    }

    return results;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/capitalize_string@0.0.1/src/index.js-=@*/
module.exports = capitalizeString;


function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/status_codes@0.0.2/src/browser.js-=@*/
module.exports = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I\"m a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Unordered Collection",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    509: "Bandwidth Limit Exceeded",
    510: "Not Extended",
    511: "Network Authentication Required"
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/audio@0.0.1/src/WebAudioSource.js-=@*/
var isBoolean = require(103),
    isNumber = require(16),
    isString = require(14),
    EventEmitter = require(36),
    mathf = require(104),
    now = require(59),
    context = require(18);


var WebAudioSourcePrototype;


module.exports = WebAudioSource;


function WebAudioSource() {
    var _this = this;

    EventEmitter.call(this, -1);

    this.clip = null;

    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.panningModel = "HRTF";
    this.distanceModel = "inverse";

    this.refDistance = 1.0;
    this.maxDistance = 10000.0;
    this.rolloffFactor = 1.0;

    this.coneInnerAngle = 360.0;
    this.coneOuterAngle = 0.0;
    this.coneOuterGain = 0.0;

    this.playing = false;
    this.paused = false;

    this._source = null;
    this._gain = null;
    this._panner = null;

    this._startTime = 0.0;

    this._onEnd = function onEnd() {
        _this._source = null;
        _this._gain = null;
        _this._panner = null;
        _this.playing = false;
        _this.paused = false;
        _this.currentTime = 0.0;
        _this._startTime = 0.0;
        _this.emit("end");
    };
}
EventEmitter.extend(WebAudioSource);
WebAudioSourcePrototype = WebAudioSource.prototype;

WebAudioSource.create = function(options) {
    return (new WebAudioSource()).construct(options);
};

WebAudioSourcePrototype.construct = function(options) {

    if (options) {
        if (options.clip) {
            this.clip = options.clip;
        }

        if (isBoolean(options.ambient)) {
            this.ambient = options.ambient;
        }
        if (isBoolean(options.loop)) {
            this.loop = options.loop;
        }

        if (isNumber(options.volume)) {
            this.volume = options.volume;
        }
        if (isNumber(options.dopplerLevel)) {
            this.dopplerLevel = options.dopplerLevel;
        }

        if (isString(options.panningModel)) {
            this.panningModel = options.panningModel;
        }
        if (isString(options.distanceModel)) {
            this.distanceModel = options.distanceModel;
        }

        if (isNumber(options.refDistance)) {
            this.refDistance = options.refDistance;
        }
        if (isNumber(options.maxDistance)) {
            this.maxDistance = options.maxDistance;
        }
        if (isNumber(options.rolloffFactor)) {
            this.rolloffFactor = options.rolloffFactor;
        }

        if (isNumber(options.coneInnerAngle)) {
            this.coneInnerAngle = options.coneInnerAngle;
        }
        if (isNumber(options.coneOuterAngle)) {
            this.coneOuterAngle = options.coneOuterAngle;
        }
        if (isNumber(options.coneOuterGain)) {
            this.coneOuterGain = options.coneOuterGain;
        }
    }

    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this._source = null;
    this._gain = null;
    this._panner = null;

    this._startTime = 0.0;

    return this;
};

WebAudioSourcePrototype.destructor = function() {

    this.clip = null;

    this.ambient = false;
    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.panningModel = "HRTF";
    this.distanceModel = "inverse";

    this.refDistance = 1.0;
    this.maxDistance = 10000.0;
    this.rolloffFactor = 1.0;

    this.coneInnerAngle = 360.0;
    this.coneOuterAngle = 0.0;
    this.coneOuterGain = 0.0;

    this.playing = false;
    this.paused = false;

    this._source = null;
    this._gain = null;
    this._panner = null;

    this._startTime = 0.0;

    return this;
};

WebAudioSourcePrototype.setClip = function(value) {
    this.clip = value;
    return this;
};

WebAudioSourcePrototype.setPanningModel = function(value) {
    var panner = this._panner;

    this.panningModel = value;

    if (panner) {
        panner.panningModel = this.panningModel;
    }

    return this;
};

WebAudioSourcePrototype.setDistanceModel = function(value) {
    var panner = this._panner;

    this.distanceModel = value;

    if (panner) {
        panner.distanceModel = this.distanceModel;
    }

    return this;
};

WebAudioSourcePrototype.setRefDistance = function(value) {
    var panner = this._panner;

    this.refDistance = value;

    if (panner) {
        panner.refDistance = this.refDistance;
    }

    return this;
};

WebAudioSourcePrototype.setMaxDistance = function(value) {
    var panner = this._panner;

    this.maxDistance = value;

    if (panner) {
        panner.maxDistance = this.maxDistance;
    }

    return this;
};

WebAudioSourcePrototype.setRolloffFactor = function(value) {
    var panner = this._panner;

    this.rolloffFactor = value;

    if (panner) {
        panner.rolloffFactor = this.rolloffFactor;
    }

    return this;
};

WebAudioSourcePrototype.setConeInnerAngle = function(value) {
    var panner = this._panner;

    this.coneInnerAngle = value || 0;

    if (panner) {
        panner.coneInnerAngle = this.coneInnerAngle;
    }

    return this;
};

WebAudioSourcePrototype.setConeOuterAngle = function(value) {
    var panner = this._panner;

    this.coneOuterAngle = value || 0;

    if (panner) {
        panner.coneOuterAngle = this.coneOuterAngle;
    }

    return this;
};

WebAudioSourcePrototype.setConeOuterGain = function(value) {
    var panner = this._panner;

    this.coneOuterGain = value || 0;

    if (panner) {
        panner.coneOuterGain = this.coneOuterGain;
    }

    return this;
};

WebAudioSourcePrototype.setAmbient = function(value) {
    this.ambient = !!value;
    return this;
};

WebAudioSourcePrototype.setDopplerLevel = function(value) {
    this.dopplerLevel = mathf.clampBottom(value, 0);
    return this;
};

WebAudioSourcePrototype.setVolume = function(value) {
    var gainNode = this._gain;

    this.volume = mathf.clamp01(value || 0);

    if (gainNode) {
        gainNode.gain.value = this.volume;
    }

    return this;
};

WebAudioSourcePrototype.setLoop = function(value) {
    this.loop = !!value;
    return this;
};

WebAudioSourcePrototype.setPosition = function(position) {
    var panner = this._panner;

    if (panner) {
        panner.setPosition(position[0], position[1], position[2]);
    }

    return this;
};

WebAudioSourcePrototype.setVelocity = function(velocity) {
    var panner = this._panner;

    if (panner) {
        panner.setVelocity(velocity[0], velocity[1], velocity[2]);
    }

    return this;
};

WebAudioSourcePrototype.setOrientation = function(orientation) {
    var panner = this._panner;

    if (panner) {
        panner.setOrientation(orientation[0], orientation[1], orientation[2]);
    }

    return this;
};

function WebAudioSource_reset(_this) {
    var source = _this._source = context.createBufferSource(),
        gainNode = _this._gain = context.createGain(),
        pannerNode;

    if (_this.ambient === true) {
        gainNode.connect(context.destination);
        source.connect(gainNode);
    } else {
        pannerNode = _this._panner = context.createPanner();

        pannerNode.panningModel = _this.panningModel;
        pannerNode.distanceModel = _this.distanceModel;

        pannerNode.refDistance = _this.refDistance;
        pannerNode.maxDistance = _this.maxDistance;
        pannerNode.rolloffFactor = _this.rolloffFactor;

        pannerNode.coneInnerAngle = _this.coneInnerAngle;
        pannerNode.coneOuterAngle = _this.coneOuterAngle;
        pannerNode.coneOuterGain = _this.coneOuterGain;

        pannerNode.setOrientation(0, 0, 1);

        pannerNode.connect(gainNode);
        gainNode.connect(context.destination);
        source.connect(pannerNode);
    }

    source.buffer = _this.clip.data;
    source.onended = _this._onEnd;

    gainNode.gain.value = _this.volume;
    source.loop = _this.loop;
}

WebAudioSourcePrototype.play = function(delay, offset, duration) {
    var _this = this,
        clip = this.clip,
        currentTime, clipDuration;

    if (clip && clip.data && (!this.playing || this.paused)) {
        currentTime = this.currentTime;
        clipDuration = clip.data.duration;

        delay = delay || 0.0;
        offset = offset || currentTime;
        duration = mathf.clamp(duration || clipDuration || 0.0, 0.0, clipDuration);

        WebAudioSource_reset(this);

        this.playing = true;
        this.paused = false;
        this._startTime = now() * 0.001;
        this.currentTime = offset;

        if (this.loop) {
            this._source.start(delay, offset);
        } else {
            this._source.start(delay, offset, duration);
        }

        if (delay === 0.0) {
            this.emit("play");
        } else {
            setTimeout(function() {
                _this.emit("play");
            }, delay * 1000);
        }
    }

    return this;
};

WebAudioSourcePrototype.pause = function() {
    var clip = this.clip;

    if (clip && clip.data && this.playing && !this.paused) {
        this.paused = true;
        this.currentTime = (now() - this._startTime) * 0.001;
        this._source.stop();
        this.emit("pause");
    }

    return this;
};

WebAudioSourcePrototype.stop = function() {
    var clip = this.clip;

    if (this.playing && clip && clip.data) {
        this._source.stop();
        this.emit("stop");
        this._onEnd();
    }

    return this;
};

WebAudioSourcePrototype.toJSON = function(json) {

    json = json || {};

    json.loop = this.loop;
    json.volume = this.volume;
    json.dopplerLevel = this.dopplerLevel;
    json.currentTime = this.currentTime;

    json.panningModel = this.panningModel;
    json.distanceModel = this.distanceModel;

    json.refDistance = this.refDistance;
    json.maxDistance = this.maxDistance;
    json.rolloffFactor = this.rolloffFactor;

    json.coneInnerAngle = this.coneInnerAngle;
    json.coneOuterAngle = this.coneOuterAngle;
    json.coneOuterGain = this.coneOuterGain;

    return json;
};

WebAudioSourcePrototype.fromJSON = function(json) {

    this.loop = json.loop;
    this.volume = json.volume;
    this.dopplerLevel = json.dopplerLevel;
    this.currentTime = json.currentTime;

    this.panningModel = json.panningModel;
    this.distanceModel = json.distanceModel;

    this.refDistance = json.refDistance;
    this.maxDistance = json.maxDistance;
    this.rolloffFactor = json.rolloffFactor;

    this.coneInnerAngle = json.coneInnerAngle;
    this.coneOuterAngle = json.coneOuterAngle;
    this.coneOuterGain = json.coneOuterGain;

    return json;
};
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/audio@0.0.1/src/AudioSource.js-=@*/
var isBoolean = require(103),
    isNumber = require(16),
    EventEmitter = require(36),
    mathf = require(104),
    now = require(59);


var AudioSourcePrototype;


module.exports = AudioSource;


function AudioSource() {
    var _this = this;

    EventEmitter.call(this, -1);

    this.clip = null;

    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.panningModel = "HRTF";
    this.distanceModel = "inverse";

    this.refDistance = 1.0;
    this.maxDistance = 10000.0;
    this.rolloffFactor = 1.0;

    this.coneInnerAngle = 360.0;
    this.coneOuterAngle = 0.0;
    this.coneOuterGain = 0.0;

    this.playing = false;
    this.paused = false;

    this._source = null;
    this._startTime = 0.0;

    this._onEnd = function onEnd() {
        _this._source = null;
        _this.playing = false;
        _this.paused = false;
        _this.currentTime = 0.0;
        _this._startTime = 0.0;
        _this.emit("end");
    };
}
EventEmitter.extend(AudioSource);
AudioSourcePrototype = AudioSource.prototype;

AudioSource.create = function(options) {
    return (new AudioSource()).construct(options);
};

AudioSourcePrototype.construct = function(options) {

    if (options) {
        if (options.clip) {
            this.clip = options.clip;
        }

        if (isBoolean(options.ambient)) {
            this.ambient = options.ambient;
        }
        if (isBoolean(options.loop)) {
            this.loop = options.loop;
        }

        if (isNumber(options.volume)) {
            this.volume = options.volume;
        }
        if (isNumber(options.dopplerLevel)) {
            this.dopplerLevel = options.dopplerLevel;
        }
    }

    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this._source = null;
    this._startTime = 0.0;

    return this;
};

AudioSourcePrototype.destructor = function() {

    this.clip = null;

    this.ambient = false;
    this.loop = false;
    this.volume = 1.0;
    this.dopplerLevel = 0.0;
    this.currentTime = 0.0;

    this.playing = false;
    this.paused = false;

    this._source = null;
    this._startTime = 0.0;

    return this;
};

AudioSourcePrototype.setClip = function(value) {
    this.clip = value;
    return this;
};

AudioSourcePrototype.setAmbient = function(value) {
    this.ambient = !!value;
    return this;
};

AudioSourcePrototype.setDopplerLevel = function(value) {
    this.dopplerLevel = mathf.clampBottom(value, 0);
    return this;
};

AudioSourcePrototype.setVolume = function(value) {
    var source = this._source;

    this.volume = mathf.clamp01(value || 0);

    if (source) {
        source.volume = this.volume;
    }

    return this;
};

AudioSourcePrototype.setPanningModel = function(value) {
    this.panningModel = value;
    return this;
};

AudioSourcePrototype.setDistanceModel = function(value) {
    this.distanceModel = value;
    return this;
};

AudioSourcePrototype.setRefDistance = function(value) {
    this.refDistance = value;
    return this;
};

AudioSourcePrototype.setMaxDistance = function(value) {
    this.maxDistance = value;
    return this;
};

AudioSourcePrototype.setRolloffFactor = function(value) {
    this.rolloffFactor = value;
    return this;
};

AudioSourcePrototype.setConeInnerAngle = function(value) {
    this.coneInnerAngle = value || 0;
    return this;
};

AudioSourcePrototype.setConeOuterAngle = function(value) {
    this.coneOuterAngle = value || 0;
    return this;
};

AudioSourcePrototype.setConeOuterGain = function(value) {
    this.coneOuterGain = value || 0;
    return this;
};

AudioSourcePrototype.setLoop = function(value) {
    this.loop = !!value;
    return this;
};

AudioSourcePrototype.setPosition = function( /* position */ ) {
    return this;
};

AudioSourcePrototype.setVelocity = function( /* velocity */ ) {
    return this;
};

AudioSourcePrototype.setOrientation = function( /* orientation */ ) {
    return this;
};

function AudioSource_reset(_this) {
    var source = _this._source = document.createElement("audio");

    source.src = _this.clip.src;
    source.onended = _this._onEnd;
    source.volume = _this.volume;
    source.loop = _this.loop;
}

AudioSourcePrototype.play = function(delay, offset, duration) {
    var _this = this,
        clip = this.clip,
        currentTime, clipDuration;

    if (clip && clip.data && (!this.playing || this.paused)) {
        currentTime = this.currentTime;
        clipDuration = clip.data.duration;

        delay = delay || 0.0;
        offset = offset || currentTime;
        duration = mathf.clamp(duration || clipDuration || 0.0, 0.0, clipDuration);

        AudioSource_reset(this);

        this.playing = true;
        this.paused = false;
        this._startTime = now() * 0.001;
        this.currentTime = offset;

        if (this.loop) {
            this._source.play();
        } else {
            this._source.play();
        }

        if (delay === 0.0) {
            this.emit("play");
        } else {
            setTimeout(function() {
                _this.emit("play");
            }, delay * 1000);
        }
    }

    return this;
};

AudioSourcePrototype.pause = function() {
    var clip = this.clip;

    if (clip && clip.data && this.playing && !this.paused) {
        this.paused = true;
        this.currentTime = (now() - this._startTime) * 0.001;
        this._source.pause();
        this.emit("pause");
    }

    return this;
};

AudioSourcePrototype.stop = function() {
    var clip = this.clip;

    if (this.playing && clip && clip.data) {
        this._source.pause();
        this.emit("stop");
        this._onEnd();
    }

    return this;
};

AudioSourcePrototype.toJSON = function(json) {

    json = json || {};

    json.loop = this.loop;
    json.volume = this.volume;
    json.dopplerLevel = this.dopplerLevel;
    json.currentTime = this.currentTime;

    json.panningModel = this.panningModel;
    json.distanceModel = this.distanceModel;

    json.refDistance = this.refDistance;
    json.maxDistance = this.maxDistance;
    json.rolloffFactor = this.rolloffFactor;

    json.coneInnerAngle = this.coneInnerAngle;
    json.coneOuterAngle = this.coneOuterAngle;
    json.coneOuterGain = this.coneOuterGain;

    return json;
};

AudioSourcePrototype.fromJSON = function(json) {

    this.loop = json.loop;
    this.volume = json.volume;
    this.dopplerLevel = json.dopplerLevel;
    this.currentTime = json.currentTime;

    this.panningModel = json.panningModel;
    this.distanceModel = json.distanceModel;

    this.refDistance = json.refDistance;
    this.maxDistance = json.maxDistance;
    this.rolloffFactor = json.rolloffFactor;

    this.coneInnerAngle = json.coneInnerAngle;
    this.coneOuterAngle = json.coneOuterAngle;
    this.coneOuterGain = json.coneOuterGain;

    return json;
};
},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_boolean@0.0.1/src/index.js-=@*/
module.exports = isBoolean;


function isBoolean(value) {
    return typeof(value) === "boolean" || false;
}

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/mathf@0.0.3/src/index.js-=@*/
var keys = require(29),
    clamp = require(51),
    isNaNPolyfill = require(105);


var mathf = exports,

    NativeMath = global.Math,

    hasFloat32Array = typeof(Float32Array) !== "undefined",
    NativeFloat32Array = hasFloat32Array ? Float32Array : Array;


mathf.ArrayType = NativeFloat32Array;

mathf.PI = NativeMath.PI;
mathf.TAU = mathf.PI * 2;
mathf.TWO_PI = mathf.TAU;
mathf.HALF_PI = mathf.PI * 0.5;
mathf.FOURTH_PI = mathf.PI * 0.25;

mathf.EPSILON = Number.EPSILON || NativeMath.pow(2, -52);

mathf.TO_RADS = mathf.PI / 180;
mathf.TO_DEGS = 180 / mathf.PI;

mathf.E = NativeMath.E;
mathf.LN2 = NativeMath.LN2;
mathf.LN10 = NativeMath.LN10;
mathf.LOG2E = NativeMath.LOG2E;
mathf.LOG10E = NativeMath.LOG10E;
mathf.SQRT1_2 = NativeMath.SQRT1_2;
mathf.SQRT2 = NativeMath.SQRT2;

mathf.abs = NativeMath.abs;

mathf.acos = NativeMath.acos;
mathf.acosh = NativeMath.acosh || function acosh(x) {
    return mathf.log(x + mathf.sqrt(x * x - 1));
};
mathf.asin = NativeMath.asin;
mathf.asinh = NativeMath.asinh || function asinh(x) {
    if (x === -Infinity) {
        return x;
    } else {
        return mathf.log(x + mathf.sqrt(x * x + 1));
    }
};
mathf.atan = NativeMath.atan;
mathf.atan2 = NativeMath.atan2;
mathf.atanh = NativeMath.atanh || function atanh(x) {
    return mathf.log((1 + x) / (1 - x)) / 2;
};

mathf.cbrt = NativeMath.cbrt || function cbrt(x) {
    var y = mathf.pow(mathf.abs(x), 1 / 3);
    return x < 0 ? -y : y;
};

mathf.ceil = NativeMath.ceil;

mathf.clz32 = NativeMath.clz32 || function clz32(value) {
    value = +value >>> 0;
    return value ? 32 - value.toString(2).length : 32;
};

mathf.cos = NativeMath.cos;
mathf.cosh = NativeMath.cosh || function cosh(x) {
    return (mathf.exp(x) + mathf.exp(-x)) / 2;
};

mathf.exp = NativeMath.exp;

mathf.expm1 = NativeMath.expm1 || function expm1(x) {
    return mathf.exp(x) - 1;
};

mathf.floor = NativeMath.floor;
mathf.fround = NativeMath.fround || (hasFloat32Array ?
    function fround(x) {
        return new NativeFloat32Array([x])[0];
    } :
    function fround(x) {
        return x;
    }
);

mathf.hypot = NativeMath.hypot || function hypot() {
    var y = 0,
        i = -1,
        il = arguments.length - 1,
        value;

    while (i++ < il) {
        value = arguments[i];

        if (value === Infinity || value === -Infinity) {
            return Infinity;
        } else {
            y += value * value;
        }
    }

    return mathf.sqrt(y);
};

mathf.imul = NativeMath.imul || function imul(a, b) {
    var ah = (a >>> 16) & 0xffff,
        al = a & 0xffff,
        bh = (b >>> 16) & 0xffff,
        bl = b & 0xffff;

    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
};

mathf.log = NativeMath.log;

mathf.log1p = NativeMath.log1p || function log1p(x) {
    return mathf.log(1 + x);
};

mathf.log10 = NativeMath.log10 || function log10(x) {
    return mathf.log(x) / mathf.LN10;
};

mathf.log2 = NativeMath.log2 || function log2(x) {
    return mathf.log(x) / mathf.LN2;
};

mathf.fac = function fac(n) {
    if (n < 2) {
        return 1;
    } else {
        return n * fac(n - 1);
    }
};

mathf.max = NativeMath.max;
mathf.min = NativeMath.min;

mathf.pow = NativeMath.pow;

mathf.random = NativeMath.random;
mathf.round = NativeMath.round;

mathf.sign = NativeMath.sign || function sign(x) {
    x = +x;
    if (x === 0 || isNaNPolyfill(x)) {
        return x;
    } else {
        return x > 0 ? 1 : -1;
    }
};

mathf.sin = NativeMath.sin;
mathf.sinh = NativeMath.sinh || function sinh(x) {
    return (mathf.exp(x) - mathf.exp(-x)) / 2;
};

mathf.sqrt = NativeMath.sqrt;

mathf.tan = NativeMath.tan;
mathf.tanh = NativeMath.tanh || function tanh(x) {
    if (x === Infinity) {
        return 1;
    } else if (x === -Infinity) {
        return -1;
    } else {
        return (mathf.exp(x) - mathf.exp(-x)) / (mathf.exp(x) + mathf.exp(-x));
    }
};

mathf.trunc = NativeMath.trunc || function trunc(x) {
    return x < 0 ? mathf.ceil(x) : mathf.floor(x);
};

mathf.equals = function(a, b, e) {
    return mathf.abs(a - b) < (e !== void(0) ? e : mathf.EPSILON);
};

mathf.modulo = function(a, b) {
    var r = a % b;
    return (r * b < 0) ? r + b : r;
};

mathf.standardRadian = function(x) {
    return mathf.modulo(x, mathf.TWO_PI);
};

mathf.standardAngle = function(x) {
    return mathf.modulo(x, 360);
};

mathf.snap = function(x, y) {
    var m = x % y;
    return m < (y * 0.5) ? x - m : x + y - m;
};

mathf.clamp = clamp;

mathf.clampBottom = function(x, min) {
    return x < min ? min : x;
};

mathf.clampTop = function(x, max) {
    return x > max ? max : x;
};

mathf.clamp01 = function(x) {
    if (x < 0) {
        return 0;
    } else if (x > 1) {
        return 1;
    } else {
        return x;
    }
};

mathf.truncate = function(x, n) {
    var p = mathf.pow(10, n),
        num = x * p;

    return (num < 0 ? mathf.ceil(num) : mathf.floor(num)) / p;
};

mathf.lerp = function(a, b, x) {
    return a + (b - a) * x;
};

mathf.lerpRadian = function(a, b, x) {
    return mathf.standardRadian(a + (b - a) * x);
};

mathf.lerpAngle = function(a, b, x) {
    return mathf.standardAngle(a + (b - a) * x);
};

mathf.lerpCos = function(a, b, x) {
    var ft = x * mathf.PI,
        f = (1 - mathf.cos(ft)) * 0.5;

    return a * (1 - f) + b * f;
};

mathf.lerpCubic = function(v0, v1, v2, v3, x) {
    var P, Q, R, S, Px, Qx, Rx;

    v0 = v0 || v1;
    v3 = v3 || v2;

    P = (v3 - v2) - (v0 - v1);
    Q = (v0 - v1) - P;
    R = v2 - v0;
    S = v1;

    Px = P * x;
    Qx = Q * x;
    Rx = R * x;

    return (Px * Px * Px) + (Qx * Qx) + Rx + S;
};

mathf.smoothStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * (3 - 2 * x);
        }
    }
};

mathf.smootherStep = function(x, min, max) {
    if (x <= min) {
        return 0;
    } else {
        if (x >= max) {
            return 1;
        } else {
            x = (x - min) / (max - min);
            return x * x * x * (x * (x * 6 - 15) + 10);
        }
    }
};

mathf.pingPong = function(x, length) {
    length = +length || 1;
    return length - mathf.abs(x % (2 * length) - length);
};

mathf.degsToRads = function(x) {
    return mathf.standardRadian(x * mathf.TO_RADS);
};

mathf.radsToDegs = function(x) {
    return mathf.standardAngle(x * mathf.TO_DEGS);
};

mathf.randInt = function(min, max) {
    return mathf.round(min + (mathf.random() * (max - min)));
};

mathf.randFloat = function(min, max) {
    return min + (mathf.random() * (max - min));
};

mathf.randSign = function() {
    return mathf.random() < 0.5 ? 1 : -1;
};

mathf.shuffle = function(array) {
    var i = array.length,
        j, x;

    while (i) {
        j = (mathf.random() * i--) | 0;
        x = array[i];
        array[i] = array[j];
        array[j] = x;
    }

    return array;
};

mathf.randArg = function() {
    return arguments[(mathf.random() * arguments.length) | 0];
};

mathf.randChoice = function(array) {
    return array[(mathf.random() * array.length) | 0];
};

mathf.randChoiceObject = function(object) {
    var objectKeys = keys(object);
    return object[objectKeys[(mathf.random() * objectKeys.length) | 0]];
};

mathf.isPowerOfTwo = function(x) {
    return (x & -x) === x;
};

mathf.floorPowerOfTwo = function(x) {
    var i = 2,
        prev;

    while (i < x) {
        prev = i;
        i *= 2;
    }

    return prev;
};

mathf.ceilPowerOfTwo = function(x) {
    var i = 2;

    while (i < x) {
        i *= 2;
    }

    return i;
};

var n225 = 0.39269908169872414,
    n675 = 1.1780972450961724,
    n1125 = 1.9634954084936207,
    n1575 = 2.748893571891069,
    n2025 = 3.5342917352885173,
    n2475 = 4.319689898685966,
    n2925 = 5.105088062083414,
    n3375 = 5.8904862254808625,

    RIGHT = "right",
    UP_RIGHT = "up_right",
    UP = "up",
    UP_LEFT = "up_left",
    LEFT = "left",
    DOWN_LEFT = "down_left",
    DOWN = "down",
    DOWN_RIGHT = "down_right";

mathf.directionAngle = function(a) {
    a = mathf.standardRadian(a);

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};

mathf.direction = function(x, y) {
    var a = mathf.standardRadian(mathf.atan2(y, x));

    return (
        (a >= n225 && a < n675) ? UP_RIGHT :
        (a >= n675 && a < n1125) ? UP :
        (a >= n1125 && a < n1575) ? UP_LEFT :
        (a >= n1575 && a < n2025) ? LEFT :
        (a >= n2025 && a < n2475) ? DOWN_LEFT :
        (a >= n2475 && a < n2925) ? DOWN :
        (a >= n2925 && a < n3375) ? DOWN_RIGHT :
        RIGHT
    );
};

},
function(require, exports, module, undefined, global) {
/*@=-@nathanfaucett/is_nan@0.0.2/src/index.js-=@*/
var isNumber = require(16);


module.exports = Number.isNaN || function isNaN(value) {
    return isNumber(value) && value !== value;
};

}], {}, void(0), (new Function("return this;"))()));
