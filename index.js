'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	
	/* in-package */
	, isGenerator = require('./lib/isGenerator')
	, isGeneratorFunction = require('./lib/isGeneratorFunction')
	;

function undertake(G, callback, compatible = false) {
	let RR = (resolve, reject) => {
		let gen;
		if (isGeneratorFunction(G)) {
			gen = G();
		}
		else if (isGenerator(G)) {
			gen = G;
		}
		else {
			return resolve(typeof G == 'function' ? G() : G);
		}
		nextLoop();

		function nextLoop(err, value) {
			if (err) return reject(err);

			var step;
			try {
				step = gen.next(value);
			} catch(ex) {
				return reject(ex);	
			}

			// step 对象有两个属性：
			// - done   ＝ 流程是否结束
			// - value  ＝ 当前步骤的返回值

			if (step.done) {
				return resolve(step.value);
			}
			else if (step.value instanceof Promise || step.value && typeof step.value.then == 'function') {
				step.value.then(ret => nextLoop(null, ret)).catch(reject);
			}
			else if (isGeneratorFunction(step.value) || isGenerator(step.value)) {
				undertake(step.value, nextLoop);
			}
			else if (step.value instanceof Function) {
				try {
					step.value(nextLoop);
				} catch(ex) {
					return reject(ex);
				}
			}
			else if (compatible) {
				if (step.value instanceof Error) {
					nextLoop(step.value);
				}
				else {
					nextLoop(null, step.value);
				}
			}
			else {
				throw new Error('operator `yield` expects a promise, generator function or thunkify function');
			}
		}
	};

	if (callback) {
		let resolve = ret => callback(null, ret);
		let reject = callback;
		RR(resolve, reject);
	}
	else {
		return new Promise(RR);
	}
}

undertake.easy = function(G, callback) {
	return undertake(G, callback, true);
};

/**
 * @param  {Array} arr
 * @param  {GeneratorFunction} iterator
 * @return Promise
 */
undertake.each = function(arr, iterator) {
	return undertake(function*() {
		for (let i = 0; i < arr.length; i++) {
			yield iterator(arr[i], i);
		}
	});
};

/**
 * @param  {Array} arr
 * @param  {GeneratorFunction} iterator
 * @return Promise
 */
undertake.map = function(arr, iterator) {
	return undertake(function*() {
		let ret = [];
		for (let i = 0; i < arr.length; i++) {
			ret[i] = yield iterator(arr[i], i);
		}
		return ret;
	});
};

Object.assign(undertake, { isGenerator, isGeneratorFunction });
module.exports = undertake;