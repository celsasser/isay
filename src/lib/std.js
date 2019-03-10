/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const util=require("util");
const {ModuleBase}=require("./_base");

/**
 * Basic stdio support
 * @typedef {ModuleBase} ModuleStd
 */
class ModuleStd extends ModuleBase {
	/**
	 * Writes output to stderr
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async error(data) {
		const writer=util.promisify(process.stderr.write.bind(process.stderr));
		return writer(`${this._inputToString(data)}\n`)
			.then(Promise.resolve.bind(Promise, data));
	}

	/**
	 * "stdin?" you may be wondering. Well, not exactly. It is simply another way for you to introduce data (most likely in memory) into a chain.
	 * You may think of it a pipe or file redirection in the shell world.
	 * Note: There probably are not may use cases at the top but it can be useful when you are working with an embedded chain.
	 * @resolves result:* in this.params[0]
	 * @returns {Promise<*>}
	 */
	async in() {
		return this.params[0];
	}

	/**
	 * Writes output to stdout
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async out(data) {
		const writer=util.promisify(process.stdout.write.bind(process.stdout));
		return writer(`${this._inputToString(data)}\n`)
			.then(Promise.resolve.bind(Promise, data));
	}

	/**************** Private Interface ****************/
	/**
	 * We want to be able to write data coming from params or data received as input. Here we stick to our rules (see readme.md):
	 * - if the user has specified an argument then we use it. And only assume that there is one.
	 * - otherwise we use the blob and make sure
	 * Whichever is chosen - we render it as a string if it is not one already
	 * @param {DataBlob} data
	 * @param {boolean} compact
	 * @returns {string}
	 * @private
	 */
	_inputToString(data, compact=false) {
		const input=(this.params.length===0)
			? data
			: (this.params.length===1)
				? this.params[0]
				: this.params;
		if(_.isObject(input)) {
			return (compact)
				? JSON.stringify(input)
				: JSON.stringify(input, null, "\t");
		} else {
			return String(input);
		}
	}
}

module.exports={
	ModuleStd
};
