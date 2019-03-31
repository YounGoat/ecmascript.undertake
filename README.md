#	undertake
__Another choice beyond co.__

[![total downloads of undertake](https://img.shields.io/npm/dt/undertake.svg)](https://www.npmjs.com/package/undertake)
[![undertake's License](https://img.shields.io/npm/l/undertake.svg)](https://www.npmjs.com/package/undertake)
[![latest version of undertake](https://img.shields.io/npm/v/undertake.svg)](https://www.npmjs.com/package/undertake)

>	If links in this document not avaiable, please access [README on GitHub](./README.md) directly.

##  Description

__undertake__ is incubated from [jinang/co](https://www.npmjs.com/package/jinang). It is something like well-known [co](https://www.npmjs.com/package/co). It just offers another choice.

##	Table of Contents

* [Get Started](#get-started)
* [API](#api)
* [undertake vs. undertake.easy](#undertake-vs-undertakeeasy)
* [Links](#links)

##	Get Started

```javascript
const undertake = require('undertake');

// A generator function.
function* success() {
    // yield promise.
    let a = yield Promise.resolve('A');

    // yield thunkified function.
    let b = yield callback => {
        setTimeout(() => callback(null, 'B'), 100);
    };

    let c = yield subtask(1);
    // c equals 3

    // Traverse an array.
    let d = 0;
    yield undertake.each([1,2,3], function*(num, index) {
        d += yield Promise.resolve(num);
    });
    // d equals 6

    // Traverse an array and return a mapped one.
    let e = yield undertake.map([1,2,3], function*(num, index) {
        return yield Promise.resolve(num * 2);
    });
    // e equals [2,4,6]

    let F = function(num_1, num_2, callback) {
        setTimeout(() => callback(null, num_1 * num_2), 100);
    };
    let f1 = yield undertake.calling(F, null, 4, 6);
    // f1 equals 24
    let f2 = yield undertake.applying(F, null, [ 4, 6 ]);
    // f2 equals 24

    return a + b + c + d;
}

function* subtask(n) {
    let m = yield Promise.resolve(n);
    let n = yield Promise.resolve(n+1);
    return m + n;
}

// When no callback passed in, an instance of Promise will be returned.
undertake(success).then(ret => {
    // ret equals "AB36"
});

// A triditional callback is acceptable.
undertake(success, function(err, data) {
    // err equals null
    // data euqals "AB36"
});
// RETURN undefined

// If callback is also a generator function, an instance of Promise will be returned.
undertake(success, function*(err, data) {
    let f = yield subtask(4);
    return data + f;
}).then(ret => {
    // ret equals "AB369";
});

// Create a new function which will accept the same paramenters as the generator function do,
// and return an instance of Promise on being invoked.
let fn = undertake.sync(subtask);
fn(2).then(ret => {
    // ret equals 5
});
```

##	API

*   Promise __undertake__(GeneratorFunction *fn*)  
    Something like `co`.

*   Promise __undertake__(GeneratorFunction *fn* [, GeneratorFunction *callback*, boolean *compatible* ])  
    Successively execute generator functions *fn* and *callback*.  
    If *compatible* is `true`, returned value which is instance of `Error` will be regarded as normal value. Otherwise and by default, such returned value will trigger rejection.
    
*   void __undertake__(GeneratorFunction *fn*, Function *callback* [, boolean *compatible* ])  
    Execute the generator function *fn*, then invoke *callback*.

*   Promise __undertake.applying__(Function *fn*, Object *this_value*, Array *args*)  
    Invoke *fn* and return an instance of `Promise`.   
    Function *fn* SHOULD accept a standard callback function as the last argument. Developer SHOULD NOT put a callback in *args*, it will be automatically appended when *fn* is really invoked.  
    This util is designed to make things easy to __yield__ a traditional asynchronised function.

*   Promise __undertake.calling__(Function *fn*, Object *this_value*, Any *arg_0*, ...)  
    Invoke *fn* and return an instance of `Promise`.  

*   Promise __undertake.easy__(GeneratorFunction *fn*)  
    See [undertake vs. undertake.easy](#undertake-vs-undertake.easy).

*   Promise(undefined) __undertake.each__(Array *arr*, GeneratorFunction *iterator*)  
    For each item of *arr*, execute the generator function *iterator* with the item as the only argument.

*   Promise(Array) __undertake.map__(Array *arr*, GeneratorFunction *iterator*)  
    Return an array of `Promise` instances. Each promise will carry the data returned by the corresponding generator function.

*   boolean __undertake.isGenerator__(any *foo*)
    A util function.

*   boolean __undertake.isGeneratorFunction__(any *foo*)  
    A util function.

*   Function __undertake.sync__(GeneratorFunction *fn* [, Function *callback*])  
    Wrap a generator function. Without *callback*, the new function will return an instance of `Promise` on being invoked. Otherwise, `callback()` will be invoked finally when the new function is invoked and completed.
    
*   Function __undertake.async__(GeneratorFunction *fn* [, number *callbackIndex*])  
    Wrap a generator function. The new function will return an instance of `Promise` on being invoked without a callback function, or `callback()` will be invoked finally. Parameter `callbackIndex` will indicate the position of `callback`. By default, the last argument with type of `'function'` will be regarded as the callback function.

If `callback(err, data)` exists, what returned by the generator function will become *data* and what throwed will become *err*.

##  undertake vs. undertake.easy

For `undertake`, operator `yield` expects a *promise*, *generator function* or *thunkify function*. If something following `yield` is not expected, an error will be thrown.

For `undertake.easy`, anything is allowed to follow `yield` operator. If it is not an instance of `Promise` or `Function`, itself will be returned by `yield`. E.g.

```javascript
// A generator function.
function* main() {
    let a = yield Promise.resolve('A');
    // `a` now equals 'A'.

    let b = yield 'B';
    // `b` now equals 'B';

    return a + b;
}

// Error: operator `yield` expects a promise, generator function or thunkify function
let p0 = undertake(main);

// It's OK.
let p1 = undertake.easy(main);

// It's OK. As same as p1.
let p2 = undertake(main, null, true);
```

##  undertake.sync vs. undertake.async

`undertake.sync()` and `undertake.async()` are used to create (or so-called "wrap") a generator function and return a new normal one. They two are actually identical when no "callback()" occurs.

```javascript
function* main() {
    return yield Promise.resolve('A');
}

function callback(err, data) {
    console.log(data.toLowerCase());
}

// A new function is created. "main()" does not run now.
const f0 = undertake.sync(main);
// Promise(A) returned.
f0();
// Promise(A) returned. "callback" is ignored.
f0(callback);  

// Both "main()" and "callback()" do not run now.
const f1 = undertake.sync(main, callback);
// Nothing returned. "a" is printed.
f1();

// f2 is the same as f0.
const f2 = undertake.async(main);
// Promise(A) returned.
f2();
// Nothing returned. "a" is printed. Here, the last argument is regarded as "callback" if it is a function.
f2(callback);

// The first (index 0) argument passed to f3 will be regarded as "callback".
const f3 = undertake.async(main, 0);
// Promise(A) returned.
f3();
// Nothing returned. "a" is printed.
f3(callback);
```

##	Links

*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/ecmascript.undertake)
