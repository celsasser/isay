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
	 * @param {string} method
	 * @param {boolean} objectMode
	 * @param {ModuleBase} output
	 * @param {Array<*>} params
	 */
	constructor({
		action,
		domain,
		method,
		output=undefined,
		params=[]
	}) {
		this.action=action;
		this.domain=domain;
		this.method=method;
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
			log.verbose(`- preprocessing ${this.domain}.${this.action}`);
			let blob=this._preprocessChunk({data, encoding});
			log.verbose(`- running ${this.domain}.${this.action}`);
			blob=await this[this.method](blob);
			return (this._output)
				? this._output.process(blob)
				: Promise.resolve(blob);
		} catch(error) {
			return Promise.reject(new XRayError({
				error,
				instance: this,
				message: `attempt to process ${this.domain}.${this.action} failed`
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
