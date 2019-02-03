/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:58
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {XRayError}=require("../common/error");
const log=require("../common/log");

/**
 * Base class for everything that gets exposed as a module
 */
class ModuleBase {
	/**
	 * @param {string} action
	 * @param {string} domain
	 * @param {boolean} objectMode
	 * @param {ModuleBase} output
	 * @param {Array<string>} params
	 */
	constructor({
		action,
		domain,
		output=undefined,
		params=[]
	}) {
		this.action=action;
		this.domain=domain;
		this.params=params;
		this._output=output;
	}

	get test() {
		return 1;
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
			log.verbose(`- preprocessing ${this.domain}.${this.action}`);
			let blob=this._preprocessChunk({data, encoding});
			log.verbose(`- running ${this.domain}.${this.action}`);
			blob=await this[this.action](blob);
			return (this._output)
				? this._output.process(blob)
				: Promise.resolve(blob);
		} catch(error) {
			return Promise.reject(new XRayError({
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
