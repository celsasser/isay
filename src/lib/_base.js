/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:58
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const log=require("../common/log");
const util=require("../common/util");

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
			log.verbose(`- running ${this.domain}.${this.action}`);
			let blob=this._preprocessChunk(data);
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
	 * If the value is not a valid JSON object then we throw an exception
	 * @param {*} value
	 * @param {boolean} allowNull
	 * @throws {Error}
	 * @protected
	 */
	_assertJson(value, {
		allowNull=true
	}={}) {
		if(_.isPlainObject(value)) {
			// okay
		} else if(value==null && allowNull) {
			// okay
		} else {
			throw new Error(`expecting JSON object but found ${util.name(value)}`);
		}
	}

	/**
	 * He will make an attempt to ensure that the object is parsed JSON.
	 * @param {*} data
	 * @returns {Object}
	 * @protected
	 */
	_ensureJson(data) {
		if(_.isPlainObject(data)) {
			return data;
		} else if(_.isString(data)) {
			return JSON.parse(data);
		} else if(_.isFunction(data)) {
			throw new Error("expected valid JSON object but found function");
		}
		return data;
	}

	/**
	 * Here we are considering a "predicate" to be any function we want to behave like an "action": async function(blob):DataBlob.
	 * So, we make sure <param>predicate</param> is a function and that it is <code>async</code>
	 * @param {Function} predicate
	 * @returns {Promise<*>}
	 * @protected
	 */
	_conditionPredicate(predicate) {
		if(predicate==null) {
			throw new Error("missing predicate function");
		} else if(_.isFunction(predicate)) {
			if(predicate[Symbol.toStringTag]==="AsyncFunction") {
				return predicate;
			} else {
				return async(...args)=>{
					return predicate(...args);
				};
			}
		} else {
			throw new Error(`expecting predicate but found ${util.name(predicate)}`);
		}
	}

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
