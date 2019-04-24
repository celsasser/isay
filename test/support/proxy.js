/**
 * Date: 05/27/18
 * Time: 5:45 PM
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const sinon=require("sinon");
const assert=require("./assert");
const log=require("../../src/common/log");


let _stubs=[];
const _props=[];

/**
 * Stubs this method and at the same time adds him to our collection of stubs
 * accumulated since the last call to exports.unstub()
 * @param {Object} object
 * @param {string} method
 * @param {Function} handler
 * @returns {wrapMethod}
 */
exports.stub=function(object, method, handler) {
	// we are not fancy. If he's already stubbed then get rid of it.
	exports.unstub([object[method]]);
	const stub=sinon.stub(object, method).callsFake(handler);
	_stubs.push(stub);
	return stub;
};

/**
 * Does everything <code>stub</code> does but wraps the handler in a try catch so that exceptions
 * work their way back to the callback method that should be the last param in <param>handler<param>
 * @param {Object} object
 * @param {string} method
 * @param {function(...args, callback)} handler - function who's last param will be a callback method
 * @returns {wrapMethod}
 */
exports.stubCallback=function(object, method, handler) {
	return exports.stub(object, method, (...args)=>{
		try {
			handler(...args);
		} catch(error) {
			_.last(args)(error);
		}
	});
};

/**
 * Spies on the specified method and at the same time adds him to our collection of stubs
 * accumulated since the last call to exports.unstub()
 * @param {Object} object
 * @param {string} method
 * @returns {wrapMethod}
 */
exports.spy=function(object, method) {
	// unstub him if he's already being spied on.
	exports.unstub([object[method]]);
	const spy=sinon.spy(object, method);
	_stubs.push(spy);
	return spy;
};

/**
 * Unstub methods in functions if they are stubbed.  Defaults to unstub all
 * methods currently being tracked by methods stubbed with exports.stub
 * @param {Array} functions if undefined then unstubs all stubs added via exports.stub
 */
exports.unstub=function(functions=undefined) {
	if(functions==null) {
		functions=_stubs;
		_stubs=[];
	}
	functions.forEach(function(fnction) {
		if(fnction.restore) {
			fnction.restore();
		}
	});
};

/**
 * Sets value for object[name] and retains the original value
 * @param {Object} object object with property you want to set
 * @param {string} name
 * @param {*} value
 */
exports.setProperty=function(object, name, value) {
	let instance=_.find(_props, {name, object});
	if(instance===undefined) {
		_props.push((instance={
			count: 0,
			name,
			object,
			value: object[name]
		}));
	}
	instance.count++;
	object[name]=value;
};

/**
 * Restores original value if ref count is 0
 * @param {Object} object
 * @param {string} name
 */
exports.restoreProperty=function(object, name) {
	const instance=_.find(_props, {name, object});
	assert.ok(instance!==undefined);
	assert.ok(instance.count>0);
	if(--instance.count===0) {
		if(instance.value===undefined) {
			delete instance.object[instance.name];
		} else {
			instance.object[instance.name]=instance.value;
		}
	}
};

/**
 * Stub our log and allow for it to be spied on
 */
exports.log={
	_methods: ["debug", "diag", "info", "warn", "error", "verbose"],
	debug: null,	// sinon stub when stubbed
	diag: null,		// sinon stub when stubbed
	info: null,		// sinon stub when stubbed
	warn: null,		// sinon stub when stubbed
	error: null,	// sinon stub when stubbed
	verbose: null,	// sinon stub when stubbed

	/**
	 * Stubs logging
	 * @param {Array} exclude
	 */
	stub: function(exclude=undefined) {
		const methods=_.xor(this._methods, exclude);
		methods.forEach((name)=>{
			if(!this[name]) {
				this[name]=sinon.stub(log, name);
			}
		});
	},
	unstub: function() {
		this._methods.forEach((name)=>{
			if(this[name]) {
				this[name].restore();
				this[name]=null;
			}
		});
	}
};

/**
 * Stub stdout and stderr. stdin is a little exceptional so not integrating here.
 */
exports.std={
	_methods: ["stderr", "stdout"],
	stderr: null,	// sinon stub when stubbed
	stdout: null,	// sinon stub when stubbed

	/**
	 * Stubs stdout and stderr
	 * @param {Array} exclude
	 */
	stub: function(exclude=undefined) {
		const methods=_.xor(this._methods, exclude);
		methods.forEach((name)=>{
			if(!this[name]) {
				this[name]=sinon.stub(process[name], "write")
					.callsFake((text, callback)=>{
						process.nextTick(callback);
					});
			}
		});
	},
	unstub: function() {
		this._methods.forEach((name)=>{
			if(this[name]) {
				this[name].restore();
				this[name]=null;
			}
		});
	}
};
