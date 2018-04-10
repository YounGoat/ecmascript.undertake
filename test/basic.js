'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require('assert')

    /* NPM */
    , noda = require('noda')

    /* in-package */
    , undertake = noda.inRequire('index')
    ;

describe('undertake, without callback (promise returned)', () => {
    const A = 100;
    const E = 'error';

    it('promise (resolved)', done => {
        function* f() {
            var a = yield Promise.resolve(A);
            return a;
        };
        undertake(f).then(ret => assert.equal(ret, A)).then(done);
    });

    it('promise (reject)', done => {
        function* f() {
            yield Promise.reject(E);
        };

        undertake(f).catch(err => assert.equal(err, E)).then(done);
    });

    it('promise (runtime error)', done => {
        function* f() {
            yield new Promise(() => {
                throw E;
            });
        };
        undertake(f).catch(err => assert.equal(err, E)).then(done);
    });

    it('thunkified function (data returned)', done => {
        function* f() {
            var a = yield callback => {
                process.nextTick(() => callback(null, A));
            };
            return a;
        }
        undertake(f).then(ret => assert.equal(ret, A)).then(done);
    });

    it('thunkified function (error returned)', done => {
        function* f() {
            var a = yield callback => {
                process.nextTick(() => callback(E));
            };
            return a;
        }
        undertake(f).catch(err => assert.equal(err, E)).then(done);
    });

    it('thunkified function (runtime error)', done => {
        function* f() {
            yield callback => {
                throw E;
            };
        };
        undertake(f).catch(err => assert.equal(err, E)).then(done);
    });

    it('runtime error (directly in generatorFunction body)', done => {
        function* f() {
            throw E;
        }
        undertake(f).catch(err => assert.equal(err, E)).then(done);
    });

});

describe('undertake, with callback (undefined returned)', () => {
    const A = 100;
    const E = 'error';

    it('promise (resolved)', done => {
        function* f() {
            var a = yield Promise.resolve(A);
            return a;
        };
        undertake(f, (err, ret) => {
            assert.equal(ret, A);
            done();
        });
    });

    it('promise (reject)', done => {
        function* f() {
            yield Promise.reject(E);
        };
        undertake(f, (err, ret) => {
            assert.equal(err, E);
            done();
        });
    });

    it('promise (runtime error)', done => {
        function* f() {
            yield new Promise(() => {
                throw E;
            });
        };
        undertake(f, (err, ret) => {
            assert.equal(err, E);
            done();
        });
    });

    it('thunkified function (data returned)', done => {
        function* f() {
            var a = yield callback => {
                process.nextTick(() => callback(null, A));
            };
            return a;
        }
        undertake(f, (err, ret) => {
            assert.equal(ret, A);
            done();
        });
    });

    it('thunkified function (error returned)', done => {
        function* f() {
            var a = yield callback => {
                process.nextTick(() => callback(E));
            };
            return a;
        }
        undertake(f, (err, ret) => {
            assert.equal(err, E);
            done();
        });
    });

    it('thunkified function (runtime error)', done => {
        function* f() {
            yield callback => {
                throw E;
            };
        };
        undertake(f, (err, ret) => {
            assert.equal(err, E);
            done();
        });
    });

    it('runtime error (directly in generatorFunction body)', done => {
        function* f() {
            throw E;
        }
        undertake(f, (err, ret) => {
            assert.equal(err, E);
            done();
        });
    });

});

describe('undertake, recursion on generator', () => {
    const A = 100;
    const E = 'error';

    it('when GeneratorFunction after yield', done => {
        function* g() {
            var a = yield Promise.resolve(A);
            return a;
        }
        
        function* f() {
            return yield g;
        }

        undertake(f, (err, ret) => {
            assert.equal(ret, A);
            done();
        });
    });

    it('when generator after yield', done => {
        function* g(foo) {
            var a = yield Promise.resolve(foo);
            return a;
        }
        
        function* f() {
            return yield g(A);
        }

        undertake(f, (err, ret) => {
            assert.equal(ret, A);
            done();
        });
    });
});

describe('undertake.easy', () => {
    it('yield Error', done => {
        function* g() {
           yield new Error('foo');
        }
        
        undertake.easy(g).catch(ex => {
            done();
        });
    });
});


describe('traverse arrays', () => {
    it('undertake.each', done => {
        function* f() {
            let nums = Array.from(arguments);
            let total = 0;
            yield undertake.each(nums, function*(n, index) {
                total += yield Promise.resolve(n);
            });
            return total;
        }

        undertake(f(1, 2, 3, 4)).then(ret => {
            assert.equal(ret, 10);
            done();
        });
    });

    it('undertake.each, on exception', done => {
        const E = 'Error';
        function* f() {
            yield undertake.each([1,2], function*(n, index) {
                throw E;
            });
        }
        undertake(f).catch(ex => {
            assert.equal(E, ex);
            done();
        });
    });

    it('undertake.map', done => {
        function* f() {
            let nums = Array.from(arguments);
            return yield undertake.map(nums, function*(n, index) {
                return yield Promise.resolve(n * 2);
            });
        }

        undertake(f(1, 2, 3)).then(ret => {
            assert.deepEqual(ret, [2, 4, 6]);
            done();
        });
    });

    it('undertake.map, on exception', done => {
        const E = 'Error';
        function* f() {
            yield undertake.map([1,2], function*(n, index) {
                throw E;
            });
        }

        undertake(f).catch(ex => {
            assert.equal(E, ex);
            done();
        });
    });
});