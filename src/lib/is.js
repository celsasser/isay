/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");

/**
 * support tests
 * @typedef {ModuleBase} ModuleFile
 */
class ModuleIs extends ModuleBase {
	/**
	 * returns true if empty
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async empty(blob) {
		return _.isEmpty(blob);
	}

	/**
	 * returns true if <param>blob</param> is equal to <code>param[0]</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async equal(blob) {
		return _.isEqual(blob, this.params[0]);
	}
}

module.exports={
	ModuleIs
};
