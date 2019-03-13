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
 * support for testing for positive conditions
 * @typedef {ModuleTest} ModuleFile
 */
class ModuleIs extends ModuleTest {
	/**
	 * returns true if empty
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async empty(blob) {
		return _.isEmpty(blob);
	}

	/**
	 * returns true if <param>blob</param> ends with value, or one of the values, in this.params[0]
	 * @param {string} blob
	 * @returns {Promise<boolean>}
	 */
	async endsWith(blob) {
		return this._endsWith(blob);
	}

	/**
	 * returns true if <param>blob</param> is equal to <code>params[0]</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async equal(blob) {
		return _.isEqual(blob, this.params[0]);
	}

	/**
	 * returns true if <param>blob</param> is included in this.params[0]
	 * @resolves compareToItems:Array<*> in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async oneOf(blob) {
		return this._oneOf(blob);
	}

	/**
	 * returns true if <param>blob</param> starts with value, or one of the values, in this.params[0]
	 * @param {string} blob
	 * @returns {boolean}
	 */
	async startsWith(blob) {
		return this._startsWith(blob);
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
			return true;
		} catch(error) {
			return false;
		}
	}
}

module.exports={
	ModuleIs
};
