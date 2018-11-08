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

*   Promise __undertake__(GeneratorFunction *fn* [, GeneratorFunction *callback*, boolean *compatible* ])
*   void __undertake__(GeneratorFunction *fn*, Function *callback* [, boolean *compatible* ])
*   Promise __undertake.applying__(Function *fn*, Object *this_value*, Array *args*)
*   Promise __undertake.calling__(Function *fn*, Object *this_value*, Any *arg_0*, ...)
*   Promise __undertake.easy__(GeneratorFunction *fn*)
*   Promise(undefined) __undertake.each__(Array *arr*, GeneratorFunction *iterator*)
*   Promise(Array) __undertake.map__(Array *arr*, GeneratorFunction *iterator*)
*   boolean __undertake.isGenerator__(any *foo*)
*   boolean __undertake.isGeneratorFunction__(any *foo*)
*   Function __undertake.sync__(GeneratorFunction *fn* [, Function *callback*])

If `callback(err, data)` exists, what returned by the generator function will become *data* and what throwed will become *err*.

##  undertake vs. undertake.easy

For `undertake`, operator `yield` expects a *promise*, *generator function* or *thunkify function*. If something following `yield` is not expected, an error will be thrown.

For `undertake.easy`, anything is allowed to follow `yield` operator. If it is not an instance of `Promise` or `Function`, itself will be returned by `yield`. E.g.

```javascript
const undertake = require('undertake');

// A generator function.
undertake.easy(function* success() {
    let a = yield Promise.resolve('A');
    // `a` now equals 'A'.

    let b = yield 'B';
    // `b` now equals 'B';

    return a + b;
});
```

##	Links

*	[CHANGE LOG](./CHANGELOG.md)
*	[Homepage](https://github.com/YounGoat/ecmascript.undertake)
