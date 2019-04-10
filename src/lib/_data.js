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
 * Asserts the result of the predicate in params[0]:  Boolean(this.params[0](blob)).
 * Intended to be used with domains <code>is</code> and <code>not</code>, but the world is your oyster.
 * @resolves predicate:ActionPredicate in this.params[0]
 * @param {ModuleBase} module
 * @param {DataBlob} blob
 * @return {Promise<DataBlob>}
 * @throws {Error}
 */
async function assertAction(module, blob) {
	const result=await resolveType(blob, module.params[0], "*", {allowNull: true});
	if(boolean(result)===false) {
		const message=(module.params.length>1)
			? await resolveType(blob, module.params[1], "String")
			: module.params[0].toString();
		throw new Error(message);
	}
	return blob;
}


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
 * Asserts that <param>value</param> is a predicate.
 * A "predicate" is a function that takes 1 or more arguments and returns a single value. Our API assumes that
 * everything is asynchronous via Promises.  Here we ensure that too.  If <param>value</param> is a function
 * but is not async then we wrap it with an async function.
 * @param {Function} value
 * @returns {Promise<*>}
 * @throws {Error}
 */
function assertPredicate(value) {
	if(value==null) {
		throw new Error("missing predicate function");
	} else if(_.isFunction(value)) {
		if(value[Symbol.toStringTag]==="AsyncFunction") {
			return value;
		} else {
			return async(...args)=>{
				return value(...args);
			};
		}
	} else {
		throw new Error(`expecting predicate but found ${util.name(value)}`);
	}
}

/**
 * Asserts that <param>value</param> is one of the <param>allowed</param> types
 * @param {*} value
 * @param {string|"*"|Array<string>} allowed - "*" will allow any type
 * @param {boolean} allowNullish - shorthand for allowNull and allowUndefined
 * @param {boolean} allowNull
 * @param {boolean} allowUndefined
 * @param {*} defaultUndefined - a default that should be used if resolution=undefined. It implies allowUndefined
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
	if(_.size(allowed)===1) {
		allowed=allowed[0];
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
 * Casts <param>value</param> to <code>boolean</code> type.
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
 * He will make an attempt to ensure that <param>data</param> is parsed JSON.
 * @param {*} data
 * @returns {Object}
 * @throws {Error}
 */
function ensureParsedJson(data) {
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
 * It always allows for <param>value</param> to be a predicate that takes a blob as input (hence the <param>blob</param>).
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
	assertAction,
	assertPredicate,
	assertProperties,
	assertType,
	assertTypesEqual,
	boolean,
	ensureParsedJson,
	getType,
	resolveType
};
