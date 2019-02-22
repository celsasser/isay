/**
 * User: curtis
 * Date: 10/18/18
 * Time: 10:08 PM
 * Copyright @2019 by Xraymen Inc.
 *
 * @module common/format
 */

const _=require("lodash");
const diagnostics=require("./diagnostics");
const util=require("./util");

/**
 * Gets text suitable for user presentation. Does his best to find the important parts.
 * @param {Error|string} error
 * @param {string} details - whether to dig the details out of the error or not?
 * @param {string} instance - whether to dig the instance out of the error or not?
 * @param {Boolean} stack - whether to include stack or not if <param>message</param> is an Error
 * @returns {string}
 */
function errorToString(error, {
	details=true,
	instance=true,
	stack=false
}={}) {
	let text="",
		delimiter=":";
	if(typeof(error)==="string") {
		text=`${text}${error}`;
	} else {
		if(instance && error.hasOwnProperty("instance")) {
			text=`${text}${error.instance.type}${delimiter} ${error.message}`;
			delimiter=".";
		} else {
			text=`${text}${error.message}`;
		}
		if(details) {
			if(error.hasOwnProperty("details")) {
				text=`${text}${delimiter} ${error.details}`;
			} else if(error.hasOwnProperty("error")) {
				text=`${text}${delimiter} ${error.error}`;
			}
		}
		if(stack) {
			text=`${text}\n${diagnostics.groomStack(error.stack, {popCount: 1})}`;
		}
	}
	return text;
}

/**
 * This guy serves up text but text that adheres to a lazy convention we use for assertions and other functionality
 * for which we want lazy processing. The message may be the various things we know of that can be converted to text.
 * @param {undefined|string|Error|function():string} message
 * @param {string} dfault - if message is null or undefined
 * @param {Boolean} stack - whether to include stack or not if <param>message</param> is an Error
 * @returns {string}
 */
function messageToString(message, {
	dfault="",
	stack=false
}={}) {
	if(message instanceof Error) {
		return errorToString(message, {stack});
	} else {
		let text;
		if(typeof(message)==="function") {
			text=message();
		} else {
			text=(message)
				? message.toString()
				: dfault;
		}
		if(stack) {
			text+=`\n${diagnostics.getStack({popCount: 1})}`;
		}
		return text;
	}
}

/**
 * Creates a "friendly" string out of an object
 * @param {Object} object
 * @param {string} name - the object name should you want it appended to the hierarchy
 * @returns {string}
 */
function objectToString(object, name=undefined) {
	/**
	 * @param {*} _object
	 * @param {string} parent
	 * @return {Array<{key:string, value:string}>}
	 */
	function _toPairs(_object, parent=undefined) {
		function _createPropertyChain(key) {
			return (parent!==undefined)
				? `${parent}.${key}`
				: key;
		}
		if(_.isPlainObject(_object) || _.isArray(_object)) {
			return _.reduce(_object, (result, value, key)=>{
				return result.concat(_toPairs(value, _createPropertyChain(key)));
			}, []);
		} else {
			return [{key: parent, value: String(_object)}];
		}
	}
	return _toPairs(util.objectToData(object, {sort: true}), name)
		.map(pair=>{
			return pair.key
				? `${pair.key}=${pair.value}`
				: pair.value;
		})
		.join(", ");
}

module.exports={
	errorToString,
	messageToString,
	objectToString
};


