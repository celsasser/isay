/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:58
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {XRayError}=require("../common/error");
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
	 * @returns {Promise<DataBlob>}
	 */
	async process(data=undefined) {
		try {
			let blob=this._preprocessChunk(data);
			log.verbose(()=>{
				const {input}=this._getPreviewDetails(blob);
				return `- executing ${this.domain}.${this.action}(${input})`;
			});
			blob=await this[this.method](blob);
			return (this._output)
				? this._output.process(blob)
				: Promise.resolve(blob);
		} catch(error) {
			// look to see whether this was reported by us. If so then it means that
			// the chain was nested. We just want the top level error.
			if(/\w+\.\w+ failed/.test(error.message)===false) {
				// let's make sure we pick up the stack by wrapping the error
				error=new XRayError({
					error,
					message: `${this.domain}.${this.action} failed`
				});
			}
			return Promise.reject(error);
		}
	}

	/**************** Protected Interface ****************/
	/**
	 * Asserts that <param>value</param> is one of the <param>allowed</param> types
	 * @param {*} value
	 * @param {string|Array<string>} allowed
	 * @param {boolean} allowNull
	 * @param {boolean} strict - if strict then will use value.constructor.name otherwise will use typedef(value)
	 * @throws {Error}
	 * @protected
	 */
	_assertType(value, allowed, {
		allowNull=false,
		strict=true
	}={}) {
		function _formatAllowed() {
			return _.isArray(allowed)
				? allowed.join(" or ")
				: allowed;
		}
		if(value==null) {
			if(!allowNull) {
				throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
			}
		} else {
			const type=(strict)
				? value.constructor.name
				: typeof(value);
			if(_.isArray(allowed)) {
				if(_.includes(allowed, type)===false) {
					throw new Error(`expecting one of ${_formatAllowed()} but found ${util.name(value)}`);
				}
			} else {
				if(type!==allowed) {
					throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
				}
			}
		}
	}

	/**
	 * A "predicate" is a function that takes 1 or more arguments and returns a single value. They are
	 * designed to be used with our API. So that they are fully compatible and in parity we make sure that
	 * the are asynchronous. If <param>predicate</param> is not found to be async then we make him async
	 * @param {Function} predicate
	 * @returns {Promise<*>}
	 * @protected
	 */
	_assertPredicate(predicate) {
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
	 * Allows modules to return more detailed info, where appropriate, for detailed logging.
	 * @param {DataBlob} data
	 * @returns {{input:string}}
	 * @private
	 */
	_getPreviewDetails(data) {
		let input="";
		if(data!==undefined) {
			if(typeof(data)==="string") {
				// todo: this will be messy if the string happens to be binary data.
				data=_.chain(data)
					.deburr()
					.replace(/\n/g, "\\n")
					.value();
				if(data.length<80) {
					input=`"${data}"`;
				} else {
					input=`"${data.substr(0, 38)}[...]${data.substr(data.length-38)}"`;
				}
			} else {
				input=util.name(data);
			}
		}
		return {
			input
		};
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
