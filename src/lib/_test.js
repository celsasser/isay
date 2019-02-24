/**
 * User: curtis
 * Date: 2019-02-23
 * Time: 9:17 PM
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");

/**
 * base class for tests so that we can support the positive and negative tests with one set of functionality
 * @typedef {ModuleBase} ModuleFile
 */
class ModuleTest extends ModuleBase {
	/**
	 * returns true if <param>blob</param> ends with value, or one of the values, in this.params[0]
	 * @param {string} blob
	 * @returns {boolean}
	 */
	_endsWith(blob) {
		this._assertType(blob, "String");
		this._assertType(this.params[0], ["Array", "String"]);
		const searchEndings=_.isArray(this.params[0])
			? this.params[0]
			: [this.params[0]];
		for(let search of searchEndings) {
			if(blob.endsWith(search)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * returns true if <param>blob</param> is included in this.params[0]
	 * @resolves compareToItems:Array<*> in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {boolean}
	 */
	_oneOf(blob) {
		this._assertType(this.params[0], "Array");
		for(let value of this.params[0]) {
			if(_.isEqual(blob, value)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * returns true if <param>blob</param> starts with value, or one of the values, in this.params[0]
	 * @param {string} blob
	 * @returns {boolean}
	 */
	_startsWith(blob) {
		this._assertType(blob, "String");
		this._assertType(this.params[0], ["Array", "String"]);
		const searchEndings=_.isArray(this.params[0])
			? this.params[0]
			: [this.params[0]];
		for(let search of searchEndings) {
			if(blob.startsWith(search)) {
				return true;
			}
		}
		return false;
	}
}

module.exports={
	ModuleTest
};
