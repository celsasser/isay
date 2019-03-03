/**
 * User: curt
 * Date: 2/8/18
 * Time: 9:48 PM
 *
 * @module common/error
 */

const _=require("lodash");
// note: be careful including relative dependencies in here as it has far reaches


/**
 * Custom Error type that supports some "smart" constructors. And some property annotation support
 * @typedef {Error} XRayError
 */
class XRayError extends Error {
	/**
	 * General purpose pig error that hold all of our secrets.  He is designed to stash information
	 * related to the error so that we capture and report relevant info.  You may specify a number
	 * of predefined params and include additional ones.  You must supply something that constitutes
	 * a "message".  This can come from "message", "error", "code" or "instance"...though instance
	 * probably does not make for a very good message.
	 * @param {number} code - code to associate with error. See <link>./constant.js</link> for enums
	 * @param {string} details - details in addition to the principle error or message
	 * @param {Error} error - error that will be promoted to "message" or "details" if they are not specified.
	 * @param {Object|string} instance - instance of object in which the error occurred
	 * @param {string} message
	 * @param {Object} properties - additional properties that you want captured and logged.
	 */
	constructor({
		code=undefined,
		details=undefined,
		error=undefined,
		instance=undefined,
		message=undefined,
		...properties
	}) {
		const leftovers=Object.assign({}, arguments[0]),
			getMostImportant=function(preferredPropery) {
				let result;
				if(leftovers[preferredPropery]) {
					result=leftovers[preferredPropery];
					delete leftovers[preferredPropery];
				} else if(leftovers.error) {
					result=leftovers.error.message;
					delete leftovers.error;
				} else if(leftovers.code) {
					const constant=require("./constant");
					result=`${constant.error.text(leftovers.code)} (${leftovers.code})`;
					delete leftovers.code;
				}
				return result;
			};
		super(message || getMostImportant("message"));
		if(error) {
			if(!_.isError(error)) {
				error=new Error(error);
			}
			// so that we can trace things to the true origin we steal his stack. There may be times at which we don't want to do this?
			this.stack=error.stack;
			// steal goodies that we want to inherit
			if(code===undefined) {
				code=error.code;
			}
		}
		XRayError.annotate(this, _.omitBy({
			details: getMostImportant("details"),
			error,
			instance,
			code,
			...properties
		}, _.isUndefined));
	}

	/**
	 * Optionally merges data and then looks for data that we know how to annotate.
	 * Note: the reason I made it static is because I am having issues with webpack and seeing the dependency. It's
	 * possible to annotate any error so fair enough.
	 * @param {Error} error
	 * @param {Object} merge
	 */
	static annotate(error, merge) {
		_.merge(error, merge);
		if(error.hasOwnProperty("instance")
			&& _.isObject(error.instance)
			&& !error.instance.hasOwnProperty("type")) {
			error.instance=Object.assign({
				type: error.instance.constructor.name
			}, error.instance);
		}
	}
}

module.exports.XRayError=XRayError;
