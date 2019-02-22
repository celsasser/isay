/**
 * User: curtis
 * Date: 3/24/18
 * Time: 3:40 AM
 * Copyright @2019 by Xraymen Inc.
 *
 * @module common/date
 */

const _=require("lodash");
const log=require("./log");


/**** Public API ****/
/**
 * Does all he can to convert a string into a date object
 * @param {string} text
 * @returns {Date|null}
 */
module.exports.fromString=function(text) {
	let result=null;
	if(!_.isEmpty(text)) {
		result=Date.parse(text);
		if(isNaN(result)===false) {
			result=new Date(result);
		} else {
			log.warn(`date.fromString: unknown codec '${text}'`);
			result=null;
		}
	}
	return result;
};

/**
 * Looks for the various known flavors of a date: Date, String, Number (assumes epoch)
 * @param {Object} o
 * @returns {Date}
 */
module.exports.fromObject=function(o=undefined) {
	if(_.isDate(o)) {
		return o;
	} else if(_.isString(o)) {
		return exports.fromString(o);
	} else if(_.isNumber(o)) {
		return new Date(o);
	}
	log.warn(`date.fromObject: unknown codec '${typeof(o)}'`);
	return null;
};


/**
 * Allows support for older encodings without millis
 * @param {Date} date
 * @param {boolean} millis true to include them or false or undefined to eliminate them
 * @returns {string}
 */
module.exports.toISOString=function(date, millis=false) {
	const result=date.toISOString();
	return (millis)
		? result
		: result.replace(/\.\d+Z$/, "Z");
};
