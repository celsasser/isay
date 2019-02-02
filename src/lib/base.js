/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:58
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {HorseError}=require("../common/error");

/**
 * Base class for everything that gets exposed as a module
 */
class ModuleBase {
	/**
	 * @param {string} action
	 * @param {boolean} objectMode
	 * @param {ModuleBase} output
	 * @param {Array<string>} params
	 */
	constructor({
		action,
		output=undefined,
		params=[]
	}) {
		this.action=action;
		this.params=params;
		this._output=output;
	}

	/**
	 * Processes data for this module and passes results down the pipeline
	 * @param {*} data
	 * @param {string} encoding
	 * @returns Promise<DataBlob>
	 */
	async process({
		data=undefined,
		encoding="utf8"
	}={}) {
		try {
			let blob=this._preprocessChunk({data, encoding});
			blob=await this[this.action](blob);
			return (this._output)
				? this._output.process(blob)
				: Promise.resolve(blob);
		} catch(error) {
			return Promise.reject(new HorseError({
				error,
				instance: this,
				message: `attempt to process ${this.action} failed`
			}));
		}
	}

	/**************** Protected Interface ****************/
	/**
	 * Allows derived instances to preprocess this data
	 * @param {DataBlob} blob
	 * @returns {DataBlob}
	 * @protected
	 */
	_preprocessChunk(blob) {
		return blob;
	}
}

module.exports={
	ModuleBase
};
