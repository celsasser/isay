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
		return writer(`${this._toString(data)}\n`)
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
		return writer(`${this._toString(data)}\n`)
			.then(Promise.resolve.bind(Promise, data));
	}

	/**************** Private Interface ****************/
	/**
	 * Converts data blob into a string representation if it is not one already
	 * @param {DataBlob} data
	 * @param {boolean} compact
	 * @returns {string}
	 * @private
	 */
	_toString(data, compact=false) {
		if(_.isObject(data)) {
			return (compact)
				? JSON.stringify(data)
				: JSON.stringify(data, null, "\t");
		} else {
			return String(data);
		}
	}
}

module.exports={
	ModuleStd
};
