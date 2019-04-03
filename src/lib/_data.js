/**
 * User: curtis
 * Date: 2019-03-12
 * Time: 23:06
 * Copyright @2019 by Xraymen Inc.
 *
 * A suite of functions and methods designed to assist us in dealing with data. This includes
 * operations such as comparing, validating and resolving data.
 */

const _=require("lodash");
const assert=require("assert");
const util=require("../common/util");

/**
 * Asserts that the properties specified are in <param>object</param>
 * @param {Object} object
 * @param {string|Array<string>} properties
 * @throws {Error}
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
 * @param {string|"*"|Array<string>} allowed - "*" will allow any type
 * @param {boolean} allowNullish - shorthand for allowNull and allowUndefined
 * @param {boolean} allowNull
 * @param {boolean} allowUndefined
 * @param {*} defaultUndefined - a default that should be used if resolution=undefined.
 * @returns {*} returns <param>value</param> if all is good
 * @throws {Error}
 */
function assertType(value, allowed, {
	allowNullish=false,
	allowNull=false,
	allowUndefined=false,
	defaultUndefined=undefined
}={}) {
	function _formatAllowed() {
		return _.isArray(allowed)
			? allowed.slice(0, allowed.length-1)
				.join(", ") + ` or ${allowed[allowed.length-1]}`
			: (allowed==="*")
				? "a value"
				: allowed;
	}
	if(allowNullish) {
		allowNull=allowUndefined=true;
	}
	if(value===undefined) {
		if(defaultUndefined!==undefined) {
			value=defaultUndefined;
		} else if(!allowUndefined) {
			throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
		}
	} else if(value===null) {
		if(!allowNull) {
			throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
		}
	} else {
		const type=getType(value);
		if(_.isArray(allowed)) {
			if(_.includes(allowed, type)===false) {
				throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
			}
		} else {
			if(allowed!=="*") {
				if(type!==allowed) {
					throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
				}
			}
		}
	}
	return value;
}

/**
 * Asserts that the values types are the same
 * @param {*} value1
 * @param {*} value2
 * @throws {Error}
 */
function assertTypesEqual(value1, value2) {
	const type1=getType(value1),
		type2=getType(value2);
	if(type1!==type2) {
		throw new Error(`expecting same type but found ${type1} and ${type2}`);
	}
}

/**
 * Casts value to <code>boolean</code> type.
 * For the most part we will follow javascript rules...except for the goofy stuff
 * @param {*} value
 * @returns {boolean}
 * @private
 */
function boolean(value) {
	if(value==="") {
		return true;
	}
	return Boolean(value);
}

/**
 * Gets the constructor name of the specified value if not null or undefined otherwise returns
 * "null" or "undefined"
 * @param {*} value
 * @returns {string}
 * @private
 */
function getType(value) {
	if(value===undefined) {
		return "undefined";
	} else if(value===null) {
		return "null";
	} else {
		const type=value.constructor.name;
		// we don't go any farther than expecting a function to be a "Function"
		return (type==="AsyncFunction")
			? "Function"
			: type;
	}
}

/**
 * He will make an attempt to ensure that the object is parsed JSON.
 * @param {*} data
 * @returns {Object}
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

/**
 * This guy brings together assertType and retrieval. So what? His value comes from dealing with predicates.
 * It always allows for <param>value</param> to be a predicate that takes a blob as input. Hence the <param>blob</param>.
 * Follows are two examples illustrating a literal param and a predicate param:
 * - literal: array.first(10)
 * - predicate: array.first(tty.height())
 * The predicate in this case doesn't care about the <param>blob</param> but it's there should it.
 * @param {DataBlob} blob
 * @param {*} value
 * @param {string|"*"|Array<string>} allowed - "*" will allow any type
 * @param {boolean} allowNull
 * @param {boolean} allowNullish - shorthand for allowNull and allowUndefined
 * @param {boolean} allowUndefined
 * @param {*} defaultUndefined - a default that should be used if resolution=undefined.
 * @throws {Error}
 */
async function resolveType(blob, value, allowed, {
	allowNull=false,
	allowNullish=false,
	allowUndefined=false,
	defaultUndefined=undefined
}={}) {
	assert.ok(!_.includes((allowed.constructor.name==="Array") ? allowed : [allowed], "Function"),
		"Not designed to resolve functions. See assertType");
	if(_.isFunction(value)) {
		const predicate=assertPredicate(value);
		value=await predicate(blob);
		// we have no rules against a predicate returning a predicate. So we'll support it.
		if(_.isFunction(value)) {
			return resolveType(blob, value, allowed, {allowNullish, allowNull, allowUndefined, defaultUndefined});
		}
	}
	return assertType(value, allowed, {allowNullish, allowNull, allowUndefined, defaultUndefined});
}

/********************* Private Interface *********************/
module.exports={
	assertPredicate,
	assertProperties,
	assertType,
	assertTypesEqual,
	boolean,
	ensureJson,
	getType,
	resolveType
};
