/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 9:58
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const parse=require("../common/parse");
const spawn=require("../common/spawn");

/**
 * @typedef {ModuleBase} ModuleStd
 */
class ModuleOs extends ModuleBase {
	/**
	 * This is the single point through which we send all command requests.
	 * @param {Object} blob
	 * @returns {Promise<DataBlob>}
	 */
	async executionHandler(blob) {
		const args=this._paramsToArguments(),
			input=_.isEmpty(blob)
				? ""
				: _.isObject(blob)
					? JSON.stringify(blob)
					: blob;
		return spawn.command({
			args: args,
			command: this.action,
			stdin: input
		});
	}

	/********************* Private Interface *********************/
	/**
	 * Parse the <code>this.params</code>. If there is a single param then we assume that the
	 * client has specified all of the params as a single argument. If there are more than 1
	 * then we assume that we are to parse the input by shell delimiter rules.
	 * @return {Array<string>}
	 * @private
	 */
	_paramsToArguments() {
		return (this.params.length===1)
			? parse.shell(this.params[0])
			: this.params;
	}
}

module.exports={
	ModuleOs
};
