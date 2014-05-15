(function(){


// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(12923);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([116,114,97,110,115,108,97,116,101,0,0,0,0,0,0,0,116,114,97,110,115,105,116,105,111,110,0,0,0,0,0,0,50,0,0,0,0,0,0,0,0,0,0,0,40,0,0,0,216,33,0,0,232,33,0,0,112,11,0,0,0,0,0,0,48,0,0,0,112,0,0,0,136,0,0,0,160,0,0,0,184,0,0,0,208,0,0,0,232,0,0,0,0,1,0,0,24,1,0,0,0,0,0,0,0,0,0,0,184,31,0,0,192,31,0,0,216,31,0,0,96,14,0,0,0,0,0,0,1,0,0,0,160,29,0,0,168,29,0,0,184,29,0,0,112,11,0,0,0,0,0,0,1,0,0,0,136,27,0,0,144,27,0,0,160,27,0,0,112,11,0,0,0,0,0,0,1,0,0,0,104,25,0,0,112,25,0,0,136,25,0,0,112,11,0,0,0,0,0,0,1,0,0,0,64,12,0,0,72,12,0,0,96,12,0,0,96,14,0,0,0,0,0,0,1,0,0,0,80,9,0,0,88,9,0,0,112,9,0,0,112,11,0,0,0,0,0,0,2,0,0,0,208,5,0,0,216,5,0,0,224,5,0,0,224,7,0,0,0,0,0,0,1,0,0,0,48,1,0,0,56,1,0,0,72,1,0,0,72,3,0,0,0,0,0,0,97,104,110,0,0,0,0,0,65,104,110,109,97,116,97,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,46,0,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,183,17,0,0,45,0,0,0,175,17,0,0,194,17,0,0,48,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,110,17,0,0,60,0,0,0,61,0,0,0,62,0,0,0,249,17,0,0,64,0,0,0,7,17,0,0,240,17,0,0,184,17,0,0,3,17,0,0,2,17,0,0,0,17,0,0,76,17,0,0,101,17,0,0,47,0,0,0,158,17,0,0,117,17,0,0,105,17,0,0,171,17,0,0,235,17,0,0,91,0,0,0,93,0,0,0,6,17,0,0,5,17,0,0,12,17,0,0,89,17,0,0,39,0,0,0,168,17,0,0,64,17,0,0,174,17,0,0,59,0,0,0,189,17,0,0,44,0,0,0,92,0,0,0,63,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,7,17,0,0,188,17,0,0,184,17,0,0,3,17,0,0,2,17,0,0,0,17,0,0,11,17,0,0,101,17,0,0,115,17,0,0,97,17,0,0,117,17,0,0,105,17,0,0,171,17,0,0,186,17,0,0,109,17,0,0,114,17,0,0,6,17,0,0,5,17,0,0,12,17,0,0,18,17,0,0,99,17,0,0,168,17,0,0,9,17,0,0,174,17,0,0,103,17,0,0,189,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,0,0,0,0,80,0,0,0,80,3,0,0,3,17,0,17,4,17,0,0,11,17,0,17,1,17,0,0,18,17,0,17,15,17,0,0,9,17,2,17,10,17,0,0,0,17,3,17,4,17,0,0,12,17,3,17,13,17,0,0,18,17,3,17,16,17,0,0,12,17,7,17,8,17,0,0,18,17,7,17,17,17,0,0,2,17,9,17,10,17,0,0,0,17,11,17,1,17,0,0,3,17,12,17,13,17,0,0,7,17,12,17,8,17,0,0,18,17,12,17,14,17,0,0,0,17,18,17,15,17,0,0,3,17,18,17,16,17,0,0,7,17,18,17,17,17,0,0,12,17,18,17,14,17,0,0,105,17,97,17,106,17,0,0,117,17,97,17,98,17,0,0,105,17,98,17,107,17,0,0,117,17,99,17,100,17,0,0,110,17,101,17,111,17,0,0,117,17,101,17,102,17,0,0,110,17,102,17,112,17,0,0,117,17,103,17,104,17,0,0,97,17,105,17,106,17,0,0,117,17,105,17,108,17,0,0,117,17,106,17,107,17,0,0,97,17,108,17,107,17,0,0,101,17,110,17,111,17,0,0,117,17,110,17,113,17,0,0,117,17,111,17,112,17,0,0,101,17,113,17,112,17,0,0,117,17,115,17,116,17,0,0,97,17,117,17,98,17,0,0,99,17,117,17,100,17,0,0,101,17,117,17,102,17,0,0,103,17,117,17,104,17,0,0,105,17,117,17,108,17,0,0,110,17,117,17,113,17,0,0,115,17,117,17,116,17,0,0,175,17,168,17,176,17,0,0,186,17,168,17,170,17,0,0,188,17,168,17,169,17,0,0,194,17,168,17,191,17,0,0,186,17,171,17,187,17,0,0,189,17,171,17,172,17,0,0,194,17,171,17,173,17,0,0,175,17,174,17,206,17,0,0,194,17,174,17,192,17,0,0,168,17,175,17,176,17,0,0,174,17,175,17,206,17,0,0,183,17,175,17,177,17,0,0,184,17,175,17,178,17,0,0,186,17,175,17,179,17,0,0,194,17,175,17,182,17,0,0,194,17,178,17,181,17,0,0,174,17,182,17,180,17,0,0,184,17,182,17,181,17,0,0,175,17,183,17,177,17,0,0,175,17,184,17,178,17,0,0,186,17,184,17,185,17,0,0,194,17,184,17,193,17,0,0,168,17,186,17,170,17,0,0,171,17,186,17,187,17,0,0,175,17,186,17,179,17,0,0,184,17,186,17,185,17,0,0,168,17,188,17,169,17,0,0,171,17,189,17,172,17,0,0,194,17,189,17,190,17,0,0,175,17,192,17,180,17,0,0,175,17,193,17,181,17,0,0,168,17,194,17,191,17,0,0,171,17,194,17,173,17,0,0,174,17,194,17,192,17,0,0,175,17,194,17,182,17,0,0,184,17,194,17,193,17,0,0,189,17,194,17,190,17,0,0,194,17,206,17,180,17,0,0,114,111,0,0,0,0,0,0,82,111,109,97,106,97,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,59,0,0,0,60,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,97,17,0,0,7,17,0,0,14,17,0,0,3,17,0,0,102,17,0,0,17,17,0,0,0,17,0,0,18,17,0,0,117,17,0,0,12,17,0,0,15,17,0,0,5,17,0,0,6,17,0,0,2,17,0,0,105,17,0,0,17,17,0,0,15,17,0,0,5,17,0,0,9,17,0,0,16,17,0,0,110,17,0,0,7,17,0,0,110,17,0,0,12,17,0,0,117,17,0,0,12,17,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,97,17,0,0,7,17,0,0,14,17,0,0,3,17,0,0,102,17,0,0,17,17,0,0,0,17,0,0,18,17,0,0,117,17,0,0,12,17,0,0,15,17,0,0,5,17,0,0,6,17,0,0,2,17,0,0,105,17,0,0,17,17,0,0,15,17,0,0,5,17,0,0,9,17,0,0,16,17,0,0,110,17,0,0,7,17,0,0,110,17,0,0,170,17,0,0,117,17,0,0,12,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,0,0,0,0,45,0,0,0,232,7,0,0,0,17,0,17,1,17,0,0,3,17,3,17,4,17,0,0,7,17,7,17,8,17,0,0,9,17,9,17,10,17,0,0,12,17,12,17,13,17,0,0,18,17,14,17,14,17,0,0,102,17,97,17,98,17,0,0,117,17,97,17,98,17,0,0,102,17,99,17,100,17,0,0,117,17,99,17,100,17,0,0,105,17,102,17,101,17,0,0,110,17,102,17,115,17,0,0,105,17,104,17,103,17,0,0,97,17,105,17,106,17,0,0,98,17,105,17,107,17,0,0,117,17,105,17,108,17,0,0,102,17,106,17,107,17,0,0,117,17,106,17,107,17,0,0,97,17,110,17,106,17,0,0,101,17,110,17,111,17,0,0,102,17,110,17,112,17,0,0,105,17,110,17,111,17,0,0,117,17,110,17,113,17,0,0,105,17,112,17,111,17,0,0,117,17,115,17,116,17,0,0,97,17,117,17,99,17,0,0,98,17,117,17,100,17,0,0,101,17,117,17,103,17,0,0,102,17,117,17,104,17,0,0,105,17,117,17,109,17,0,0,110,17,117,17,114,17,0,0,168,17,168,17,169,17,0,0,186,17,168,17,170,17,0,0,168,17,171,17,188,17,0,0,189,17,171,17,172,17,0,0,194,17,171,17,173,17,0,0,168,17,175,17,176,17,0,0,183,17,175,17,177,17,0,0,184,17,175,17,178,17,0,0,186,17,175,17,179,17,0,0,192,17,175,17,180,17,0,0,193,17,175,17,181,17,0,0,194,17,175,17,182,17,0,0,186,17,184,17,185,17,0,0,186,17,186,17,187,17,0,0,51,50,0,0,0,0,0,0,83,101,98,101,111,108,115,105,107,32,68,117,98,101,111,108,32,76,97,121,111,117,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,59,0,0,0,60,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,183,17,0,0,114,17,0,0,190,17,0,0,188,17,0,0,174,17,0,0,175,17,0,0,194,17,0,0,105,17,0,0,99,17,0,0,101,17,0,0,97,17,0,0,117,17,0,0,115,17,0,0,110,17,0,0,100,17,0,0,104,17,0,0,184,17,0,0,168,17,0,0,171,17,0,0,186,17,0,0,103,17,0,0,193,17,0,0,189,17,0,0,192,17,0,0,109,17,0,0,191,17,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,6,17,0,0,114,17,0,0,14,17,0,0,11,17,0,0,3,17,0,0,5,17,0,0,18,17,0,0,105,17,0,0,99,17,0,0,101,17,0,0,97,17,0,0,117,17,0,0,115,17,0,0,110,17,0,0,98,17,0,0,102,17,0,0,7,17,0,0,0,17,0,0,2,17,0,0,9,17,0,0,103,17,0,0,17,17,0,0,12,17,0,0,16,17,0,0,109,17,0,0,15,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,59,32,0,0,0,0,0,0,25,0,0,0,120,11,0,0,0,17,0,17,1,17,0,0,3,17,3,17,4,17,0,0,7,17,7,17,8,17,0,0,9,17,9,17,10,17,0,0,12,17,12,17,13,17,0,0,97,17,105,17,106,17,0,0,98,17,105,17,107,17,0,0,117,17,105,17,108,17,0,0,101,17,110,17,111,17,0,0,102,17,110,17,112,17,0,0,117,17,110,17,113,17,0,0,117,17,115,17,116,17,0,0,168,17,168,17,169,17,0,0,186,17,168,17,170,17,0,0,189,17,171,17,172,17,0,0,194,17,171,17,173,17,0,0,168,17,175,17,176,17,0,0,183,17,175,17,177,17,0,0,184,17,175,17,178,17,0,0,186,17,175,17,179,17,0,0,192,17,175,17,180,17,0,0,193,17,175,17,181,17,0,0,194,17,175,17,182,17,0,0,186,17,184,17,185,17,0,0,186,17,186,17,187,17,0,0,51,121,0,0,0,0,0,0,83,101,98,101,111,108,115,105,107,32,89,101,116,103,101,117,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,189,17,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,16,17,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,105,17,0,0,15,17,0,0,194,17,0,0,187,17,0,0,184,17,0,0,109,17,0,0,114,17,0,0,99,17,0,0,104,17,0,0,116,17,0,0,110,17,0,0,58,0,0,0,7,17,0,0,60,17,0,0,61,0,0,0,62,17,0,0,63,0,0,0,235,17,0,0,174,17,0,0,33,0,0,0,177,17,0,0,176,17,0,0,191,17,0,0,169,17,0,0,158,17,0,0,39,0,0,0,84,17,0,0,76,17,0,0,78,17,0,0,80,17,0,0,89,17,0,0,64,17,0,0,85,17,0,0,62,0,0,0,193,17,0,0,100,17,0,0,173,17,0,0,59,0,0,0,183,0,0,0,182,17,0,0,192,17,0,0,185,17,0,0,60,0,0,0,190,17,0,0,91,0,0,0,92,0,0,0,93,0,0,0,76,17,0,0,95,0,0,0,249,17,0,0,188,17,0,0,110,17,0,0,102,17,0,0,117,17,0,0,103,17,0,0,97,17,0,0,115,17,0,0,2,17,0,0,6,17,0,0,11,17,0,0,0,17,0,0,12,17,0,0,18,17,0,0,9,17,0,0,14,17,0,0,17,17,0,0,186,17,0,0,98,17,0,0,171,17,0,0,101,17,0,0,3,17,0,0,105,17,0,0,175,17,0,0,168,17,0,0,5,17,0,0,183,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,240,17,0,0,0,0,0,0,96,1,0,0,104,14,0,0,0,17,0,17,1,17,0,0,3,17,0,17,90,17,0,0,0,17,2,17,19,17,0,0,2,17,2,17,20,17,0,0,3,17,2,17,21,17,0,0,7,17,2,17,22,17,0,0,9,17,2,17,91,17,0,0,12,17,2,17,92,17,0,0,18,17,2,17,93,17,0,0,0,17,3,17,23,17,0,0,3,17,3,17,4,17,0,0,5,17,3,17,94,17,0,0,6,17,3,17,96,169,0,0,7,17,3,17,97,169,0,0,9,17,3,17,98,169,0,0,12,17,3,17,99,169,0,0,0,17,5,17,100,169,0,0,1,17,5,17,101,169,0,0,2,17,5,17,24,17,0,0,3,17,5,17,102,169,0,0,4,17,5,17,103,169,0,0,5,17,5,17,25,17,0,0,6,17,5,17,104,169,0,0,7,17,5,17,105,169,0,0,8,17,5,17,106,169,0,0,9,17,5,17,108,169,0,0,11,17,5,17,27,17,0,0,12,17,5,17,109,169,0,0,15,17,5,17,110,169,0,0,18,17,5,17,26,17,0,0,43,17,5,17,107,169,0,0,0,17,6,17,111,169,0,0,3,17,6,17,112,169,0,0,7,17,6,17,28,17,0,0,9,17,6,17,113,169,0,0,11,17,6,17,29,17,0,0,0,17,7,17,30,17,0,0,2,17,7,17,31,17,0,0,3,17,7,17,32,17,0,0,7,17,7,17,8,17,0,0,9,17,7,17,33,17,0,0,10,17,7,17,37,17,0,0,11,17,7,17,43,17,0,0,12,17,7,17,39,17,0,0,14,17,7,17,40,17,0,0,15,17,7,17,115,169,0,0,16,17,7,17,41,17,0,0,17,17,7,17,42,17,0,0,18,17,7,17,116,169,0,0,43,17,7,17,44,17,0,0,45,17,7,17,34,17,0,0,47,17,7,17,35,17,0,0,50,17,7,17,36,17,0,0,54,17,7,17,38,17,0,0,57,17,7,17,114,169,0,0,11,17,8,17,44,17,0,0,0,17,9,17,45,17,0,0,2,17,9,17,46,17,0,0,3,17,9,17,47,17,0,0,5,17,9,17,48,17,0,0,6,17,9,17,49,17,0,0,7,17,9,17,50,17,0,0,9,17,9,17,10,17,0,0,10,17,9,17,52,17,0,0,11,17,9,17,53,17,0,0,12,17,9,17,54,17,0,0,14,17,9,17,55,17,0,0,15,17,9,17,56,17,0,0,16,17,9,17,57,17,0,0,17,17,9,17,58,17,0,0,18,17,9,17,59,17,0,0,30,17,9,17,51,17,0,0,50,17,9,17,117,169,0,0,7,17,10,17,117,169,0,0,9,17,10,17,52,17,0,0,0,17,11,17,65,17,0,0,3,17,11,17,66,17,0,0,5,17,11,17,118,169,0,0,6,17,11,17,67,17,0,0,7,17,11,17,68,17,0,0,9,17,11,17,69,17,0,0,11,17,11,17,71,17,0,0,12,17,11,17,72,17,0,0,14,17,11,17,73,17,0,0,16,17,11,17,74,17,0,0,17,17,11,17,75,17,0,0,18,17,11,17,119,169,0,0,64,17,11,17,70,17,0,0,11,17,12,17,77,17,0,0,12,17,12,17,13,17,0,0,18,17,13,17,120,169,0,0,15,17,14,17,82,17,0,0,18,17,14,17,83,17,0,0,16,17,16,17,121,169,0,0,7,17,17,17,86,17,0,0,11,17,17,17,87,17,0,0,18,17,17,17,122,169,0,0,9,17,18,17,123,169,0,0,18,17,18,17,88,17,0,0,0,17,33,17,34,17,0,0,3,17,33,17,35,17,0,0,7,17,33,17,36,17,0,0,9,17,33,17,37,17,0,0,12,17,33,17,38,17,0,0,16,17,33,17,114,169,0,0,0,17,50,17,51,17,0,0,60,17,60,17,61,17,0,0,62,17,62,17,63,17,0,0,78,17,78,17,79,17,0,0,80,17,80,17,81,17,0,0,89,17,89,17,124,169,0,0,97,17,97,17,158,17,0,0,105,17,97,17,118,17,0,0,110,17,97,17,119,17,0,0,115,17,97,17,163,17,0,0,117,17,97,17,98,17,0,0,105,17,99,17,120,17,0,0,109,17,99,17,121,17,0,0,110,17,99,17,164,17,0,0,117,17,99,17,100,17,0,0,105,17,101,17,122,17,0,0,110,17,101,17,123,17,0,0,115,17,101,17,124,17,0,0,117,17,101,17,102,17,0,0,99,17,103,17,165,17,0,0,105,17,103,17,125,17,0,0,110,17,103,17,126,17,0,0,117,17,103,17,104,17,0,0,97,17,105,17,106,17,0,0,98,17,105,17,107,17,0,0,99,17,105,17,166,17,0,0,100,17,105,17,167,17,0,0,101,17,105,17,127,17,0,0,102,17,105,17,128,17,0,0,103,17,105,17,176,215,0,0,104,17,105,17,129,17,0,0,105,17,105,17,130,17,0,0,110,17,105,17,131,17,0,0,117,17,105,17,108,17,0,0,117,17,106,17,107,17,0,0,97,17,109,17,178,215,0,0,98,17,109,17,179,215,0,0,99,17,109,17,132,17,0,0,100,17,109,17,133,17,0,0,101,17,109,17,180,215,0,0,103,17,109,17,134,17,0,0,105,17,109,17,135,17,0,0,117,17,109,17,136,17,0,0,97,17,110,17,137,17,0,0,98,17,110,17,138,17,0,0,101,17,110,17,111,17,0,0,102,17,110,17,112,17,0,0,103,17,110,17,181,215,0,0,104,17,110,17,140,17,0,0,110,17,110,17,141,17,0,0,117,17,110,17,113,17,0,0,124,17,110,17,139,17,0,0,196,215,110,17,182,215,0,0,115,17,111,17,139,17,0,0,117,17,111,17,112,17,0,0,117,17,113,17,182,215,0,0,97,17,114,17,142,17,0,0,98,17,114,17,183,215,0,0,101,17,114,17,143,17,0,0,102,17,114,17,144,17,0,0,103,17,114,17,145,17,0,0,104,17,114,17,146,17,0,0,105,17,114,17,184,215,0,0,110,17,114,17,147,17,0,0,117,17,114,17,148,17,0,0,97,17,115,17,185,215,0,0,101,17,115,17,186,215,0,0,102,17,115,17,187,215,0,0,105,17,115,17,188,215,0,0,110,17,115,17,149,17,0,0,115,17,115,17,150,17,0,0,117,17,115,17,116,17,0,0,110,17,116,17,151,17,0,0,97,17,117,17,152,17,0,0,99,17,117,17,153,17,0,0,100,17,117,17,190,215,0,0,103,17,117,17,191,215,0,0,104,17,117,17,192,215,0,0,105,17,117,17,154,17,0,0,109,17,117,17,194,215,0,0,110,17,117,17,155,17,0,0,114,17,117,17,195,215,0,0,115,17,117,17,156,17,0,0,117,17,117,17,196,215,0,0,120,17,117,17,189,215,0,0,158,17,117,17,157,17,0,0,117,17,130,17,177,215,0,0,105,17,153,17,189,215,0,0,117,17,154,17,193,215,0,0,97,17,158,17,197,215,0,0,101,17,158,17,159,17,0,0,102,17,158,17,198,215,0,0,110,17,158,17,160,17,0,0,117,17,158,17,161,17,0,0,158,17,158,17,162,17,0,0,168,17,168,17,169,17,0,0,171,17,168,17,250,17,0,0,175,17,168,17,195,17,0,0,184,17,168,17,251,17,0,0,186,17,168,17,170,17,0,0,190,17,168,17,252,17,0,0,191,17,168,17,253,17,0,0,194,17,168,17,254,17,0,0,231,17,168,17,196,17,0,0,168,17,170,17,196,17,0,0,168,17,171,17,197,17,0,0,171,17,171,17,255,17,0,0,174,17,171,17,198,17,0,0,175,17,171,17,203,215,0,0,186,17,171,17,199,17,0,0,189,17,171,17,172,17,0,0,190,17,171,17,204,215,0,0,192,17,171,17,201,17,0,0,194,17,171,17,173,17,0,0,235,17,171,17,200,17,0,0,168,17,174,17,202,17,0,0,174,17,174,17,205,215,0,0,175,17,174,17,203,17,0,0,184,17,174,17,207,215,0,0,186,17,174,17,208,215,0,0,189,17,174,17,210,215,0,0,190,17,174,17,211,215,0,0,192,17,174,17,212,215,0,0,231,17,174,17,209,215,0,0,207,215,174,17,206,215,0,0,168,17,175,17,176,17,0,0,169,17,175,17,213,215,0,0,170,17,175,17,204,17,0,0,171,17,175,17,205,17,0,0,174,17,175,17,206,17,0,0,175,17,175,17,208,17,0,0,183,17,175,17,177,17,0,0,184,17,175,17,178,17,0,0,185,17,175,17,211,17,0,0,186,17,175,17,179,17,0,0,187,17,175,17,214,17,0,0,188,17,175,17,221,215,0,0,191,17,175,17,216,17,0,0,192,17,175,17,180,17,0,0,193,17,175,17,181,17,0,0,194,17,175,17,182,17,0,0,216,17,175,17,215,215,0,0,218,17,175,17,209,17,0,0,221,17,175,17,210,17,0,0,225,17,175,17,216,215,0,0,228,17,175,17,218,215,0,0,229,17,175,17,212,17,0,0,230,17,175,17,213,17,0,0,235,17,175,17,215,17,0,0,240,17,175,17,219,215,0,0,249,17,175,17,217,17,0,0,254,17,175,17,214,215,0,0,227,215,175,17,217,215,0,0,168,17,176,17,213,215,0,0,186,17,176,17,204,17,0,0,194,17,176,17,214,215,0,0,168,17,177,17,209,17,0,0,186,17,177,17,210,17,0,0,194,17,177,17,216,215,0,0,174,17,178,17,217,215,0,0,186,17,178,17,211,17,0,0,188,17,178,17,213,17,0,0,193,17,178,17,218,215,0,0,194,17,178,17,212,17,0,0,186,17,179,17,214,17,0,0,168,17,183,17,218,17,0,0,171,17,183,17,222,215,0,0,175,17,183,17,219,17,0,0,183,17,183,17,224,215,0,0,184,17,183,17,220,17,0,0,185,17,183,17,225,215,0,0,186,17,183,17,221,17,0,0,187,17,183,17,222,17,0,0,188,17,183,17,226,17,0,0,189,17,183,17,226,215,0,0,190,17,183,17,224,17,0,0,194,17,183,17,225,17,0,0,235,17,183,17,223,17,0,0,255,17,183,17,223,215,0,0,174,17,184,17,227,215,0,0,175,17,184,17,227,17,0,0,181,17,184,17,228,215,0,0,183,17,184,17,229,215,0,0,184,17,184,17,230,215,0,0,186,17,184,17,185,17,0,0,188,17,184,17,230,17,0,0,189,17,184,17,232,215,0,0,190,17,184,17,233,215,0,0,193,17,184,17,228,17,0,0,194,17,184,17,229,17,0,0,232,17,184,17,231,215,0,0,174,17,185,17,231,215,0,0,168,17,186,17,231,17,0,0,174,17,186,17,232,17,0,0,175,17,186,17,233,17,0,0,183,17,186,17,234,215,0,0,184,17,186,17,234,17,0,0,186,17,186,17,187,17,0,0,189,17,186,17,239,215,0,0,190,17,186,17,240,215,0,0,192,17,186,17,241,215,0,0,194,17,186,17,242,215,0,0,230,17,186,17,235,215,0,0,231,17,186,17,236,215,0,0,232,17,186,17,237,215,0,0,235,17,186,17,238,215,0,0,168,17,187,17,236,215,0,0,174,17,187,17,237,215,0,0,184,17,189,17,247,215,0,0,189,17,189,17,249,215,0,0,230,215,189,17,248,215,0,0,184,17,193,17,243,17,0,0,186,17,193,17,250,215,0,0,188,17,193,17,244,17,0,0,192,17,193,17,251,215,0,0,171,17,194,17,245,17,0,0,175,17,194,17,246,17,0,0,183,17,194,17,247,17,0,0,184,17,194,17,248,17,0,0,194,17,206,17,207,17,0,0,191,17,208,17,215,215,0,0,194,17,217,17,220,215,0,0,186,17,220,17,225,215,0,0,186,17,221,17,222,17,0,0,193,17,227,17,228,215,0,0,188,17,234,17,235,215,0,0,184,17,235,17,243,215,0,0,230,17,235,17,244,215,0,0,168,17,236,17,237,17,0,0,168,17,240,17,236,17,0,0,169,17,240,17,237,17,0,0,183,17,240,17,245,215,0,0,186,17,240,17,241,17,0,0,191,17,240,17,239,17,0,0,194,17,240,17,246,215,0,0,235,17,240,17,242,17,0,0,240,17,240,17,238,17,0,0,0,17,100,169,101,169,0,0,3,17,102,169,103,169,0,0,7,17,105,169,106,169,0,0,11,17,105,169,107,169,0,0,97,17,197,215,162,17,0,0,184,17,205,215,206,215,0,0,168,17,208,215,209,215,0,0,171,17,222,215,223,215,0,0,188,17,243,215,244,215,0,0,184,17,247,215,248,215,0,0,51,115,0,0,0,0,0,0,83,101,98,101,111,108,115,105,107,32,78,111,115,104,105,102,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,16,17,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,189,17,0,0,46,0,0,0,174,17,0,0,100,17,0,0,194,17,0,0,187,17,0,0,184,17,0,0,109,17,0,0,114,17,0,0,99,17,0,0,104,17,0,0,116,17,0,0,15,17,0,0,58,0,0,0,7,17,0,0,50,0,0,0,190,17,0,0,51,0,0,0,63,0,0,0,64,0,0,0,188,17,0,0,33,0,0,0,92,0,0,0,93,0,0,0,103,17,0,0,97,17,0,0,47,0,0,0,39,0,0,0,56,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,49,0,0,0,48,0,0,0,57,0,0,0,62,0,0,0,186,17,0,0,98,17,0,0,91,0,0,0,59,0,0,0,55,0,0,0,105,17,0,0,175,17,0,0,61,0,0,0,60,0,0,0,45,0,0,0,192,17,0,0,191,17,0,0,193,17,0,0,94,0,0,0,95,0,0,0,96,0,0,0,188,17,0,0,110,17,0,0,102,17,0,0,117,17,0,0,103,17,0,0,97,17,0,0,115,17,0,0,2,17,0,0,6,17,0,0,11,17,0,0,0,17,0,0,12,17,0,0,18,17,0,0,9,17,0,0,14,17,0,0,17,17,0,0,186,17,0,0,98,17,0,0,171,17,0,0,101,17,0,0,3,17,0,0,105,17,0,0,175,17,0,0,168,17,0,0,5,17,0,0,183,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,0,0,0,0,51,102,0,0,0,0,0,0,83,101,98,101,111,108,115,105,107,32,70,105,110,97,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,169,17,0,0,183,0,0,0,189,17,0,0,181,17,0,0,180,17,0,0,28,32,0,0,16,17,0,0,39,0,0,0,126,0,0,0,29,32,0,0,43,0,0,0,44,0,0,0,41,0,0,0,46,0,0,0,105,17,0,0,15,17,0,0,194,17,0,0,187,17,0,0,184,17,0,0,109,17,0,0,114,17,0,0,99,17,0,0,104,17,0,0,116,17,0,0,110,17,0,0,52,0,0,0,7,17,0,0,44,0,0,0,62,0,0,0,46,0,0,0,33,0,0,0,176,17,0,0,174,17,0,0,63,0,0,0,191,17,0,0,178,17,0,0,172,17,0,0,177,17,0,0,100,17,0,0,48,0,0,0,55,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,34,0,0,0,45,0,0,0,56,0,0,0,57,0,0,0,193,17,0,0,182,17,0,0,173,17,0,0,179,17,0,0,54,0,0,0,170,17,0,0,192,17,0,0,185,17,0,0,53,0,0,0,190,17,0,0,40,0,0,0,58,0,0,0,60,0,0,0,61,0,0,0,59,0,0,0,42,0,0,0,188,17,0,0,110,17,0,0,102,17,0,0,117,17,0,0,103,17,0,0,97,17,0,0,115,17,0,0,2,17,0,0,6,17,0,0,11,17,0,0,0,17,0,0,12,17,0,0,18,17,0,0,9,17,0,0,14,17,0,0,17,17,0,0,186,17,0,0,98,17,0,0,171,17,0,0,101,17,0,0,3,17,0,0,105,17,0,0,175,17,0,0,168,17,0,0,5,17,0,0,183,17,0,0,37,0,0,0,92,0,0,0,47,0,0,0,59,32,0,0,0,0,0,0,51,57,0,0,0,0,0,0,83,101,98,101,111,108,115,105,107,32,51,57,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,189,17,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,16,17,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,105,17,0,0,15,17,0,0,194,17,0,0,187,17,0,0,184,17,0,0,109,17,0,0,114,17,0,0,99,17,0,0,104,17,0,0,116,17,0,0,110,17,0,0,58,0,0,0,7,17,0,0,50,0,0,0,61,0,0,0,51,0,0,0,63,0,0,0,64,0,0,0,174,17,0,0,33,0,0,0,177,17,0,0,176,17,0,0,191,17,0,0,169,17,0,0,47,0,0,0,39,0,0,0,56,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,49,0,0,0,48,0,0,0,57,0,0,0,62,0,0,0,193,17,0,0,100,17,0,0,173,17,0,0,59,0,0,0,55,0,0,0,182,17,0,0,192,17,0,0,185,17,0,0,60,0,0,0,190,17,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,188,17,0,0,110,17,0,0,102,17,0,0,117,17,0,0,103,17,0,0,97,17,0,0,115,17,0,0,2,17,0,0,6,17,0,0,11,17,0,0,0,17,0,0,12,17,0,0,18,17,0,0,9,17,0,0,14,17,0,0,17,17,0,0,186,17,0,0,98,17,0,0,171,17,0,0,101,17,0,0,3,17,0,0,105,17,0,0,175,17,0,0,168,17,0,0,5,17,0,0,183,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,0,0,0,0,50,121,0,0,0,0,0,0,68,117,98,101,111,108,115,105,107,32,89,101,116,103,101,117,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,59,0,0,0,60,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,64,17,0,0,84,17,0,0,78,17,0,0,76,17,0,0,4,17,0,0,26,17,0,0,89,17,0,0,131,17,0,0,99,17,0,0,101,17,0,0,158,17,0,0,148,17,0,0,115,17,0,0,85,17,0,0,100,17,0,0,104,17,0,0,8,17,0,0,1,17,0,0,93,17,0,0,10,17,0,0,103,17,0,0,80,17,0,0,13,17,0,0,62,17,0,0,109,17,0,0,60,17,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,6,17,0,0,114,17,0,0,14,17,0,0,11,17,0,0,3,17,0,0,5,17,0,0,18,17,0,0,105,17,0,0,99,17,0,0,101,17,0,0,97,17,0,0,117,17,0,0,115,17,0,0,110,17,0,0,98,17,0,0,102,17,0,0,7,17,0,0,0,17,0,0,2,17,0,0,9,17,0,0,103,17,0,0,17,17,0,0,12,17,0,0,16,17,0,0,109,17,0,0,15,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,0,0,0,0,68,117,98,101,111,108,115,105,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,0,0,34,0,0,0,35,0,0,0,36,0,0,0,37,0,0,0,38,0,0,0,39,0,0,0,40,0,0,0,41,0,0,0,42,0,0,0,43,0,0,0,44,0,0,0,45,0,0,0,46,0,0,0,47,0,0,0,48,0,0,0,49,0,0,0,50,0,0,0,51,0,0,0,52,0,0,0,53,0,0,0,54,0,0,0,55,0,0,0,56,0,0,0,57,0,0,0,58,0,0,0,59,0,0,0,60,0,0,0,61,0,0,0,62,0,0,0,63,0,0,0,64,0,0,0,6,17,0,0,114,17,0,0,14,17,0,0,11,17,0,0,4,17,0,0,5,17,0,0,18,17,0,0,105,17,0,0,99,17,0,0,101,17,0,0,97,17,0,0,117,17,0,0,115,17,0,0,110,17,0,0,100,17,0,0,104,17,0,0,8,17,0,0,1,17,0,0,2,17,0,0,10,17,0,0,103,17,0,0,17,17,0,0,13,17,0,0,16,17,0,0,109,17,0,0,15,17,0,0,91,0,0,0,92,0,0,0,93,0,0,0,94,0,0,0,95,0,0,0,96,0,0,0,6,17,0,0,114,17,0,0,14,17,0,0,11,17,0,0,3,17,0,0,5,17,0,0,18,17,0,0,105,17,0,0,99,17,0,0,101,17,0,0,97,17,0,0,117,17,0,0,115,17,0,0,110,17,0,0,98,17,0,0,102,17,0,0,7,17,0,0,0,17,0,0,2,17,0,0,9,17,0,0,103,17,0,0,17,17,0,0,12,17,0,0,16,17,0,0,109,17,0,0,15,17,0,0,123,0,0,0,124,0,0,0,125,0,0,0,126,0,0,0,0,0,0,0,49,49,50,49,52,49,55,49,56,49,57,49,65,49,66,49,67,49,69,49,70,49,71,49,72,49,73,49,74,49,75,49,76,49,77,49,78,49,0,0,101,49,102,49,0,0,0,0,0,0,0,0,64,49,0,0,110,49,113,49,114,49,0,0,115,49,68,49,116,49,117,49,0,0,0,0,0,0,118,49,0,0,119,49,0,0,120,49,121,49,122,49,123,49,124,49,0,0,0,0,125,49,0,0,0,0,0,0,126,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,127,49,0,0,0,0,0,0,0,0,0,0,0,0,128,49,0,0,0,0,0,0,0,0,129,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,49,133,49,134,49,0,0,0,0,0,0,0,0,0,0,0,0,100,49,79,49,80,49,81,49,82,49,83,49,84,49,85,49,86,49,87,49,88,49,89,49,90,49,91,49,92,49,93,49,94,49,95,49,96,49,97,49,98,49,99,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,135,49,136,49,0,0,0,0,137,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,49,139,49,0,0,140,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,141,49,0,0,0,0,142,49,0,0,0,0,0,0,0,0,0,0,0,0,49,49,50,49,51,49,52,49,53,49,54,49,55,49,57,49,58,49,59,49,60,49,61,49,62,49,63,49,64,49,65,49,66,49,68,49,69,49,70,49,71,49,72,49,74,49,75,49,76,49,77,49,78,49,0,0,0,0,0,0,0,0,103,49,104,49,0,0,0,0,0,0,105,49,0,0,106,49,0,0,0,0,0,0,0,0,107,49,0,0,0,0,0,0,108,49,0,0,109,49,0,0,0,0,0,0,111,49,0,0,112,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,130,49,131,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,49,0,0,106,49,0,0,59,49,60,49,0,0,0,0,61,49,0,0,0,0,0,0,0,0,111,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,49,0,0,0,0,67,49,117,49,118,49,0,0,0,0,0,0,0,0,0,0,0,0,126,49,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,73,49,0,0,0,0,168,17,0,0,169,17,0,0,171,17,0,0,174,17,0,0,205,215,0,0,175,17,0,0,183,17,0,0,184,17,0,0,230,215,0,0,186,17,0,0,187,17,0,0,188,17,0,0,189,17,0,0,249,215,0,0,190,17,0,0,191,17,0,0,192,17,0,0,193,17,0,0,194,17,0,0,197,17,0,0,255,17,0,0,198,17,0,0,0,0,0,0,202,17,0,0,205,17,0,0,208,17,0,0,182,17,0,0,221,215,0,0,220,17,0,0,226,17,0,0,0,0,0,0,0,0,0,0,227,215,0,0,185,17,0,0,0,0,0,0,231,215,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,215,0,0,233,215,0,0,0,0,0,0,228,17,0,0,230,17,0,0,0,0,0,0,231,17,0,0,0,0,0,0,232,17,0,0,233,17,0,0,234,215,0,0,234,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,239,215,0,0,240,215,0,0,0,0,0,0,241,215,0,0,0,0,0,0,242,215,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,235,17,0,0,236,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,238,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,17], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([243,17,0,0,244,17,0,0,0,0,0,0,249,17,0,0,0,0,0,0,199,17,0,0,172,17,0,0,173,17,0,0,203,17,0,0,0,0,0,0,0,0,0,0,207,215,0,0,208,215,0,0,210,215,0,0,176,17,0,0,213,215,0,0,206,17,0,0,0,0,0,0,177,17,0,0,178,17,0,0,0,0,0,0,213,17,0,0,179,17,0,0,0,0,0,0,216,17,0,0,218,17,0,0,0,0,0,0,221,17,0,0,0,0,0,0,0,0,0,0,229,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,1,17,0,0,0,0,0,0,2,17,0,0,92,17,0,0,93,17,0,0,3,17,0,0,5,17,0,0,100,169,0,0,104,169,0,0,105,169,0,0,108,169,0,0,0,0,0,0,0,0,0,0,26,17,0,0,6,17,0,0,7,17,0,0,33,17,0,0,9,17,0,0,10,17,0,0,11,17,0,0,12,17,0,0,14,17,0,0,15,17,0,0,16,17,0,0,17,17,0,0,18,17,0,0,0,0,0,0,0,0,0,0,19,17,0,0,21,17,0,0,91,17,0,0,0,0,0,0,0,0,0,0,23,17,0,0,94,17,0,0,0,0,0,0,24,17,0,0,102,169,0,0,0,0,0,0,25,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,169,0,0,0,0,0,0,0,0,0,0,110,169,0,0,0,0,0,0,111,169,0,0,0,0,0,0,28,17,0,0,113,169,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,17,0,0,0,0,0,0,42,17,0,0,116,169,0,0,43,17,0,0,45,17,0,0,47,17,0,0,48,17,0,0,50,17,0,0,64,17,0,0,65,17,0,0,0,0,0,0,71,17,0,0,0,0,0,0,76,17,0,0,0,0,0,0,0,0,0,0,86,17,0,0,87,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,89,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,17,0,0,0,0,0,0,0,0,0,0,4,17,0,0,0,0,0,0,97,169,0,0,98,169,0,0,0,0,0,0,99,169,0,0,0,0,0,0,0,0,0,0,101,169,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,27,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,17,0,0,0,0,0,0,0,0,0,0,8,17,0,0,35,17,0,0,39,17,0,0,40,17,0,0,49,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,17,0,0,55,17,0,0,57,17,0,0,59,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,168,17,0,0,0,17,0,0,168,17,0,0,9,17,0,0,0,0,0,0,2,17,0,0,171,17,0,0,12,17,0,0,171,17,0,0,18,17,0,0,0,0,0,0,3,17,0,0,0,0,0,0,5,17,0,0,175,17,0,0,0,17,0,0,175,17,0,0,6,17,0,0,175,17,0,0,7,17,0,0,175,17,0,0,9,17,0,0,175,17,0,0,16,17,0,0,175,17,0,0,17,17,0,0,175,17,0,0,18,17,0,0,0,0,0,0,6,17,0,0,0,0,0,0,7,17,0,0,184,17,0,0,9,17,0,0,0,0,0,0,9,17,0,0,186,17,0,0,9,17,0,0,0,0,0,0,11,17,0,0,0,0,0,0,12,17,0,0,0,0,0,0,14,17,0,0,0,0,0,0,15,17,0,0,0,0,0,0,16,17,0,0,0,0,0,0,17,17,0,0,0,0,0,0,18,17,0,0,0,17,0,0,0,17,0,0,0,17,0,0,1,17,0,0,9,17,0,0,0,0,0,0,2,17,0,0,2,17,0,0,12,17,0,0,92,17,0,0,18,17,0,0,93,17,0,0,3,17,0,0,3,17,0,0,5,17,0,0,5,17,0,0,0,17,0,0,100,169,0,0,6,17,0,0,104,169,0,0,7,17,0,0,105,169,0,0,9,17,0,0,108,169,0,0,16,17,0,0,0,0,0,0,17,17,0,0,0,0,0,0,18,17,0,0,26,17,0,0,6,17,0,0,6,17,0,0,7,17,0,0,7,17,0,0,9,17,0,0,33,17,0,0,9,17,0,0,9,17,0,0,9,17,0,0,10,17,0,0,11,17,0,0,11,17,0,0,12,17,0,0,12,17,0,0,14,17,0,0,14,17,0,0,15,17,0,0,15,17,0,0,16,17,0,0,16,17,0,0,17,17,0,0,17,17,0,0,18,17,0,0,18,17,0,0,5,17,0,0,0,0,0,0,0,17,0,0,45,17,0,0,0,17,0,0,19,17,0,0,3,17,0,0,21,17,0,0,9,17,0,0,91,17,0,0,64,17,0,0,0,0,0,0,16,17,0,0,0,0,0,0,0,17,0,0,23,17,0,0,5,17,0,0,94,17,0,0,9,17,0,0,0,0,0,0,2,17,0,0,24,17,0,0,3,17,0,0,102,169,0,0,18,17,0,0,0,0,0,0,5,17,0,0,25,17,0,0,0,17,0,0,111,169,0,0,9,17,0,0,113,169,0,0,9,17,0,0,33,17,0,0,18,17,0,0,116,169,0,0,11,17,0,0,43,17,0,0,9,17,0,0,10,17,0,0,64,17,0,0,0,0,0,0,15,17,0,0,110,169,0,0,89,17,0,0,0,0,0,0,0,17,0,0,111,169,0,0,5,17,0,0,0,0,0,0,7,17,0,0,28,17,0,0,9,17,0,0,113,169,0,0,9,17,0,0,10,17,0,0,64,17,0,0,0,0,0,0,14,17,0,0,0,0,0,0,18,17,0,0,0,0,0,0,11,17,0,0,29,17,0,0,5,17,0,0,0,0,0,0,17,17,0,0,42,17,0,0,18,17,0,0,116,169,0,0,11,17,0,0,43,17,0,0,0,17,0,0,45,17,0,0,3,17,0,0,47,17,0,0,5,17,0,0,48,17,0,0,7,17,0,0,50,17,0,0,64,17,0,0,64,17,0,0,0,17,0,0,0,0,0,0,0,17,0,0,1,17,0,0,76,17,0,0,0,0,0,0,15,17,0,0,0,0,0,0,76,17,0,0,76,17,0,0,9,17,0,0,0,0,0,0,64,17,0,0,0,0,0,0,7,17,0,0,86,17,0,0,11,17,0,0,87,17,0,0,2,17,0,0,0,0,0,0,5,17,0,0,0,0,0,0,6,17,0,0,0,0,0,0,7,17,0,0,0,0,0,0,89,17,0,0,89,17,0,0,2,17,0,0,0,0,0,0,7,17,0,0,0,0,0,0,14,17,0,0,0,0,0,0,15,17,0,0,0,0,0,0,18,17,0,0,0,0,0,0,2,17,0,0,20,17,0,0,5,17,0,0,0,0,0,0,14,17,0,0,0,0,0,0,3,17,0,0,4,17,0,0,7,17,0,0,97,169,0,0,7,17,0,0,97,169,0,0,9,17,0,0,98,169,0,0,0,17,0,0,45,17,0,0,12,17,0,0,99,169,0,0,14,17,0,0,0,0,0,0,16,17,0,0,0,0,0,0,0,17,0,0,1,17,0,0,18,17,0,0,0,0,0,0,15,17,0,0,110,169,0,0,18,17,0,0,0,0,0,0,3,17,0,0,32,17,0,0,17,17,0,0,42,17,0,0,76,17,0,0,0,0,0,0,18,17,0,0,0,0,0,0,11,17,0,0,27,17,0,0,2,17,0,0,0,0,0,0,2,17,0,0,20,17,0,0,6,17,0,0,0,0,0,0,9,17,0,0,33,17,0,0,12,17,0,0,0,0,0,0,3,17,0,0,32,17,0,0,17,17,0,0,0,0,0,0,6,17,0,0,0,0,0,0,7,17,0,0,8,17,0,0,3,17,0,0,47,17,0,0,12,17,0,0,39,17,0,0,14,17,0,0,40,17,0,0,6,17,0,0,49,17,0,0,11,17,0,0,43,17,0,0,0,17,0,0,45,17,0,0,3,17,0,0,47,17,0,0,64,17,0,0,0,0,0,0,12,17,0,0,54,17,0,0,14,17,0,0,55,17,0,0,16,17,0,0,57,17,0,0,18,17,0,0,59,17,0,0,7,17,0,0,0,0,0,0,11,17,0,0,43,17,0,0,6,17,0,0,0,0,0,0,18,17,0,0,0,0,0,0,7,17,0,0,0,0,0,0,7,17,0,0,8,17,0,0,12,17,0,0,13,17,0,0,9,17,0,0,0,0,0,0,16,17,0,0,0,0,0,0,1,2,2,1,2,2,1,1,2,2,2,2,2,2,2,1,1,2,1,2,1,1,1,1,1,1,1,2,3,2,2,2,2,2,2,2,3,2,2,3,2,3,3,3,3,3,3,2,2,2,2,2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,1,2,3,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,3,2,2,3,2,2,2,3,3,3,3,3,3,2,3,2,2,3,2,3,2,2,3,2,2,3,2,2,2,3,3,3,2,2,2,2,2,2,3,2,2,2,3,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+10256);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_memset"] = _memset;

  function ___errno_location() {
      return ___errno_state;
    }

  function _abort() {
      Module['abort']();
    }

  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _isupper(chr) {
      return chr >= 65 && chr <= 90;
    }

   
  Module["_strlen"] = _strlen;

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

   
  Module["_tolower"] = _tolower;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function nullFunc_iiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'almost asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = +env.NaN, inf = +env.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var nullFunc_iiiii=env.nullFunc_iiiii;
  var nullFunc_iii=env.nullFunc_iii;
  var nullFunc_viiii=env.nullFunc_viiii;
  var invoke_iiiii=env.invoke_iiiii;
  var invoke_iii=env.invoke_iii;
  var invoke_viiii=env.invoke_viiii;
  var _fflush=env._fflush;
  var _abort=env._abort;
  var ___setErrNo=env.___setErrNo;
  var _sbrk=env._sbrk;
  var _time=env._time;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _sysconf=env._sysconf;
  var _isupper=env._isupper;
  var ___errno_location=env.___errno_location;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
STACKTOP = (STACKTOP + 7)&-8;
  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
  HEAP8[tempDoublePtr+4|0] = HEAP8[ptr+4|0];
  HEAP8[tempDoublePtr+5|0] = HEAP8[ptr+5|0];
  HEAP8[tempDoublePtr+6|0] = HEAP8[ptr+6|0];
  HEAP8[tempDoublePtr+7|0] = HEAP8[ptr+7|0];
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}

function setTempRet1(value) {
  value = value|0;
  tempRet1 = value;
}

function setTempRet2(value) {
  value = value|0;
  tempRet2 = value;
}

function setTempRet3(value) {
  value = value|0;
  tempRet3 = value;
}

function setTempRet4(value) {
  value = value|0;
  tempRet4 = value;
}

function setTempRet5(value) {
  value = value|0;
  tempRet5 = value;
}

function setTempRet6(value) {
  value = value|0;
  tempRet6 = value;
}

function setTempRet7(value) {
  value = value|0;
  tempRet7 = value;
}

function setTempRet8(value) {
  value = value|0;
  tempRet8 = value;
}

function setTempRet9(value) {
  value = value|0;
  tempRet9 = value;
}

function _hangul_combination_make_key($first,$second) {
 $first = $first|0;
 $second = $second|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $first;
 $1 = $second;
 $2 = $0;
 $3 = $2 << 16;
 $4 = $1;
 $5 = $3 | $4;
 STACKTOP = sp;return ($5|0);
}
function _hangul_combination_combine($combination,$first,$second) {
 $combination = $combination|0;
 $first = $first|0;
 $second = $second|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $key = 0, $res = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $key = sp;
 $1 = $combination;
 $2 = $first;
 $3 = $second;
 $4 = $1;
 $5 = ($4|0)==(0|0);
 if ($5) {
  $0 = 0;
  $20 = $0;
  STACKTOP = sp;return ($20|0);
 }
 $6 = $2;
 $7 = $3;
 $8 = (_hangul_combination_make_key($6,$7)|0);
 HEAP32[$key>>2] = $8;
 $9 = $1;
 $10 = (($9) + 4|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = $1;
 $13 = HEAP32[$12>>2]|0;
 $14 = (_bsearch($key,$11,$13,8,1)|0);
 $res = $14;
 $15 = $res;
 $16 = ($15|0)!=(0|0);
 if ($16) {
  $17 = $res;
  $18 = (($17) + 4|0);
  $19 = HEAP32[$18>>2]|0;
  $0 = $19;
  $20 = $0;
  STACKTOP = sp;return ($20|0);
 } else {
  $0 = 0;
  $20 = $0;
  STACKTOP = sp;return ($20|0);
 }
 return 0|0;
}
function _hangul_combination_cmp($p1,$p2) {
 $p1 = $p1|0;
 $p2 = $p2|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $item1 = 0, $item2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $p1;
 $2 = $p2;
 $3 = $1;
 $item1 = $3;
 $4 = $2;
 $item2 = $4;
 $5 = $item1;
 $6 = HEAP32[$5>>2]|0;
 $7 = $item2;
 $8 = HEAP32[$7>>2]|0;
 $9 = ($6>>>0)<($8>>>0);
 do {
  if ($9) {
   $0 = -1;
  } else {
   $10 = $item1;
   $11 = HEAP32[$10>>2]|0;
   $12 = $item2;
   $13 = HEAP32[$12>>2]|0;
   $14 = ($11>>>0)>($13>>>0);
   if ($14) {
    $0 = 1;
    break;
   } else {
    $0 = 0;
    break;
   }
  }
 } while(0);
 $15 = $0;
 STACKTOP = sp;return ($15|0);
}
function _hangul_ic_process($hic,$ascii) {
 $hic = $hic|0;
 $ascii = $ascii|0;
 var $$expand_i1_val = 0, $$expand_i1_val2 = 0, $$expand_i1_val4 = 0, $$expand_i1_val6 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $c = sp;
 $1 = $hic;
 $2 = $ascii;
 $3 = $1;
 $4 = ($3|0)==(0|0);
 if ($4) {
  $$expand_i1_val = 0;
  $0 = $$expand_i1_val;
  $$pre_trunc = $0;
  $46 = $$pre_trunc&1;
  STACKTOP = sp;return ($46|0);
 }
 $5 = $1;
 $6 = (($5) + 76|0);
 HEAP32[$6>>2] = 0;
 $7 = $1;
 $8 = (($7) + 332|0);
 HEAP32[$8>>2] = 0;
 $9 = $1;
 $10 = (($9) + 4|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = $2;
 $13 = (_hangul_keyboard_get_value($11,$12)|0);
 HEAP32[$c>>2] = $13;
 $14 = $1;
 $15 = (($14) + 844|0);
 $16 = HEAP32[$15>>2]|0;
 $17 = ($16|0)!=(0|0);
 if ($17) {
  $18 = $1;
  $19 = (($18) + 844|0);
  $20 = HEAP32[$19>>2]|0;
  $21 = $1;
  $22 = $2;
  $23 = $1;
  $24 = (($23) + 848|0);
  $25 = HEAP32[$24>>2]|0;
  FUNCTION_TABLE_viiii[$20 & 0]($21,$22,$c,$25);
 }
 $26 = $1;
 $27 = (($26) + 4|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = (_hangul_keyboard_get_type($28)|0);
 $30 = ($29|0)==(0);
 if ($30) {
  $31 = $1;
  $32 = HEAP32[$c>>2]|0;
  $33 = (_hangul_ic_process_jamo($31,$32)|0);
  $$expand_i1_val2 = $33&1;
  $0 = $$expand_i1_val2;
  $$pre_trunc = $0;
  $46 = $$pre_trunc&1;
  STACKTOP = sp;return ($46|0);
 }
 $34 = $1;
 $35 = (($34) + 4|0);
 $36 = HEAP32[$35>>2]|0;
 $37 = (_hangul_keyboard_get_type($36)|0);
 $38 = ($37|0)==(1);
 if ($38) {
  $39 = $1;
  $40 = HEAP32[$c>>2]|0;
  $41 = (_hangul_ic_process_jaso($39,$40)|0);
  $$expand_i1_val4 = $41&1;
  $0 = $$expand_i1_val4;
  $$pre_trunc = $0;
  $46 = $$pre_trunc&1;
  STACKTOP = sp;return ($46|0);
 } else {
  $42 = $1;
  $43 = $2;
  $44 = HEAP32[$c>>2]|0;
  $45 = (_hangul_ic_process_romaja($42,$43,$44)|0);
  $$expand_i1_val6 = $45&1;
  $0 = $$expand_i1_val6;
  $$pre_trunc = $0;
  $46 = $$pre_trunc&1;
  STACKTOP = sp;return ($46|0);
 }
 return 0|0;
}
function _hangul_keyboard_get_value($keyboard,$key) {
 $keyboard = $keyboard|0;
 $key = $key|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $keyboard;
 $2 = $key;
 $3 = $1;
 $4 = ($3|0)!=(0|0);
 if ($4) {
  $5 = $2;
  $6 = ($5|0)>=(0);
  if ($6) {
   $7 = $2;
   $8 = ($7|0)<(128);
   if ($8) {
    $9 = $2;
    $10 = $1;
    $11 = (($10) + 12|0);
    $12 = HEAP32[$11>>2]|0;
    $13 = (($12) + ($9<<2)|0);
    $14 = HEAP32[$13>>2]|0;
    $0 = $14;
    $15 = $0;
    STACKTOP = sp;return ($15|0);
   }
  }
 }
 $0 = 0;
 $15 = $0;
 STACKTOP = sp;return ($15|0);
}
function _hangul_keyboard_get_type($keyboard) {
 $keyboard = $keyboard|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $type = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $keyboard;
 $type = 0;
 $1 = $0;
 $2 = ($1|0)!=(0|0);
 if ($2) {
  $3 = $0;
  $4 = HEAP32[$3>>2]|0;
  $type = $4;
 }
 $5 = $type;
 STACKTOP = sp;return ($5|0);
}
function _hangul_ic_process_jamo($hic,$ch) {
 $hic = $hic|0;
 $ch = $ch|0;
 var $$expand_i1_val = 0, $$expand_i1_val10 = 0, $$expand_i1_val12 = 0, $$expand_i1_val14 = 0, $$expand_i1_val16 = 0, $$expand_i1_val18 = 0, $$expand_i1_val2 = 0, $$expand_i1_val20 = 0, $$expand_i1_val22 = 0, $$expand_i1_val24 = 0, $$expand_i1_val26 = 0, $$expand_i1_val28 = 0, $$expand_i1_val30 = 0, $$expand_i1_val4 = 0, $$expand_i1_val6 = 0, $$expand_i1_val8 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0;
 var $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0;
 var $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0;
 var $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0;
 var $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $18 = 0, $19 = 0;
 var $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0;
 var $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0;
 var $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0;
 var $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0;
 var $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $choseong = 0, $combined = 0, $jong = 0, $peek = 0, $pop = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $hic;
 $2 = $ch;
 $3 = $2;
 $4 = (_hangul_is_jamo($3)|0);
 if ($4) {
  label = 4;
 } else {
  $5 = $2;
  $6 = ($5>>>0)>(0);
  if ($6) {
   $7 = $1;
   _hangul_ic_save_commit_string($7);
   $8 = $1;
   $9 = $2;
   _hangul_ic_append_commit_string($8,$9);
   $$expand_i1_val = 1;
   $0 = $$expand_i1_val;
  } else {
   label = 4;
  }
 }
 L4: do {
  if ((label|0) == 4) {
   $10 = $1;
   $11 = (($10) + 8|0);
   $12 = (($11) + 8|0);
   $13 = HEAP32[$12>>2]|0;
   $14 = ($13|0)!=(0);
   do {
    if ($14) {
     $15 = $2;
     $16 = (_hangul_is_choseong($15)|0);
     if ($16) {
      $17 = $1;
      $18 = $2;
      $19 = (_hangul_ic_choseong_to_jongseong($17,$18)|0);
      $jong = $19;
      $20 = $1;
      $21 = (($20) + 4|0);
      $22 = HEAP32[$21>>2]|0;
      $23 = (($22) + 16|0);
      $24 = HEAP32[$23>>2]|0;
      $25 = $1;
      $26 = (($25) + 8|0);
      $27 = (($26) + 8|0);
      $28 = HEAP32[$27>>2]|0;
      $29 = $jong;
      $30 = (_hangul_combination_combine($24,$28,$29)|0);
      $combined = $30;
      $31 = $combined;
      $32 = (_hangul_is_jongseong($31)|0);
      do {
       if ($32) {
        $33 = $1;
        $34 = $combined;
        $35 = (_hangul_ic_push($33,$34)|0);
        do {
         if (!($35)) {
          $36 = $1;
          $37 = $2;
          $38 = (_hangul_ic_push($36,$37)|0);
          if ($38) {
           break;
          } else {
           $$expand_i1_val2 = 0;
           $0 = $$expand_i1_val2;
           break L4;
          }
         }
        } while(0);
       } else {
        $39 = $1;
        _hangul_ic_save_commit_string($39);
        $40 = $1;
        $41 = $2;
        $42 = (_hangul_ic_push($40,$41)|0);
        if ($42) {
         break;
        } else {
         $$expand_i1_val4 = 0;
         $0 = $$expand_i1_val4;
         break L4;
        }
       }
      } while(0);
     } else {
      $43 = $2;
      $44 = (_hangul_is_jungseong($43)|0);
      if (!($44)) {
       label = 83;
       break;
      }
      $45 = $1;
      $46 = (_hangul_ic_pop($45)|0);
      $pop = $46;
      $47 = $1;
      $48 = (_hangul_ic_peek($47)|0);
      $peek = $48;
      $49 = $peek;
      $50 = (_hangul_is_jongseong($49)|0);
      do {
       if ($50) {
        $51 = $peek;
        $52 = $1;
        $53 = (($52) + 8|0);
        $54 = (($53) + 8|0);
        $55 = HEAP32[$54>>2]|0;
        $56 = (_hangul_jongseong_get_diff($51,$55)|0);
        $choseong = $56;
        $57 = $choseong;
        $58 = ($57|0)==(0);
        do {
         if ($58) {
          $59 = $1;
          _hangul_ic_save_commit_string($59);
          $60 = $1;
          $61 = $2;
          $62 = (_hangul_ic_push($60,$61)|0);
          if ($62) {
           break;
          } else {
           $$expand_i1_val6 = 0;
           $0 = $$expand_i1_val6;
           break L4;
          }
         } else {
          $63 = $peek;
          $64 = $1;
          $65 = (($64) + 8|0);
          $66 = (($65) + 8|0);
          HEAP32[$66>>2] = $63;
          $67 = $1;
          _hangul_ic_save_commit_string($67);
          $68 = $1;
          $69 = $choseong;
          (_hangul_ic_push($68,$69)|0);
          $70 = $1;
          $71 = $2;
          $72 = (_hangul_ic_push($70,$71)|0);
          if ($72) {
           break;
          } else {
           $$expand_i1_val8 = 0;
           $0 = $$expand_i1_val8;
           break L4;
          }
         }
        } while(0);
       } else {
        $73 = $1;
        $74 = (($73) + 8|0);
        $75 = (($74) + 8|0);
        HEAP32[$75>>2] = 0;
        $76 = $1;
        _hangul_ic_save_commit_string($76);
        $77 = $1;
        $78 = $pop;
        $79 = (_hangul_jongseong_to_choseong($78)|0);
        (_hangul_ic_push($77,$79)|0);
        $80 = $1;
        $81 = $2;
        $82 = (_hangul_ic_push($80,$81)|0);
        if ($82) {
         break;
        } else {
         $$expand_i1_val10 = 0;
         $0 = $$expand_i1_val10;
         break L4;
        }
       }
      } while(0);
     }
     label = 82;
    } else {
     $83 = $1;
     $84 = (($83) + 8|0);
     $85 = (($84) + 4|0);
     $86 = HEAP32[$85>>2]|0;
     $87 = ($86|0)!=(0);
     if ($87) {
      $88 = $2;
      $89 = (_hangul_is_choseong($88)|0);
      if ($89) {
       $90 = $1;
       $91 = (($90) + 8|0);
       $92 = HEAP32[$91>>2]|0;
       $93 = ($92|0)!=(0);
       if ($93) {
        $94 = $1;
        $95 = $2;
        $96 = (_hangul_ic_choseong_to_jongseong($94,$95)|0);
        $jong = $96;
        $97 = $jong;
        $98 = (_hangul_is_jongseong($97)|0);
        do {
         if ($98) {
          $99 = $1;
          $100 = $jong;
          $101 = (_hangul_ic_push($99,$100)|0);
          do {
           if (!($101)) {
            $102 = $1;
            $103 = $2;
            $104 = (_hangul_ic_push($102,$103)|0);
            if ($104) {
             break;
            } else {
             $$expand_i1_val12 = 0;
             $0 = $$expand_i1_val12;
             break L4;
            }
           }
          } while(0);
         } else {
          $105 = $1;
          _hangul_ic_save_commit_string($105);
          $106 = $1;
          $107 = $2;
          $108 = (_hangul_ic_push($106,$107)|0);
          if ($108) {
           break;
          } else {
           $$expand_i1_val14 = 0;
           $0 = $$expand_i1_val14;
           break L4;
          }
         }
        } while(0);
       } else {
        $109 = $1;
        $110 = $2;
        $111 = (_hangul_ic_push($109,$110)|0);
        do {
         if (!($111)) {
          $112 = $1;
          $113 = $2;
          $114 = (_hangul_ic_push($112,$113)|0);
          if ($114) {
           break;
          } else {
           $$expand_i1_val16 = 0;
           $0 = $$expand_i1_val16;
           break L4;
          }
         }
        } while(0);
       }
      } else {
       $115 = $2;
       $116 = (_hangul_is_jungseong($115)|0);
       if (!($116)) {
        label = 83;
        break;
       }
       $117 = $1;
       $118 = (($117) + 4|0);
       $119 = HEAP32[$118>>2]|0;
       $120 = (($119) + 16|0);
       $121 = HEAP32[$120>>2]|0;
       $122 = $1;
       $123 = (($122) + 8|0);
       $124 = (($123) + 4|0);
       $125 = HEAP32[$124>>2]|0;
       $126 = $2;
       $127 = (_hangul_combination_combine($121,$125,$126)|0);
       $combined = $127;
       $128 = $combined;
       $129 = (_hangul_is_jungseong($128)|0);
       do {
        if ($129) {
         $130 = $1;
         $131 = $combined;
         $132 = (_hangul_ic_push($130,$131)|0);
         if ($132) {
          break;
         } else {
          $$expand_i1_val18 = 0;
          $0 = $$expand_i1_val18;
          break L4;
         }
        } else {
         $133 = $1;
         _hangul_ic_save_commit_string($133);
         $134 = $1;
         $135 = $2;
         $136 = (_hangul_ic_push($134,$135)|0);
         if ($136) {
          break;
         } else {
          $$expand_i1_val20 = 0;
          $0 = $$expand_i1_val20;
          break L4;
         }
        }
       } while(0);
      }
     } else {
      $137 = $1;
      $138 = (($137) + 8|0);
      $139 = HEAP32[$138>>2]|0;
      $140 = ($139|0)!=(0);
      do {
       if ($140) {
        $141 = $2;
        $142 = (_hangul_is_choseong($141)|0);
        if ($142) {
         $143 = $1;
         $144 = (($143) + 4|0);
         $145 = HEAP32[$144>>2]|0;
         $146 = (($145) + 16|0);
         $147 = HEAP32[$146>>2]|0;
         $148 = $1;
         $149 = (($148) + 8|0);
         $150 = HEAP32[$149>>2]|0;
         $151 = $2;
         $152 = (_hangul_combination_combine($147,$150,$151)|0);
         $combined = $152;
         $153 = $1;
         $154 = $combined;
         $155 = (_hangul_ic_push($153,$154)|0);
         do {
          if (!($155)) {
           $156 = $1;
           $157 = $2;
           $158 = (_hangul_ic_push($156,$157)|0);
           if ($158) {
            break;
           } else {
            $$expand_i1_val22 = 0;
            $0 = $$expand_i1_val22;
            break L4;
           }
          }
         } while(0);
        } else {
         $159 = $1;
         $160 = $2;
         $161 = (_hangul_ic_push($159,$160)|0);
         do {
          if (!($161)) {
           $162 = $1;
           $163 = $2;
           $164 = (_hangul_ic_push($162,$163)|0);
           if ($164) {
            break;
           } else {
            $$expand_i1_val24 = 0;
            $0 = $$expand_i1_val24;
            break L4;
           }
          }
         } while(0);
        }
       } else {
        $165 = $1;
        $166 = $2;
        $167 = (_hangul_ic_push($165,$166)|0);
        if ($167) {
         break;
        } else {
         $$expand_i1_val26 = 0;
         $0 = $$expand_i1_val26;
         break L4;
        }
       }
      } while(0);
     }
     label = 82;
    }
   } while(0);
   if ((label|0) == 82) {
    $168 = $1;
    _hangul_ic_save_preedit_string($168);
    $$expand_i1_val28 = 1;
    $0 = $$expand_i1_val28;
    break;
   }
   else if ((label|0) == 83) {
    $169 = $1;
    _hangul_ic_flush_internal($169);
    $$expand_i1_val30 = 0;
    $0 = $$expand_i1_val30;
    break;
   }
  }
 } while(0);
 $$pre_trunc = $0;
 $170 = $$pre_trunc&1;
 STACKTOP = sp;return ($170|0);
}
function _hangul_ic_process_jaso($hic,$ch) {
 $hic = $hic|0;
 $ch = $ch|0;
 var $$expand_i1_val = 0, $$expand_i1_val10 = 0, $$expand_i1_val12 = 0, $$expand_i1_val14 = 0, $$expand_i1_val16 = 0, $$expand_i1_val18 = 0, $$expand_i1_val2 = 0, $$expand_i1_val20 = 0, $$expand_i1_val4 = 0, $$expand_i1_val6 = 0, $$expand_i1_val8 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
 var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
 var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
 var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0;
 var $96 = 0, $97 = 0, $98 = 0, $99 = 0, $choseong = 0, $jongseong = 0, $jungseong = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $hic;
 $2 = $ch;
 $3 = $2;
 $4 = (_hangul_is_choseong($3)|0);
 if ($4) {
  $5 = $1;
  $6 = (($5) + 8|0);
  $7 = HEAP32[$6>>2]|0;
  $8 = ($7|0)==(0);
  if ($8) {
   $9 = $1;
   $10 = $2;
   $11 = (_hangul_ic_push($9,$10)|0);
   do {
    if (!($11)) {
     $12 = $1;
     $13 = $2;
     $14 = (_hangul_ic_push($12,$13)|0);
     if ($14) {
      break;
     }
     $$expand_i1_val = 0;
     $0 = $$expand_i1_val;
     $$pre_trunc = $0;
     $131 = $$pre_trunc&1;
     STACKTOP = sp;return ($131|0);
    }
   } while(0);
  } else {
   $choseong = 0;
   $15 = $1;
   $16 = (_hangul_ic_peek($15)|0);
   $17 = (_hangul_is_choseong($16)|0);
   if ($17) {
    $18 = $1;
    $19 = (($18) + 4|0);
    $20 = HEAP32[$19>>2]|0;
    $21 = (($20) + 16|0);
    $22 = HEAP32[$21>>2]|0;
    $23 = $1;
    $24 = (($23) + 8|0);
    $25 = HEAP32[$24>>2]|0;
    $26 = $2;
    $27 = (_hangul_combination_combine($22,$25,$26)|0);
    $choseong = $27;
   }
   $28 = $choseong;
   $29 = ($28|0)!=(0);
   do {
    if ($29) {
     $30 = $1;
     $31 = $choseong;
     $32 = (_hangul_ic_push($30,$31)|0);
     do {
      if (!($32)) {
       $33 = $1;
       $34 = $choseong;
       $35 = (_hangul_ic_push($33,$34)|0);
       if ($35) {
        break;
       }
       $$expand_i1_val2 = 0;
       $0 = $$expand_i1_val2;
       $$pre_trunc = $0;
       $131 = $$pre_trunc&1;
       STACKTOP = sp;return ($131|0);
      }
     } while(0);
    } else {
     $36 = $1;
     _hangul_ic_save_commit_string($36);
     $37 = $1;
     $38 = $2;
     $39 = (_hangul_ic_push($37,$38)|0);
     if ($39) {
      break;
     }
     $$expand_i1_val4 = 0;
     $0 = $$expand_i1_val4;
     $$pre_trunc = $0;
     $131 = $$pre_trunc&1;
     STACKTOP = sp;return ($131|0);
    }
   } while(0);
  }
 } else {
  $40 = $2;
  $41 = (_hangul_is_jungseong($40)|0);
  if ($41) {
   $42 = $1;
   $43 = (($42) + 8|0);
   $44 = (($43) + 4|0);
   $45 = HEAP32[$44>>2]|0;
   $46 = ($45|0)==(0);
   if ($46) {
    $47 = $1;
    $48 = $2;
    $49 = (_hangul_ic_push($47,$48)|0);
    do {
     if (!($49)) {
      $50 = $1;
      $51 = $2;
      $52 = (_hangul_ic_push($50,$51)|0);
      if ($52) {
       break;
      }
      $$expand_i1_val6 = 0;
      $0 = $$expand_i1_val6;
      $$pre_trunc = $0;
      $131 = $$pre_trunc&1;
      STACKTOP = sp;return ($131|0);
     }
    } while(0);
   } else {
    $jungseong = 0;
    $53 = $1;
    $54 = (_hangul_ic_peek($53)|0);
    $55 = (_hangul_is_jungseong($54)|0);
    if ($55) {
     $56 = $1;
     $57 = (($56) + 4|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = (($58) + 16|0);
     $60 = HEAP32[$59>>2]|0;
     $61 = $1;
     $62 = (($61) + 8|0);
     $63 = (($62) + 4|0);
     $64 = HEAP32[$63>>2]|0;
     $65 = $2;
     $66 = (_hangul_combination_combine($60,$64,$65)|0);
     $jungseong = $66;
    }
    $67 = $jungseong;
    $68 = ($67|0)!=(0);
    if ($68) {
     $69 = $1;
     $70 = $jungseong;
     $71 = (_hangul_ic_push($69,$70)|0);
     do {
      if (!($71)) {
       $72 = $1;
       $73 = $jungseong;
       $74 = (_hangul_ic_push($72,$73)|0);
       if ($74) {
        break;
       }
       $$expand_i1_val8 = 0;
       $0 = $$expand_i1_val8;
       $$pre_trunc = $0;
       $131 = $$pre_trunc&1;
       STACKTOP = sp;return ($131|0);
      }
     } while(0);
    } else {
     $75 = $1;
     _hangul_ic_save_commit_string($75);
     $76 = $1;
     $77 = $2;
     $78 = (_hangul_ic_push($76,$77)|0);
     do {
      if (!($78)) {
       $79 = $1;
       $80 = $2;
       $81 = (_hangul_ic_push($79,$80)|0);
       if ($81) {
        break;
       }
       $$expand_i1_val10 = 0;
       $0 = $$expand_i1_val10;
       $$pre_trunc = $0;
       $131 = $$pre_trunc&1;
       STACKTOP = sp;return ($131|0);
      }
     } while(0);
    }
   }
  } else {
   $82 = $2;
   $83 = (_hangul_is_jongseong($82)|0);
   do {
    if ($83) {
     $84 = $1;
     $85 = (($84) + 8|0);
     $86 = (($85) + 8|0);
     $87 = HEAP32[$86>>2]|0;
     $88 = ($87|0)==(0);
     if ($88) {
      $89 = $1;
      $90 = $2;
      $91 = (_hangul_ic_push($89,$90)|0);
      do {
       if (!($91)) {
        $92 = $1;
        $93 = $2;
        $94 = (_hangul_ic_push($92,$93)|0);
        if ($94) {
         break;
        }
        $$expand_i1_val12 = 0;
        $0 = $$expand_i1_val12;
        $$pre_trunc = $0;
        $131 = $$pre_trunc&1;
        STACKTOP = sp;return ($131|0);
       }
      } while(0);
     } else {
      $jongseong = 0;
      $95 = $1;
      $96 = (_hangul_ic_peek($95)|0);
      $97 = (_hangul_is_jongseong($96)|0);
      if ($97) {
       $98 = $1;
       $99 = (($98) + 4|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = (($100) + 16|0);
       $102 = HEAP32[$101>>2]|0;
       $103 = $1;
       $104 = (($103) + 8|0);
       $105 = (($104) + 8|0);
       $106 = HEAP32[$105>>2]|0;
       $107 = $2;
       $108 = (_hangul_combination_combine($102,$106,$107)|0);
       $jongseong = $108;
      }
      $109 = $jongseong;
      $110 = ($109|0)!=(0);
      if ($110) {
       $111 = $1;
       $112 = $jongseong;
       $113 = (_hangul_ic_push($111,$112)|0);
       do {
        if (!($113)) {
         $114 = $1;
         $115 = $jongseong;
         $116 = (_hangul_ic_push($114,$115)|0);
         if ($116) {
          break;
         }
         $$expand_i1_val14 = 0;
         $0 = $$expand_i1_val14;
         $$pre_trunc = $0;
         $131 = $$pre_trunc&1;
         STACKTOP = sp;return ($131|0);
        }
       } while(0);
      } else {
       $117 = $1;
       _hangul_ic_save_commit_string($117);
       $118 = $1;
       $119 = $2;
       $120 = (_hangul_ic_push($118,$119)|0);
       do {
        if (!($120)) {
         $121 = $1;
         $122 = $2;
         $123 = (_hangul_ic_push($121,$122)|0);
         if ($123) {
          break;
         }
         $$expand_i1_val16 = 0;
         $0 = $$expand_i1_val16;
         $$pre_trunc = $0;
         $131 = $$pre_trunc&1;
         STACKTOP = sp;return ($131|0);
        }
       } while(0);
      }
     }
    } else {
     $124 = $2;
     $125 = ($124>>>0)>(0);
     if ($125) {
      $126 = $1;
      _hangul_ic_save_commit_string($126);
      $127 = $1;
      $128 = $2;
      _hangul_ic_append_commit_string($127,$128);
      break;
     } else {
      $129 = $1;
      _hangul_ic_save_commit_string($129);
      $$expand_i1_val18 = 0;
      $0 = $$expand_i1_val18;
      $$pre_trunc = $0;
      $131 = $$pre_trunc&1;
      STACKTOP = sp;return ($131|0);
     }
    }
   } while(0);
  }
 }
 $130 = $1;
 _hangul_ic_save_preedit_string($130);
 $$expand_i1_val20 = 1;
 $0 = $$expand_i1_val20;
 $$pre_trunc = $0;
 $131 = $$pre_trunc&1;
 STACKTOP = sp;return ($131|0);
}
function _hangul_ic_process_romaja($hic,$ascii,$ch) {
 $hic = $hic|0;
 $ascii = $ascii|0;
 $ch = $ch|0;
 var $$expand_i1_val = 0, $$expand_i1_val10 = 0, $$expand_i1_val12 = 0, $$expand_i1_val14 = 0, $$expand_i1_val16 = 0, $$expand_i1_val18 = 0, $$expand_i1_val2 = 0, $$expand_i1_val20 = 0, $$expand_i1_val22 = 0, $$expand_i1_val24 = 0, $$expand_i1_val26 = 0, $$expand_i1_val28 = 0, $$expand_i1_val30 = 0, $$expand_i1_val32 = 0, $$expand_i1_val34 = 0, $$expand_i1_val36 = 0, $$expand_i1_val4 = 0, $$expand_i1_val6 = 0, $$expand_i1_val8 = 0, $$pre_trunc = 0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0;
 var $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0;
 var $97 = 0, $98 = 0, $99 = 0, $choseong = 0, $combined = 0, $jong = 0, $jongseong = 0, $peek = 0, $pop = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $choseong = sp + 4|0;
 $jongseong = sp;
 $1 = $hic;
 $2 = $ascii;
 $3 = $ch;
 $4 = $3;
 $5 = (_hangul_is_jamo($4)|0);
 if (!($5)) {
  $6 = $3;
  $7 = ($6>>>0)>(0);
  if ($7) {
   $8 = $1;
   _hangul_ic_save_commit_string($8);
   $9 = $1;
   $10 = $3;
   _hangul_ic_append_commit_string($9,$10);
   $$expand_i1_val = 1;
   $0 = $$expand_i1_val;
   $$pre_trunc = $0;
   $242 = $$pre_trunc&1;
   STACKTOP = sp;return ($242|0);
  }
 }
 $11 = $2;
 $12 = (_isupper(($11|0))|0);
 $13 = ($12|0)!=(0);
 if ($13) {
  $14 = $1;
  _hangul_ic_save_commit_string($14);
 }
 $15 = $1;
 $16 = (($15) + 8|0);
 $17 = (($16) + 8|0);
 $18 = HEAP32[$17>>2]|0;
 $19 = ($18|0)!=(0);
 do {
  if ($19) {
   $20 = $2;
   $21 = ($20|0)==(120);
   if ($21) {
    label = 9;
   } else {
    $22 = $2;
    $23 = ($22|0)==(88);
    if ($23) {
     label = 9;
    } else {
     $28 = $3;
     $29 = (_hangul_is_choseong($28)|0);
     if ($29) {
      label = 14;
     } else {
      $30 = $3;
      $31 = (_hangul_is_jongseong($30)|0);
      if ($31) {
       label = 14;
      } else {
       $61 = $3;
       $62 = (_hangul_is_jungseong($61)|0);
       if (!($62)) {
        label = 123;
        break;
       }
       $63 = $1;
       $64 = (($63) + 8|0);
       $65 = (($64) + 8|0);
       $66 = HEAP32[$65>>2]|0;
       $67 = ($66|0)==(4540);
       if ($67) {
        $68 = $1;
        _hangul_ic_save_commit_string($68);
        $69 = $1;
        $70 = (($69) + 8|0);
        HEAP32[$70>>2] = 4363;
        $71 = $1;
        $72 = $3;
        (_hangul_ic_push($71,$72)|0);
       } else {
        $73 = $1;
        $74 = (_hangul_ic_pop($73)|0);
        $pop = $74;
        $75 = $1;
        $76 = (_hangul_ic_peek($75)|0);
        $peek = $76;
        $77 = $peek;
        $78 = (_hangul_is_jungseong($77)|0);
        do {
         if ($78) {
          $79 = $pop;
          $80 = ($79|0)==(4522);
          if ($80) {
           $81 = $1;
           $82 = (($81) + 8|0);
           $83 = (($82) + 8|0);
           HEAP32[$83>>2] = 4520;
           $pop = 4538;
          } else {
           $84 = $1;
           $85 = (($84) + 8|0);
           $86 = (($85) + 8|0);
           HEAP32[$86>>2] = 0;
          }
          $87 = $1;
          _hangul_ic_save_commit_string($87);
          $88 = $1;
          $89 = $pop;
          $90 = (_hangul_jongseong_to_choseong($89)|0);
          (_hangul_ic_push($88,$90)|0);
          $91 = $1;
          $92 = $3;
          $93 = (_hangul_ic_push($91,$92)|0);
          if ($93) {
           break;
          }
          $$expand_i1_val8 = 0;
          $0 = $$expand_i1_val8;
          $$pre_trunc = $0;
          $242 = $$pre_trunc&1;
          STACKTOP = sp;return ($242|0);
         } else {
          HEAP32[$choseong>>2] = 0;
          HEAP32[$jongseong>>2] = 0;
          $94 = $1;
          $95 = (($94) + 8|0);
          $96 = (($95) + 8|0);
          $97 = HEAP32[$96>>2]|0;
          _hangul_jongseong_decompose($97,$jongseong,$choseong);
          $98 = HEAP32[$jongseong>>2]|0;
          $99 = $1;
          $100 = (($99) + 8|0);
          $101 = (($100) + 8|0);
          HEAP32[$101>>2] = $98;
          $102 = $1;
          _hangul_ic_save_commit_string($102);
          $103 = $1;
          $104 = HEAP32[$choseong>>2]|0;
          (_hangul_ic_push($103,$104)|0);
          $105 = $1;
          $106 = $3;
          $107 = (_hangul_ic_push($105,$106)|0);
          if ($107) {
           break;
          }
          $$expand_i1_val10 = 0;
          $0 = $$expand_i1_val10;
          $$pre_trunc = $0;
          $242 = $$pre_trunc&1;
          STACKTOP = sp;return ($242|0);
         }
        } while(0);
       }
      }
     }
     if ((label|0) == 14) {
      $32 = $3;
      $33 = (_hangul_is_jongseong($32)|0);
      if ($33) {
       $34 = $3;
       $jong = $34;
      } else {
       $35 = $1;
       $36 = $3;
       $37 = (_hangul_ic_choseong_to_jongseong($35,$36)|0);
       $jong = $37;
      }
      $38 = $1;
      $39 = (($38) + 4|0);
      $40 = HEAP32[$39>>2]|0;
      $41 = (($40) + 16|0);
      $42 = HEAP32[$41>>2]|0;
      $43 = $1;
      $44 = (($43) + 8|0);
      $45 = (($44) + 8|0);
      $46 = HEAP32[$45>>2]|0;
      $47 = $jong;
      $48 = (_hangul_combination_combine($42,$46,$47)|0);
      $combined = $48;
      $49 = $combined;
      $50 = (_hangul_is_jongseong($49)|0);
      do {
       if ($50) {
        $51 = $1;
        $52 = $combined;
        $53 = (_hangul_ic_push($51,$52)|0);
        do {
         if (!($53)) {
          $54 = $1;
          $55 = $3;
          $56 = (_hangul_ic_push($54,$55)|0);
          if ($56) {
           break;
          }
          $$expand_i1_val4 = 0;
          $0 = $$expand_i1_val4;
          $$pre_trunc = $0;
          $242 = $$pre_trunc&1;
          STACKTOP = sp;return ($242|0);
         }
        } while(0);
       } else {
        $57 = $1;
        _hangul_ic_save_commit_string($57);
        $58 = $1;
        $59 = $3;
        $60 = (_hangul_ic_push($58,$59)|0);
        if ($60) {
         break;
        }
        $$expand_i1_val6 = 0;
        $0 = $$expand_i1_val6;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       }
      } while(0);
     }
    }
   }
   do {
    if ((label|0) == 9) {
     $3 = 4364;
     $24 = $1;
     _hangul_ic_save_commit_string($24);
     $25 = $1;
     $26 = $3;
     $27 = (_hangul_ic_push($25,$26)|0);
     if ($27) {
      break;
     }
     $$expand_i1_val2 = 0;
     $0 = $$expand_i1_val2;
     $$pre_trunc = $0;
     $242 = $$pre_trunc&1;
     STACKTOP = sp;return ($242|0);
    }
   } while(0);
   label = 122;
  } else {
   $108 = $1;
   $109 = (($108) + 8|0);
   $110 = (($109) + 4|0);
   $111 = HEAP32[$110>>2]|0;
   $112 = ($111|0)!=(0);
   if ($112) {
    $113 = $3;
    $114 = (_hangul_is_choseong($113)|0);
    if ($114) {
     $115 = $1;
     $116 = (($115) + 8|0);
     $117 = HEAP32[$116>>2]|0;
     $118 = ($117|0)!=(0);
     if ($118) {
      $119 = $1;
      $120 = $3;
      $121 = (_hangul_ic_choseong_to_jongseong($119,$120)|0);
      $jong = $121;
      $122 = $jong;
      $123 = (_hangul_is_jongseong($122)|0);
      do {
       if ($123) {
        $124 = $1;
        $125 = $jong;
        $126 = (_hangul_ic_push($124,$125)|0);
        do {
         if (!($126)) {
          $127 = $1;
          $128 = $3;
          $129 = (_hangul_ic_push($127,$128)|0);
          if ($129) {
           break;
          }
          $$expand_i1_val12 = 0;
          $0 = $$expand_i1_val12;
          $$pre_trunc = $0;
          $242 = $$pre_trunc&1;
          STACKTOP = sp;return ($242|0);
         }
        } while(0);
       } else {
        $130 = $1;
        _hangul_ic_save_commit_string($130);
        $131 = $1;
        $132 = $3;
        $133 = (_hangul_ic_push($131,$132)|0);
        if ($133) {
         break;
        }
        $$expand_i1_val14 = 0;
        $0 = $$expand_i1_val14;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       }
      } while(0);
     } else {
      $134 = $1;
      $135 = $3;
      $136 = (_hangul_ic_push($134,$135)|0);
      do {
       if (!($136)) {
        $137 = $1;
        $138 = $3;
        $139 = (_hangul_ic_push($137,$138)|0);
        if ($139) {
         break;
        }
        $$expand_i1_val16 = 0;
        $0 = $$expand_i1_val16;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       }
      } while(0);
     }
    } else {
     $140 = $3;
     $141 = (_hangul_is_jungseong($140)|0);
     if ($141) {
      $142 = $1;
      $143 = (($142) + 4|0);
      $144 = HEAP32[$143>>2]|0;
      $145 = (($144) + 16|0);
      $146 = HEAP32[$145>>2]|0;
      $147 = $1;
      $148 = (($147) + 8|0);
      $149 = (($148) + 4|0);
      $150 = HEAP32[$149>>2]|0;
      $151 = $3;
      $152 = (_hangul_combination_combine($146,$150,$151)|0);
      $combined = $152;
      $153 = $combined;
      $154 = (_hangul_is_jungseong($153)|0);
      do {
       if ($154) {
        $155 = $1;
        $156 = $combined;
        $157 = (_hangul_ic_push($155,$156)|0);
        if ($157) {
         break;
        }
        $$expand_i1_val18 = 0;
        $0 = $$expand_i1_val18;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       } else {
        $158 = $1;
        _hangul_ic_save_commit_string($158);
        $159 = $1;
        $160 = (($159) + 8|0);
        HEAP32[$160>>2] = 4363;
        $161 = $1;
        $162 = $3;
        $163 = (_hangul_ic_push($161,$162)|0);
        if ($163) {
         break;
        }
        $$expand_i1_val20 = 0;
        $0 = $$expand_i1_val20;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       }
      } while(0);
     } else {
      $164 = $3;
      $165 = (_hangul_is_jongseong($164)|0);
      if (!($165)) {
       label = 123;
       break;
      }
      $166 = $1;
      $167 = $3;
      $168 = (_hangul_ic_push($166,$167)|0);
      do {
       if (!($168)) {
        $169 = $1;
        $170 = $3;
        $171 = (_hangul_ic_push($169,$170)|0);
        if ($171) {
         break;
        }
        $$expand_i1_val22 = 0;
        $0 = $$expand_i1_val22;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       }
      } while(0);
     }
    }
   } else {
    $172 = $1;
    $173 = (($172) + 8|0);
    $174 = HEAP32[$173>>2]|0;
    $175 = ($174|0)!=(0);
    if ($175) {
     $176 = $3;
     $177 = (_hangul_is_choseong($176)|0);
     if ($177) {
      $178 = $1;
      $179 = (($178) + 4|0);
      $180 = HEAP32[$179>>2]|0;
      $181 = (($180) + 16|0);
      $182 = HEAP32[$181>>2]|0;
      $183 = $1;
      $184 = (($183) + 8|0);
      $185 = HEAP32[$184>>2]|0;
      $186 = $3;
      $187 = (_hangul_combination_combine($182,$185,$186)|0);
      $combined = $187;
      $188 = $combined;
      $189 = ($188|0)==(0);
      do {
       if ($189) {
        $190 = $1;
        $191 = (($190) + 8|0);
        $192 = (($191) + 4|0);
        HEAP32[$192>>2] = 4467;
        $193 = $1;
        _hangul_ic_flush_internal($193);
        $194 = $1;
        $195 = $3;
        $196 = (_hangul_ic_push($194,$195)|0);
        if ($196) {
         break;
        }
        $$expand_i1_val24 = 0;
        $0 = $$expand_i1_val24;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       } else {
        $197 = $1;
        $198 = $combined;
        $199 = (_hangul_ic_push($197,$198)|0);
        do {
         if (!($199)) {
          $200 = $1;
          $201 = $3;
          $202 = (_hangul_ic_push($200,$201)|0);
          if ($202) {
           break;
          }
          $$expand_i1_val26 = 0;
          $0 = $$expand_i1_val26;
          $$pre_trunc = $0;
          $242 = $$pre_trunc&1;
          STACKTOP = sp;return ($242|0);
         }
        } while(0);
       }
      } while(0);
     } else {
      $203 = $3;
      $204 = (_hangul_is_jongseong($203)|0);
      do {
       if ($204) {
        $205 = $1;
        $206 = (($205) + 8|0);
        $207 = (($206) + 4|0);
        HEAP32[$207>>2] = 4467;
        $208 = $1;
        _hangul_ic_save_commit_string($208);
        $209 = $2;
        $210 = ($209|0)==(120);
        if ($210) {
         label = 99;
        } else {
         $211 = $2;
         $212 = ($211|0)==(88);
         if ($212) {
          label = 99;
         }
        }
        if ((label|0) == 99) {
         $3 = 4364;
        }
        $213 = $1;
        $214 = $3;
        $215 = (_hangul_ic_push($213,$214)|0);
        if ($215) {
         break;
        }
        $$expand_i1_val28 = 0;
        $0 = $$expand_i1_val28;
        $$pre_trunc = $0;
        $242 = $$pre_trunc&1;
        STACKTOP = sp;return ($242|0);
       } else {
        $216 = $1;
        $217 = $3;
        $218 = (_hangul_ic_push($216,$217)|0);
        do {
         if (!($218)) {
          $219 = $1;
          $220 = $3;
          $221 = (_hangul_ic_push($219,$220)|0);
          if ($221) {
           break;
          }
          $$expand_i1_val30 = 0;
          $0 = $$expand_i1_val30;
          $$pre_trunc = $0;
          $242 = $$pre_trunc&1;
          STACKTOP = sp;return ($242|0);
         }
        } while(0);
       }
      } while(0);
     }
    } else {
     $222 = $2;
     $223 = ($222|0)==(120);
     if ($223) {
      label = 112;
     } else {
      $224 = $2;
      $225 = ($224|0)==(88);
      if ($225) {
       label = 112;
      }
     }
     if ((label|0) == 112) {
      $3 = 4364;
     }
     $226 = $1;
     $227 = $3;
     $228 = (_hangul_ic_push($226,$227)|0);
     if (!($228)) {
      $$expand_i1_val32 = 0;
      $0 = $$expand_i1_val32;
      $$pre_trunc = $0;
      $242 = $$pre_trunc&1;
      STACKTOP = sp;return ($242|0);
     }
     $229 = $1;
     $230 = (($229) + 8|0);
     $231 = HEAP32[$230>>2]|0;
     $232 = ($231|0)==(0);
     if ($232) {
      $233 = $1;
      $234 = (($233) + 8|0);
      $235 = (($234) + 4|0);
      $236 = HEAP32[$235>>2]|0;
      $237 = ($236|0)!=(0);
      if ($237) {
       $238 = $1;
       $239 = (($238) + 8|0);
       HEAP32[$239>>2] = 4363;
      }
     }
    }
   }
   label = 122;
  }
 } while(0);
 if ((label|0) == 122) {
  $240 = $1;
  _hangul_ic_save_preedit_string($240);
  $$expand_i1_val34 = 1;
  $0 = $$expand_i1_val34;
  $$pre_trunc = $0;
  $242 = $$pre_trunc&1;
  STACKTOP = sp;return ($242|0);
 }
 else if ((label|0) == 123) {
  $241 = $1;
  _hangul_ic_flush_internal($241);
  $$expand_i1_val36 = 0;
  $0 = $$expand_i1_val36;
  $$pre_trunc = $0;
  $242 = $$pre_trunc&1;
  STACKTOP = sp;return ($242|0);
 }
 return 0|0;
}
function _hangul_ic_get_preedit_string($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $hic;
 $2 = $1;
 $3 = ($2|0)==(0|0);
 if ($3) {
  $0 = 0;
 } else {
  $4 = $1;
  $5 = (($4) + 76|0);
  $0 = $5;
 }
 $6 = $0;
 STACKTOP = sp;return ($6|0);
}
function _hangul_ic_get_commit_string($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $hic;
 $2 = $1;
 $3 = ($2|0)==(0|0);
 if ($3) {
  $0 = 0;
 } else {
  $4 = $1;
  $5 = (($4) + 332|0);
  $0 = $5;
 }
 $6 = $0;
 STACKTOP = sp;return ($6|0);
}
function _hangul_ic_reset($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = ($1|0)==(0|0);
 if ($2) {
  STACKTOP = sp;return;
 } else {
  $3 = $0;
  $4 = (($3) + 76|0);
  HEAP32[$4>>2] = 0;
  $5 = $0;
  $6 = (($5) + 332|0);
  HEAP32[$6>>2] = 0;
  $7 = $0;
  $8 = (($7) + 588|0);
  HEAP32[$8>>2] = 0;
  $9 = $0;
  $10 = (($9) + 8|0);
  _hangul_buffer_clear($10);
  STACKTOP = sp;return;
 }
}
function _hangul_buffer_clear($buffer) {
 $buffer = $buffer|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $0;
 HEAP32[$1>>2] = 0;
 $2 = $0;
 $3 = (($2) + 4|0);
 HEAP32[$3>>2] = 0;
 $4 = $0;
 $5 = (($4) + 8|0);
 HEAP32[$5>>2] = 0;
 $6 = $0;
 $7 = (($6) + 60|0);
 HEAP32[$7>>2] = -1;
 $8 = $0;
 $9 = (($8) + 12|0);
 HEAP32[$9>>2] = 0;
 $10 = $0;
 $11 = (($10) + 12|0);
 $12 = (($11) + 4|0);
 HEAP32[$12>>2] = 0;
 $13 = $0;
 $14 = (($13) + 12|0);
 $15 = (($14) + 8|0);
 HEAP32[$15>>2] = 0;
 $16 = $0;
 $17 = (($16) + 12|0);
 $18 = (($17) + 12|0);
 HEAP32[$18>>2] = 0;
 $19 = $0;
 $20 = (($19) + 12|0);
 $21 = (($20) + 16|0);
 HEAP32[$21>>2] = 0;
 $22 = $0;
 $23 = (($22) + 12|0);
 $24 = (($23) + 20|0);
 HEAP32[$24>>2] = 0;
 $25 = $0;
 $26 = (($25) + 12|0);
 $27 = (($26) + 24|0);
 HEAP32[$27>>2] = 0;
 $28 = $0;
 $29 = (($28) + 12|0);
 $30 = (($29) + 28|0);
 HEAP32[$30>>2] = 0;
 $31 = $0;
 $32 = (($31) + 12|0);
 $33 = (($32) + 32|0);
 HEAP32[$33>>2] = 0;
 $34 = $0;
 $35 = (($34) + 12|0);
 $36 = (($35) + 36|0);
 HEAP32[$36>>2] = 0;
 $37 = $0;
 $38 = (($37) + 12|0);
 $39 = (($38) + 40|0);
 HEAP32[$39>>2] = 0;
 $40 = $0;
 $41 = (($40) + 12|0);
 $42 = (($41) + 44|0);
 HEAP32[$42>>2] = 0;
 STACKTOP = sp;return;
}
function _hangul_ic_flush($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $hic;
 $2 = $1;
 $3 = ($2|0)==(0|0);
 if ($3) {
  $0 = 0;
  $26 = $0;
  STACKTOP = sp;return ($26|0);
 }
 $4 = $1;
 $5 = (($4) + 76|0);
 HEAP32[$5>>2] = 0;
 $6 = $1;
 $7 = (($6) + 332|0);
 HEAP32[$7>>2] = 0;
 $8 = $1;
 $9 = (($8) + 588|0);
 HEAP32[$9>>2] = 0;
 $10 = $1;
 $11 = (($10) + 72|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)==(1);
 if ($13) {
  $14 = $1;
  $15 = (($14) + 8|0);
  $16 = $1;
  $17 = (($16) + 588|0);
  (_hangul_buffer_get_jamo_string($15,$17,64)|0);
 } else {
  $18 = $1;
  $19 = (($18) + 8|0);
  $20 = $1;
  $21 = (($20) + 588|0);
  (_hangul_buffer_get_string($19,$21,64)|0);
 }
 $22 = $1;
 $23 = (($22) + 8|0);
 _hangul_buffer_clear($23);
 $24 = $1;
 $25 = (($24) + 588|0);
 $0 = $25;
 $26 = $0;
 STACKTOP = sp;return ($26|0);
}
function _hangul_buffer_get_jamo_string($buffer,$buf,$buflen) {
 $buffer = $buffer|0;
 $buf = $buf|0;
 $buflen = $buflen|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $n = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $buf;
 $2 = $buflen;
 $n = 0;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)!=(0);
 if (!($5)) {
  $6 = $0;
  $7 = (($6) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($8|0)!=(0);
  if (!($9)) {
   $10 = $0;
   $11 = (($10) + 8|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = ($12|0)!=(0);
   if (!($13)) {
    $53 = $n;
    $54 = $1;
    $55 = (($54) + ($53<<2)|0);
    HEAP32[$55>>2] = 0;
    $56 = $n;
    STACKTOP = sp;return ($56|0);
   }
  }
 }
 $14 = $0;
 $15 = HEAP32[$14>>2]|0;
 $16 = ($15|0)!=(0);
 if ($16) {
  $17 = $0;
  $18 = HEAP32[$17>>2]|0;
  $19 = $n;
  $20 = (($19) + 1)|0;
  $n = $20;
  $21 = $1;
  $22 = (($21) + ($19<<2)|0);
  HEAP32[$22>>2] = $18;
 } else {
  $23 = $n;
  $24 = (($23) + 1)|0;
  $n = $24;
  $25 = $1;
  $26 = (($25) + ($23<<2)|0);
  HEAP32[$26>>2] = 4447;
 }
 $27 = $0;
 $28 = (($27) + 4|0);
 $29 = HEAP32[$28>>2]|0;
 $30 = ($29|0)!=(0);
 if ($30) {
  $31 = $0;
  $32 = (($31) + 4|0);
  $33 = HEAP32[$32>>2]|0;
  $34 = $n;
  $35 = (($34) + 1)|0;
  $n = $35;
  $36 = $1;
  $37 = (($36) + ($34<<2)|0);
  HEAP32[$37>>2] = $33;
 } else {
  $38 = $n;
  $39 = (($38) + 1)|0;
  $n = $39;
  $40 = $1;
  $41 = (($40) + ($38<<2)|0);
  HEAP32[$41>>2] = 4448;
 }
 $42 = $0;
 $43 = (($42) + 8|0);
 $44 = HEAP32[$43>>2]|0;
 $45 = ($44|0)!=(0);
 if ($45) {
  $46 = $0;
  $47 = (($46) + 8|0);
  $48 = HEAP32[$47>>2]|0;
  $49 = $n;
  $50 = (($49) + 1)|0;
  $n = $50;
  $51 = $1;
  $52 = (($51) + ($49<<2)|0);
  HEAP32[$52>>2] = $48;
 }
 $53 = $n;
 $54 = $1;
 $55 = (($54) + ($53<<2)|0);
 HEAP32[$55>>2] = 0;
 $56 = $n;
 STACKTOP = sp;return ($56|0);
}
function _hangul_buffer_get_string($buffer,$buf,$buflen) {
 $buffer = $buffer|0;
 $buf = $buf|0;
 $buflen = $buflen|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $buf;
 $2 = $buflen;
 $3 = $0;
 $4 = HEAP32[$3>>2]|0;
 $5 = $0;
 $6 = (($5) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = $0;
 $9 = (($8) + 8|0);
 $10 = HEAP32[$9>>2]|0;
 $11 = $1;
 $12 = $2;
 $13 = (_hangul_jaso_to_string($4,$7,$10,$11,$12)|0);
 STACKTOP = sp;return ($13|0);
}
function _hangul_ic_backspace($hic) {
 $hic = $hic|0;
 var $$expand_i1_val = 0, $$expand_i1_val2 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $ret = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $hic;
 $2 = $1;
 $3 = ($2|0)==(0|0);
 if ($3) {
  $$expand_i1_val = 0;
  $0 = $$expand_i1_val;
  $$pre_trunc = $0;
  $17 = $$pre_trunc&1;
  STACKTOP = sp;return ($17|0);
 }
 $4 = $1;
 $5 = (($4) + 76|0);
 HEAP32[$5>>2] = 0;
 $6 = $1;
 $7 = (($6) + 332|0);
 HEAP32[$7>>2] = 0;
 $8 = $1;
 $9 = (($8) + 8|0);
 $10 = (_hangul_buffer_backspace($9)|0);
 $11 = $10&1;
 $ret = $11;
 $12 = $ret;
 $13 = ($12|0)!=(0);
 if ($13) {
  $14 = $1;
  _hangul_ic_save_preedit_string($14);
 }
 $15 = $ret;
 $16 = ($15|0)!=(0);
 $$expand_i1_val2 = $16&1;
 $0 = $$expand_i1_val2;
 $$pre_trunc = $0;
 $17 = $$pre_trunc&1;
 STACKTOP = sp;return ($17|0);
}
function _hangul_buffer_backspace($buffer) {
 $buffer = $buffer|0;
 var $$expand_i1_val = 0, $$expand_i1_val10 = 0, $$expand_i1_val2 = 0, $$expand_i1_val4 = 0, $$expand_i1_val6 = 0, $$expand_i1_val8 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0;
 var $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0;
 var $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $ch = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $buffer;
 $2 = $1;
 $3 = (($2) + 60|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)>=(0);
 do {
  if ($5) {
   $6 = $1;
   $7 = (_hangul_buffer_pop($6)|0);
   $ch = $7;
   $8 = $ch;
   $9 = ($8|0)==(0);
   if ($9) {
    $$expand_i1_val = 0;
    $0 = $$expand_i1_val;
    break;
   }
   $10 = $1;
   $11 = (($10) + 60|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = ($12|0)>=(0);
   if (!($13)) {
    $43 = $1;
    HEAP32[$43>>2] = 0;
    $44 = $1;
    $45 = (($44) + 4|0);
    HEAP32[$45>>2] = 0;
    $46 = $1;
    $47 = (($46) + 8|0);
    HEAP32[$47>>2] = 0;
    $$expand_i1_val8 = 1;
    $0 = $$expand_i1_val8;
    break;
   }
   $14 = $ch;
   $15 = (_hangul_is_choseong($14)|0);
   if ($15) {
    $16 = $1;
    $17 = (_hangul_buffer_peek($16)|0);
    $ch = $17;
    $18 = $ch;
    $19 = (_hangul_is_choseong($18)|0);
    if ($19) {
     $20 = $ch;
     $22 = $20;
    } else {
     $22 = 0;
    }
    $21 = $1;
    HEAP32[$21>>2] = $22;
    $$expand_i1_val2 = 1;
    $0 = $$expand_i1_val2;
    break;
   }
   $23 = $ch;
   $24 = (_hangul_is_jungseong($23)|0);
   if ($24) {
    $25 = $1;
    $26 = (_hangul_buffer_peek($25)|0);
    $ch = $26;
    $27 = $ch;
    $28 = (_hangul_is_jungseong($27)|0);
    if ($28) {
     $29 = $ch;
     $32 = $29;
    } else {
     $32 = 0;
    }
    $30 = $1;
    $31 = (($30) + 4|0);
    HEAP32[$31>>2] = $32;
    $$expand_i1_val4 = 1;
    $0 = $$expand_i1_val4;
    break;
   }
   $33 = $ch;
   $34 = (_hangul_is_jongseong($33)|0);
   if ($34) {
    $35 = $1;
    $36 = (_hangul_buffer_peek($35)|0);
    $ch = $36;
    $37 = $ch;
    $38 = (_hangul_is_jongseong($37)|0);
    if ($38) {
     $39 = $ch;
     $42 = $39;
    } else {
     $42 = 0;
    }
    $40 = $1;
    $41 = (($40) + 8|0);
    HEAP32[$41>>2] = $42;
    $$expand_i1_val6 = 1;
    $0 = $$expand_i1_val6;
    break;
   } else {
    label = 25;
    break;
   }
  } else {
   label = 25;
  }
 } while(0);
 if ((label|0) == 25) {
  $$expand_i1_val10 = 0;
  $0 = $$expand_i1_val10;
 }
 $$pre_trunc = $0;
 $48 = $$pre_trunc&1;
 STACKTOP = sp;return ($48|0);
}
function _hangul_ic_save_preedit_string($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 72|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($3|0)==(1);
 if ($4) {
  $5 = $0;
  $6 = (($5) + 8|0);
  $7 = $0;
  $8 = (($7) + 76|0);
  (_hangul_buffer_get_jamo_string($6,$8,64)|0);
  STACKTOP = sp;return;
 } else {
  $9 = $0;
  $10 = (($9) + 8|0);
  $11 = $0;
  $12 = (($11) + 76|0);
  (_hangul_buffer_get_string($10,$12,64)|0);
  STACKTOP = sp;return;
 }
}
function _hangul_ic_is_empty($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 8|0);
 $3 = (_hangul_buffer_is_empty($2)|0);
 STACKTOP = sp;return ($3|0);
}
function _hangul_buffer_is_empty($buffer) {
 $buffer = $buffer|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = ($2|0)==(0);
 if ($3) {
  $4 = $0;
  $5 = (($4) + 4|0);
  $6 = HEAP32[$5>>2]|0;
  $7 = ($6|0)==(0);
  if ($7) {
   $8 = $0;
   $9 = (($8) + 8|0);
   $10 = HEAP32[$9>>2]|0;
   $11 = ($10|0)==(0);
   $12 = $11;
  } else {
   $12 = 0;
  }
 } else {
  $12 = 0;
 }
 STACKTOP = sp;return ($12|0);
}
function _hangul_ic_has_choseong($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 8|0);
 $3 = (_hangul_buffer_has_choseong($2)|0);
 STACKTOP = sp;return ($3|0);
}
function _hangul_buffer_has_choseong($buffer) {
 $buffer = $buffer|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $0;
 $2 = HEAP32[$1>>2]|0;
 $3 = ($2|0)!=(0);
 STACKTOP = sp;return ($3|0);
}
function _hangul_ic_has_jungseong($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 8|0);
 $3 = (_hangul_buffer_has_jungseong($2)|0);
 STACKTOP = sp;return ($3|0);
}
function _hangul_buffer_has_jungseong($buffer) {
 $buffer = $buffer|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $0;
 $2 = (($1) + 4|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($3|0)!=(0);
 STACKTOP = sp;return ($4|0);
}
function _hangul_ic_has_jongseong($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 8|0);
 $3 = (_hangul_buffer_has_jongseong($2)|0);
 STACKTOP = sp;return ($3|0);
}
function _hangul_buffer_has_jongseong($buffer) {
 $buffer = $buffer|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $0;
 $2 = (($1) + 8|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($3|0)!=(0);
 STACKTOP = sp;return ($4|0);
}
function _hangul_ic_set_output_mode($hic,$mode) {
 $hic = $hic|0;
 $mode = $mode|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $mode;
 $2 = $0;
 $3 = ($2|0)==(0|0);
 if ($3) {
  STACKTOP = sp;return;
 }
 $4 = $0;
 $5 = (($4) + 860|0);
 $6 = HEAP8[$5]|0;
 $7 = $6 & 1;
 $8 = $7&255;
 $9 = ($8|0)!=(0);
 if ($9) {
  STACKTOP = sp;return;
 }
 $10 = $1;
 $11 = $0;
 $12 = (($11) + 72|0);
 HEAP32[$12>>2] = $10;
 STACKTOP = sp;return;
}
function _hangul_ic_connect_callback($hic,$event,$callback,$user_data) {
 $hic = $hic|0;
 $event = $event|0;
 $callback = $callback|0;
 $user_data = $user_data|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $event;
 $2 = $callback;
 $3 = $user_data;
 $4 = $0;
 $5 = ($4|0)==(0|0);
 if (!($5)) {
  $6 = $1;
  $7 = ($6|0)==(0|0);
  if (!($7)) {
   $8 = $1;
   $9 = (_strcasecmp($8,8)|0);
   $10 = ($9|0)==(0);
   if ($10) {
    $11 = $2;
    $12 = $0;
    $13 = (($12) + 844|0);
    HEAP32[$13>>2] = $11;
    $14 = $3;
    $15 = $0;
    $16 = (($15) + 848|0);
    HEAP32[$16>>2] = $14;
    STACKTOP = sp;return;
   }
   $17 = $1;
   $18 = (_strcasecmp($17,24)|0);
   $19 = ($18|0)==(0);
   if ($19) {
    $20 = $2;
    $21 = $0;
    $22 = (($21) + 852|0);
    HEAP32[$22>>2] = $20;
    $23 = $3;
    $24 = $0;
    $25 = (($24) + 856|0);
    HEAP32[$25>>2] = $23;
   }
   STACKTOP = sp;return;
  }
 }
 STACKTOP = sp;return;
}
function _hangul_ic_set_keyboard($hic,$keyboard) {
 $hic = $hic|0;
 $keyboard = $keyboard|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $keyboard;
 $2 = $0;
 $3 = ($2|0)==(0|0);
 if (!($3)) {
  $4 = $1;
  $5 = ($4|0)==(0|0);
  if (!($5)) {
   $6 = $1;
   $7 = $0;
   $8 = (($7) + 4|0);
   HEAP32[$8>>2] = $6;
   STACKTOP = sp;return;
  }
 }
 STACKTOP = sp;return;
}
function _hangul_ic_select_keyboard($hic,$id) {
 $hic = $hic|0;
 $id = $id|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $keyboard = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $id;
 $2 = $0;
 $3 = ($2|0)==(0|0);
 if ($3) {
  STACKTOP = sp;return;
 }
 $4 = $1;
 $5 = ($4|0)==(0|0);
 if ($5) {
  $1 = 40;
 }
 $6 = $1;
 $7 = (_hangul_ic_get_keyboard_by_id($6)|0);
 $keyboard = $7;
 $8 = $keyboard;
 $9 = ($8|0)!=(0|0);
 if ($9) {
  $10 = $keyboard;
  $11 = $0;
  $12 = (($11) + 4|0);
  HEAP32[$12>>2] = $10;
  STACKTOP = sp;return;
 } else {
  $13 = $0;
  $14 = (($13) + 4|0);
  HEAP32[$14>>2] = 48;
  STACKTOP = sp;return;
 }
}
function _hangul_ic_get_keyboard_by_id($id) {
 $id = $id|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0;
 var $keyboard = 0, $n = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $id;
 $2 = (_hangul_ic_get_n_keyboards()|0);
 $n = $2;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $n;
  $5 = ($3>>>0)<($4>>>0);
  if (!($5)) {
   label = 7;
   break;
  }
  $6 = $i;
  $7 = (72 + ($6<<2)|0);
  $8 = HEAP32[$7>>2]|0;
  $keyboard = $8;
  $9 = $1;
  $10 = $keyboard;
  $11 = (($10) + 4|0);
  $12 = HEAP32[$11>>2]|0;
  $13 = (_strcmp($9,$12)|0);
  $14 = ($13|0)==(0);
  if ($14) {
   label = 4;
   break;
  }
  $16 = $i;
  $17 = (($16) + 1)|0;
  $i = $17;
 }
 if ((label|0) == 4) {
  $15 = $keyboard;
  $0 = $15;
  $18 = $0;
  STACKTOP = sp;return ($18|0);
 }
 else if ((label|0) == 7) {
  $0 = 0;
  $18 = $0;
  STACKTOP = sp;return ($18|0);
 }
 return 0|0;
}
function _hangul_ic_set_combination($hic,$combination) {
 $hic = $hic|0;
 $combination = $combination|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $combination;
 STACKTOP = sp;return;
}
function _hangul_ic_new($keyboard) {
 $keyboard = $keyboard|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $hic = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $keyboard;
 $2 = (_malloc(864)|0);
 $hic = $2;
 $3 = $hic;
 $4 = ($3|0)==(0|0);
 if ($4) {
  $0 = 0;
  $29 = $0;
  STACKTOP = sp;return ($29|0);
 } else {
  $5 = $hic;
  $6 = (($5) + 76|0);
  HEAP32[$6>>2] = 0;
  $7 = $hic;
  $8 = (($7) + 332|0);
  HEAP32[$8>>2] = 0;
  $9 = $hic;
  $10 = (($9) + 588|0);
  HEAP32[$10>>2] = 0;
  $11 = $hic;
  $12 = (($11) + 844|0);
  HEAP32[$12>>2] = 0;
  $13 = $hic;
  $14 = (($13) + 848|0);
  HEAP32[$14>>2] = 0;
  $15 = $hic;
  $16 = (($15) + 852|0);
  HEAP32[$16>>2] = 0;
  $17 = $hic;
  $18 = (($17) + 856|0);
  HEAP32[$18>>2] = 0;
  $19 = $hic;
  $20 = (($19) + 860|0);
  $21 = HEAP8[$20]|0;
  $22 = $21 & -2;
  HEAP8[$20] = $22;
  $23 = $hic;
  _hangul_ic_set_output_mode($23,0);
  $24 = $hic;
  $25 = $1;
  _hangul_ic_select_keyboard($24,$25);
  $26 = $hic;
  $27 = (($26) + 8|0);
  _hangul_buffer_clear($27);
  $28 = $hic;
  $0 = $28;
  $29 = $0;
  STACKTOP = sp;return ($29|0);
 }
 return 0|0;
}
function _hangul_ic_delete($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = ($1|0)==(0|0);
 if ($2) {
 } else {
  $3 = $0;
  _free($3);
 }
 STACKTOP = sp;return;
}
function _hangul_ic_get_n_keyboards() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return 9;
}
function _hangul_ic_get_keyboard_id($index_) {
 $index_ = $index_|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $index_;
 $2 = $1;
 $3 = ($2>>>0)<(9);
 if ($3) {
  $4 = $1;
  $5 = (72 + ($4<<2)|0);
  $6 = HEAP32[$5>>2]|0;
  $7 = (($6) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $0 = $8;
  $9 = $0;
  STACKTOP = sp;return ($9|0);
 } else {
  $0 = 0;
  $9 = $0;
  STACKTOP = sp;return ($9|0);
 }
 return 0|0;
}
function _hangul_ic_get_keyboard_name($index_) {
 $index_ = $index_|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $index_;
 $2 = $1;
 $3 = ($2>>>0)<(9);
 if ($3) {
  $4 = $1;
  $5 = (72 + ($4<<2)|0);
  $6 = HEAP32[$5>>2]|0;
  $7 = (($6) + 8|0);
  $8 = HEAP32[$7>>2]|0;
  $0 = $8;
  $9 = $0;
  STACKTOP = sp;return ($9|0);
 } else {
  $0 = 0;
  $9 = $0;
  STACKTOP = sp;return ($9|0);
 }
 return 0|0;
}
function _hangul_ic_is_transliteration($hic) {
 $hic = $hic|0;
 var $$expand_i1_val = 0, $$expand_i1_val2 = 0, $$expand_i1_val4 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $type = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $hic;
 $2 = $1;
 $3 = ($2|0)==(0|0);
 do {
  if ($3) {
   $$expand_i1_val = 0;
   $0 = $$expand_i1_val;
  } else {
   $4 = $1;
   $5 = (($4) + 4|0);
   $6 = HEAP32[$5>>2]|0;
   $7 = (_hangul_keyboard_get_type($6)|0);
   $type = $7;
   $8 = $type;
   $9 = ($8|0)==(2);
   if ($9) {
    $$expand_i1_val2 = 1;
    $0 = $$expand_i1_val2;
    break;
   } else {
    $$expand_i1_val4 = 0;
    $0 = $$expand_i1_val4;
    break;
   }
  }
 } while(0);
 $$pre_trunc = $0;
 $10 = $$pre_trunc&1;
 STACKTOP = sp;return ($10|0);
}
function _hangul_buffer_pop($buffer) {
 $buffer = $buffer|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $0;
 $2 = (($1) + 60|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) + -1)|0;
 HEAP32[$2>>2] = $4;
 $5 = $0;
 $6 = (($5) + 12|0);
 $7 = (($6) + ($3<<2)|0);
 $8 = HEAP32[$7>>2]|0;
 STACKTOP = sp;return ($8|0);
}
function _hangul_buffer_peek($buffer) {
 $buffer = $buffer|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $buffer;
 $2 = $1;
 $3 = (($2) + 60|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)<(0);
 if ($5) {
  $0 = 0;
  $13 = $0;
  STACKTOP = sp;return ($13|0);
 } else {
  $6 = $1;
  $7 = (($6) + 60|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = $1;
  $10 = (($9) + 12|0);
  $11 = (($10) + ($8<<2)|0);
  $12 = HEAP32[$11>>2]|0;
  $0 = $12;
  $13 = $0;
  STACKTOP = sp;return ($13|0);
 }
 return 0|0;
}
function _hangul_jaso_to_string($cho,$jung,$jong,$buf,$len) {
 $cho = $cho|0;
 $jung = $jung|0;
 $jong = $jong|0;
 $buf = $buf|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0;
 var $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
 var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0;
 var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
 var $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $ch = 0, $n = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $cho;
 $1 = $jung;
 $2 = $jong;
 $3 = $buf;
 $4 = $len;
 $ch = 0;
 $n = 0;
 $5 = $0;
 $6 = ($5|0)!=(0);
 if ($6) {
  $7 = $1;
  $8 = ($7|0)!=(0);
  if ($8) {
   $9 = $0;
   $10 = $1;
   $11 = $2;
   $12 = (_hangul_jamo_to_syllable($9,$10,$11)|0);
   $ch = $12;
   $13 = $ch;
   $14 = ($13|0)!=(0);
   if ($14) {
    $15 = $ch;
    $16 = $n;
    $17 = (($16) + 1)|0;
    $n = $17;
    $18 = $3;
    $19 = (($18) + ($16<<2)|0);
    HEAP32[$19>>2] = $15;
   } else {
    $20 = $0;
    $21 = $n;
    $22 = (($21) + 1)|0;
    $n = $22;
    $23 = $3;
    $24 = (($23) + ($21<<2)|0);
    HEAP32[$24>>2] = $20;
    $25 = $1;
    $26 = $n;
    $27 = (($26) + 1)|0;
    $n = $27;
    $28 = $3;
    $29 = (($28) + ($26<<2)|0);
    HEAP32[$29>>2] = $25;
    $30 = $2;
    $31 = ($30|0)!=(0);
    if ($31) {
     $32 = $2;
     $33 = $n;
     $34 = (($33) + 1)|0;
     $n = $34;
     $35 = $3;
     $36 = (($35) + ($33<<2)|0);
     HEAP32[$36>>2] = $32;
    }
   }
  } else {
   $37 = $2;
   $38 = ($37|0)!=(0);
   if ($38) {
    $39 = $0;
    $40 = $n;
    $41 = (($40) + 1)|0;
    $n = $41;
    $42 = $3;
    $43 = (($42) + ($40<<2)|0);
    HEAP32[$43>>2] = $39;
    $44 = $n;
    $45 = (($44) + 1)|0;
    $n = $45;
    $46 = $3;
    $47 = (($46) + ($44<<2)|0);
    HEAP32[$47>>2] = 4448;
    $48 = $2;
    $49 = $n;
    $50 = (($49) + 1)|0;
    $n = $50;
    $51 = $3;
    $52 = (($51) + ($49<<2)|0);
    HEAP32[$52>>2] = $48;
   } else {
    $53 = $0;
    $54 = (_hangul_jamo_to_cjamo($53)|0);
    $ch = $54;
    $55 = $ch;
    $56 = (_hangul_is_cjamo($55)|0);
    if ($56) {
     $57 = $ch;
     $58 = $n;
     $59 = (($58) + 1)|0;
     $n = $59;
     $60 = $3;
     $61 = (($60) + ($58<<2)|0);
     HEAP32[$61>>2] = $57;
    } else {
     $62 = $0;
     $63 = $n;
     $64 = (($63) + 1)|0;
     $n = $64;
     $65 = $3;
     $66 = (($65) + ($63<<2)|0);
     HEAP32[$66>>2] = $62;
     $67 = $n;
     $68 = (($67) + 1)|0;
     $n = $68;
     $69 = $3;
     $70 = (($69) + ($67<<2)|0);
     HEAP32[$70>>2] = 4448;
    }
   }
  }
  $134 = $n;
  $135 = $3;
  $136 = (($135) + ($134<<2)|0);
  HEAP32[$136>>2] = 0;
  $137 = $n;
  STACKTOP = sp;return ($137|0);
 }
 $71 = $1;
 $72 = ($71|0)!=(0);
 if ($72) {
  $73 = $2;
  $74 = ($73|0)!=(0);
  if ($74) {
   $75 = $n;
   $76 = (($75) + 1)|0;
   $n = $76;
   $77 = $3;
   $78 = (($77) + ($75<<2)|0);
   HEAP32[$78>>2] = 4447;
   $79 = $1;
   $80 = $n;
   $81 = (($80) + 1)|0;
   $n = $81;
   $82 = $3;
   $83 = (($82) + ($80<<2)|0);
   HEAP32[$83>>2] = $79;
   $84 = $2;
   $85 = $n;
   $86 = (($85) + 1)|0;
   $n = $86;
   $87 = $3;
   $88 = (($87) + ($85<<2)|0);
   HEAP32[$88>>2] = $84;
  } else {
   $89 = $1;
   $90 = (_hangul_jamo_to_cjamo($89)|0);
   $ch = $90;
   $91 = $ch;
   $92 = (_hangul_is_cjamo($91)|0);
   if ($92) {
    $93 = $ch;
    $94 = $n;
    $95 = (($94) + 1)|0;
    $n = $95;
    $96 = $3;
    $97 = (($96) + ($94<<2)|0);
    HEAP32[$97>>2] = $93;
   } else {
    $98 = $n;
    $99 = (($98) + 1)|0;
    $n = $99;
    $100 = $3;
    $101 = (($100) + ($98<<2)|0);
    HEAP32[$101>>2] = 4447;
    $102 = $1;
    $103 = $n;
    $104 = (($103) + 1)|0;
    $n = $104;
    $105 = $3;
    $106 = (($105) + ($103<<2)|0);
    HEAP32[$106>>2] = $102;
   }
  }
 } else {
  $107 = $2;
  $108 = ($107|0)!=(0);
  if ($108) {
   $109 = $2;
   $110 = (_hangul_jamo_to_cjamo($109)|0);
   $ch = $110;
   $111 = $ch;
   $112 = (_hangul_is_cjamo($111)|0);
   if ($112) {
    $113 = $ch;
    $114 = $n;
    $115 = (($114) + 1)|0;
    $n = $115;
    $116 = $3;
    $117 = (($116) + ($114<<2)|0);
    HEAP32[$117>>2] = $113;
   } else {
    $118 = $n;
    $119 = (($118) + 1)|0;
    $n = $119;
    $120 = $3;
    $121 = (($120) + ($118<<2)|0);
    HEAP32[$121>>2] = 4447;
    $122 = $n;
    $123 = (($122) + 1)|0;
    $n = $123;
    $124 = $3;
    $125 = (($124) + ($122<<2)|0);
    HEAP32[$125>>2] = 4448;
    $126 = $2;
    $127 = $n;
    $128 = (($127) + 1)|0;
    $n = $128;
    $129 = $3;
    $130 = (($129) + ($127<<2)|0);
    HEAP32[$130>>2] = $126;
   }
  } else {
   $131 = $n;
   $132 = $3;
   $133 = (($132) + ($131<<2)|0);
   HEAP32[$133>>2] = 0;
  }
 }
 $134 = $n;
 $135 = $3;
 $136 = (($135) + ($134<<2)|0);
 HEAP32[$136>>2] = 0;
 $137 = $n;
 STACKTOP = sp;return ($137|0);
}
function _hangul_ic_save_commit_string($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $len = 0, $string = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 332|0);
 $string = $2;
 $len = 64;
 while(1) {
  $3 = $len;
  $4 = ($3|0)>(0);
  if (!($4)) {
   break;
  }
  $5 = $string;
  $6 = HEAP32[$5>>2]|0;
  $7 = ($6|0)==(0);
  if ($7) {
   label = 4;
   break;
  }
  $8 = $len;
  $9 = (($8) + -1)|0;
  $len = $9;
  $10 = $string;
  $11 = (($10) + 4|0);
  $string = $11;
 }
 if ((label|0) == 4) {
 }
 $12 = $0;
 $13 = (($12) + 72|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = ($14|0)==(1);
 if ($15) {
  $16 = $0;
  $17 = (($16) + 8|0);
  $18 = $string;
  $19 = $len;
  (_hangul_buffer_get_jamo_string($17,$18,$19)|0);
  $24 = $0;
  $25 = (($24) + 8|0);
  _hangul_buffer_clear($25);
  STACKTOP = sp;return;
 } else {
  $20 = $0;
  $21 = (($20) + 8|0);
  $22 = $string;
  $23 = $len;
  (_hangul_buffer_get_string($21,$22,$23)|0);
  $24 = $0;
  $25 = (($24) + 8|0);
  _hangul_buffer_clear($25);
  STACKTOP = sp;return;
 }
}
function _hangul_ic_append_commit_string($hic,$ch) {
 $hic = $hic|0;
 $ch = $ch|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $ch;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = ($2>>>0)<(64);
  if (!($3)) {
   break;
  }
  $4 = $i;
  $5 = $0;
  $6 = (($5) + 332|0);
  $7 = (($6) + ($4<<2)|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ($8|0)==(0);
  if ($9) {
   label = 4;
   break;
  }
  $10 = $i;
  $11 = (($10) + 1)|0;
  $i = $11;
 }
 if ((label|0) == 4) {
 }
 $12 = $i;
 $13 = (($12) + 1)|0;
 $14 = ($13>>>0)<(64);
 if (!($14)) {
  STACKTOP = sp;return;
 }
 $15 = $1;
 $16 = $i;
 $17 = (($16) + 1)|0;
 $i = $17;
 $18 = $0;
 $19 = (($18) + 332|0);
 $20 = (($19) + ($16<<2)|0);
 HEAP32[$20>>2] = $15;
 $21 = $i;
 $22 = $0;
 $23 = (($22) + 332|0);
 $24 = (($23) + ($21<<2)|0);
 HEAP32[$24>>2] = 0;
 STACKTOP = sp;return;
}
function _hangul_ic_push($hic,$c) {
 $hic = $hic|0;
 $c = $c|0;
 var $$expand_i1_val = 0, $$expand_i1_val2 = 0, $$expand_i1_val4 = 0, $$expand_i1_val6 = 0, $$pre_trunc = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $buf = 0, $cho = 0, $jong = 0, $jung = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 288|0;
 $buf = sp + 24|0;
 $1 = $hic;
 $2 = $c;
 _memset(($buf|0),0,256)|0;
 $3 = $1;
 $4 = (($3) + 852|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($5|0)!=(0|0);
 do {
  if ($6) {
   $7 = $2;
   $8 = (_hangul_is_choseong($7)|0);
   if ($8) {
    $9 = $2;
    $cho = $9;
    $10 = $1;
    $11 = (($10) + 8|0);
    $12 = (($11) + 4|0);
    $13 = HEAP32[$12>>2]|0;
    $jung = $13;
    $14 = $1;
    $15 = (($14) + 8|0);
    $16 = (($15) + 8|0);
    $17 = HEAP32[$16>>2]|0;
    $jong = $17;
   } else {
    $18 = $2;
    $19 = (_hangul_is_jungseong($18)|0);
    do {
     if ($19) {
      $20 = $1;
      $21 = (($20) + 8|0);
      $22 = HEAP32[$21>>2]|0;
      $cho = $22;
      $23 = $2;
      $jung = $23;
      $24 = $1;
      $25 = (($24) + 8|0);
      $26 = (($25) + 8|0);
      $27 = HEAP32[$26>>2]|0;
      $jong = $27;
     } else {
      $28 = $2;
      $29 = (_hangul_is_jongseong($28)|0);
      if ($29) {
       $30 = $1;
       $31 = (($30) + 8|0);
       $32 = HEAP32[$31>>2]|0;
       $cho = $32;
       $33 = $1;
       $34 = (($33) + 8|0);
       $35 = (($34) + 4|0);
       $36 = HEAP32[$35>>2]|0;
       $jung = $36;
       $37 = $2;
       $jong = $37;
       break;
      } else {
       $38 = $1;
       _hangul_ic_flush_internal($38);
       $$expand_i1_val = 0;
       $0 = $$expand_i1_val;
       $$pre_trunc = $0;
       $58 = $$pre_trunc&1;
       STACKTOP = sp;return ($58|0);
      }
     }
    } while(0);
   }
   $39 = $cho;
   $40 = $jung;
   $41 = $jong;
   (_hangul_jaso_to_string($39,$40,$41,$buf,64)|0);
   $42 = $1;
   $43 = (($42) + 852|0);
   $44 = HEAP32[$43>>2]|0;
   $45 = $1;
   $46 = $2;
   $47 = $1;
   $48 = (($47) + 856|0);
   $49 = HEAP32[$48>>2]|0;
   $50 = (FUNCTION_TABLE_iiiii[$44 & 0]($45,$46,$buf,$49)|0);
   if ($50) {
    break;
   }
   $51 = $1;
   _hangul_ic_flush_internal($51);
   $$expand_i1_val2 = 0;
   $0 = $$expand_i1_val2;
   $$pre_trunc = $0;
   $58 = $$pre_trunc&1;
   STACKTOP = sp;return ($58|0);
  } else {
   $52 = $2;
   $53 = (_hangul_is_jamo($52)|0);
   if ($53) {
    break;
   }
   $54 = $1;
   _hangul_ic_flush_internal($54);
   $$expand_i1_val4 = 0;
   $0 = $$expand_i1_val4;
   $$pre_trunc = $0;
   $58 = $$pre_trunc&1;
   STACKTOP = sp;return ($58|0);
  }
 } while(0);
 $55 = $1;
 $56 = (($55) + 8|0);
 $57 = $2;
 _hangul_buffer_push($56,$57);
 $$expand_i1_val6 = 1;
 $0 = $$expand_i1_val6;
 $$pre_trunc = $0;
 $58 = $$pre_trunc&1;
 STACKTOP = sp;return ($58|0);
}
function _hangul_ic_choseong_to_jongseong($hic,$cho) {
 $hic = $hic|0;
 $cho = $cho|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $jong = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $hic;
 $2 = $cho;
 $3 = $2;
 $4 = (_hangul_choseong_to_jongseong($3)|0);
 $jong = $4;
 $5 = $jong;
 $6 = (_hangul_is_jongseong_conjoinable($5)|0);
 do {
  if ($6) {
   $7 = $jong;
   $0 = $7;
  } else {
   $8 = $1;
   $9 = (($8) + 4|0);
   $10 = HEAP32[$9>>2]|0;
   $11 = (($10) + 16|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = ($12|0)==(3680|0);
   if ($13) {
    $14 = $jong;
    $0 = $14;
    break;
   }
   $0 = 0;
  }
 } while(0);
 $15 = $0;
 STACKTOP = sp;return ($15|0);
}
function _hangul_ic_pop($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 8|0);
 $3 = (_hangul_buffer_pop($2)|0);
 STACKTOP = sp;return ($3|0);
}
function _hangul_ic_peek($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 8|0);
 $3 = (_hangul_buffer_peek($2)|0);
 STACKTOP = sp;return ($3|0);
}
function _hangul_ic_flush_internal($hic) {
 $hic = $hic|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $hic;
 $1 = $0;
 $2 = (($1) + 76|0);
 HEAP32[$2>>2] = 0;
 $3 = $0;
 _hangul_ic_save_commit_string($3);
 $4 = $0;
 $5 = (($4) + 8|0);
 _hangul_buffer_clear($5);
 STACKTOP = sp;return;
}
function _hangul_buffer_push($buffer,$ch) {
 $buffer = $buffer|0;
 $ch = $ch|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $buffer;
 $1 = $ch;
 $2 = $1;
 $3 = (_hangul_is_choseong($2)|0);
 if ($3) {
  $4 = $1;
  $5 = $0;
  HEAP32[$5>>2] = $4;
 } else {
  $6 = $1;
  $7 = (_hangul_is_jungseong($6)|0);
  if ($7) {
   $8 = $1;
   $9 = $0;
   $10 = (($9) + 4|0);
   HEAP32[$10>>2] = $8;
  } else {
   $11 = $1;
   $12 = (_hangul_is_jongseong($11)|0);
   if ($12) {
    $13 = $1;
    $14 = $0;
    $15 = (($14) + 8|0);
    HEAP32[$15>>2] = $13;
   } else {
   }
  }
 }
 $16 = $1;
 $17 = $0;
 $18 = (($17) + 60|0);
 $19 = HEAP32[$18>>2]|0;
 $20 = (($19) + 1)|0;
 HEAP32[$18>>2] = $20;
 $21 = $0;
 $22 = (($21) + 12|0);
 $23 = (($22) + ($20<<2)|0);
 HEAP32[$23>>2] = $16;
 STACKTOP = sp;return;
}
function _hangul_is_choseong($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(4352);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(4447);
  if ($4) {
   $9 = 1;
   STACKTOP = sp;return ($9|0);
  }
 }
 $5 = $0;
 $6 = ($5>>>0)>=(43360);
 if ($6) {
  $7 = $0;
  $8 = ($7>>>0)<=(43388);
  $10 = $8;
 } else {
  $10 = 0;
 }
 $9 = $10;
 STACKTOP = sp;return ($9|0);
}
function _hangul_is_jungseong($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(4448);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(4519);
  if ($4) {
   $9 = 1;
   STACKTOP = sp;return ($9|0);
  }
 }
 $5 = $0;
 $6 = ($5>>>0)>=(55216);
 if ($6) {
  $7 = $0;
  $8 = ($7>>>0)<=(55238);
  $10 = $8;
 } else {
  $10 = 0;
 }
 $9 = $10;
 STACKTOP = sp;return ($9|0);
}
function _hangul_is_jongseong($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(4520);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(4607);
  if ($4) {
   $9 = 1;
   STACKTOP = sp;return ($9|0);
  }
 }
 $5 = $0;
 $6 = ($5>>>0)>=(55243);
 if ($6) {
  $7 = $0;
  $8 = ($7>>>0)<=(55291);
  $10 = $8;
 } else {
  $10 = 0;
 }
 $9 = $10;
 STACKTOP = sp;return ($9|0);
}
function _hangul_is_combining_mark($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1|0)==(12334);
 do {
  if ($2) {
   $17 = 1;
  } else {
   $3 = $0;
   $4 = ($3|0)==(12335);
   if ($4) {
    $17 = 1;
   } else {
    $5 = $0;
    $6 = ($5>>>0)>=(768);
    if ($6) {
     $7 = $0;
     $8 = ($7>>>0)<=(879);
     if ($8) {
      $17 = 1;
      break;
     }
    }
    $9 = $0;
    $10 = ($9>>>0)>=(7616);
    if ($10) {
     $11 = $0;
     $12 = ($11>>>0)<=(7679);
     if ($12) {
      $17 = 1;
      break;
     }
    }
    $13 = $0;
    $14 = ($13>>>0)>=(65056);
    if ($14) {
     $15 = $0;
     $16 = ($15>>>0)<=(65071);
     $18 = $16;
    } else {
     $18 = 0;
    }
    $17 = $18;
   }
  }
 } while(0);
 STACKTOP = sp;return ($17|0);
}
function _hangul_is_choseong_conjoinable($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(4352);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(4370);
  $5 = $4;
 } else {
  $5 = 0;
 }
 STACKTOP = sp;return ($5|0);
}
function _hangul_is_jungseong_conjoinable($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(4449);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(4469);
  $5 = $4;
 } else {
  $5 = 0;
 }
 STACKTOP = sp;return ($5|0);
}
function _hangul_is_jongseong_conjoinable($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(4519);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(4546);
  $5 = $4;
 } else {
  $5 = 0;
 }
 STACKTOP = sp;return ($5|0);
}
function _hangul_is_syllable($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(44032);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(55203);
  $5 = $4;
 } else {
  $5 = 0;
 }
 STACKTOP = sp;return ($5|0);
}
function _hangul_is_jamo($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = (_hangul_is_choseong($1)|0);
 if ($2) {
  $7 = 1;
 } else {
  $3 = $0;
  $4 = (_hangul_is_jungseong($3)|0);
  if ($4) {
   $7 = 1;
  } else {
   $5 = $0;
   $6 = (_hangul_is_jongseong($5)|0);
   $7 = $6;
  }
 }
 STACKTOP = sp;return ($7|0);
}
function _hangul_is_cjamo($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $0;
 $2 = ($1>>>0)>=(12593);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(12686);
  $5 = $4;
 } else {
  $5 = 0;
 }
 STACKTOP = sp;return ($5|0);
}
function _hangul_jamo_to_cjamo($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $ret = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $ret = 0;
 $1 = $0;
 $2 = ($1>>>0)>=(4352);
 if ($2) {
  $3 = $0;
  $4 = ($3>>>0)<=(4607);
  if ($4) {
   $5 = $0;
   $6 = (($5) - 4352)|0;
   $7 = (9192 + ($6<<1)|0);
   $8 = HEAP16[$7>>1]|0;
   $9 = $8&65535;
   $ret = $9;
  } else {
   label = 4;
  }
 } else {
  label = 4;
 }
 if ((label|0) == 4) {
  $10 = $0;
  $11 = ($10>>>0)>=(43360);
  if ($11) {
   $12 = $0;
   $13 = ($12>>>0)<=(43388);
   if ($13) {
    $14 = $0;
    $15 = (($14) - 43360)|0;
    $16 = (9704 + ($15<<1)|0);
    $17 = HEAP16[$16>>1]|0;
    $18 = $17&65535;
    $ret = $18;
   } else {
    label = 7;
   }
  } else {
   label = 7;
  }
  if ((label|0) == 7) {
   $19 = $0;
   $20 = ($19>>>0)>=(55216);
   if ($20) {
    $21 = $0;
    $22 = ($21>>>0)<=(55291);
    if ($22) {
     $23 = $0;
     $24 = (($23) - 55216)|0;
     $25 = (9768 + ($24<<1)|0);
     $26 = HEAP16[$25>>1]|0;
     $27 = $26&65535;
     $ret = $27;
    }
   }
  }
 }
 $28 = $ret;
 $29 = ($28|0)==(0);
 if (!($29)) {
  $31 = $ret;
  STACKTOP = sp;return ($31|0);
 }
 $30 = $0;
 $ret = $30;
 $31 = $ret;
 STACKTOP = sp;return ($31|0);
}
function _hangul_choseong_to_jongseong($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $c;
 $2 = $1;
 $3 = ($2>>>0)>=(4352);
 if ($3) {
  $4 = $1;
  $5 = ($4>>>0)<=(4446);
  if ($5) {
   $6 = $1;
   $7 = (($6) - 4352)|0;
   $8 = (9920 + ($7<<2)|0);
   $9 = HEAP32[$8>>2]|0;
   $0 = $9;
  } else {
   label = 4;
  }
 } else {
  label = 4;
 }
 do {
  if ((label|0) == 4) {
   $10 = $1;
   $11 = ($10>>>0)>=(43360);
   if ($11) {
    $12 = $1;
    $13 = ($12>>>0)<=(43388);
    if ($13) {
     $14 = $1;
     $15 = (($14) - 43360)|0;
     $16 = (10304 + ($15<<2)|0);
     $17 = HEAP32[$16>>2]|0;
     $0 = $17;
     break;
    }
   }
   $0 = 0;
  }
 } while(0);
 $18 = $0;
 STACKTOP = sp;return ($18|0);
}
function _hangul_jongseong_to_choseong($c) {
 $c = $c|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $c;
 $2 = $1;
 $3 = ($2>>>0)>=(4520);
 if ($3) {
  $4 = $1;
  $5 = ($4>>>0)<=(4607);
  if ($5) {
   $6 = $1;
   $7 = (($6) - 4520)|0;
   $8 = (10424 + ($7<<2)|0);
   $9 = HEAP32[$8>>2]|0;
   $0 = $9;
  } else {
   label = 4;
  }
 } else {
  label = 4;
 }
 do {
  if ((label|0) == 4) {
   $10 = $1;
   $11 = ($10>>>0)>=(55243);
   if ($11) {
    $12 = $1;
    $13 = ($12>>>0)<=(55291);
    if ($13) {
     $14 = $1;
     $15 = (($14) - 55243)|0;
     $16 = (10776 + ($15<<2)|0);
     $17 = HEAP32[$16>>2]|0;
     $0 = $17;
     break;
    }
   }
   $0 = 0;
  }
 } while(0);
 $18 = $0;
 STACKTOP = sp;return ($18|0);
}
function _hangul_jongseong_decompose($c,$jong,$cho) {
 $c = $c|0;
 $jong = $jong|0;
 $cho = $cho|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $c;
 $1 = $jong;
 $2 = $cho;
 $3 = $0;
 $4 = (($3) - 4520)|0;
 $5 = (10976 + ($4<<3)|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = $1;
 HEAP32[$7>>2] = $6;
 $8 = $0;
 $9 = (($8) - 4520)|0;
 $10 = (10976 + ($9<<3)|0);
 $11 = (($10) + 4|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = $2;
 HEAP32[$13>>2] = $12;
 STACKTOP = sp;return;
}
function _hangul_jongseong_get_diff($prevjong,$jong) {
 $prevjong = $prevjong|0;
 $jong = $jong|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $cho = 0, $diff = 0, $n1 = 0, $n2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $0 = $prevjong;
 $1 = $jong;
 $cho = 0;
 $2 = $0;
 $3 = ($2|0)==(0);
 if ($3) {
  $4 = $1;
  $5 = (_hangul_jongseong_to_choseong($4)|0);
  $cho = $5;
  $42 = $cho;
  STACKTOP = sp;return ($42|0);
 }
 $6 = $0;
 $7 = (_hangul_jongseong_get_ncomponent($6)|0);
 $n1 = $7;
 $8 = $1;
 $9 = (_hangul_jongseong_get_ncomponent($8)|0);
 $n2 = $9;
 $10 = $n2;
 $11 = $n1;
 $12 = (($10) - ($11))|0;
 $13 = (($12) - 1)|0;
 $diff = $13;
 $14 = $diff;
 $15 = ($14|0)>=(0);
 if ($15) {
  $16 = $diff;
  $17 = ($16|0)<(2);
  if ($17) {
   $18 = $1;
   $19 = ($18>>>0)>=(4520);
   if ($19) {
    $20 = $1;
    $21 = ($20>>>0)<=(4607);
    if ($21) {
     $22 = $diff;
     $23 = $1;
     $24 = (($23) - 4520)|0;
     $25 = (11192 + ($24<<3)|0);
     $26 = (($25) + ($22<<2)|0);
     $27 = HEAP32[$26>>2]|0;
     $cho = $27;
    } else {
     label = 8;
    }
   } else {
    label = 8;
   }
   if ((label|0) == 8) {
    $28 = $1;
    $29 = ($28>>>0)>=(55243);
    if ($29) {
     $30 = $1;
     $31 = ($30>>>0)<=(55291);
     if ($31) {
      $32 = $diff;
      $33 = $1;
      $34 = (($33) - 55243)|0;
      $35 = (11896 + ($34<<3)|0);
      $36 = (($35) + ($32<<2)|0);
      $37 = HEAP32[$36>>2]|0;
      $cho = $37;
     }
    }
   }
  } else {
   label = 13;
  }
 } else {
  label = 13;
 }
 if ((label|0) == 13) {
  $38 = $diff;
  $39 = ($38|0)==(2);
  if ($39) {
   $40 = $1;
   $41 = (_hangul_jongseong_to_choseong($40)|0);
   $cho = $41;
  }
 }
 $42 = $cho;
 STACKTOP = sp;return ($42|0);
}
function _hangul_jongseong_get_ncomponent($jong) {
 $jong = $jong|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $jong;
 $2 = $1;
 $3 = ($2>>>0)>=(4520);
 if ($3) {
  $4 = $1;
  $5 = ($4>>>0)<=(4607);
  if ($5) {
   $6 = $1;
   $7 = (($6) - 4520)|0;
   $8 = (12288 + ($7)|0);
   $9 = HEAP8[$8]|0;
   $10 = $9 << 24 >> 24;
   $0 = $10;
   $20 = $0;
   STACKTOP = sp;return ($20|0);
  }
 }
 $11 = $1;
 $12 = ($11>>>0)>=(55243);
 if ($12) {
  $13 = $1;
  $14 = ($13>>>0)<=(55291);
  if ($14) {
   $15 = $1;
   $16 = (($15) - 55243)|0;
   $17 = (12376 + ($16)|0);
   $18 = HEAP8[$17]|0;
   $19 = $18 << 24 >> 24;
   $0 = $19;
   $20 = $0;
   STACKTOP = sp;return ($20|0);
  }
 }
 $0 = 0;
 $20 = $0;
 STACKTOP = sp;return ($20|0);
}
function _hangul_jamo_to_syllable($choseong,$jungseong,$jongseong) {
 $choseong = $choseong|0;
 $jungseong = $jungseong|0;
 $jongseong = $jongseong|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $choseong;
 $2 = $jungseong;
 $3 = $jongseong;
 $4 = $3;
 $5 = ($4|0)==(0);
 if ($5) {
  $3 = 4519;
 }
 $6 = $1;
 $7 = (_hangul_is_choseong_conjoinable($6)|0);
 if (!($7)) {
  $0 = 0;
  $27 = $0;
  STACKTOP = sp;return ($27|0);
 }
 $8 = $2;
 $9 = (_hangul_is_jungseong_conjoinable($8)|0);
 if (!($9)) {
  $0 = 0;
  $27 = $0;
  STACKTOP = sp;return ($27|0);
 }
 $10 = $3;
 $11 = (_hangul_is_jongseong_conjoinable($10)|0);
 if ($11) {
  $12 = $1;
  $13 = (($12) - 4352)|0;
  $1 = $13;
  $14 = $2;
  $15 = (($14) - 4449)|0;
  $2 = $15;
  $16 = $3;
  $17 = (($16) - 4519)|0;
  $3 = $17;
  $18 = $1;
  $19 = ($18*21)|0;
  $20 = $2;
  $21 = (($19) + ($20))|0;
  $22 = ($21*28)|0;
  $23 = $3;
  $24 = (($22) + ($23))|0;
  $25 = (($24) + 44032)|0;
  $c = $25;
  $26 = $c;
  $0 = $26;
  $27 = $0;
  STACKTOP = sp;return ($27|0);
 } else {
  $0 = 0;
  $27 = $0;
  STACKTOP = sp;return ($27|0);
 }
 return 0|0;
}
function _hangul_syllable_to_jamo($syllable,$choseong,$jungseong,$jongseong) {
 $syllable = $syllable|0;
 $choseong = $choseong|0;
 $jungseong = $jungseong|0;
 $jongseong = $jongseong|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $syllable;
 $1 = $choseong;
 $2 = $jungseong;
 $3 = $jongseong;
 $4 = $3;
 $5 = ($4|0)!=(0|0);
 if ($5) {
  $6 = $3;
  HEAP32[$6>>2] = 0;
 }
 $7 = $2;
 $8 = ($7|0)!=(0|0);
 if ($8) {
  $9 = $2;
  HEAP32[$9>>2] = 0;
 }
 $10 = $1;
 $11 = ($10|0)!=(0|0);
 if ($11) {
  $12 = $1;
  HEAP32[$12>>2] = 0;
 }
 $13 = $0;
 $14 = (_hangul_is_syllable($13)|0);
 if (!($14)) {
  STACKTOP = sp;return;
 }
 $15 = $0;
 $16 = (($15) - 44032)|0;
 $0 = $16;
 $17 = $3;
 $18 = ($17|0)!=(0|0);
 if ($18) {
  $19 = $0;
  $20 = (($19>>>0) % 28)&-1;
  $21 = ($20|0)!=(0);
  if ($21) {
   $22 = $0;
   $23 = (($22>>>0) % 28)&-1;
   $24 = (4519 + ($23))|0;
   $25 = $3;
   HEAP32[$25>>2] = $24;
  }
 }
 $26 = $0;
 $27 = (($26>>>0) / 28)&-1;
 $0 = $27;
 $28 = $2;
 $29 = ($28|0)!=(0|0);
 if ($29) {
  $30 = $0;
  $31 = (($30>>>0) % 21)&-1;
  $32 = (4449 + ($31))|0;
  $33 = $2;
  HEAP32[$33>>2] = $32;
 }
 $34 = $0;
 $35 = (($34>>>0) / 21)&-1;
 $0 = $35;
 $36 = $1;
 $37 = ($36|0)!=(0|0);
 if (!($37)) {
  STACKTOP = sp;return;
 }
 $38 = $0;
 $39 = (4352 + ($38))|0;
 $40 = $1;
 HEAP32[$40>>2] = $39;
 STACKTOP = sp;return;
}
function _hangul_syllable_len($str,$max_len) {
 $str = $str|0;
 $max_len = $max_len|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $str;
 $2 = $max_len;
 $i = 0;
 $3 = $2;
 $4 = ($3|0)==(0);
 if ($4) {
  $0 = 0;
  $31 = $0;
  STACKTOP = sp;return ($31|0);
 }
 $5 = $i;
 $6 = $1;
 $7 = (($6) + ($5<<2)|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = ($8|0)!=(0);
 if ($9) {
  $i = 1;
  while(1) {
   $10 = $i;
   $11 = $2;
   $12 = ($10|0)<($11|0);
   if (!($12)) {
    break;
   }
   $13 = $i;
   $14 = $1;
   $15 = (($14) + ($13<<2)|0);
   $16 = HEAP32[$15>>2]|0;
   $17 = ($16|0)==(0);
   if ($17) {
    label = 7;
    break;
   }
   $18 = $i;
   $19 = (($18) - 1)|0;
   $20 = $1;
   $21 = (($20) + ($19<<2)|0);
   $22 = HEAP32[$21>>2]|0;
   $23 = $i;
   $24 = $1;
   $25 = (($24) + ($23<<2)|0);
   $26 = HEAP32[$25>>2]|0;
   $27 = (_is_syllable_boundary($22,$26)|0);
   if ($27) {
    label = 9;
    break;
   }
   $28 = $i;
   $29 = (($28) + 1)|0;
   $i = $29;
  }
  if ((label|0) == 7) {
  }
  else if ((label|0) == 9) {
  }
 }
 $30 = $i;
 $0 = $30;
 $31 = $0;
 STACKTOP = sp;return ($31|0);
}
function _is_syllable_boundary($prev,$next) {
 $prev = $prev|0;
 $next = $next|0;
 var $$expand_i1_val = 0, $$expand_i1_val10 = 0, $$expand_i1_val12 = 0, $$expand_i1_val14 = 0, $$expand_i1_val16 = 0, $$expand_i1_val18 = 0, $$expand_i1_val2 = 0, $$expand_i1_val20 = 0, $$expand_i1_val22 = 0, $$expand_i1_val24 = 0, $$expand_i1_val26 = 0, $$expand_i1_val28 = 0, $$expand_i1_val30 = 0, $$expand_i1_val32 = 0, $$expand_i1_val34 = 0, $$expand_i1_val4 = 0, $$expand_i1_val6 = 0, $$expand_i1_val8 = 0, $$pre_trunc = 0, $0 = 0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $prev;
 $2 = $next;
 $3 = $1;
 $4 = (_hangul_is_choseong($3)|0);
 L1: do {
  if ($4) {
   $5 = $2;
   $6 = (_hangul_is_choseong($5)|0);
   if ($6) {
    $$expand_i1_val = 0;
    $0 = $$expand_i1_val;
    break;
   }
   $7 = $2;
   $8 = (_hangul_is_jungseong($7)|0);
   if ($8) {
    $$expand_i1_val2 = 0;
    $0 = $$expand_i1_val2;
    break;
   }
   $9 = $2;
   $10 = (_hangul_is_syllable($9)|0);
   if ($10) {
    $$expand_i1_val4 = 0;
    $0 = $$expand_i1_val4;
    break;
   }
   $11 = $2;
   $12 = (_hangul_is_combining_mark($11)|0);
   if ($12) {
    $$expand_i1_val6 = 0;
    $0 = $$expand_i1_val6;
    break;
   }
   $13 = $2;
   $14 = ($13|0)==(4448);
   if ($14) {
    $$expand_i1_val8 = 0;
    $0 = $$expand_i1_val8;
    break;
   } else {
    label = 55;
    break;
   }
  } else {
   $15 = $1;
   $16 = ($15|0)==(4447);
   do {
    if ($16) {
     $17 = $2;
     $18 = (_hangul_is_jungseong($17)|0);
     if ($18) {
      $$expand_i1_val10 = 0;
      $0 = $$expand_i1_val10;
      break L1;
     }
     $19 = $2;
     $20 = ($19|0)==(4448);
     if ($20) {
      $$expand_i1_val12 = 0;
      $0 = $$expand_i1_val12;
      break L1;
     } else {
      break;
     }
    } else {
     $21 = $1;
     $22 = (_hangul_is_jungseong($21)|0);
     do {
      if ($22) {
       $23 = $2;
       $24 = (_hangul_is_jungseong($23)|0);
       if ($24) {
        $$expand_i1_val14 = 0;
        $0 = $$expand_i1_val14;
        break L1;
       }
       $25 = $2;
       $26 = (_hangul_is_jongseong($25)|0);
       if ($26) {
        $$expand_i1_val16 = 0;
        $0 = $$expand_i1_val16;
        break L1;
       }
       $27 = $2;
       $28 = (_hangul_is_combining_mark($27)|0);
       if ($28) {
        $$expand_i1_val18 = 0;
        $0 = $$expand_i1_val18;
        break L1;
       } else {
        break;
       }
      } else {
       $29 = $1;
       $30 = ($29|0)==(4448);
       do {
        if ($30) {
         $31 = $2;
         $32 = (_hangul_is_jongseong($31)|0);
         if ($32) {
          $$expand_i1_val20 = 0;
          $0 = $$expand_i1_val20;
          break L1;
         } else {
          break;
         }
        } else {
         $33 = $1;
         $34 = (_hangul_is_jongseong($33)|0);
         do {
          if ($34) {
           $35 = $2;
           $36 = (_hangul_is_jongseong($35)|0);
           if ($36) {
            $$expand_i1_val22 = 0;
            $0 = $$expand_i1_val22;
            break L1;
           }
           $37 = $2;
           $38 = (_hangul_is_combining_mark($37)|0);
           if ($38) {
            $$expand_i1_val24 = 0;
            $0 = $$expand_i1_val24;
            break L1;
           } else {
            break;
           }
          } else {
           $39 = $1;
           $40 = (_hangul_is_syllable($39)|0);
           do {
            if ($40) {
             $41 = $1;
             $42 = (($41) - 44032)|0;
             $43 = (($42>>>0) % 28)&-1;
             $44 = ($43|0)==(0);
             do {
              if ($44) {
               $45 = $2;
               $46 = (_hangul_is_jungseong($45)|0);
               if ($46) {
                $$expand_i1_val26 = 0;
                $0 = $$expand_i1_val26;
                break L1;
               }
               $47 = $2;
               $48 = (_hangul_is_jongseong($47)|0);
               if ($48) {
                $$expand_i1_val28 = 0;
                $0 = $$expand_i1_val28;
                break L1;
               } else {
                break;
               }
              } else {
               $49 = $2;
               $50 = (_hangul_is_jongseong($49)|0);
               if ($50) {
                $$expand_i1_val30 = 0;
                $0 = $$expand_i1_val30;
                break L1;
               } else {
                break;
               }
              }
             } while(0);
             $51 = $2;
             $52 = (_hangul_is_combining_mark($51)|0);
             if ($52) {
              $$expand_i1_val32 = 0;
              $0 = $$expand_i1_val32;
              break L1;
             } else {
              break;
             }
            }
           } while(0);
          }
         } while(0);
        }
       } while(0);
      }
     } while(0);
    }
   } while(0);
   label = 55;
  }
 } while(0);
 if ((label|0) == 55) {
  $$expand_i1_val34 = 1;
  $0 = $$expand_i1_val34;
 }
 $$pre_trunc = $0;
 $53 = $$pre_trunc&1;
 STACKTOP = sp;return ($53|0);
}
function _hangul_syllable_iterator_prev($iter,$begin) {
 $iter = $iter|0;
 $begin = $begin|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $curr = 0, $prev = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $iter;
 $1 = $begin;
 $2 = $0;
 $3 = $1;
 $4 = ($2>>>0)>($3>>>0);
 if ($4) {
  $5 = $0;
  $6 = (($5) + -4|0);
  $0 = $6;
 }
 while(1) {
  $7 = $0;
  $8 = $1;
  $9 = ($7>>>0)>($8>>>0);
  if (!($9)) {
   label = 8;
   break;
  }
  $10 = $0;
  $11 = (($10) + -4|0);
  $12 = HEAP32[$11>>2]|0;
  $prev = $12;
  $13 = $0;
  $14 = HEAP32[$13>>2]|0;
  $curr = $14;
  $15 = $prev;
  $16 = $curr;
  $17 = (_is_syllable_boundary($15,$16)|0);
  if ($17) {
   break;
  }
  $18 = $0;
  $19 = (($18) + -4|0);
  $0 = $19;
 }
 if ((label|0) == 8) {
  $20 = $0;
  STACKTOP = sp;return ($20|0);
 }
 $20 = $0;
 STACKTOP = sp;return ($20|0);
}
function _hangul_syllable_iterator_next($iter,$end) {
 $iter = $iter|0;
 $end = $end|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $curr = 0, $prev = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $0 = $iter;
 $1 = $end;
 $2 = $0;
 $3 = $1;
 $4 = ($2>>>0)<($3>>>0);
 if ($4) {
  $5 = $0;
  $6 = (($5) + 4|0);
  $0 = $6;
 }
 while(1) {
  $7 = $0;
  $8 = $1;
  $9 = ($7>>>0)<($8>>>0);
  if (!($9)) {
   label = 8;
   break;
  }
  $10 = $0;
  $11 = (($10) + -4|0);
  $12 = HEAP32[$11>>2]|0;
  $prev = $12;
  $13 = $0;
  $14 = HEAP32[$13>>2]|0;
  $curr = $14;
  $15 = $prev;
  $16 = $curr;
  $17 = (_is_syllable_boundary($15,$16)|0);
  if ($17) {
   break;
  }
  $18 = $0;
  $19 = (($18) + 4|0);
  $0 = $19;
 }
 if ((label|0) == 8) {
  $20 = $0;
  STACKTOP = sp;return ($20|0);
 }
 $20 = $0;
 STACKTOP = sp;return ($20|0);
}
function _hangul_jamos_to_syllables($dest,$destlen,$src,$srclen) {
 $dest = $dest|0;
 $destlen = $destlen|0;
 $src = $src|0;
 $srclen = $srclen|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $8 = 0, $9 = 0, $c = 0, $d = 0, $i = 0;
 var $inleft = 0, $n = 0, $outleft = 0, $s = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $0 = $dest;
 $1 = $destlen;
 $2 = $src;
 $3 = $srclen;
 $4 = $3;
 $5 = ($4|0)<(0);
 if ($5) {
  $6 = $2;
  $s = $6;
  while(1) {
   $7 = $s;
   $8 = HEAP32[$7>>2]|0;
   $9 = ($8|0)!=(0);
   if (!($9)) {
    break;
   }
   $10 = $s;
   $11 = (($10) + 4|0);
   $s = $11;
  }
  $12 = $s;
  $13 = $2;
  $14 = $12;
  $15 = $13;
  $16 = (($14) - ($15))|0;
  $17 = (($16|0) / 4)&-1;
  $3 = $17;
 }
 $18 = $2;
 $s = $18;
 $19 = $0;
 $d = $19;
 $20 = $3;
 $inleft = $20;
 $21 = $1;
 $outleft = $21;
 $22 = $s;
 $23 = $inleft;
 $24 = (_hangul_syllable_len($22,$23)|0);
 $n = $24;
 while(1) {
  $25 = $n;
  $26 = ($25|0)>(0);
  if ($26) {
   $27 = $inleft;
   $28 = ($27|0)>(0);
   if ($28) {
    $29 = $outleft;
    $30 = ($29|0)>(0);
    $75 = $30;
   } else {
    $75 = 0;
   }
  } else {
   $75 = 0;
  }
  if (!($75)) {
   break;
  }
  $31 = $s;
  $32 = $n;
  $33 = (_build_syllable($31,$32)|0);
  $c = $33;
  $34 = $c;
  $35 = ($34|0)!=(0);
  if ($35) {
   $36 = $c;
   $37 = $d;
   HEAP32[$37>>2] = $36;
   $38 = $d;
   $39 = (($38) + 4|0);
   $d = $39;
   $40 = $outleft;
   $41 = (($40) + -1)|0;
   $outleft = $41;
  } else {
   $i = 0;
   while(1) {
    $42 = $i;
    $43 = $n;
    $44 = ($42|0)<($43|0);
    if ($44) {
     $45 = $i;
     $46 = $outleft;
     $47 = ($45|0)<($46|0);
     $76 = $47;
    } else {
     $76 = 0;
    }
    if (!($76)) {
     break;
    }
    $48 = $i;
    $49 = $s;
    $50 = (($49) + ($48<<2)|0);
    $51 = HEAP32[$50>>2]|0;
    $52 = $i;
    $53 = $d;
    $54 = (($53) + ($52<<2)|0);
    HEAP32[$54>>2] = $51;
    $55 = $i;
    $56 = (($55) + 1)|0;
    $i = $56;
   }
   $57 = $i;
   $58 = $d;
   $59 = (($58) + ($57<<2)|0);
   $d = $59;
   $60 = $i;
   $61 = $outleft;
   $62 = (($61) - ($60))|0;
   $outleft = $62;
  }
  $63 = $n;
  $64 = $s;
  $65 = (($64) + ($63<<2)|0);
  $s = $65;
  $66 = $n;
  $67 = $inleft;
  $68 = (($67) - ($66))|0;
  $inleft = $68;
  $69 = $s;
  $70 = $inleft;
  $71 = (_hangul_syllable_len($69,$70)|0);
  $n = $71;
 }
 $72 = $1;
 $73 = $outleft;
 $74 = (($72) - ($73))|0;
 STACKTOP = sp;return ($74|0);
}
function _build_syllable($str,$len) {
 $str = $str|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $7 = 0, $8 = 0, $9 = 0, $cho = 0, $i = 0, $jong = 0, $jung = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $str;
 $2 = $len;
 $cho = 0;
 $jung = 0;
 $jong = 0;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $2;
  $5 = ($3>>>0)<($4>>>0);
  if ($5) {
   $6 = $i;
   $7 = $1;
   $8 = (($7) + ($6<<2)|0);
   $9 = HEAP32[$8>>2]|0;
   $10 = (_hangul_is_choseong_conjoinable($9)|0);
   $65 = $10;
  } else {
   $65 = 0;
  }
  if (!($65)) {
   break;
  }
  $11 = $cho;
  $12 = $i;
  $13 = $1;
  $14 = (($13) + ($12<<2)|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = (_choseong_compress($11,$15)|0);
  $cho = $16;
  $17 = $cho;
  $18 = ($17|0)==(0);
  if ($18) {
   label = 6;
   break;
  }
  $19 = $i;
  $20 = (($19) + 1)|0;
  $i = $20;
 }
 if ((label|0) == 6) {
  $0 = 0;
  $64 = $0;
  STACKTOP = sp;return ($64|0);
 }
 while(1) {
  $21 = $i;
  $22 = $2;
  $23 = ($21>>>0)<($22>>>0);
  if ($23) {
   $24 = $i;
   $25 = $1;
   $26 = (($25) + ($24<<2)|0);
   $27 = HEAP32[$26>>2]|0;
   $28 = (_hangul_is_jungseong_conjoinable($27)|0);
   $66 = $28;
  } else {
   $66 = 0;
  }
  if (!($66)) {
   break;
  }
  $29 = $jung;
  $30 = $i;
  $31 = $1;
  $32 = (($31) + ($30<<2)|0);
  $33 = HEAP32[$32>>2]|0;
  $34 = (_jungseong_compress($29,$33)|0);
  $jung = $34;
  $35 = $jung;
  $36 = ($35|0)==(0);
  if ($36) {
   label = 13;
   break;
  }
  $37 = $i;
  $38 = (($37) + 1)|0;
  $i = $38;
 }
 if ((label|0) == 13) {
  $0 = 0;
  $64 = $0;
  STACKTOP = sp;return ($64|0);
 }
 while(1) {
  $39 = $i;
  $40 = $2;
  $41 = ($39>>>0)<($40>>>0);
  if ($41) {
   $42 = $i;
   $43 = $1;
   $44 = (($43) + ($42<<2)|0);
   $45 = HEAP32[$44>>2]|0;
   $46 = (_hangul_is_jongseong_conjoinable($45)|0);
   $67 = $46;
  } else {
   $67 = 0;
  }
  if (!($67)) {
   break;
  }
  $47 = $jong;
  $48 = $i;
  $49 = $1;
  $50 = (($49) + ($48<<2)|0);
  $51 = HEAP32[$50>>2]|0;
  $52 = (_jongseong_compress($47,$51)|0);
  $jong = $52;
  $53 = $jong;
  $54 = ($53|0)==(0);
  if ($54) {
   label = 20;
   break;
  }
  $55 = $i;
  $56 = (($55) + 1)|0;
  $i = $56;
 }
 if ((label|0) == 20) {
  $0 = 0;
  $64 = $0;
  STACKTOP = sp;return ($64|0);
 }
 $57 = $i;
 $58 = $2;
 $59 = ($57>>>0)<($58>>>0);
 if ($59) {
  $0 = 0;
  $64 = $0;
  STACKTOP = sp;return ($64|0);
 } else {
  $60 = $cho;
  $61 = $jung;
  $62 = $jong;
  $63 = (_hangul_jamo_to_syllable($60,$61,$62)|0);
  $0 = $63;
  $64 = $0;
  STACKTOP = sp;return ($64|0);
 }
 return 0|0;
}
function _choseong_compress($a,$b) {
 $a = $a|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $a;
 $2 = $b;
 $3 = $1;
 $4 = ($3|0)==(0);
 do {
  if ($4) {
   $5 = $2;
   $0 = $5;
  } else {
   $6 = $1;
   $7 = ($6|0)==(4352);
   if ($7) {
    $8 = $2;
    $9 = ($8|0)==(4352);
    if ($9) {
     $0 = 4353;
     break;
    }
   }
   $10 = $1;
   $11 = ($10|0)==(4355);
   if ($11) {
    $12 = $2;
    $13 = ($12|0)==(4355);
    if ($13) {
     $0 = 4356;
     break;
    }
   }
   $14 = $1;
   $15 = ($14|0)==(4359);
   if ($15) {
    $16 = $2;
    $17 = ($16|0)==(4359);
    if ($17) {
     $0 = 4360;
     break;
    }
   }
   $18 = $1;
   $19 = ($18|0)==(4361);
   if ($19) {
    $20 = $2;
    $21 = ($20|0)==(4361);
    if ($21) {
     $0 = 4362;
     break;
    }
   }
   $22 = $1;
   $23 = ($22|0)==(4364);
   if ($23) {
    $24 = $2;
    $25 = ($24|0)==(4364);
    if ($25) {
     $0 = 4365;
     break;
    }
   }
   $0 = 0;
  }
 } while(0);
 $26 = $0;
 STACKTOP = sp;return ($26|0);
}
function _jungseong_compress($a,$b) {
 $a = $a|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $a;
 $2 = $b;
 $3 = $1;
 $4 = ($3|0)==(0);
 L1: do {
  if ($4) {
   $5 = $2;
   $0 = $5;
  } else {
   $6 = $1;
   $7 = ($6|0)==(4457);
   do {
    if ($7) {
     $8 = $2;
     $9 = ($8|0)==(4449);
     if ($9) {
      $0 = 4458;
      break L1;
     }
     $10 = $2;
     $11 = ($10|0)==(4450);
     if ($11) {
      $0 = 4459;
      break L1;
     }
     $12 = $2;
     $13 = ($12|0)==(4469);
     if ($13) {
      $0 = 4460;
      break L1;
     } else {
      break;
     }
    }
   } while(0);
   $14 = $1;
   $15 = ($14|0)==(4462);
   do {
    if ($15) {
     $16 = $2;
     $17 = ($16|0)==(4453);
     if ($17) {
      $0 = 4463;
      break L1;
     }
     $18 = $2;
     $19 = ($18|0)==(4454);
     if ($19) {
      $0 = 4464;
      break L1;
     }
     $20 = $2;
     $21 = ($20|0)==(4469);
     if ($21) {
      $0 = 4465;
      break L1;
     } else {
      break;
     }
    }
   } while(0);
   $22 = $2;
   $23 = ($22|0)==(4469);
   do {
    if ($23) {
     $24 = $1;
     $25 = ($24|0)==(4467);
     if ($25) {
      $0 = 4468;
      break L1;
     }
     $26 = $1;
     $27 = ($26|0)==(4449);
     if ($27) {
      $0 = 4450;
      break L1;
     }
     $28 = $1;
     $29 = ($28|0)==(4451);
     if ($29) {
      $0 = 4452;
      break L1;
     }
     $30 = $1;
     $31 = ($30|0)==(4453);
     if ($31) {
      $0 = 4454;
      break L1;
     }
     $32 = $1;
     $33 = ($32|0)==(4455);
     if ($33) {
      $0 = 4456;
      break L1;
     } else {
      break;
     }
    }
   } while(0);
   $0 = 0;
  }
 } while(0);
 $34 = $0;
 STACKTOP = sp;return ($34|0);
}
function _jongseong_compress($a,$b) {
 $a = $a|0;
 $b = $b|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $a;
 $2 = $b;
 $3 = $1;
 $4 = ($3|0)==(0);
 L1: do {
  if ($4) {
   $5 = $2;
   $0 = $5;
  } else {
   $6 = $1;
   $7 = ($6|0)==(4520);
   do {
    if ($7) {
     $8 = $2;
     $9 = ($8|0)==(4520);
     if ($9) {
      $0 = 4521;
      break L1;
     }
     $10 = $2;
     $11 = ($10|0)==(4538);
     if ($11) {
      $0 = 4522;
      break L1;
     } else {
      break;
     }
    }
   } while(0);
   $12 = $1;
   $13 = ($12|0)==(4523);
   do {
    if ($13) {
     $14 = $2;
     $15 = ($14|0)==(4528);
     if ($15) {
      $0 = 4523;
      break L1;
     }
     $16 = $2;
     $17 = ($16|0)==(4546);
     if ($17) {
      $0 = 4525;
      break L1;
     } else {
      break;
     }
    }
   } while(0);
   $18 = $1;
   $19 = ($18|0)==(4527);
   do {
    if ($19) {
     $20 = $2;
     $21 = ($20|0)==(4520);
     if ($21) {
      $0 = 4528;
      break L1;
     }
     $22 = $2;
     $23 = ($22|0)==(4535);
     if ($23) {
      $0 = 4529;
      break L1;
     }
     $24 = $2;
     $25 = ($24|0)==(4536);
     if ($25) {
      $0 = 4530;
      break L1;
     }
     $26 = $2;
     $27 = ($26|0)==(4538);
     if ($27) {
      $0 = 4531;
      break L1;
     }
     $28 = $2;
     $29 = ($28|0)==(4544);
     if ($29) {
      $0 = 4532;
      break L1;
     }
     $30 = $2;
     $31 = ($30|0)==(4545);
     if ($31) {
      $0 = 4533;
      break L1;
     }
     $32 = $2;
     $33 = ($32|0)==(4546);
     if ($33) {
      $0 = 4534;
      break L1;
     } else {
      break;
     }
    }
   } while(0);
   $34 = $1;
   $35 = ($34|0)==(4536);
   if ($35) {
    $36 = $2;
    $37 = ($36|0)==(4538);
    if ($37) {
     $0 = 4537;
     break;
    }
   }
   $38 = $1;
   $39 = ($38|0)==(4538);
   if ($39) {
    $40 = $2;
    $41 = ($40|0)==(4538);
    if ($41) {
     $0 = 4539;
     break;
    }
   }
   $0 = 0;
  }
 } while(0);
 $42 = $0;
 STACKTOP = sp;return ($42|0);
}
function _bsearch($key,$base,$nel,$width,$cmp) {
 $key = $key|0;
 $base = $base|0;
 $nel = $nel|0;
 $width = $width|0;
 $cmp = $cmp|0;
 var $$ = 0, $$0 = 0, $$01$ = 0, $$014 = 0, $$023 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($nel|0)==(0);
 L1: do {
  if ($0) {
   $$0 = 0;
  } else {
   $$014 = $base;$$023 = $nel;
   while(1) {
    $1 = $$023 >>> 1;
    $2 = Math_imul($1, $width)|0;
    $3 = (($$014) + ($2)|0);
    $4 = (FUNCTION_TABLE_iii[$cmp & 1]($key,$3)|0);
    $5 = ($4|0)==(0);
    if ($5) {
     $$0 = $3;
     break L1;
    }
    $6 = ($$023|0)==(1);
    if ($6) {
     $$0 = 0;
     break L1;
    }
    $7 = ($4|0)<(0);
    $8 = (($$023) - ($1))|0;
    $$ = $7 ? $1 : $8;
    $$01$ = $7 ? $$014 : $3;
    $9 = ($$|0)==(0);
    if ($9) {
     $$0 = 0;
     break;
    } else {
     $$014 = $$01$;$$023 = $$;
    }
   }
  }
 } while(0);
 STACKTOP = sp;return ($$0|0);
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0;
 var $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0, $$sum108$i = 0, $$sum109$i = 0;
 var $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0;
 var $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0;
 var $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0;
 var $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0;
 var $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0;
 var $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0;
 var $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0;
 var $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0, $1073 = 0;
 var $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i18 = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i17 = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0;
 var $T$024$i = 0, $T$051$i$i = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0;
 var $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0, $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0;
 var $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0, $t$2$v$3$i = 0, $t$228$i = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0;
 var $v$330$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   if ($1) {
    $5 = 16;
   } else {
    $2 = (($bytes) + 11)|0;
    $3 = $2 & -8;
    $5 = $3;
   }
   $4 = $5 >>> 3;
   $6 = HEAP32[12432>>2]|0;
   $7 = $6 >>> $4;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($4))|0;
    $13 = $12 << 1;
    $14 = ((12432 + ($13<<2)|0) + 40|0);
    $$sum10 = (($13) + 2)|0;
    $15 = ((12432 + ($$sum10<<2)|0) + 40|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = (($16) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[12432>>2] = $22;
     } else {
      $23 = HEAP32[((12432 + 16|0))>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = (($18) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = (($16) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    STACKTOP = sp;return ($mem$0|0);
   }
   $34 = HEAP32[((12432 + 8|0))>>2]|0;
   $35 = ($5>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $4;
     $38 = 2 << $4;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = ((12432 + ($65<<2)|0) + 40|0);
     $$sum4 = (($65) + 2)|0;
     $67 = ((12432 + ($$sum4<<2)|0) + 40|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = (($68) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[12432>>2] = $74;
      } else {
       $75 = HEAP32[((12432 + 16|0))>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = (($70) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($5))|0;
     $82 = $5 | 3;
     $83 = (($68) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($5)|0);
     $85 = $81 | 1;
     $$sum56 = $5 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $88 = HEAP32[((12432 + 8|0))>>2]|0;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[((12432 + 20|0))>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = ((12432 + ($92<<2)|0) + 40|0);
      $94 = HEAP32[12432>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[12432>>2] = $98;
       $$sum8$pre = (($92) + 2)|0;
       $$pre = ((12432 + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = ((12432 + ($$sum9<<2)|0) + 40|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[((12432 + 16|0))>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = (($F4$0) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = (($90) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = (($90) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[((12432 + 8|0))>>2] = $81;
     HEAP32[((12432 + 20|0))>>2] = $84;
     $mem$0 = $69;
     STACKTOP = sp;return ($mem$0|0);
    }
    $106 = HEAP32[((12432 + 4|0))>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $5;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = ((12432 + ($130<<2)|0) + 304|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = (($132) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($5))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = (($t$0$i) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = (($t$0$i) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = (($144) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($5))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[((12432 + 16|0))>>2]|0;
     $150 = ($v$0$i>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i) + ($5)|0);
     $152 = ($v$0$i>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = (($v$0$i) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = (($v$0$i) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i|0);
     do {
      if ($157) {
       $167 = (($v$0$i) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = (($v$0$i) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = (($R$0$i) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = (($R$0$i) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i>>2] = 0;
        $R$1$i = $R$0$i;
        break;
       }
      } else {
       $158 = (($v$0$i) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = (($159) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = (($156) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = (($v$0$i) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ((12432 + ($182<<2)|0) + 304|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[((12432 + 4|0))>>2]|0;
         $189 = $188 & $187;
         HEAP32[((12432 + 4|0))>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[((12432 + 16|0))>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = (($154) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = (($154) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[((12432 + 16|0))>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = (($R$1$i) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = (($v$0$i) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = HEAP32[((12432 + 16|0))>>2]|0;
         $204 = ($201>>>0)<($203>>>0);
         if ($204) {
          _abort();
          // unreachable;
         } else {
          $205 = (($R$1$i) + 16|0);
          HEAP32[$205>>2] = $201;
          $206 = (($201) + 24|0);
          HEAP32[$206>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $207 = (($v$0$i) + 20|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==(0|0);
       if (!($209)) {
        $210 = HEAP32[((12432 + 16|0))>>2]|0;
        $211 = ($208>>>0)<($210>>>0);
        if ($211) {
         _abort();
         // unreachable;
        } else {
         $212 = (($R$1$i) + 20|0);
         HEAP32[$212>>2] = $208;
         $213 = (($208) + 24|0);
         HEAP32[$213>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $214 = ($rsize$0$i>>>0)<(16);
     if ($214) {
      $215 = (($rsize$0$i) + ($5))|0;
      $216 = $215 | 3;
      $217 = (($v$0$i) + 4|0);
      HEAP32[$217>>2] = $216;
      $$sum4$i = (($215) + 4)|0;
      $218 = (($v$0$i) + ($$sum4$i)|0);
      $219 = HEAP32[$218>>2]|0;
      $220 = $219 | 1;
      HEAP32[$218>>2] = $220;
     } else {
      $221 = $5 | 3;
      $222 = (($v$0$i) + 4|0);
      HEAP32[$222>>2] = $221;
      $223 = $rsize$0$i | 1;
      $$sum$i35 = $5 | 4;
      $224 = (($v$0$i) + ($$sum$i35)|0);
      HEAP32[$224>>2] = $223;
      $$sum1$i = (($rsize$0$i) + ($5))|0;
      $225 = (($v$0$i) + ($$sum1$i)|0);
      HEAP32[$225>>2] = $rsize$0$i;
      $226 = HEAP32[((12432 + 8|0))>>2]|0;
      $227 = ($226|0)==(0);
      if (!($227)) {
       $228 = HEAP32[((12432 + 20|0))>>2]|0;
       $229 = $226 >>> 3;
       $230 = $229 << 1;
       $231 = ((12432 + ($230<<2)|0) + 40|0);
       $232 = HEAP32[12432>>2]|0;
       $233 = 1 << $229;
       $234 = $232 & $233;
       $235 = ($234|0)==(0);
       if ($235) {
        $236 = $232 | $233;
        HEAP32[12432>>2] = $236;
        $$sum2$pre$i = (($230) + 2)|0;
        $$pre$i = ((12432 + ($$sum2$pre$i<<2)|0) + 40|0);
        $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $231;
       } else {
        $$sum3$i = (($230) + 2)|0;
        $237 = ((12432 + ($$sum3$i<<2)|0) + 40|0);
        $238 = HEAP32[$237>>2]|0;
        $239 = HEAP32[((12432 + 16|0))>>2]|0;
        $240 = ($238>>>0)<($239>>>0);
        if ($240) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $237;$F1$0$i = $238;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $228;
       $241 = (($F1$0$i) + 12|0);
       HEAP32[$241>>2] = $228;
       $242 = (($228) + 8|0);
       HEAP32[$242>>2] = $F1$0$i;
       $243 = (($228) + 12|0);
       HEAP32[$243>>2] = $231;
      }
      HEAP32[((12432 + 8|0))>>2] = $rsize$0$i;
      HEAP32[((12432 + 20|0))>>2] = $151;
     }
     $244 = (($v$0$i) + 8|0);
     $mem$0 = $244;
     STACKTOP = sp;return ($mem$0|0);
    }
   } else {
    $nb$0 = $5;
   }
  } else {
   $245 = ($bytes>>>0)>(4294967231);
   if ($245) {
    $nb$0 = -1;
   } else {
    $246 = (($bytes) + 11)|0;
    $247 = $246 & -8;
    $248 = HEAP32[((12432 + 4|0))>>2]|0;
    $249 = ($248|0)==(0);
    if ($249) {
     $nb$0 = $247;
    } else {
     $250 = (0 - ($247))|0;
     $251 = $246 >>> 8;
     $252 = ($251|0)==(0);
     if ($252) {
      $idx$0$i = 0;
     } else {
      $253 = ($247>>>0)>(16777215);
      if ($253) {
       $idx$0$i = 31;
      } else {
       $254 = (($251) + 1048320)|0;
       $255 = $254 >>> 16;
       $256 = $255 & 8;
       $257 = $251 << $256;
       $258 = (($257) + 520192)|0;
       $259 = $258 >>> 16;
       $260 = $259 & 4;
       $261 = $260 | $256;
       $262 = $257 << $260;
       $263 = (($262) + 245760)|0;
       $264 = $263 >>> 16;
       $265 = $264 & 2;
       $266 = $261 | $265;
       $267 = (14 - ($266))|0;
       $268 = $262 << $265;
       $269 = $268 >>> 15;
       $270 = (($267) + ($269))|0;
       $271 = $270 << 1;
       $272 = (($270) + 7)|0;
       $273 = $247 >>> $272;
       $274 = $273 & 1;
       $275 = $274 | $271;
       $idx$0$i = $275;
      }
     }
     $276 = ((12432 + ($idx$0$i<<2)|0) + 304|0);
     $277 = HEAP32[$276>>2]|0;
     $278 = ($277|0)==(0|0);
     L126: do {
      if ($278) {
       $rsize$2$i = $250;$t$1$i = 0;$v$2$i = 0;
      } else {
       $279 = ($idx$0$i|0)==(31);
       if ($279) {
        $283 = 0;
       } else {
        $280 = $idx$0$i >>> 1;
        $281 = (25 - ($280))|0;
        $283 = $281;
       }
       $282 = $247 << $283;
       $rsize$0$i15 = $250;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $277;$v$0$i16 = 0;
       while(1) {
        $284 = (($t$0$i14) + 4|0);
        $285 = HEAP32[$284>>2]|0;
        $286 = $285 & -8;
        $287 = (($286) - ($247))|0;
        $288 = ($287>>>0)<($rsize$0$i15>>>0);
        if ($288) {
         $289 = ($286|0)==($247|0);
         if ($289) {
          $rsize$2$i = $287;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
          break L126;
         } else {
          $rsize$1$i = $287;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $290 = (($t$0$i14) + 20|0);
        $291 = HEAP32[$290>>2]|0;
        $292 = $sizebits$0$i >>> 31;
        $293 = ((($t$0$i14) + ($292<<2)|0) + 16|0);
        $294 = HEAP32[$293>>2]|0;
        $295 = ($291|0)==(0|0);
        $296 = ($291|0)==($294|0);
        $or$cond$i = $295 | $296;
        $rst$1$i = $or$cond$i ? $rst$0$i : $291;
        $297 = ($294|0)==(0|0);
        $298 = $sizebits$0$i << 1;
        if ($297) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $298;$t$0$i14 = $294;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     $299 = ($t$1$i|0)==(0|0);
     $300 = ($v$2$i|0)==(0|0);
     $or$cond19$i = $299 & $300;
     if ($or$cond19$i) {
      $301 = 2 << $idx$0$i;
      $302 = (0 - ($301))|0;
      $303 = $301 | $302;
      $304 = $248 & $303;
      $305 = ($304|0)==(0);
      if ($305) {
       $nb$0 = $247;
       break;
      }
      $306 = (0 - ($304))|0;
      $307 = $304 & $306;
      $308 = (($307) + -1)|0;
      $309 = $308 >>> 12;
      $310 = $309 & 16;
      $311 = $308 >>> $310;
      $312 = $311 >>> 5;
      $313 = $312 & 8;
      $314 = $313 | $310;
      $315 = $311 >>> $313;
      $316 = $315 >>> 2;
      $317 = $316 & 4;
      $318 = $314 | $317;
      $319 = $315 >>> $317;
      $320 = $319 >>> 1;
      $321 = $320 & 2;
      $322 = $318 | $321;
      $323 = $319 >>> $321;
      $324 = $323 >>> 1;
      $325 = $324 & 1;
      $326 = $322 | $325;
      $327 = $323 >>> $325;
      $328 = (($326) + ($327))|0;
      $329 = ((12432 + ($328<<2)|0) + 304|0);
      $330 = HEAP32[$329>>2]|0;
      $t$2$ph$i = $330;
     } else {
      $t$2$ph$i = $t$1$i;
     }
     $331 = ($t$2$ph$i|0)==(0|0);
     if ($331) {
      $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
     } else {
      $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
      while(1) {
       $332 = (($t$228$i) + 4|0);
       $333 = HEAP32[$332>>2]|0;
       $334 = $333 & -8;
       $335 = (($334) - ($247))|0;
       $336 = ($335>>>0)<($rsize$329$i>>>0);
       $$rsize$3$i = $336 ? $335 : $rsize$329$i;
       $t$2$v$3$i = $336 ? $t$228$i : $v$330$i;
       $337 = (($t$228$i) + 16|0);
       $338 = HEAP32[$337>>2]|0;
       $339 = ($338|0)==(0|0);
       if (!($339)) {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $338;$v$330$i = $t$2$v$3$i;
        continue;
       }
       $340 = (($t$228$i) + 20|0);
       $341 = HEAP32[$340>>2]|0;
       $342 = ($341|0)==(0|0);
       if ($342) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$329$i = $$rsize$3$i;$t$228$i = $341;$v$330$i = $t$2$v$3$i;
       }
      }
     }
     $343 = ($v$3$lcssa$i|0)==(0|0);
     if ($343) {
      $nb$0 = $247;
     } else {
      $344 = HEAP32[((12432 + 8|0))>>2]|0;
      $345 = (($344) - ($247))|0;
      $346 = ($rsize$3$lcssa$i>>>0)<($345>>>0);
      if ($346) {
       $347 = HEAP32[((12432 + 16|0))>>2]|0;
       $348 = ($v$3$lcssa$i>>>0)<($347>>>0);
       if ($348) {
        _abort();
        // unreachable;
       }
       $349 = (($v$3$lcssa$i) + ($247)|0);
       $350 = ($v$3$lcssa$i>>>0)<($349>>>0);
       if (!($350)) {
        _abort();
        // unreachable;
       }
       $351 = (($v$3$lcssa$i) + 24|0);
       $352 = HEAP32[$351>>2]|0;
       $353 = (($v$3$lcssa$i) + 12|0);
       $354 = HEAP32[$353>>2]|0;
       $355 = ($354|0)==($v$3$lcssa$i|0);
       do {
        if ($355) {
         $365 = (($v$3$lcssa$i) + 20|0);
         $366 = HEAP32[$365>>2]|0;
         $367 = ($366|0)==(0|0);
         if ($367) {
          $368 = (($v$3$lcssa$i) + 16|0);
          $369 = HEAP32[$368>>2]|0;
          $370 = ($369|0)==(0|0);
          if ($370) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $369;$RP$0$i17 = $368;
          }
         } else {
          $R$0$i18 = $366;$RP$0$i17 = $365;
         }
         while(1) {
          $371 = (($R$0$i18) + 20|0);
          $372 = HEAP32[$371>>2]|0;
          $373 = ($372|0)==(0|0);
          if (!($373)) {
           $R$0$i18 = $372;$RP$0$i17 = $371;
           continue;
          }
          $374 = (($R$0$i18) + 16|0);
          $375 = HEAP32[$374>>2]|0;
          $376 = ($375|0)==(0|0);
          if ($376) {
           break;
          } else {
           $R$0$i18 = $375;$RP$0$i17 = $374;
          }
         }
         $377 = ($RP$0$i17>>>0)<($347>>>0);
         if ($377) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17>>2] = 0;
          $R$1$i20 = $R$0$i18;
          break;
         }
        } else {
         $356 = (($v$3$lcssa$i) + 8|0);
         $357 = HEAP32[$356>>2]|0;
         $358 = ($357>>>0)<($347>>>0);
         if ($358) {
          _abort();
          // unreachable;
         }
         $359 = (($357) + 12|0);
         $360 = HEAP32[$359>>2]|0;
         $361 = ($360|0)==($v$3$lcssa$i|0);
         if (!($361)) {
          _abort();
          // unreachable;
         }
         $362 = (($354) + 8|0);
         $363 = HEAP32[$362>>2]|0;
         $364 = ($363|0)==($v$3$lcssa$i|0);
         if ($364) {
          HEAP32[$359>>2] = $354;
          HEAP32[$362>>2] = $357;
          $R$1$i20 = $354;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $378 = ($352|0)==(0|0);
       do {
        if (!($378)) {
         $379 = (($v$3$lcssa$i) + 28|0);
         $380 = HEAP32[$379>>2]|0;
         $381 = ((12432 + ($380<<2)|0) + 304|0);
         $382 = HEAP32[$381>>2]|0;
         $383 = ($v$3$lcssa$i|0)==($382|0);
         if ($383) {
          HEAP32[$381>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $384 = 1 << $380;
           $385 = $384 ^ -1;
           $386 = HEAP32[((12432 + 4|0))>>2]|0;
           $387 = $386 & $385;
           HEAP32[((12432 + 4|0))>>2] = $387;
           break;
          }
         } else {
          $388 = HEAP32[((12432 + 16|0))>>2]|0;
          $389 = ($352>>>0)<($388>>>0);
          if ($389) {
           _abort();
           // unreachable;
          }
          $390 = (($352) + 16|0);
          $391 = HEAP32[$390>>2]|0;
          $392 = ($391|0)==($v$3$lcssa$i|0);
          if ($392) {
           HEAP32[$390>>2] = $R$1$i20;
          } else {
           $393 = (($352) + 20|0);
           HEAP32[$393>>2] = $R$1$i20;
          }
          $394 = ($R$1$i20|0)==(0|0);
          if ($394) {
           break;
          }
         }
         $395 = HEAP32[((12432 + 16|0))>>2]|0;
         $396 = ($R$1$i20>>>0)<($395>>>0);
         if ($396) {
          _abort();
          // unreachable;
         }
         $397 = (($R$1$i20) + 24|0);
         HEAP32[$397>>2] = $352;
         $398 = (($v$3$lcssa$i) + 16|0);
         $399 = HEAP32[$398>>2]|0;
         $400 = ($399|0)==(0|0);
         do {
          if (!($400)) {
           $401 = HEAP32[((12432 + 16|0))>>2]|0;
           $402 = ($399>>>0)<($401>>>0);
           if ($402) {
            _abort();
            // unreachable;
           } else {
            $403 = (($R$1$i20) + 16|0);
            HEAP32[$403>>2] = $399;
            $404 = (($399) + 24|0);
            HEAP32[$404>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $405 = (($v$3$lcssa$i) + 20|0);
         $406 = HEAP32[$405>>2]|0;
         $407 = ($406|0)==(0|0);
         if (!($407)) {
          $408 = HEAP32[((12432 + 16|0))>>2]|0;
          $409 = ($406>>>0)<($408>>>0);
          if ($409) {
           _abort();
           // unreachable;
          } else {
           $410 = (($R$1$i20) + 20|0);
           HEAP32[$410>>2] = $406;
           $411 = (($406) + 24|0);
           HEAP32[$411>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $412 = ($rsize$3$lcssa$i>>>0)<(16);
       L204: do {
        if ($412) {
         $413 = (($rsize$3$lcssa$i) + ($247))|0;
         $414 = $413 | 3;
         $415 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$415>>2] = $414;
         $$sum18$i = (($413) + 4)|0;
         $416 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $417 = HEAP32[$416>>2]|0;
         $418 = $417 | 1;
         HEAP32[$416>>2] = $418;
        } else {
         $419 = $247 | 3;
         $420 = (($v$3$lcssa$i) + 4|0);
         HEAP32[$420>>2] = $419;
         $421 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $247 | 4;
         $422 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$422>>2] = $421;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($247))|0;
         $423 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$423>>2] = $rsize$3$lcssa$i;
         $424 = $rsize$3$lcssa$i >>> 3;
         $425 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($425) {
          $426 = $424 << 1;
          $427 = ((12432 + ($426<<2)|0) + 40|0);
          $428 = HEAP32[12432>>2]|0;
          $429 = 1 << $424;
          $430 = $428 & $429;
          $431 = ($430|0)==(0);
          if ($431) {
           $432 = $428 | $429;
           HEAP32[12432>>2] = $432;
           $$sum14$pre$i = (($426) + 2)|0;
           $$pre$i25 = ((12432 + ($$sum14$pre$i<<2)|0) + 40|0);
           $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $427;
          } else {
           $$sum17$i = (($426) + 2)|0;
           $433 = ((12432 + ($$sum17$i<<2)|0) + 40|0);
           $434 = HEAP32[$433>>2]|0;
           $435 = HEAP32[((12432 + 16|0))>>2]|0;
           $436 = ($434>>>0)<($435>>>0);
           if ($436) {
            _abort();
            // unreachable;
           } else {
            $$pre$phi$i26Z2D = $433;$F5$0$i = $434;
           }
          }
          HEAP32[$$pre$phi$i26Z2D>>2] = $349;
          $437 = (($F5$0$i) + 12|0);
          HEAP32[$437>>2] = $349;
          $$sum15$i = (($247) + 8)|0;
          $438 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$438>>2] = $F5$0$i;
          $$sum16$i = (($247) + 12)|0;
          $439 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$439>>2] = $427;
          break;
         }
         $440 = $rsize$3$lcssa$i >>> 8;
         $441 = ($440|0)==(0);
         if ($441) {
          $I7$0$i = 0;
         } else {
          $442 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($442) {
           $I7$0$i = 31;
          } else {
           $443 = (($440) + 1048320)|0;
           $444 = $443 >>> 16;
           $445 = $444 & 8;
           $446 = $440 << $445;
           $447 = (($446) + 520192)|0;
           $448 = $447 >>> 16;
           $449 = $448 & 4;
           $450 = $449 | $445;
           $451 = $446 << $449;
           $452 = (($451) + 245760)|0;
           $453 = $452 >>> 16;
           $454 = $453 & 2;
           $455 = $450 | $454;
           $456 = (14 - ($455))|0;
           $457 = $451 << $454;
           $458 = $457 >>> 15;
           $459 = (($456) + ($458))|0;
           $460 = $459 << 1;
           $461 = (($459) + 7)|0;
           $462 = $rsize$3$lcssa$i >>> $461;
           $463 = $462 & 1;
           $464 = $463 | $460;
           $I7$0$i = $464;
          }
         }
         $465 = ((12432 + ($I7$0$i<<2)|0) + 304|0);
         $$sum2$i = (($247) + 28)|0;
         $466 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$466>>2] = $I7$0$i;
         $$sum3$i27 = (($247) + 16)|0;
         $467 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($247) + 20)|0;
         $468 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$468>>2] = 0;
         HEAP32[$467>>2] = 0;
         $469 = HEAP32[((12432 + 4|0))>>2]|0;
         $470 = 1 << $I7$0$i;
         $471 = $469 & $470;
         $472 = ($471|0)==(0);
         if ($472) {
          $473 = $469 | $470;
          HEAP32[((12432 + 4|0))>>2] = $473;
          HEAP32[$465>>2] = $349;
          $$sum5$i = (($247) + 24)|0;
          $474 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$474>>2] = $465;
          $$sum6$i = (($247) + 12)|0;
          $475 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$475>>2] = $349;
          $$sum7$i = (($247) + 8)|0;
          $476 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$476>>2] = $349;
          break;
         }
         $477 = HEAP32[$465>>2]|0;
         $478 = ($I7$0$i|0)==(31);
         if ($478) {
          $486 = 0;
         } else {
          $479 = $I7$0$i >>> 1;
          $480 = (25 - ($479))|0;
          $486 = $480;
         }
         $481 = (($477) + 4|0);
         $482 = HEAP32[$481>>2]|0;
         $483 = $482 & -8;
         $484 = ($483|0)==($rsize$3$lcssa$i|0);
         L225: do {
          if ($484) {
           $T$0$lcssa$i = $477;
          } else {
           $485 = $rsize$3$lcssa$i << $486;
           $K12$025$i = $485;$T$024$i = $477;
           while(1) {
            $493 = $K12$025$i >>> 31;
            $494 = ((($T$024$i) + ($493<<2)|0) + 16|0);
            $489 = HEAP32[$494>>2]|0;
            $495 = ($489|0)==(0|0);
            if ($495) {
             break;
            }
            $487 = $K12$025$i << 1;
            $488 = (($489) + 4|0);
            $490 = HEAP32[$488>>2]|0;
            $491 = $490 & -8;
            $492 = ($491|0)==($rsize$3$lcssa$i|0);
            if ($492) {
             $T$0$lcssa$i = $489;
             break L225;
            } else {
             $K12$025$i = $487;$T$024$i = $489;
            }
           }
           $496 = HEAP32[((12432 + 16|0))>>2]|0;
           $497 = ($494>>>0)<($496>>>0);
           if ($497) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$494>>2] = $349;
            $$sum11$i = (($247) + 24)|0;
            $498 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$498>>2] = $T$024$i;
            $$sum12$i = (($247) + 12)|0;
            $499 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$499>>2] = $349;
            $$sum13$i = (($247) + 8)|0;
            $500 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$500>>2] = $349;
            break L204;
           }
          }
         } while(0);
         $501 = (($T$0$lcssa$i) + 8|0);
         $502 = HEAP32[$501>>2]|0;
         $503 = HEAP32[((12432 + 16|0))>>2]|0;
         $504 = ($T$0$lcssa$i>>>0)<($503>>>0);
         if ($504) {
          _abort();
          // unreachable;
         }
         $505 = ($502>>>0)<($503>>>0);
         if ($505) {
          _abort();
          // unreachable;
         } else {
          $506 = (($502) + 12|0);
          HEAP32[$506>>2] = $349;
          HEAP32[$501>>2] = $349;
          $$sum8$i = (($247) + 8)|0;
          $507 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$507>>2] = $502;
          $$sum9$i = (($247) + 12)|0;
          $508 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$508>>2] = $T$0$lcssa$i;
          $$sum10$i = (($247) + 24)|0;
          $509 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$509>>2] = 0;
          break;
         }
        }
       } while(0);
       $510 = (($v$3$lcssa$i) + 8|0);
       $mem$0 = $510;
       STACKTOP = sp;return ($mem$0|0);
      } else {
       $nb$0 = $247;
      }
     }
    }
   }
  }
 } while(0);
 $511 = HEAP32[((12432 + 8|0))>>2]|0;
 $512 = ($nb$0>>>0)>($511>>>0);
 if (!($512)) {
  $513 = (($511) - ($nb$0))|0;
  $514 = HEAP32[((12432 + 20|0))>>2]|0;
  $515 = ($513>>>0)>(15);
  if ($515) {
   $516 = (($514) + ($nb$0)|0);
   HEAP32[((12432 + 20|0))>>2] = $516;
   HEAP32[((12432 + 8|0))>>2] = $513;
   $517 = $513 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $518 = (($514) + ($$sum2)|0);
   HEAP32[$518>>2] = $517;
   $519 = (($514) + ($511)|0);
   HEAP32[$519>>2] = $513;
   $520 = $nb$0 | 3;
   $521 = (($514) + 4|0);
   HEAP32[$521>>2] = $520;
  } else {
   HEAP32[((12432 + 8|0))>>2] = 0;
   HEAP32[((12432 + 20|0))>>2] = 0;
   $522 = $511 | 3;
   $523 = (($514) + 4|0);
   HEAP32[$523>>2] = $522;
   $$sum1 = (($511) + 4)|0;
   $524 = (($514) + ($$sum1)|0);
   $525 = HEAP32[$524>>2]|0;
   $526 = $525 | 1;
   HEAP32[$524>>2] = $526;
  }
  $527 = (($514) + 8|0);
  $mem$0 = $527;
  STACKTOP = sp;return ($mem$0|0);
 }
 $528 = HEAP32[((12432 + 12|0))>>2]|0;
 $529 = ($nb$0>>>0)<($528>>>0);
 if ($529) {
  $530 = (($528) - ($nb$0))|0;
  HEAP32[((12432 + 12|0))>>2] = $530;
  $531 = HEAP32[((12432 + 24|0))>>2]|0;
  $532 = (($531) + ($nb$0)|0);
  HEAP32[((12432 + 24|0))>>2] = $532;
  $533 = $530 | 1;
  $$sum = (($nb$0) + 4)|0;
  $534 = (($531) + ($$sum)|0);
  HEAP32[$534>>2] = $533;
  $535 = $nb$0 | 3;
  $536 = (($531) + 4|0);
  HEAP32[$536>>2] = $535;
  $537 = (($531) + 8|0);
  $mem$0 = $537;
  STACKTOP = sp;return ($mem$0|0);
 }
 $538 = HEAP32[12904>>2]|0;
 $539 = ($538|0)==(0);
 do {
  if ($539) {
   $540 = (_sysconf(30)|0);
   $541 = (($540) + -1)|0;
   $542 = $541 & $540;
   $543 = ($542|0)==(0);
   if ($543) {
    HEAP32[((12904 + 8|0))>>2] = $540;
    HEAP32[((12904 + 4|0))>>2] = $540;
    HEAP32[((12904 + 12|0))>>2] = -1;
    HEAP32[((12904 + 16|0))>>2] = -1;
    HEAP32[((12904 + 20|0))>>2] = 0;
    HEAP32[((12432 + 444|0))>>2] = 0;
    $544 = (_time((0|0))|0);
    $545 = $544 & -16;
    $546 = $545 ^ 1431655768;
    HEAP32[12904>>2] = $546;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $547 = (($nb$0) + 48)|0;
 $548 = HEAP32[((12904 + 8|0))>>2]|0;
 $549 = (($nb$0) + 47)|0;
 $550 = (($548) + ($549))|0;
 $551 = (0 - ($548))|0;
 $552 = $550 & $551;
 $553 = ($552>>>0)>($nb$0>>>0);
 if (!($553)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $554 = HEAP32[((12432 + 440|0))>>2]|0;
 $555 = ($554|0)==(0);
 if (!($555)) {
  $556 = HEAP32[((12432 + 432|0))>>2]|0;
  $557 = (($556) + ($552))|0;
  $558 = ($557>>>0)<=($556>>>0);
  $559 = ($557>>>0)>($554>>>0);
  $or$cond1$i = $558 | $559;
  if ($or$cond1$i) {
   $mem$0 = 0;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $560 = HEAP32[((12432 + 444|0))>>2]|0;
 $561 = $560 & 4;
 $562 = ($561|0)==(0);
 L269: do {
  if ($562) {
   $563 = HEAP32[((12432 + 24|0))>>2]|0;
   $564 = ($563|0)==(0|0);
   L271: do {
    if ($564) {
     label = 182;
    } else {
     $sp$0$i$i = ((12432 + 448|0));
     while(1) {
      $565 = HEAP32[$sp$0$i$i>>2]|0;
      $566 = ($565>>>0)>($563>>>0);
      if (!($566)) {
       $567 = (($sp$0$i$i) + 4|0);
       $568 = HEAP32[$567>>2]|0;
       $569 = (($565) + ($568)|0);
       $570 = ($569>>>0)>($563>>>0);
       if ($570) {
        break;
       }
      }
      $571 = (($sp$0$i$i) + 8|0);
      $572 = HEAP32[$571>>2]|0;
      $573 = ($572|0)==(0|0);
      if ($573) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $572;
      }
     }
     $574 = ($sp$0$i$i|0)==(0|0);
     if ($574) {
      label = 182;
     } else {
      $597 = HEAP32[((12432 + 12|0))>>2]|0;
      $598 = (($550) - ($597))|0;
      $599 = $598 & $551;
      $600 = ($599>>>0)<(2147483647);
      if ($600) {
       $601 = (_sbrk(($599|0))|0);
       $602 = HEAP32[$sp$0$i$i>>2]|0;
       $603 = HEAP32[$567>>2]|0;
       $604 = (($602) + ($603)|0);
       $605 = ($601|0)==($604|0);
       $$3$i = $605 ? $599 : 0;
       $$4$i = $605 ? $601 : (-1);
       $br$0$i = $601;$ssize$1$i = $599;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $575 = (_sbrk(0)|0);
     $576 = ($575|0)==((-1)|0);
     if ($576) {
      $tsize$0323841$i = 0;
     } else {
      $577 = $575;
      $578 = HEAP32[((12904 + 4|0))>>2]|0;
      $579 = (($578) + -1)|0;
      $580 = $579 & $577;
      $581 = ($580|0)==(0);
      if ($581) {
       $ssize$0$i = $552;
      } else {
       $582 = (($579) + ($577))|0;
       $583 = (0 - ($578))|0;
       $584 = $582 & $583;
       $585 = (($552) - ($577))|0;
       $586 = (($585) + ($584))|0;
       $ssize$0$i = $586;
      }
      $587 = HEAP32[((12432 + 432|0))>>2]|0;
      $588 = (($587) + ($ssize$0$i))|0;
      $589 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $590 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i29 = $589 & $590;
      if ($or$cond$i29) {
       $591 = HEAP32[((12432 + 440|0))>>2]|0;
       $592 = ($591|0)==(0);
       if (!($592)) {
        $593 = ($588>>>0)<=($587>>>0);
        $594 = ($588>>>0)>($591>>>0);
        $or$cond2$i = $593 | $594;
        if ($or$cond2$i) {
         $tsize$0323841$i = 0;
         break;
        }
       }
       $595 = (_sbrk(($ssize$0$i|0))|0);
       $596 = ($595|0)==($575|0);
       $ssize$0$$i = $596 ? $ssize$0$i : 0;
       $$$i = $596 ? $575 : (-1);
       $br$0$i = $595;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
       label = 191;
      } else {
       $tsize$0323841$i = 0;
      }
     }
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $606 = (0 - ($ssize$1$i))|0;
     $607 = ($tbase$0$i|0)==((-1)|0);
     if (!($607)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $608 = ($br$0$i|0)!=((-1)|0);
     $609 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $608 & $609;
     $610 = ($ssize$1$i>>>0)<($547>>>0);
     $or$cond6$i = $or$cond5$i & $610;
     do {
      if ($or$cond6$i) {
       $611 = HEAP32[((12904 + 8|0))>>2]|0;
       $612 = (($549) - ($ssize$1$i))|0;
       $613 = (($612) + ($611))|0;
       $614 = (0 - ($611))|0;
       $615 = $613 & $614;
       $616 = ($615>>>0)<(2147483647);
       if ($616) {
        $617 = (_sbrk(($615|0))|0);
        $618 = ($617|0)==((-1)|0);
        if ($618) {
         (_sbrk(($606|0))|0);
         $tsize$0323841$i = $tsize$0$i;
         break L291;
        } else {
         $619 = (($615) + ($ssize$1$i))|0;
         $ssize$2$i = $619;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$i;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $620 = ($br$0$i|0)==((-1)|0);
     if ($620) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $621 = HEAP32[((12432 + 444|0))>>2]|0;
   $622 = $621 | 4;
   HEAP32[((12432 + 444|0))>>2] = $622;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 if ((label|0) == 199) {
  $623 = ($552>>>0)<(2147483647);
  if ($623) {
   $624 = (_sbrk(($552|0))|0);
   $625 = (_sbrk(0)|0);
   $notlhs$i = ($624|0)!=((-1)|0);
   $notrhs$i = ($625|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $626 = ($624>>>0)<($625>>>0);
   $or$cond9$i = $or$cond8$not$i & $626;
   if ($or$cond9$i) {
    $627 = $625;
    $628 = $624;
    $629 = (($627) - ($628))|0;
    $630 = (($nb$0) + 40)|0;
    $631 = ($629>>>0)>($630>>>0);
    $$tsize$1$i = $631 ? $629 : $tsize$1$i;
    if ($631) {
     $tbase$247$i = $624;$tsize$246$i = $$tsize$1$i;
     label = 202;
    }
   }
  }
 }
 if ((label|0) == 202) {
  $632 = HEAP32[((12432 + 432|0))>>2]|0;
  $633 = (($632) + ($tsize$246$i))|0;
  HEAP32[((12432 + 432|0))>>2] = $633;
  $634 = HEAP32[((12432 + 436|0))>>2]|0;
  $635 = ($633>>>0)>($634>>>0);
  if ($635) {
   HEAP32[((12432 + 436|0))>>2] = $633;
  }
  $636 = HEAP32[((12432 + 24|0))>>2]|0;
  $637 = ($636|0)==(0|0);
  L311: do {
   if ($637) {
    $638 = HEAP32[((12432 + 16|0))>>2]|0;
    $639 = ($638|0)==(0|0);
    $640 = ($tbase$247$i>>>0)<($638>>>0);
    $or$cond10$i = $639 | $640;
    if ($or$cond10$i) {
     HEAP32[((12432 + 16|0))>>2] = $tbase$247$i;
    }
    HEAP32[((12432 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((12432 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((12432 + 460|0))>>2] = 0;
    $641 = HEAP32[12904>>2]|0;
    HEAP32[((12432 + 36|0))>>2] = $641;
    HEAP32[((12432 + 32|0))>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $642 = $i$02$i$i << 1;
     $643 = ((12432 + ($642<<2)|0) + 40|0);
     $$sum$i$i = (($642) + 3)|0;
     $644 = ((12432 + ($$sum$i$i<<2)|0) + 40|0);
     HEAP32[$644>>2] = $643;
     $$sum1$i$i = (($642) + 2)|0;
     $645 = ((12432 + ($$sum1$i$i<<2)|0) + 40|0);
     HEAP32[$645>>2] = $643;
     $646 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($646|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $646;
     }
    }
    $647 = (($tsize$246$i) + -40)|0;
    $648 = (($tbase$247$i) + 8|0);
    $649 = $648;
    $650 = $649 & 7;
    $651 = ($650|0)==(0);
    if ($651) {
     $655 = 0;
    } else {
     $652 = (0 - ($649))|0;
     $653 = $652 & 7;
     $655 = $653;
    }
    $654 = (($tbase$247$i) + ($655)|0);
    $656 = (($647) - ($655))|0;
    HEAP32[((12432 + 24|0))>>2] = $654;
    HEAP32[((12432 + 12|0))>>2] = $656;
    $657 = $656 | 1;
    $$sum$i14$i = (($655) + 4)|0;
    $658 = (($tbase$247$i) + ($$sum$i14$i)|0);
    HEAP32[$658>>2] = $657;
    $$sum2$i$i = (($tsize$246$i) + -36)|0;
    $659 = (($tbase$247$i) + ($$sum2$i$i)|0);
    HEAP32[$659>>2] = 40;
    $660 = HEAP32[((12904 + 16|0))>>2]|0;
    HEAP32[((12432 + 28|0))>>2] = $660;
   } else {
    $sp$075$i = ((12432 + 448|0));
    while(1) {
     $661 = HEAP32[$sp$075$i>>2]|0;
     $662 = (($sp$075$i) + 4|0);
     $663 = HEAP32[$662>>2]|0;
     $664 = (($661) + ($663)|0);
     $665 = ($tbase$247$i|0)==($664|0);
     if ($665) {
      label = 214;
      break;
     }
     $666 = (($sp$075$i) + 8|0);
     $667 = HEAP32[$666>>2]|0;
     $668 = ($667|0)==(0|0);
     if ($668) {
      break;
     } else {
      $sp$075$i = $667;
     }
    }
    if ((label|0) == 214) {
     $669 = (($sp$075$i) + 12|0);
     $670 = HEAP32[$669>>2]|0;
     $671 = $670 & 8;
     $672 = ($671|0)==(0);
     if ($672) {
      $673 = ($636>>>0)>=($661>>>0);
      $674 = ($636>>>0)<($tbase$247$i>>>0);
      $or$cond49$i = $673 & $674;
      if ($or$cond49$i) {
       $675 = (($663) + ($tsize$246$i))|0;
       HEAP32[$662>>2] = $675;
       $676 = HEAP32[((12432 + 12|0))>>2]|0;
       $677 = (($676) + ($tsize$246$i))|0;
       $678 = (($636) + 8|0);
       $679 = $678;
       $680 = $679 & 7;
       $681 = ($680|0)==(0);
       if ($681) {
        $685 = 0;
       } else {
        $682 = (0 - ($679))|0;
        $683 = $682 & 7;
        $685 = $683;
       }
       $684 = (($636) + ($685)|0);
       $686 = (($677) - ($685))|0;
       HEAP32[((12432 + 24|0))>>2] = $684;
       HEAP32[((12432 + 12|0))>>2] = $686;
       $687 = $686 | 1;
       $$sum$i18$i = (($685) + 4)|0;
       $688 = (($636) + ($$sum$i18$i)|0);
       HEAP32[$688>>2] = $687;
       $$sum2$i19$i = (($677) + 4)|0;
       $689 = (($636) + ($$sum2$i19$i)|0);
       HEAP32[$689>>2] = 40;
       $690 = HEAP32[((12904 + 16|0))>>2]|0;
       HEAP32[((12432 + 28|0))>>2] = $690;
       break;
      }
     }
    }
    $691 = HEAP32[((12432 + 16|0))>>2]|0;
    $692 = ($tbase$247$i>>>0)<($691>>>0);
    if ($692) {
     HEAP32[((12432 + 16|0))>>2] = $tbase$247$i;
    }
    $693 = (($tbase$247$i) + ($tsize$246$i)|0);
    $sp$168$i = ((12432 + 448|0));
    while(1) {
     $694 = HEAP32[$sp$168$i>>2]|0;
     $695 = ($694|0)==($693|0);
     if ($695) {
      label = 224;
      break;
     }
     $696 = (($sp$168$i) + 8|0);
     $697 = HEAP32[$696>>2]|0;
     $698 = ($697|0)==(0|0);
     if ($698) {
      break;
     } else {
      $sp$168$i = $697;
     }
    }
    if ((label|0) == 224) {
     $699 = (($sp$168$i) + 12|0);
     $700 = HEAP32[$699>>2]|0;
     $701 = $700 & 8;
     $702 = ($701|0)==(0);
     if ($702) {
      HEAP32[$sp$168$i>>2] = $tbase$247$i;
      $703 = (($sp$168$i) + 4|0);
      $704 = HEAP32[$703>>2]|0;
      $705 = (($704) + ($tsize$246$i))|0;
      HEAP32[$703>>2] = $705;
      $706 = (($tbase$247$i) + 8|0);
      $707 = $706;
      $708 = $707 & 7;
      $709 = ($708|0)==(0);
      if ($709) {
       $713 = 0;
      } else {
       $710 = (0 - ($707))|0;
       $711 = $710 & 7;
       $713 = $711;
      }
      $712 = (($tbase$247$i) + ($713)|0);
      $$sum107$i = (($tsize$246$i) + 8)|0;
      $714 = (($tbase$247$i) + ($$sum107$i)|0);
      $715 = $714;
      $716 = $715 & 7;
      $717 = ($716|0)==(0);
      if ($717) {
       $720 = 0;
      } else {
       $718 = (0 - ($715))|0;
       $719 = $718 & 7;
       $720 = $719;
      }
      $$sum108$i = (($720) + ($tsize$246$i))|0;
      $721 = (($tbase$247$i) + ($$sum108$i)|0);
      $722 = $721;
      $723 = $712;
      $724 = (($722) - ($723))|0;
      $$sum$i21$i = (($713) + ($nb$0))|0;
      $725 = (($tbase$247$i) + ($$sum$i21$i)|0);
      $726 = (($724) - ($nb$0))|0;
      $727 = $nb$0 | 3;
      $$sum1$i22$i = (($713) + 4)|0;
      $728 = (($tbase$247$i) + ($$sum1$i22$i)|0);
      HEAP32[$728>>2] = $727;
      $729 = HEAP32[((12432 + 24|0))>>2]|0;
      $730 = ($721|0)==($729|0);
      L348: do {
       if ($730) {
        $731 = HEAP32[((12432 + 12|0))>>2]|0;
        $732 = (($731) + ($726))|0;
        HEAP32[((12432 + 12|0))>>2] = $732;
        HEAP32[((12432 + 24|0))>>2] = $725;
        $733 = $732 | 1;
        $$sum42$i$i = (($$sum$i21$i) + 4)|0;
        $734 = (($tbase$247$i) + ($$sum42$i$i)|0);
        HEAP32[$734>>2] = $733;
       } else {
        $735 = HEAP32[((12432 + 20|0))>>2]|0;
        $736 = ($721|0)==($735|0);
        if ($736) {
         $737 = HEAP32[((12432 + 8|0))>>2]|0;
         $738 = (($737) + ($726))|0;
         HEAP32[((12432 + 8|0))>>2] = $738;
         HEAP32[((12432 + 20|0))>>2] = $725;
         $739 = $738 | 1;
         $$sum40$i$i = (($$sum$i21$i) + 4)|0;
         $740 = (($tbase$247$i) + ($$sum40$i$i)|0);
         HEAP32[$740>>2] = $739;
         $$sum41$i$i = (($738) + ($$sum$i21$i))|0;
         $741 = (($tbase$247$i) + ($$sum41$i$i)|0);
         HEAP32[$741>>2] = $738;
         break;
        }
        $$sum2$i23$i = (($tsize$246$i) + 4)|0;
        $$sum109$i = (($$sum2$i23$i) + ($720))|0;
        $742 = (($tbase$247$i) + ($$sum109$i)|0);
        $743 = HEAP32[$742>>2]|0;
        $744 = $743 & 3;
        $745 = ($744|0)==(1);
        if ($745) {
         $746 = $743 & -8;
         $747 = $743 >>> 3;
         $748 = ($743>>>0)<(256);
         do {
          if ($748) {
           $$sum3738$i$i = $720 | 8;
           $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
           $749 = (($tbase$247$i) + ($$sum119$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $$sum39$i$i = (($tsize$246$i) + 12)|0;
           $$sum120$i = (($$sum39$i$i) + ($720))|0;
           $751 = (($tbase$247$i) + ($$sum120$i)|0);
           $752 = HEAP32[$751>>2]|0;
           $753 = $747 << 1;
           $754 = ((12432 + ($753<<2)|0) + 40|0);
           $755 = ($750|0)==($754|0);
           if (!($755)) {
            $756 = HEAP32[((12432 + 16|0))>>2]|0;
            $757 = ($750>>>0)<($756>>>0);
            if ($757) {
             _abort();
             // unreachable;
            }
            $758 = (($750) + 12|0);
            $759 = HEAP32[$758>>2]|0;
            $760 = ($759|0)==($721|0);
            if (!($760)) {
             _abort();
             // unreachable;
            }
           }
           $761 = ($752|0)==($750|0);
           if ($761) {
            $762 = 1 << $747;
            $763 = $762 ^ -1;
            $764 = HEAP32[12432>>2]|0;
            $765 = $764 & $763;
            HEAP32[12432>>2] = $765;
            break;
           }
           $766 = ($752|0)==($754|0);
           if ($766) {
            $$pre57$i$i = (($752) + 8|0);
            $$pre$phi58$i$iZ2D = $$pre57$i$i;
           } else {
            $767 = HEAP32[((12432 + 16|0))>>2]|0;
            $768 = ($752>>>0)<($767>>>0);
            if ($768) {
             _abort();
             // unreachable;
            }
            $769 = (($752) + 8|0);
            $770 = HEAP32[$769>>2]|0;
            $771 = ($770|0)==($721|0);
            if ($771) {
             $$pre$phi58$i$iZ2D = $769;
            } else {
             _abort();
             // unreachable;
            }
           }
           $772 = (($750) + 12|0);
           HEAP32[$772>>2] = $752;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $750;
          } else {
           $$sum34$i$i = $720 | 24;
           $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
           $773 = (($tbase$247$i) + ($$sum110$i)|0);
           $774 = HEAP32[$773>>2]|0;
           $$sum5$i$i = (($tsize$246$i) + 12)|0;
           $$sum111$i = (($$sum5$i$i) + ($720))|0;
           $775 = (($tbase$247$i) + ($$sum111$i)|0);
           $776 = HEAP32[$775>>2]|0;
           $777 = ($776|0)==($721|0);
           do {
            if ($777) {
             $$sum67$i$i = $720 | 16;
             $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
             $788 = (($tbase$247$i) + ($$sum117$i)|0);
             $789 = HEAP32[$788>>2]|0;
             $790 = ($789|0)==(0|0);
             if ($790) {
              $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
              $791 = (($tbase$247$i) + ($$sum118$i)|0);
              $792 = HEAP32[$791>>2]|0;
              $793 = ($792|0)==(0|0);
              if ($793) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $792;$RP$0$i$i = $791;
              }
             } else {
              $R$0$i$i = $789;$RP$0$i$i = $788;
             }
             while(1) {
              $794 = (($R$0$i$i) + 20|0);
              $795 = HEAP32[$794>>2]|0;
              $796 = ($795|0)==(0|0);
              if (!($796)) {
               $R$0$i$i = $795;$RP$0$i$i = $794;
               continue;
              }
              $797 = (($R$0$i$i) + 16|0);
              $798 = HEAP32[$797>>2]|0;
              $799 = ($798|0)==(0|0);
              if ($799) {
               break;
              } else {
               $R$0$i$i = $798;$RP$0$i$i = $797;
              }
             }
             $800 = HEAP32[((12432 + 16|0))>>2]|0;
             $801 = ($RP$0$i$i>>>0)<($800>>>0);
             if ($801) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i>>2] = 0;
              $R$1$i$i = $R$0$i$i;
              break;
             }
            } else {
             $$sum3536$i$i = $720 | 8;
             $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
             $778 = (($tbase$247$i) + ($$sum112$i)|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = HEAP32[((12432 + 16|0))>>2]|0;
             $781 = ($779>>>0)<($780>>>0);
             if ($781) {
              _abort();
              // unreachable;
             }
             $782 = (($779) + 12|0);
             $783 = HEAP32[$782>>2]|0;
             $784 = ($783|0)==($721|0);
             if (!($784)) {
              _abort();
              // unreachable;
             }
             $785 = (($776) + 8|0);
             $786 = HEAP32[$785>>2]|0;
             $787 = ($786|0)==($721|0);
             if ($787) {
              HEAP32[$782>>2] = $776;
              HEAP32[$785>>2] = $779;
              $R$1$i$i = $776;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $802 = ($774|0)==(0|0);
           if (!($802)) {
            $$sum30$i$i = (($tsize$246$i) + 28)|0;
            $$sum113$i = (($$sum30$i$i) + ($720))|0;
            $803 = (($tbase$247$i) + ($$sum113$i)|0);
            $804 = HEAP32[$803>>2]|0;
            $805 = ((12432 + ($804<<2)|0) + 304|0);
            $806 = HEAP32[$805>>2]|0;
            $807 = ($721|0)==($806|0);
            if ($807) {
             HEAP32[$805>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if ($cond$i$i) {
              $808 = 1 << $804;
              $809 = $808 ^ -1;
              $810 = HEAP32[((12432 + 4|0))>>2]|0;
              $811 = $810 & $809;
              HEAP32[((12432 + 4|0))>>2] = $811;
              break;
             }
            } else {
             $812 = HEAP32[((12432 + 16|0))>>2]|0;
             $813 = ($774>>>0)<($812>>>0);
             if ($813) {
              _abort();
              // unreachable;
             }
             $814 = (($774) + 16|0);
             $815 = HEAP32[$814>>2]|0;
             $816 = ($815|0)==($721|0);
             if ($816) {
              HEAP32[$814>>2] = $R$1$i$i;
             } else {
              $817 = (($774) + 20|0);
              HEAP32[$817>>2] = $R$1$i$i;
             }
             $818 = ($R$1$i$i|0)==(0|0);
             if ($818) {
              break;
             }
            }
            $819 = HEAP32[((12432 + 16|0))>>2]|0;
            $820 = ($R$1$i$i>>>0)<($819>>>0);
            if ($820) {
             _abort();
             // unreachable;
            }
            $821 = (($R$1$i$i) + 24|0);
            HEAP32[$821>>2] = $774;
            $$sum3132$i$i = $720 | 16;
            $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
            $822 = (($tbase$247$i) + ($$sum114$i)|0);
            $823 = HEAP32[$822>>2]|0;
            $824 = ($823|0)==(0|0);
            do {
             if (!($824)) {
              $825 = HEAP32[((12432 + 16|0))>>2]|0;
              $826 = ($823>>>0)<($825>>>0);
              if ($826) {
               _abort();
               // unreachable;
              } else {
               $827 = (($R$1$i$i) + 16|0);
               HEAP32[$827>>2] = $823;
               $828 = (($823) + 24|0);
               HEAP32[$828>>2] = $R$1$i$i;
               break;
              }
             }
            } while(0);
            $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
            $829 = (($tbase$247$i) + ($$sum115$i)|0);
            $830 = HEAP32[$829>>2]|0;
            $831 = ($830|0)==(0|0);
            if (!($831)) {
             $832 = HEAP32[((12432 + 16|0))>>2]|0;
             $833 = ($830>>>0)<($832>>>0);
             if ($833) {
              _abort();
              // unreachable;
             } else {
              $834 = (($R$1$i$i) + 20|0);
              HEAP32[$834>>2] = $830;
              $835 = (($830) + 24|0);
              HEAP32[$835>>2] = $R$1$i$i;
              break;
             }
            }
           }
          }
         } while(0);
         $$sum9$i$i = $746 | $720;
         $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
         $836 = (($tbase$247$i) + ($$sum116$i)|0);
         $837 = (($746) + ($726))|0;
         $oldfirst$0$i$i = $836;$qsize$0$i$i = $837;
        } else {
         $oldfirst$0$i$i = $721;$qsize$0$i$i = $726;
        }
        $838 = (($oldfirst$0$i$i) + 4|0);
        $839 = HEAP32[$838>>2]|0;
        $840 = $839 & -2;
        HEAP32[$838>>2] = $840;
        $841 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i21$i) + 4)|0;
        $842 = (($tbase$247$i) + ($$sum10$i$i)|0);
        HEAP32[$842>>2] = $841;
        $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
        $843 = (($tbase$247$i) + ($$sum11$i24$i)|0);
        HEAP32[$843>>2] = $qsize$0$i$i;
        $844 = $qsize$0$i$i >>> 3;
        $845 = ($qsize$0$i$i>>>0)<(256);
        if ($845) {
         $846 = $844 << 1;
         $847 = ((12432 + ($846<<2)|0) + 40|0);
         $848 = HEAP32[12432>>2]|0;
         $849 = 1 << $844;
         $850 = $848 & $849;
         $851 = ($850|0)==(0);
         if ($851) {
          $852 = $848 | $849;
          HEAP32[12432>>2] = $852;
          $$sum26$pre$i$i = (($846) + 2)|0;
          $$pre$i25$i = ((12432 + ($$sum26$pre$i$i<<2)|0) + 40|0);
          $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $847;
         } else {
          $$sum29$i$i = (($846) + 2)|0;
          $853 = ((12432 + ($$sum29$i$i<<2)|0) + 40|0);
          $854 = HEAP32[$853>>2]|0;
          $855 = HEAP32[((12432 + 16|0))>>2]|0;
          $856 = ($854>>>0)<($855>>>0);
          if ($856) {
           _abort();
           // unreachable;
          } else {
           $$pre$phi$i26$iZ2D = $853;$F4$0$i$i = $854;
          }
         }
         HEAP32[$$pre$phi$i26$iZ2D>>2] = $725;
         $857 = (($F4$0$i$i) + 12|0);
         HEAP32[$857>>2] = $725;
         $$sum27$i$i = (($$sum$i21$i) + 8)|0;
         $858 = (($tbase$247$i) + ($$sum27$i$i)|0);
         HEAP32[$858>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i21$i) + 12)|0;
         $859 = (($tbase$247$i) + ($$sum28$i$i)|0);
         HEAP32[$859>>2] = $847;
         break;
        }
        $860 = $qsize$0$i$i >>> 8;
        $861 = ($860|0)==(0);
        if ($861) {
         $I7$0$i$i = 0;
        } else {
         $862 = ($qsize$0$i$i>>>0)>(16777215);
         if ($862) {
          $I7$0$i$i = 31;
         } else {
          $863 = (($860) + 1048320)|0;
          $864 = $863 >>> 16;
          $865 = $864 & 8;
          $866 = $860 << $865;
          $867 = (($866) + 520192)|0;
          $868 = $867 >>> 16;
          $869 = $868 & 4;
          $870 = $869 | $865;
          $871 = $866 << $869;
          $872 = (($871) + 245760)|0;
          $873 = $872 >>> 16;
          $874 = $873 & 2;
          $875 = $870 | $874;
          $876 = (14 - ($875))|0;
          $877 = $871 << $874;
          $878 = $877 >>> 15;
          $879 = (($876) + ($878))|0;
          $880 = $879 << 1;
          $881 = (($879) + 7)|0;
          $882 = $qsize$0$i$i >>> $881;
          $883 = $882 & 1;
          $884 = $883 | $880;
          $I7$0$i$i = $884;
         }
        }
        $885 = ((12432 + ($I7$0$i$i<<2)|0) + 304|0);
        $$sum12$i$i = (($$sum$i21$i) + 28)|0;
        $886 = (($tbase$247$i) + ($$sum12$i$i)|0);
        HEAP32[$886>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i21$i) + 16)|0;
        $887 = (($tbase$247$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i21$i) + 20)|0;
        $888 = (($tbase$247$i) + ($$sum14$i$i)|0);
        HEAP32[$888>>2] = 0;
        HEAP32[$887>>2] = 0;
        $889 = HEAP32[((12432 + 4|0))>>2]|0;
        $890 = 1 << $I7$0$i$i;
        $891 = $889 & $890;
        $892 = ($891|0)==(0);
        if ($892) {
         $893 = $889 | $890;
         HEAP32[((12432 + 4|0))>>2] = $893;
         HEAP32[$885>>2] = $725;
         $$sum15$i$i = (($$sum$i21$i) + 24)|0;
         $894 = (($tbase$247$i) + ($$sum15$i$i)|0);
         HEAP32[$894>>2] = $885;
         $$sum16$i$i = (($$sum$i21$i) + 12)|0;
         $895 = (($tbase$247$i) + ($$sum16$i$i)|0);
         HEAP32[$895>>2] = $725;
         $$sum17$i$i = (($$sum$i21$i) + 8)|0;
         $896 = (($tbase$247$i) + ($$sum17$i$i)|0);
         HEAP32[$896>>2] = $725;
         break;
        }
        $897 = HEAP32[$885>>2]|0;
        $898 = ($I7$0$i$i|0)==(31);
        if ($898) {
         $906 = 0;
        } else {
         $899 = $I7$0$i$i >>> 1;
         $900 = (25 - ($899))|0;
         $906 = $900;
        }
        $901 = (($897) + 4|0);
        $902 = HEAP32[$901>>2]|0;
        $903 = $902 & -8;
        $904 = ($903|0)==($qsize$0$i$i|0);
        L445: do {
         if ($904) {
          $T$0$lcssa$i28$i = $897;
         } else {
          $905 = $qsize$0$i$i << $906;
          $K8$052$i$i = $905;$T$051$i$i = $897;
          while(1) {
           $913 = $K8$052$i$i >>> 31;
           $914 = ((($T$051$i$i) + ($913<<2)|0) + 16|0);
           $909 = HEAP32[$914>>2]|0;
           $915 = ($909|0)==(0|0);
           if ($915) {
            break;
           }
           $907 = $K8$052$i$i << 1;
           $908 = (($909) + 4|0);
           $910 = HEAP32[$908>>2]|0;
           $911 = $910 & -8;
           $912 = ($911|0)==($qsize$0$i$i|0);
           if ($912) {
            $T$0$lcssa$i28$i = $909;
            break L445;
           } else {
            $K8$052$i$i = $907;$T$051$i$i = $909;
           }
          }
          $916 = HEAP32[((12432 + 16|0))>>2]|0;
          $917 = ($914>>>0)<($916>>>0);
          if ($917) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$914>>2] = $725;
           $$sum23$i$i = (($$sum$i21$i) + 24)|0;
           $918 = (($tbase$247$i) + ($$sum23$i$i)|0);
           HEAP32[$918>>2] = $T$051$i$i;
           $$sum24$i$i = (($$sum$i21$i) + 12)|0;
           $919 = (($tbase$247$i) + ($$sum24$i$i)|0);
           HEAP32[$919>>2] = $725;
           $$sum25$i$i = (($$sum$i21$i) + 8)|0;
           $920 = (($tbase$247$i) + ($$sum25$i$i)|0);
           HEAP32[$920>>2] = $725;
           break L348;
          }
         }
        } while(0);
        $921 = (($T$0$lcssa$i28$i) + 8|0);
        $922 = HEAP32[$921>>2]|0;
        $923 = HEAP32[((12432 + 16|0))>>2]|0;
        $924 = ($T$0$lcssa$i28$i>>>0)<($923>>>0);
        if ($924) {
         _abort();
         // unreachable;
        }
        $925 = ($922>>>0)<($923>>>0);
        if ($925) {
         _abort();
         // unreachable;
        } else {
         $926 = (($922) + 12|0);
         HEAP32[$926>>2] = $725;
         HEAP32[$921>>2] = $725;
         $$sum20$i$i = (($$sum$i21$i) + 8)|0;
         $927 = (($tbase$247$i) + ($$sum20$i$i)|0);
         HEAP32[$927>>2] = $922;
         $$sum21$i$i = (($$sum$i21$i) + 12)|0;
         $928 = (($tbase$247$i) + ($$sum21$i$i)|0);
         HEAP32[$928>>2] = $T$0$lcssa$i28$i;
         $$sum22$i$i = (($$sum$i21$i) + 24)|0;
         $929 = (($tbase$247$i) + ($$sum22$i$i)|0);
         HEAP32[$929>>2] = 0;
         break;
        }
       }
      } while(0);
      $$sum1819$i$i = $713 | 8;
      $930 = (($tbase$247$i) + ($$sum1819$i$i)|0);
      $mem$0 = $930;
      STACKTOP = sp;return ($mem$0|0);
     }
    }
    $sp$0$i$i$i = ((12432 + 448|0));
    while(1) {
     $931 = HEAP32[$sp$0$i$i$i>>2]|0;
     $932 = ($931>>>0)>($636>>>0);
     if (!($932)) {
      $933 = (($sp$0$i$i$i) + 4|0);
      $934 = HEAP32[$933>>2]|0;
      $935 = (($931) + ($934)|0);
      $936 = ($935>>>0)>($636>>>0);
      if ($936) {
       break;
      }
     }
     $937 = (($sp$0$i$i$i) + 8|0);
     $938 = HEAP32[$937>>2]|0;
     $sp$0$i$i$i = $938;
    }
    $$sum$i15$i = (($934) + -47)|0;
    $$sum1$i16$i = (($934) + -39)|0;
    $939 = (($931) + ($$sum1$i16$i)|0);
    $940 = $939;
    $941 = $940 & 7;
    $942 = ($941|0)==(0);
    if ($942) {
     $945 = 0;
    } else {
     $943 = (0 - ($940))|0;
     $944 = $943 & 7;
     $945 = $944;
    }
    $$sum2$i17$i = (($$sum$i15$i) + ($945))|0;
    $946 = (($931) + ($$sum2$i17$i)|0);
    $947 = (($636) + 16|0);
    $948 = ($946>>>0)<($947>>>0);
    $949 = $948 ? $636 : $946;
    $950 = (($949) + 8|0);
    $951 = (($tsize$246$i) + -40)|0;
    $952 = (($tbase$247$i) + 8|0);
    $953 = $952;
    $954 = $953 & 7;
    $955 = ($954|0)==(0);
    if ($955) {
     $959 = 0;
    } else {
     $956 = (0 - ($953))|0;
     $957 = $956 & 7;
     $959 = $957;
    }
    $958 = (($tbase$247$i) + ($959)|0);
    $960 = (($951) - ($959))|0;
    HEAP32[((12432 + 24|0))>>2] = $958;
    HEAP32[((12432 + 12|0))>>2] = $960;
    $961 = $960 | 1;
    $$sum$i$i$i = (($959) + 4)|0;
    $962 = (($tbase$247$i) + ($$sum$i$i$i)|0);
    HEAP32[$962>>2] = $961;
    $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
    $963 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
    HEAP32[$963>>2] = 40;
    $964 = HEAP32[((12904 + 16|0))>>2]|0;
    HEAP32[((12432 + 28|0))>>2] = $964;
    $965 = (($949) + 4|0);
    HEAP32[$965>>2] = 27;
    ;HEAP32[$950+0>>2]=HEAP32[((12432 + 448|0))+0>>2]|0;HEAP32[$950+4>>2]=HEAP32[((12432 + 448|0))+4>>2]|0;HEAP32[$950+8>>2]=HEAP32[((12432 + 448|0))+8>>2]|0;HEAP32[$950+12>>2]=HEAP32[((12432 + 448|0))+12>>2]|0;
    HEAP32[((12432 + 448|0))>>2] = $tbase$247$i;
    HEAP32[((12432 + 452|0))>>2] = $tsize$246$i;
    HEAP32[((12432 + 460|0))>>2] = 0;
    HEAP32[((12432 + 456|0))>>2] = $950;
    $966 = (($949) + 28|0);
    HEAP32[$966>>2] = 7;
    $967 = (($949) + 32|0);
    $968 = ($967>>>0)<($935>>>0);
    if ($968) {
     $970 = $966;
     while(1) {
      $969 = (($970) + 4|0);
      HEAP32[$969>>2] = 7;
      $971 = (($970) + 8|0);
      $972 = ($971>>>0)<($935>>>0);
      if ($972) {
       $970 = $969;
      } else {
       break;
      }
     }
    }
    $973 = ($949|0)==($636|0);
    if (!($973)) {
     $974 = $949;
     $975 = $636;
     $976 = (($974) - ($975))|0;
     $977 = (($636) + ($976)|0);
     $$sum3$i$i = (($976) + 4)|0;
     $978 = (($636) + ($$sum3$i$i)|0);
     $979 = HEAP32[$978>>2]|0;
     $980 = $979 & -2;
     HEAP32[$978>>2] = $980;
     $981 = $976 | 1;
     $982 = (($636) + 4|0);
     HEAP32[$982>>2] = $981;
     HEAP32[$977>>2] = $976;
     $983 = $976 >>> 3;
     $984 = ($976>>>0)<(256);
     if ($984) {
      $985 = $983 << 1;
      $986 = ((12432 + ($985<<2)|0) + 40|0);
      $987 = HEAP32[12432>>2]|0;
      $988 = 1 << $983;
      $989 = $987 & $988;
      $990 = ($989|0)==(0);
      if ($990) {
       $991 = $987 | $988;
       HEAP32[12432>>2] = $991;
       $$sum10$pre$i$i = (($985) + 2)|0;
       $$pre$i$i = ((12432 + ($$sum10$pre$i$i<<2)|0) + 40|0);
       $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $986;
      } else {
       $$sum11$i$i = (($985) + 2)|0;
       $992 = ((12432 + ($$sum11$i$i<<2)|0) + 40|0);
       $993 = HEAP32[$992>>2]|0;
       $994 = HEAP32[((12432 + 16|0))>>2]|0;
       $995 = ($993>>>0)<($994>>>0);
       if ($995) {
        _abort();
        // unreachable;
       } else {
        $$pre$phi$i$iZ2D = $992;$F$0$i$i = $993;
       }
      }
      HEAP32[$$pre$phi$i$iZ2D>>2] = $636;
      $996 = (($F$0$i$i) + 12|0);
      HEAP32[$996>>2] = $636;
      $997 = (($636) + 8|0);
      HEAP32[$997>>2] = $F$0$i$i;
      $998 = (($636) + 12|0);
      HEAP32[$998>>2] = $986;
      break;
     }
     $999 = $976 >>> 8;
     $1000 = ($999|0)==(0);
     if ($1000) {
      $I1$0$i$i = 0;
     } else {
      $1001 = ($976>>>0)>(16777215);
      if ($1001) {
       $I1$0$i$i = 31;
      } else {
       $1002 = (($999) + 1048320)|0;
       $1003 = $1002 >>> 16;
       $1004 = $1003 & 8;
       $1005 = $999 << $1004;
       $1006 = (($1005) + 520192)|0;
       $1007 = $1006 >>> 16;
       $1008 = $1007 & 4;
       $1009 = $1008 | $1004;
       $1010 = $1005 << $1008;
       $1011 = (($1010) + 245760)|0;
       $1012 = $1011 >>> 16;
       $1013 = $1012 & 2;
       $1014 = $1009 | $1013;
       $1015 = (14 - ($1014))|0;
       $1016 = $1010 << $1013;
       $1017 = $1016 >>> 15;
       $1018 = (($1015) + ($1017))|0;
       $1019 = $1018 << 1;
       $1020 = (($1018) + 7)|0;
       $1021 = $976 >>> $1020;
       $1022 = $1021 & 1;
       $1023 = $1022 | $1019;
       $I1$0$i$i = $1023;
      }
     }
     $1024 = ((12432 + ($I1$0$i$i<<2)|0) + 304|0);
     $1025 = (($636) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1025>>2] = $I1$0$c$i$i;
     $1026 = (($636) + 20|0);
     HEAP32[$1026>>2] = 0;
     $1027 = (($636) + 16|0);
     HEAP32[$1027>>2] = 0;
     $1028 = HEAP32[((12432 + 4|0))>>2]|0;
     $1029 = 1 << $I1$0$i$i;
     $1030 = $1028 & $1029;
     $1031 = ($1030|0)==(0);
     if ($1031) {
      $1032 = $1028 | $1029;
      HEAP32[((12432 + 4|0))>>2] = $1032;
      HEAP32[$1024>>2] = $636;
      $1033 = (($636) + 24|0);
      HEAP32[$1033>>2] = $1024;
      $1034 = (($636) + 12|0);
      HEAP32[$1034>>2] = $636;
      $1035 = (($636) + 8|0);
      HEAP32[$1035>>2] = $636;
      break;
     }
     $1036 = HEAP32[$1024>>2]|0;
     $1037 = ($I1$0$i$i|0)==(31);
     if ($1037) {
      $1045 = 0;
     } else {
      $1038 = $I1$0$i$i >>> 1;
      $1039 = (25 - ($1038))|0;
      $1045 = $1039;
     }
     $1040 = (($1036) + 4|0);
     $1041 = HEAP32[$1040>>2]|0;
     $1042 = $1041 & -8;
     $1043 = ($1042|0)==($976|0);
     L499: do {
      if ($1043) {
       $T$0$lcssa$i$i = $1036;
      } else {
       $1044 = $976 << $1045;
       $K2$014$i$i = $1044;$T$013$i$i = $1036;
       while(1) {
        $1052 = $K2$014$i$i >>> 31;
        $1053 = ((($T$013$i$i) + ($1052<<2)|0) + 16|0);
        $1048 = HEAP32[$1053>>2]|0;
        $1054 = ($1048|0)==(0|0);
        if ($1054) {
         break;
        }
        $1046 = $K2$014$i$i << 1;
        $1047 = (($1048) + 4|0);
        $1049 = HEAP32[$1047>>2]|0;
        $1050 = $1049 & -8;
        $1051 = ($1050|0)==($976|0);
        if ($1051) {
         $T$0$lcssa$i$i = $1048;
         break L499;
        } else {
         $K2$014$i$i = $1046;$T$013$i$i = $1048;
        }
       }
       $1055 = HEAP32[((12432 + 16|0))>>2]|0;
       $1056 = ($1053>>>0)<($1055>>>0);
       if ($1056) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1053>>2] = $636;
        $1057 = (($636) + 24|0);
        HEAP32[$1057>>2] = $T$013$i$i;
        $1058 = (($636) + 12|0);
        HEAP32[$1058>>2] = $636;
        $1059 = (($636) + 8|0);
        HEAP32[$1059>>2] = $636;
        break L311;
       }
      }
     } while(0);
     $1060 = (($T$0$lcssa$i$i) + 8|0);
     $1061 = HEAP32[$1060>>2]|0;
     $1062 = HEAP32[((12432 + 16|0))>>2]|0;
     $1063 = ($T$0$lcssa$i$i>>>0)<($1062>>>0);
     if ($1063) {
      _abort();
      // unreachable;
     }
     $1064 = ($1061>>>0)<($1062>>>0);
     if ($1064) {
      _abort();
      // unreachable;
     } else {
      $1065 = (($1061) + 12|0);
      HEAP32[$1065>>2] = $636;
      HEAP32[$1060>>2] = $636;
      $1066 = (($636) + 8|0);
      HEAP32[$1066>>2] = $1061;
      $1067 = (($636) + 12|0);
      HEAP32[$1067>>2] = $T$0$lcssa$i$i;
      $1068 = (($636) + 24|0);
      HEAP32[$1068>>2] = 0;
      break;
     }
    }
   }
  } while(0);
  $1069 = HEAP32[((12432 + 12|0))>>2]|0;
  $1070 = ($1069>>>0)>($nb$0>>>0);
  if ($1070) {
   $1071 = (($1069) - ($nb$0))|0;
   HEAP32[((12432 + 12|0))>>2] = $1071;
   $1072 = HEAP32[((12432 + 24|0))>>2]|0;
   $1073 = (($1072) + ($nb$0)|0);
   HEAP32[((12432 + 24|0))>>2] = $1073;
   $1074 = $1071 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1075 = (($1072) + ($$sum$i32)|0);
   HEAP32[$1075>>2] = $1074;
   $1076 = $nb$0 | 3;
   $1077 = (($1072) + 4|0);
   HEAP32[$1077>>2] = $1076;
   $1078 = (($1072) + 8|0);
   $mem$0 = $1078;
   STACKTOP = sp;return ($mem$0|0);
  }
 }
 $1079 = (___errno_location()|0);
 HEAP32[$1079>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0;
 var $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0;
 var $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0;
 var $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0;
 var $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0;
 var $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0;
 var $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0;
 var $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0;
 var $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0;
 var $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0;
 var $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0;
 var $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0, $K19$057 = 0;
 var $R$0 = 0, $R$1 = 0, $R7$0 = 0, $R7$1 = 0, $RP$0 = 0, $RP9$0 = 0, $T$0$lcssa = 0, $T$056 = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  STACKTOP = sp;return;
 }
 $1 = (($mem) + -8|0);
 $2 = HEAP32[((12432 + 16|0))>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = (($mem) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[((12432 + 20|0))>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $104 = (($mem) + ($$sum3)|0);
    $105 = HEAP32[$104>>2]|0;
    $106 = $105 & 3;
    $107 = ($106|0)==(3);
    if (!($107)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[((12432 + 8|0))>>2] = $15;
    $108 = HEAP32[$104>>2]|0;
    $109 = $108 & -2;
    HEAP32[$104>>2] = $109;
    $110 = $15 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $111 = (($mem) + ($$sum26)|0);
    HEAP32[$111>>2] = $110;
    HEAP32[$9>>2] = $15;
    STACKTOP = sp;return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum36 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum36)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum37)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = ((12432 + ($25<<2)|0) + 40|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = (($22) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[12432>>2]|0;
     $36 = $35 & $34;
     HEAP32[12432>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre69 = (($24) + 8|0);
     $$pre$phi70Z2D = $$pre69;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = (($24) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi70Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = (($22) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi70Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum28 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum28)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum29)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum31 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum31)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum30 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum30)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = (($R$0) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = (($R$0) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum35)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = (($49) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = (($46) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum32 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum32)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = ((12432 + ($72<<2)|0) + 304|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[((12432 + 4|0))>>2]|0;
      $79 = $78 & $77;
      HEAP32[((12432 + 4|0))>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[((12432 + 16|0))>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = (($44) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = (($44) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[((12432 + 16|0))>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = (($R$1) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum33 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum33)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = HEAP32[((12432 + 16|0))>>2]|0;
      $94 = ($91>>>0)<($93>>>0);
      if ($94) {
       _abort();
       // unreachable;
      } else {
       $95 = (($R$1) + 16|0);
       HEAP32[$95>>2] = $91;
       $96 = (($91) + 24|0);
       HEAP32[$96>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum34 = (($$sum2) + 20)|0;
    $97 = (($mem) + ($$sum34)|0);
    $98 = HEAP32[$97>>2]|0;
    $99 = ($98|0)==(0|0);
    if ($99) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $100 = HEAP32[((12432 + 16|0))>>2]|0;
     $101 = ($98>>>0)<($100>>>0);
     if ($101) {
      _abort();
      // unreachable;
     } else {
      $102 = (($R$1) + 20|0);
      HEAP32[$102>>2] = $98;
      $103 = (($98) + 24|0);
      HEAP32[$103>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $112 = ($p$0>>>0)<($9>>>0);
 if (!($112)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($8) + -4)|0;
 $113 = (($mem) + ($$sum25)|0);
 $114 = HEAP32[$113>>2]|0;
 $115 = $114 & 1;
 $116 = ($115|0)==(0);
 if ($116) {
  _abort();
  // unreachable;
 }
 $117 = $114 & 2;
 $118 = ($117|0)==(0);
 if ($118) {
  $119 = HEAP32[((12432 + 24|0))>>2]|0;
  $120 = ($9|0)==($119|0);
  if ($120) {
   $121 = HEAP32[((12432 + 12|0))>>2]|0;
   $122 = (($121) + ($psize$0))|0;
   HEAP32[((12432 + 12|0))>>2] = $122;
   HEAP32[((12432 + 24|0))>>2] = $p$0;
   $123 = $122 | 1;
   $124 = (($p$0) + 4|0);
   HEAP32[$124>>2] = $123;
   $125 = HEAP32[((12432 + 20|0))>>2]|0;
   $126 = ($p$0|0)==($125|0);
   if (!($126)) {
    STACKTOP = sp;return;
   }
   HEAP32[((12432 + 20|0))>>2] = 0;
   HEAP32[((12432 + 8|0))>>2] = 0;
   STACKTOP = sp;return;
  }
  $127 = HEAP32[((12432 + 20|0))>>2]|0;
  $128 = ($9|0)==($127|0);
  if ($128) {
   $129 = HEAP32[((12432 + 8|0))>>2]|0;
   $130 = (($129) + ($psize$0))|0;
   HEAP32[((12432 + 8|0))>>2] = $130;
   HEAP32[((12432 + 20|0))>>2] = $p$0;
   $131 = $130 | 1;
   $132 = (($p$0) + 4|0);
   HEAP32[$132>>2] = $131;
   $133 = (($p$0) + ($130)|0);
   HEAP32[$133>>2] = $130;
   STACKTOP = sp;return;
  }
  $134 = $114 & -8;
  $135 = (($134) + ($psize$0))|0;
  $136 = $114 >>> 3;
  $137 = ($114>>>0)<(256);
  do {
   if ($137) {
    $138 = (($mem) + ($8)|0);
    $139 = HEAP32[$138>>2]|0;
    $$sum2324 = $8 | 4;
    $140 = (($mem) + ($$sum2324)|0);
    $141 = HEAP32[$140>>2]|0;
    $142 = $136 << 1;
    $143 = ((12432 + ($142<<2)|0) + 40|0);
    $144 = ($139|0)==($143|0);
    if (!($144)) {
     $145 = HEAP32[((12432 + 16|0))>>2]|0;
     $146 = ($139>>>0)<($145>>>0);
     if ($146) {
      _abort();
      // unreachable;
     }
     $147 = (($139) + 12|0);
     $148 = HEAP32[$147>>2]|0;
     $149 = ($148|0)==($9|0);
     if (!($149)) {
      _abort();
      // unreachable;
     }
    }
    $150 = ($141|0)==($139|0);
    if ($150) {
     $151 = 1 << $136;
     $152 = $151 ^ -1;
     $153 = HEAP32[12432>>2]|0;
     $154 = $153 & $152;
     HEAP32[12432>>2] = $154;
     break;
    }
    $155 = ($141|0)==($143|0);
    if ($155) {
     $$pre67 = (($141) + 8|0);
     $$pre$phi68Z2D = $$pre67;
    } else {
     $156 = HEAP32[((12432 + 16|0))>>2]|0;
     $157 = ($141>>>0)<($156>>>0);
     if ($157) {
      _abort();
      // unreachable;
     }
     $158 = (($141) + 8|0);
     $159 = HEAP32[$158>>2]|0;
     $160 = ($159|0)==($9|0);
     if ($160) {
      $$pre$phi68Z2D = $158;
     } else {
      _abort();
      // unreachable;
     }
    }
    $161 = (($139) + 12|0);
    HEAP32[$161>>2] = $141;
    HEAP32[$$pre$phi68Z2D>>2] = $139;
   } else {
    $$sum5 = (($8) + 16)|0;
    $162 = (($mem) + ($$sum5)|0);
    $163 = HEAP32[$162>>2]|0;
    $$sum67 = $8 | 4;
    $164 = (($mem) + ($$sum67)|0);
    $165 = HEAP32[$164>>2]|0;
    $166 = ($165|0)==($9|0);
    do {
     if ($166) {
      $$sum9 = (($8) + 12)|0;
      $177 = (($mem) + ($$sum9)|0);
      $178 = HEAP32[$177>>2]|0;
      $179 = ($178|0)==(0|0);
      if ($179) {
       $$sum8 = (($8) + 8)|0;
       $180 = (($mem) + ($$sum8)|0);
       $181 = HEAP32[$180>>2]|0;
       $182 = ($181|0)==(0|0);
       if ($182) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $181;$RP9$0 = $180;
       }
      } else {
       $R7$0 = $178;$RP9$0 = $177;
      }
      while(1) {
       $183 = (($R7$0) + 20|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==(0|0);
       if (!($185)) {
        $R7$0 = $184;$RP9$0 = $183;
        continue;
       }
       $186 = (($R7$0) + 16|0);
       $187 = HEAP32[$186>>2]|0;
       $188 = ($187|0)==(0|0);
       if ($188) {
        break;
       } else {
        $R7$0 = $187;$RP9$0 = $186;
       }
      }
      $189 = HEAP32[((12432 + 16|0))>>2]|0;
      $190 = ($RP9$0>>>0)<($189>>>0);
      if ($190) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0>>2] = 0;
       $R7$1 = $R7$0;
       break;
      }
     } else {
      $167 = (($mem) + ($8)|0);
      $168 = HEAP32[$167>>2]|0;
      $169 = HEAP32[((12432 + 16|0))>>2]|0;
      $170 = ($168>>>0)<($169>>>0);
      if ($170) {
       _abort();
       // unreachable;
      }
      $171 = (($168) + 12|0);
      $172 = HEAP32[$171>>2]|0;
      $173 = ($172|0)==($9|0);
      if (!($173)) {
       _abort();
       // unreachable;
      }
      $174 = (($165) + 8|0);
      $175 = HEAP32[$174>>2]|0;
      $176 = ($175|0)==($9|0);
      if ($176) {
       HEAP32[$171>>2] = $165;
       HEAP32[$174>>2] = $168;
       $R7$1 = $165;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $191 = ($163|0)==(0|0);
    if (!($191)) {
     $$sum18 = (($8) + 20)|0;
     $192 = (($mem) + ($$sum18)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ((12432 + ($193<<2)|0) + 304|0);
     $195 = HEAP32[$194>>2]|0;
     $196 = ($9|0)==($195|0);
     if ($196) {
      HEAP32[$194>>2] = $R7$1;
      $cond54 = ($R7$1|0)==(0|0);
      if ($cond54) {
       $197 = 1 << $193;
       $198 = $197 ^ -1;
       $199 = HEAP32[((12432 + 4|0))>>2]|0;
       $200 = $199 & $198;
       HEAP32[((12432 + 4|0))>>2] = $200;
       break;
      }
     } else {
      $201 = HEAP32[((12432 + 16|0))>>2]|0;
      $202 = ($163>>>0)<($201>>>0);
      if ($202) {
       _abort();
       // unreachable;
      }
      $203 = (($163) + 16|0);
      $204 = HEAP32[$203>>2]|0;
      $205 = ($204|0)==($9|0);
      if ($205) {
       HEAP32[$203>>2] = $R7$1;
      } else {
       $206 = (($163) + 20|0);
       HEAP32[$206>>2] = $R7$1;
      }
      $207 = ($R7$1|0)==(0|0);
      if ($207) {
       break;
      }
     }
     $208 = HEAP32[((12432 + 16|0))>>2]|0;
     $209 = ($R7$1>>>0)<($208>>>0);
     if ($209) {
      _abort();
      // unreachable;
     }
     $210 = (($R7$1) + 24|0);
     HEAP32[$210>>2] = $163;
     $$sum19 = (($8) + 8)|0;
     $211 = (($mem) + ($$sum19)|0);
     $212 = HEAP32[$211>>2]|0;
     $213 = ($212|0)==(0|0);
     do {
      if (!($213)) {
       $214 = HEAP32[((12432 + 16|0))>>2]|0;
       $215 = ($212>>>0)<($214>>>0);
       if ($215) {
        _abort();
        // unreachable;
       } else {
        $216 = (($R7$1) + 16|0);
        HEAP32[$216>>2] = $212;
        $217 = (($212) + 24|0);
        HEAP32[$217>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($8) + 12)|0;
     $218 = (($mem) + ($$sum20)|0);
     $219 = HEAP32[$218>>2]|0;
     $220 = ($219|0)==(0|0);
     if (!($220)) {
      $221 = HEAP32[((12432 + 16|0))>>2]|0;
      $222 = ($219>>>0)<($221>>>0);
      if ($222) {
       _abort();
       // unreachable;
      } else {
       $223 = (($R7$1) + 20|0);
       HEAP32[$223>>2] = $219;
       $224 = (($219) + 24|0);
       HEAP32[$224>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $225 = $135 | 1;
  $226 = (($p$0) + 4|0);
  HEAP32[$226>>2] = $225;
  $227 = (($p$0) + ($135)|0);
  HEAP32[$227>>2] = $135;
  $228 = HEAP32[((12432 + 20|0))>>2]|0;
  $229 = ($p$0|0)==($228|0);
  if ($229) {
   HEAP32[((12432 + 8|0))>>2] = $135;
   STACKTOP = sp;return;
  } else {
   $psize$1 = $135;
  }
 } else {
  $230 = $114 & -2;
  HEAP32[$113>>2] = $230;
  $231 = $psize$0 | 1;
  $232 = (($p$0) + 4|0);
  HEAP32[$232>>2] = $231;
  $233 = (($p$0) + ($psize$0)|0);
  HEAP32[$233>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $234 = $psize$1 >>> 3;
 $235 = ($psize$1>>>0)<(256);
 if ($235) {
  $236 = $234 << 1;
  $237 = ((12432 + ($236<<2)|0) + 40|0);
  $238 = HEAP32[12432>>2]|0;
  $239 = 1 << $234;
  $240 = $238 & $239;
  $241 = ($240|0)==(0);
  if ($241) {
   $242 = $238 | $239;
   HEAP32[12432>>2] = $242;
   $$sum16$pre = (($236) + 2)|0;
   $$pre = ((12432 + ($$sum16$pre<<2)|0) + 40|0);
   $$pre$phiZ2D = $$pre;$F16$0 = $237;
  } else {
   $$sum17 = (($236) + 2)|0;
   $243 = ((12432 + ($$sum17<<2)|0) + 40|0);
   $244 = HEAP32[$243>>2]|0;
   $245 = HEAP32[((12432 + 16|0))>>2]|0;
   $246 = ($244>>>0)<($245>>>0);
   if ($246) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $243;$F16$0 = $244;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $247 = (($F16$0) + 12|0);
  HEAP32[$247>>2] = $p$0;
  $248 = (($p$0) + 8|0);
  HEAP32[$248>>2] = $F16$0;
  $249 = (($p$0) + 12|0);
  HEAP32[$249>>2] = $237;
  STACKTOP = sp;return;
 }
 $250 = $psize$1 >>> 8;
 $251 = ($250|0)==(0);
 if ($251) {
  $I18$0 = 0;
 } else {
  $252 = ($psize$1>>>0)>(16777215);
  if ($252) {
   $I18$0 = 31;
  } else {
   $253 = (($250) + 1048320)|0;
   $254 = $253 >>> 16;
   $255 = $254 & 8;
   $256 = $250 << $255;
   $257 = (($256) + 520192)|0;
   $258 = $257 >>> 16;
   $259 = $258 & 4;
   $260 = $259 | $255;
   $261 = $256 << $259;
   $262 = (($261) + 245760)|0;
   $263 = $262 >>> 16;
   $264 = $263 & 2;
   $265 = $260 | $264;
   $266 = (14 - ($265))|0;
   $267 = $261 << $264;
   $268 = $267 >>> 15;
   $269 = (($266) + ($268))|0;
   $270 = $269 << 1;
   $271 = (($269) + 7)|0;
   $272 = $psize$1 >>> $271;
   $273 = $272 & 1;
   $274 = $273 | $270;
   $I18$0 = $274;
  }
 }
 $275 = ((12432 + ($I18$0<<2)|0) + 304|0);
 $276 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$276>>2] = $I18$0$c;
 $277 = (($p$0) + 20|0);
 HEAP32[$277>>2] = 0;
 $278 = (($p$0) + 16|0);
 HEAP32[$278>>2] = 0;
 $279 = HEAP32[((12432 + 4|0))>>2]|0;
 $280 = 1 << $I18$0;
 $281 = $279 & $280;
 $282 = ($281|0)==(0);
 L199: do {
  if ($282) {
   $283 = $279 | $280;
   HEAP32[((12432 + 4|0))>>2] = $283;
   HEAP32[$275>>2] = $p$0;
   $284 = (($p$0) + 24|0);
   HEAP32[$284>>2] = $275;
   $285 = (($p$0) + 12|0);
   HEAP32[$285>>2] = $p$0;
   $286 = (($p$0) + 8|0);
   HEAP32[$286>>2] = $p$0;
  } else {
   $287 = HEAP32[$275>>2]|0;
   $288 = ($I18$0|0)==(31);
   if ($288) {
    $296 = 0;
   } else {
    $289 = $I18$0 >>> 1;
    $290 = (25 - ($289))|0;
    $296 = $290;
   }
   $291 = (($287) + 4|0);
   $292 = HEAP32[$291>>2]|0;
   $293 = $292 & -8;
   $294 = ($293|0)==($psize$1|0);
   L205: do {
    if ($294) {
     $T$0$lcssa = $287;
    } else {
     $295 = $psize$1 << $296;
     $K19$057 = $295;$T$056 = $287;
     while(1) {
      $303 = $K19$057 >>> 31;
      $304 = ((($T$056) + ($303<<2)|0) + 16|0);
      $299 = HEAP32[$304>>2]|0;
      $305 = ($299|0)==(0|0);
      if ($305) {
       break;
      }
      $297 = $K19$057 << 1;
      $298 = (($299) + 4|0);
      $300 = HEAP32[$298>>2]|0;
      $301 = $300 & -8;
      $302 = ($301|0)==($psize$1|0);
      if ($302) {
       $T$0$lcssa = $299;
       break L205;
      } else {
       $K19$057 = $297;$T$056 = $299;
      }
     }
     $306 = HEAP32[((12432 + 16|0))>>2]|0;
     $307 = ($304>>>0)<($306>>>0);
     if ($307) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$304>>2] = $p$0;
      $308 = (($p$0) + 24|0);
      HEAP32[$308>>2] = $T$056;
      $309 = (($p$0) + 12|0);
      HEAP32[$309>>2] = $p$0;
      $310 = (($p$0) + 8|0);
      HEAP32[$310>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $311 = (($T$0$lcssa) + 8|0);
   $312 = HEAP32[$311>>2]|0;
   $313 = HEAP32[((12432 + 16|0))>>2]|0;
   $314 = ($T$0$lcssa>>>0)<($313>>>0);
   if ($314) {
    _abort();
    // unreachable;
   }
   $315 = ($312>>>0)<($313>>>0);
   if ($315) {
    _abort();
    // unreachable;
   } else {
    $316 = (($312) + 12|0);
    HEAP32[$316>>2] = $p$0;
    HEAP32[$311>>2] = $p$0;
    $317 = (($p$0) + 8|0);
    HEAP32[$317>>2] = $312;
    $318 = (($p$0) + 12|0);
    HEAP32[$318>>2] = $T$0$lcssa;
    $319 = (($p$0) + 24|0);
    HEAP32[$319>>2] = 0;
    break;
   }
  }
 } while(0);
 $320 = HEAP32[((12432 + 32|0))>>2]|0;
 $321 = (($320) + -1)|0;
 HEAP32[((12432 + 32|0))>>2] = $321;
 $322 = ($321|0)==(0);
 if ($322) {
  $sp$0$in$i = ((12432 + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $323 = ($sp$0$i|0)==(0|0);
  $324 = (($sp$0$i) + 8|0);
  if ($323) {
   break;
  } else {
   $sp$0$in$i = $324;
  }
 }
 HEAP32[((12432 + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function _strcasecmp($_l,$_r) {
 $_l = $_l|0;
 $_r = $_r|0;
 var $$pre$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $l$03 = 0, $r$0$lcssa = 0, $r$04 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP8[$_l]|0;
 $1 = ($0<<24>>24)==(0);
 L1: do {
  if ($1) {
   $19 = 0;$r$0$lcssa = $_r;
  } else {
   $2 = $0&255;
   $6 = $0;$7 = $2;$l$03 = $_l;$r$04 = $_r;
   while(1) {
    $3 = HEAP8[$r$04]|0;
    $4 = ($3<<24>>24)==(0);
    if ($4) {
     $19 = $6;$r$0$lcssa = $r$04;
     break L1;
    }
    $5 = ($6<<24>>24)==($3<<24>>24);
    if (!($5)) {
     $8 = (_tolower(($7|0))|0);
     $9 = HEAP8[$r$04]|0;
     $10 = $9&255;
     $11 = (_tolower(($10|0))|0);
     $12 = ($8|0)==($11|0);
     if (!($12)) {
      break;
     }
    }
    $13 = (($l$03) + 1|0);
    $14 = (($r$04) + 1|0);
    $15 = HEAP8[$13]|0;
    $16 = $15&255;
    $17 = ($15<<24>>24)==(0);
    if ($17) {
     $19 = 0;$r$0$lcssa = $14;
     break L1;
    } else {
     $6 = $15;$7 = $16;$l$03 = $13;$r$04 = $14;
    }
   }
   $$pre$pre = HEAP8[$l$03]|0;
   $19 = $$pre$pre;$r$0$lcssa = $r$04;
  }
 } while(0);
 $18 = $19&255;
 $20 = (_tolower(($18|0))|0);
 $21 = HEAP8[$r$0$lcssa]|0;
 $22 = $21&255;
 $23 = (_tolower(($22|0))|0);
 $24 = (($20) - ($23))|0;
 STACKTOP = sp;return ($24|0);
}
function _strcmp($l,$r) {
 $l = $l|0;
 $r = $r|0;
 var $$027 = 0, $$08 = 0, $$lcssa = 0, $$lcssa4 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0;
 var $or$cond3 = 0, $or$cond36 = 0, $or$cond5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP8[$l]|0;
 $1 = HEAP8[$r]|0;
 $2 = ($0<<24>>24)!=($1<<24>>24);
 $3 = ($0<<24>>24)==(0);
 $or$cond5 = $2 | $3;
 $4 = ($1<<24>>24)==(0);
 $or$cond36 = $or$cond5 | $4;
 if ($or$cond36) {
  $$lcssa = $0;$$lcssa4 = $1;
  $12 = $$lcssa&255;
  $13 = $$lcssa4&255;
  $14 = (($12) - ($13))|0;
  STACKTOP = sp;return ($14|0);
 } else {
  $$027 = $l;$$08 = $r;
 }
 while(1) {
  $5 = (($$027) + 1|0);
  $6 = (($$08) + 1|0);
  $7 = HEAP8[$5]|0;
  $8 = HEAP8[$6]|0;
  $9 = ($7<<24>>24)!=($8<<24>>24);
  $10 = ($7<<24>>24)==(0);
  $or$cond = $9 | $10;
  $11 = ($8<<24>>24)==(0);
  $or$cond3 = $or$cond | $11;
  if ($or$cond3) {
   $$lcssa = $7;$$lcssa4 = $8;
   break;
  } else {
   $$027 = $5;$$08 = $6;
  }
 }
 $12 = $$lcssa&255;
 $13 = $$lcssa4&255;
 $14 = (($12) - ($13))|0;
 STACKTOP = sp;return ($14|0);
}
function runPostSets() {
 
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[(ptr)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[(ptr)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[(curr)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[(dest)]=((HEAP8[(src)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[(dest)]=((HEAP8[(src)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _tolower(chr) {
    chr = chr|0;
    if ((chr|0) < 65) return chr|0;
    if ((chr|0) > 90) return chr|0;
    return (chr - 65 + 97)|0;
}

// EMSCRIPTEN_END_FUNCS

  
  function dynCall_iiiii(index,a1,a2,a3,a4) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    return FUNCTION_TABLE_iiiii[index&0](a1|0,a2|0,a3|0,a4|0)|0;
  }


  function dynCall_iii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    return FUNCTION_TABLE_iii[index&1](a1|0,a2|0)|0;
  }


  function dynCall_viiii(index,a1,a2,a3,a4) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
    FUNCTION_TABLE_viiii[index&0](a1|0,a2|0,a3|0,a4|0);
  }

function b0(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; nullFunc_iiiii(0);return 0; }
  function b1(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_iii(1);return 0; }
  function b2(p0,p1,p2,p3) { p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; nullFunc_viiii(2); }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_iiiii = [b0];
  var FUNCTION_TABLE_iii = [b1,_hangul_combination_cmp];
  var FUNCTION_TABLE_viiii = [b2];

  return { _hangul_jamo_to_cjamo: _hangul_jamo_to_cjamo, _strlen: _strlen, _tolower: _tolower, _hangul_syllable_iterator_next: _hangul_syllable_iterator_next, _hangul_ic_process: _hangul_ic_process, _hangul_is_jongseong_conjoinable: _hangul_is_jongseong_conjoinable, _hangul_ic_flush: _hangul_ic_flush, _malloc: _malloc, _hangul_ic_select_keyboard: _hangul_ic_select_keyboard, _hangul_ic_is_empty: _hangul_ic_is_empty, _hangul_ic_get_keyboard_id: _hangul_ic_get_keyboard_id, _memset: _memset, _hangul_syllable_to_jamo: _hangul_syllable_to_jamo, _hangul_ic_is_transliteration: _hangul_ic_is_transliteration, _memcpy: _memcpy, _hangul_is_jamo: _hangul_is_jamo, _hangul_ic_has_choseong: _hangul_ic_has_choseong, _hangul_ic_get_preedit_string: _hangul_ic_get_preedit_string, _hangul_ic_set_combination: _hangul_ic_set_combination, _hangul_jamos_to_syllables: _hangul_jamos_to_syllables, _hangul_is_choseong_conjoinable: _hangul_is_choseong_conjoinable, _hangul_ic_reset: _hangul_ic_reset, _hangul_ic_new: _hangul_ic_new, _hangul_is_jungseong: _hangul_is_jungseong, _hangul_ic_get_n_keyboards: _hangul_ic_get_n_keyboards, _free: _free, _hangul_is_cjamo: _hangul_is_cjamo, _hangul_syllable_iterator_prev: _hangul_syllable_iterator_prev, _hangul_is_syllable: _hangul_is_syllable, _hangul_ic_has_jungseong: _hangul_ic_has_jungseong, _hangul_is_choseong: _hangul_is_choseong, _hangul_is_jongseong: _hangul_is_jongseong, _hangul_ic_delete: _hangul_ic_delete, _hangul_syllable_len: _hangul_syllable_len, _hangul_ic_has_jongseong: _hangul_ic_has_jongseong, _hangul_jamo_to_syllable: _hangul_jamo_to_syllable, _hangul_ic_backspace: _hangul_ic_backspace, _hangul_ic_get_commit_string: _hangul_ic_get_commit_string, _hangul_ic_set_keyboard: _hangul_ic_set_keyboard, _hangul_ic_get_keyboard_name: _hangul_ic_get_keyboard_name, _hangul_ic_connect_callback: _hangul_ic_connect_callback, _hangul_ic_set_output_mode: _hangul_ic_set_output_mode, _hangul_is_jungseong_conjoinable: _hangul_is_jungseong_conjoinable, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_iiiii: dynCall_iiiii, dynCall_iii: dynCall_iii, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "nullFunc_iiiii": nullFunc_iiiii, "nullFunc_iii": nullFunc_iii, "nullFunc_viiii": nullFunc_viiii, "invoke_iiiii": invoke_iiiii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_fflush": _fflush, "_abort": _abort, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_time": _time, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "_isupper": _isupper, "___errno_location": ___errno_location, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
var _hangul_jamo_to_cjamo = Module["_hangul_jamo_to_cjamo"] = asm["_hangul_jamo_to_cjamo"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _hangul_syllable_iterator_next = Module["_hangul_syllable_iterator_next"] = asm["_hangul_syllable_iterator_next"];
var _hangul_ic_process = Module["_hangul_ic_process"] = asm["_hangul_ic_process"];
var _hangul_is_jongseong_conjoinable = Module["_hangul_is_jongseong_conjoinable"] = asm["_hangul_is_jongseong_conjoinable"];
var _hangul_ic_flush = Module["_hangul_ic_flush"] = asm["_hangul_ic_flush"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _hangul_ic_select_keyboard = Module["_hangul_ic_select_keyboard"] = asm["_hangul_ic_select_keyboard"];
var _hangul_ic_is_empty = Module["_hangul_ic_is_empty"] = asm["_hangul_ic_is_empty"];
var _hangul_ic_get_keyboard_id = Module["_hangul_ic_get_keyboard_id"] = asm["_hangul_ic_get_keyboard_id"];
var _memset = Module["_memset"] = asm["_memset"];
var _hangul_syllable_to_jamo = Module["_hangul_syllable_to_jamo"] = asm["_hangul_syllable_to_jamo"];
var _hangul_ic_is_transliteration = Module["_hangul_ic_is_transliteration"] = asm["_hangul_ic_is_transliteration"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _hangul_is_jamo = Module["_hangul_is_jamo"] = asm["_hangul_is_jamo"];
var _hangul_ic_has_choseong = Module["_hangul_ic_has_choseong"] = asm["_hangul_ic_has_choseong"];
var _hangul_ic_get_preedit_string = Module["_hangul_ic_get_preedit_string"] = asm["_hangul_ic_get_preedit_string"];
var _hangul_ic_set_combination = Module["_hangul_ic_set_combination"] = asm["_hangul_ic_set_combination"];
var _hangul_jamos_to_syllables = Module["_hangul_jamos_to_syllables"] = asm["_hangul_jamos_to_syllables"];
var _hangul_is_choseong_conjoinable = Module["_hangul_is_choseong_conjoinable"] = asm["_hangul_is_choseong_conjoinable"];
var _hangul_ic_reset = Module["_hangul_ic_reset"] = asm["_hangul_ic_reset"];
var _hangul_ic_new = Module["_hangul_ic_new"] = asm["_hangul_ic_new"];
var _hangul_is_jungseong = Module["_hangul_is_jungseong"] = asm["_hangul_is_jungseong"];
var _hangul_ic_get_n_keyboards = Module["_hangul_ic_get_n_keyboards"] = asm["_hangul_ic_get_n_keyboards"];
var _free = Module["_free"] = asm["_free"];
var _hangul_is_cjamo = Module["_hangul_is_cjamo"] = asm["_hangul_is_cjamo"];
var _hangul_syllable_iterator_prev = Module["_hangul_syllable_iterator_prev"] = asm["_hangul_syllable_iterator_prev"];
var _hangul_is_syllable = Module["_hangul_is_syllable"] = asm["_hangul_is_syllable"];
var _hangul_ic_has_jungseong = Module["_hangul_ic_has_jungseong"] = asm["_hangul_ic_has_jungseong"];
var _hangul_is_choseong = Module["_hangul_is_choseong"] = asm["_hangul_is_choseong"];
var _hangul_is_jongseong = Module["_hangul_is_jongseong"] = asm["_hangul_is_jongseong"];
var _hangul_ic_delete = Module["_hangul_ic_delete"] = asm["_hangul_ic_delete"];
var _hangul_syllable_len = Module["_hangul_syllable_len"] = asm["_hangul_syllable_len"];
var _hangul_ic_has_jongseong = Module["_hangul_ic_has_jongseong"] = asm["_hangul_ic_has_jongseong"];
var _hangul_jamo_to_syllable = Module["_hangul_jamo_to_syllable"] = asm["_hangul_jamo_to_syllable"];
var _hangul_ic_backspace = Module["_hangul_ic_backspace"] = asm["_hangul_ic_backspace"];
var _hangul_ic_get_commit_string = Module["_hangul_ic_get_commit_string"] = asm["_hangul_ic_get_commit_string"];
var _hangul_ic_set_keyboard = Module["_hangul_ic_set_keyboard"] = asm["_hangul_ic_set_keyboard"];
var _hangul_ic_get_keyboard_name = Module["_hangul_ic_get_keyboard_name"] = asm["_hangul_ic_get_keyboard_name"];
var _hangul_ic_connect_callback = Module["_hangul_ic_connect_callback"] = asm["_hangul_ic_connect_callback"];
var _hangul_ic_set_output_mode = Module["_hangul_ic_set_output_mode"] = asm["_hangul_ic_set_output_mode"];
var _hangul_is_jungseong_conjoinable = Module["_hangul_is_jungseong_conjoinable"] = asm["_hangul_is_jungseong_conjoinable"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}




// "한글" -> [0xd55c, 0xae00, 0]
function ucscharPointer2IntegerArrayWithZeroPadding(ucschars) {
    var integerArray = [];

    var endPointer;

    hangul_syllable_iterator_next;
}
function ucschars2str(ucschars) {
    var sum = 0;
    for(var i = ucschars.length-1; i >= 0; i--) {
        sum = sum * 256 + ucschars[i].charCodeAt(0);
    }
    return String.fromCharCode(sum);
}



var hangul = {
    hangul_is_choseong:              function(ch) { return Module["ccall"]("hangul_is_choseong"             , "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_jungseong:             function(ch) { return Module["ccall"]("hangul_is_jungseong"            , "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_jongseong:             function(ch) { return Module["ccall"]("hangul_is_jongseong"            , "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_choseong_conjoinable:  function(ch) { return Module["ccall"]("hangul_is_choseong_conjoinable" , "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_jungseong_conjoinable: function(ch) { return Module["ccall"]("hangul_is_jungseong_conjoinable", "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_jongseong_conjoinable: function(ch) { return Module["ccall"]("hangul_is_jongseong_conjoinable", "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_syllable:              function(ch) { return Module["ccall"]("hangul_is_syllable"             , "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_jamo:                  function(ch) { return Module["ccall"]("hangul_is_jamo"                 , "number", ["number"], [ch.charCodeAt(0)]); }, 
    hangul_is_cjamo:                 function(ch) { return Module["ccall"]("hangul_is_cjamo"                , "number", ["number"], [ch.charCodeAt(0)]); }, 

    //int hangul_syllable_len(const ucschar* str, int max_len)
    hangul_syllable_len: function(str, max_len) {
        return Module["ccall"]("hangul_syllable_len", "number", ["number", "number"], [str, max_len]);
    },

    //HangulInputContext* hangul_ic_new(const char* keyboard);
    hangul_ic_new: function(keyboard) {
        return Module["ccall"]("hangul_ic_new", "number", ["string"], [keyboard]);
    },
    //bool hangul_ic_process(HangulInputContext *hic, int ascii);
    hangul_ic_process: function(hic, ascii) {
        return Module["ccall"]("hangul_ic_process", "number", ["number", "number"], [hic, ascii]);
    },
    //void hangul_ic_delete(HangulInputContext *hic);
    hangul_ic_delete: function(hic) {
        Module["ccall"]("hangul_ic_new", "number", ["number"], [hic]);
    },
    //bool hangul_ic_backspace(HangulInputContext *hic);
    hangul_ic_backspace: function(hic) {
        Module["ccall"]("hangul_ic_backspace", "number", ["number"], [hic]);
    },
    //void hangul_ic_reset(HangulInputContext *hic);
    hangul_ic_reset: function(hic) {
        Module["ccall"]("hangul_ic_reset", "number", ["number"], [hic]);
    },

    //unsigned    hangul_ic_get_n_keyboards();
    hangul_ic_get_n_keyboards: function() {
        return Module["ccall"]("hangul_ic_get_n_keyboards", "number");
    },
    //const char* hangul_ic_get_keyboard_id(unsigned index_);
    hangul_ic_get_keyboard_id: function(index_) {
        return Module["ccall"]("hangul_ic_get_keyboard_id", "string", ["number"], [index_]);
    },
    //const char* hangul_ic_get_keyboard_name(unsigned index_);
    hangul_ic_get_keyboard_name: function(index_) {
        return Module["ccall"]("hangul_ic_get_keyboard_name", "string", ["number"], [index_]);
    },
    // void hangul_ic_select_keyboard(HangulInputContext *hic, const char* id);
    hangul_ic_select_keyboard: function(hic, id) {
        Module["ccall"]("hangul_ic_select_keyboard", "number", ["number", "string"], [hic, id]);
    },

    //bool hangul_ic_is_empty(HangulInputContext *hic);
    hangul_ic_is_empty:      function(hic) { return Module["ccall"]("hangul_ic_is_empty",      "number", ["number"], [hic]); },
    //bool hangul_ic_has_choseong(HangulInputContext *hic);
    hangul_ic_has_choseong:  function(hic) { return Module["ccall"]("hangul_ic_has_choseong",  "number", ["number"], [hic]); },
    //bool hangul_ic_has_jungseong(HangulInputContext *hic);
    hangul_ic_has_jungseong: function(hic) { return Module["ccall"]("hangul_ic_has_jungseong", "number", ["number"], [hic]); },
    //bool hangul_ic_has_jongseong(HangulInputContext *hic);
    hangul_ic_has_jongseong: function(hic) { return Module["ccall"]("hangul_ic_has_jongseong", "number", ["number"], [hic]); },

    //const ucschar* hangul_ic_get_preedit_string(HangulInputContext *hic);
    hangul_ic_get_preedit_string: function(hic) {
        var ucschars = Module["ccall"]("hangul_ic_get_preedit_string", "number", ["number"], [hic]);
        return Module['UTF16ToString'](ucschars);
    },
    //const ucschar* hangul_ic_get_commit_string(HangulInputContext *hic);
    hangul_ic_get_commit_string: function(hic) {
        var ucschars = Module["ccall"]("hangul_ic_get_commit_string", "number", ["number"], [hic]);
        return Module['UTF16ToString'](ucschars);
    },
    //const ucschar* hangul_ic_flush(HangulInputContext *hic);
    hangul_ic_flush: function(hic) {
        var ucschars = Module["ccall"]("hangul_ic_flush", "number", ["number"], [hic]);
        return Module['UTF16ToString'](ucschars);
    },

};


// node
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module['exports'] = hangul;
}
// AMD
else if (typeof define === 'function' && define.amd) {
    define([], function() {
        return hangul;
    });
}
// browser
else {
    window['hangul'] = hangul;
}


})();

