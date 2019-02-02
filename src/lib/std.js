/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const util=require("util");
const {ModuleBase}=require("./base");

/**
 * @typedef {ModuleBase} StdModule
 */
class StdModule extends ModuleBase {
	/**
	 * Writes output to stderr
	 * @param {Object} data
	 * @param {string} encoding
	 * @returns {Promise<DataBlob>}
	 */
	async error({data, encoding}) {
		const writer=util.promisify(process.stderr.write.bind(process.stderr));
		return writer(this._toString(data))
			.then(()=>({data, encoding}));
	}

	/**
	 * Writes output to stdout
	 * @param {Object} data
	 * @param {string} encoding
	 * @returns {Promise<DataBlob>}
	 */
	async out({data, encoding}) {
		const writer=util.promisify(process.stdout.write.bind(process.stdout));
		return writer(this._toString(data))
			.then(()=>({data, encoding}));
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
	StdModule
};
