/**
 * User: curt
 * Date: 3/5/2018
 * Time: 9:10 PM
 *
 * @module common/constant
 */

/**
 * An extension of the http error codes that we use for internal purposes
 * @enum {number}
 */
exports.error={
	code: {
		ABORT: -1
	},
	text: (code)=>{
		switch(code) {
			case exports.error.code.ABORT: return "Abort";
			default: {
				return String(code);
			}
		}
	}
};

/**
 * Error severities.
 * Should by in parity with <code>LogLevel</code>
 * @enum {string}
 */
exports.severity={
	VERBOSE: "verbose",
	DEBUG: "debug",
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
	FATAL: "fatal",
	/**
	 * Is the specified <param>severity</param> greater than or equal to the threshold value which is "warn" by default
	 * @param {LogLevel} value
	 * @param {LogLevel} threshold
	 * @returns {boolean}
	 */
	trips: (value, threshold=exports.severity.WARN)=>{
		return exports.severity._ORDER.indexOf(value)>=exports.severity._ORDER.indexOf(threshold);
	},

	/**
	 * The order of severity for measurement
	 * @private
	 */
	_ORDER: ["verbose", "debug", "info", "warn", "error", "fatal"]
};

/**
 * Determines whether the value is valid
 * @param {Object} enumObject
 * @param {string} value
 * @returns {boolean}
 */
exports.isValidValue=function(enumObject, value) {
	return Object.values(enumObject)
		.indexOf(value)> -1;
};

/**
 * @type {function(value:string):Boolean}
 */
exports.isValidSeverity=exports.isValidValue.bind(null, exports.severity);

