/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:58
 * Copyright @2019 by Xraymen Inc.
 */

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
	 * @param {DataBlob} data
	 * @returns Promise<DataBlob>
	 */
	async process(data=undefined) {
		try {
			log.verbose(`- preprocessing ${this.domain}.${this.action}`);
			let blob=this._preprocessChunk(data);
			log.verbose(`- running ${this.domain}.${this.action}`);
			blob=await this[this.method](blob);
			return (this._output)
				? this._output.process(blob)
				: Promise.resolve(blob);
		} catch(error) {
			// look to see whether this was reported by us. If so then it means that
			// the chain was nested. We just want the top level error.
			if(/\w+\.\w+ failed/.test(error.message)===false) {
				error=new Error(`${this.domain}.${this.action} failed - ${error.message}`);
			}
			return Promise.reject(error);
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
