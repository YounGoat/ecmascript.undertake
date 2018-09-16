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

    let c = yield subtask;

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

function* subtask() {
    let m = yield Promise.resolve(1);
    let n = yield Promise.resolve(1);
    return m + n;
}

// A triditional callback is acceptable.
undertake(success, function(err, data) {
    // err equals null
    // data euqals "AB26"
});
// RETURN undefined

// When no callback passed in, an instance of Promise will be returned.
undertake(success).then(ret => {
    // ret equals "AB26"
});`
```

##	API

*   Promise __undertake__(GeneratorFunction *fn*)
*   Promise __undertake.applying__(Function *fn*, Object *this_value*, Array *args*)
*   Promise __undertake.calling__(Function *fn*, Object *this_value*, Any *arg_0*, ...)
*   Promise __undertake.easy__(GeneratorFunction *fn*)
*   Promise(undefined) __undertake.each__(Array *arr*, GeneratorFunction *iterator*)
*   Promise(Array) __undertake.map__(Array *arr*, GeneratorFunction *iterator*)
*   boolean __undertake.isGenerator__(any *foo*)
*   boolean __undertake.isGeneratorFunction__(any *foo*)

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
