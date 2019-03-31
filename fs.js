'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	, fs = require('fs')
	
	/* NPM */
	
	/* in-package */
	, undertake = require('.')
	;

let ufs = {};

Object.keys(fs).forEach(name => {
	if (name.endsWith('Sync')) {
		name = name.slice(0, -4);
		ufs[name] = function*() {
			let args = Array.from(arguments);
			return yield callback => {
				args.push(callback);
				fs[name].apply(fs, args);
			};
		};
	}
})

module.exports = ufs;