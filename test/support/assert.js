/**
 * Date: 3/5/2018
 * Time: 9:10 PM
 * @license MIT (see project's LICENSE file)
 *
 * There is both runtime support and test support. We flag those that are safe for any runtime environment.
 * But most are intended for unit and integration testing
 */

const _=require("lodash");
const assert=require("assert");
const diagnostics=require("../../src/common/diagnostics");
const format=require("../../src/common/format");
const log=require("../../src/common/log");
const util=require("../../src/common/util");

// mixin the guys that we like
exports.deepStrictEqual=assert.deepStrictEqual;
exports.doesNotThrow=assert.doesNotThrow;
exports.equal=assert.equal;
exports.ifError=assert.ifError;
exports.notDeepEqual=assert.notDeepEqual;
exports.notEqual=assert.notEqual;
exports.notStrictEqual=assert.notStrictEqual;
exports.ok=assert.ok;
exports.strictEqual=assert.strictEqual;
exports.throws=assert.throws;

/**
 * We print out the expected as, in here at least, we frequently want to steal it.
 * @param {*} actual
 * @param {*} expected
 * @param {string} message
 * @param {boolean} scrub
 * @throws {Error}
 */
exports.deepEqual=function(actual, expected, {
	message=undefined,
	scrub=true
}={}) {
	try {
		if(scrub) {
			actual=util.scrubObject(actual);
			expected=util.scrubObject(expected);
		}
		actual=util.objectToData(actual, {sort: true});
		expected=util.objectToData(expected, {sort: true});
		assert.deepStrictEqual(actual, expected, message);
	} catch(error) {
		throw new Error(`assert.deepEqual() failed: actual=\n${JSON.stringify(actual, null, "\t")}`);
	}
};

/**
 * macro for assert.ok(false, error)
 * @param {Error|string} error
 */
exports.fail=(error)=>{
	// note: we convert it to a string (if an error) so that the assert library doesn't just throw him
	exports.ok(false, error.toString());
};

/**
 * Asserts there is an error. Supports async business and returns a callable function should <param>error</param> be a function.
 * @param {Error|Function|null} error
 * @returns {Function|undefined}
 * @throws {Error}
 * @example for async use
 *   seriesQueue.execute(assert.notError(done));
 */
exports.isError=function(error) {
	if(_.isFunction(error)) {
		// we capture the stack now so that we can tie errors back to the origin
		const stack=diagnostics.getStack({popCount: 2});
		return function(_error) {
			if(!_error) {
				exports.ok(false, `assert.isError(): ${_error.message}\n${stack}`);
			} else {
				error();
			}
		};
	} else if(!error) {
		exports.ok(false, "Expecting error");
	}
};

/**
 * Asserts if there is an error. Supports async business and returns a callable function should <param>error</param> be a function.
 * @param {Error|Function|null} error
 * @returns {Function|undefined}
 * @throws {Error}
 * @example for async use
 *   seriesQueue.execute(assert.isNotError(done));
 */
exports.isNotError=function(error) {
	if(_.isFunction(error)) {
		// we capture the stack now so that we can tie errors back to the origin
		const stack=diagnostics.getStack({popCount: 2});
		return function(_error) {
			if(!_error) {
				error();
			} else if(_error.constructor.name==="AssertionError") {
				// this is already an assertion. Let's not double up. It clouds the stack waters
				error(_error);
			} else {
				exports.ok(false, `assert.isNotError(): ${_error.message}\n${stack}`);
			}
		};
	} else if(error) {
		exports.ok(false, error);
	}
};
/**
 * Simply asserts false if called
 * @param {string|Error|Function} [message]
 * @throws {Error}
 */
exports.notCalled=function(message=undefined) {
	throw new Error(`assert.notCalled() was called${(message!==undefined) ? `. ${message}` : ""}`);
};


/**
 * Will assert (to log) that all objects passed as params remain unchanged.
 * @param {[Object]} objects
 * @returns {function():@throws} - call when you are done and want to make sure the object did not change
 * @throws {Error}
 */
exports.immutable=function(...objects) {
	const clones=_.map(objects, (object)=>[_.cloneDeep(object), object]);
	return function() {
		clones.forEach(function(pair) {
			if(!_.isEqual(pair[0], pair[1])) {
				const expected=JSON.stringify(pair[0], null, "\t"),
					actual=JSON.stringify(pair[1], null, "\t");
				throw new Error(`assert.immutable() failed:\nexpected=${expected}\nactual=${actual}`);
			}
		});
	};
};


/**
 * Asserts that all properties exist on object
 * @param {Object} object
 * @param {string|Array} property
 * @throws {Error}
 */
exports.properties=function(object, property) {
	function _assert(_property) {
		if(!_.has(object, _property)) {
			throw new Error(`assert.properties(${property}) failed: ${property} does not exist in ${JSON.stringify(object)}`);
		}
	}
	if(_.isString(property)) {
		_assert(property);
	} else {
		property.forEach(_assert);
	}
};

/**
 * Assert condition and if it is false then logs it
 * @param {boolean} condition
 * @param {string|Error|Function} [message]
 * @throws {Error}
 */
exports.toLog=function(condition, message="") {
	if(!condition) {
		log.error(new Error(`assert.toLog() failed: ${format.messageToString(message)}`));
	}
};
