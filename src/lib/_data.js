/**
 * User: curtis
 * Date: 2019-03-12
 * Time: 23:06
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const util=require("../common/util");

/**
 * Asserts that the properties specified are in <param>object</param>
 * @param {Object} object
 * @param {string|Array<string>} properties
 * @throws {Error}
 * @protected
 */
function assertProperties(object, properties) {
	if(typeof(properties)==="string") {
		properties=[properties];
	}
	const missing=_.difference(properties, Object.keys(object));
	if(missing.length>0) {
		throw new Error(`Object missing required keys ${JSON.stringify(missing)}`);
	}
}

/**
 * A "predicate" is a function that takes 1 or more arguments and returns a single value. They are
 * designed to be used with our API. So that they are fully compatible and in parity we make sure that
 * the are asynchronous. If <param>predicate</param> is not found to be async then we make him async
 * @param {Function} predicate
 * @returns {Promise<*>}
 * @protected
 */
function assertPredicate(predicate) {
	if(predicate==null) {
		throw new Error("missing predicate function");
	} else if(_.isFunction(predicate)) {
		if(predicate[Symbol.toStringTag]==="AsyncFunction") {
			return predicate;
		} else {
			return async(...args)=>{
				return predicate(...args);
			};
		}
	} else {
		throw new Error(`expecting predicate but found ${util.name(predicate)}`);
	}
}

/**
 * Asserts that <param>value</param> is one of the <param>allowed</param> types
 * @param {*} value
 * @param {string|Array<string>} allowed
 * @param {boolean} allowNull
 * @param {boolean} strict - if strict then will use value.constructor.name otherwise will use typedef(value)
 * @throws {Error}
 * @protected
 */
function assertType(value, allowed, {
	allowNull=false,
	strict=true
}={}) {
	function _formatAllowed() {
		return _.isArray(allowed)
			? allowed.slice(0, allowed.length-1)
				.join(", ")
			+` or ${allowed[allowed.length-1]}`
			: allowed;
	}
	if(value==null) {
		if(!allowNull) {
			throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
		}
	} else {
		let type;
		if(strict) {
			// we don't go any farther than expecting a function to be a "Function"
			type=(value.constructor.name==="AsyncFunction")
				? "Function"
				: value.constructor.name;
		} else {
			type=typeof(value);
		}
		if(_.isArray(allowed)) {
			if(_.includes(allowed, type)===false) {
				throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
			}
		} else {
			if(type!==allowed) {
				throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
			}
		}
	}
}

/**
 * He will make an attempt to ensure that the object is parsed JSON.
 * @param {*} data
 * @returns {Object}
 * @protected
 */
function ensureJson(data) {
	if(_.isPlainObject(data)) {
		return data;
	} else if(_.isString(data)) {
		return JSON.parse(data);
	} else if(_.isFunction(data)) {
		throw new Error("expected valid JSON object but found function");
	}
	return data;
}

module.exports={
	assertPredicate,
	assertProperties,
	assertType,
	ensureJson
};
