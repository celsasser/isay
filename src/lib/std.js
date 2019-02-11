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
		return writer(this._toString(data))
			.then(()=>data);
	}

	/**
	 * Writes output to stdout
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async out(data) {
		const writer=util.promisify(process.stdout.write.bind(process.stdout));
		return writer(this._toString(data))
			.then(()=>data);
	}

	/**************** Private Interface ****************/
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
