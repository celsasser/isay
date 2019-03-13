/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleTest}=require("./_test");
const {assertType}=require("./_data");

/**
 * support for testing for negative conditions
 * @typedef {ModuleTest} ModuleFile
 */
class ModuleNot extends ModuleTest {
	/**
	 * returns true if not empty
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async empty(blob) {
		return !_.isEmpty(blob);
	}

	/**
	 * returns false if <param>blob</param> ends with value, or one of the values, in this.params[0]
	 * @param {string} blob
	 * @returns {Promise<boolean>}
	 */
	async endsWith(blob) {
		return !this._endsWith(blob);
	}

	/**
	 * returns true if <param>blob</param> is not equal to <code>params[0]</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async equal(blob) {
		return !_.isEqual(blob, this.params[0]);
	}

	/**
	 * returns false if <param>blob</param> is included in this.params[0]
	 * @resolves compareToItems:Array<*> in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async oneOf(blob) {
		return !this._oneOf(blob);
	}

	/**
	 * returns true if <param>blob</param> is included in this.params[0]
	 * @resolves compareToItems:Array<*> in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async startsWith(blob) {
		return !this._startsWith(blob);
	}

	/**
	 * returns true if <param>blob</param> is of one of the types specified in this.params[0]
	 * @resolves types:(string|Array<string>) in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async type(blob) {
		assertType(this.params[0], ["Array", "String"]);
		try {
			assertType(blob, this.params[0]);
			return false;
		} catch(error) {
			return true;
		}
	}
}

module.exports={
	ModuleNot
};
