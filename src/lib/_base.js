/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:58
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {getApplicationConfiguration}=require("../command/configuration");
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
	 * @param {ModuleBase} trap - it's catch but we are using "trap" to get around reserved keyword problems
	 */
	constructor({
		action,
		domain,
		method,
		output=undefined,
		params=[],
		trap=undefined
	}) {
		this.action=action;
		this.domain=domain;
		this.method=method;
		this.params=params;
		this._output=output;
		this._trap=trap;
	}

	/**
	 * Processes data for this module and passes results down the pipeline
	 * @param {DataBlob} data
	 * @param {Array<*>} args - a few of our action predicates offering extra params such as array.map
	 * @returns {Promise<DataBlob>}
	 */
	async process(data=undefined, ...args) {
		let blob;
		const configuration=getApplicationConfiguration();
		try {
			blob=this._preprocessChunk(data);
			if(configuration.options.debug) {
				const {input, params}=this._formatDebugActionDetails(blob),
					paramsText=params.map((text, index)=>`\n   params[${index}]=${text}`, "").join("");
				log.info(`- executing ${this.domain}.${this.action}(${input})${paramsText}`);
			} else {
				log.verbose(()=>{
					const {input}=this._formatVerboseActionDetails(blob);
					return `- executing ${this.domain}.${this.action}(${input})`;
				});
			}
			blob=await this[this.method](blob, ...args);
			return (this._output)
				? this._output.process(blob)
				: Promise.resolve(blob);
		} catch(error) {
			if(this._trap) {
				// we have a "catch" error handler so we let him handle it.
				return this._trap.process(error, blob, ...args);
			} else {
				// look to see whether this was reported by us. If so then it means that
				// the chain was nested. We just want the top level error.
				if(!(error.instance instanceof ModuleBase)) {
					error=this._createUnexpectedError({error});
				}
				return Promise.reject(error);
			}
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
				? allowed.slice(0, allowed.length-1)
					.join(", ")
					+` or ${allowed[allowed.length-1]}`
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
					throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
				}
			} else {
				if(type!==allowed) {
					throw new Error(`expecting ${_formatAllowed()} but found ${util.name(value)}`);
				}
			}
		}
	}

	/**
	 * Asserts that the properties specified are in <param>object</param>
	 * @param {Object} object
	 * @param {string|Array<string>} properties
	 * @throws {Error}
	 * @protected
	 */
	_assertProperties(object, properties) {
		if(typeof(properties)==="string") {
			properties=[properties];
		}
		const missing=_.difference(properties, Object.keys(object));
		if(missing.length>0) {
			throw new Error(`Object missing required keys ${JSON.stringify(missing)}`);
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
	 * Creates a special error that we will know and not modify as it percolates up through nested chains.
	 * @param {Number|undefined} code
	 * @param {Error} error
	 * @param {string} message
	 * @returns {XRayError}
	 * @protected
	 */
	_createExpectedError({
		code=undefined,
		error=undefined,
		message=undefined
	}) {
		return new XRayError({
			action: this.action,
			code,
			domain: this.domain,
			error,
			instance: this,
			message
		});
	}

	/**
	 * Creates a special error that we will know and not modify as it percolates up through nested chains.
	 * @param {Error} error
	 * @returns {XRayError}
	 * @private
	 */
	_createUnexpectedError(error) {
		return new XRayError({
			action: this.action,
			domain: this.domain,
			error,
			instance: this,
			message: `${this.domain}.${this.action} failed`
		});
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
	 * Formats data for verbose or debug presentation. It is assumed that <param>data</param> was received as input or param data.
	 * @param {*} data
	 * @param {Number} max
	 * @returns {string}
	 * @private
	 */
	static _formatVariableData(data, max=Number.MAX_SAFE_INTEGER) {
		let formatted="";
		if(data!==undefined) {
			if(typeof(data)==="function") {
				formatted="Function";
			} else {
				// Most of the data we are going to encounter in mouse is not going to be binary. So, optimistically, we are going
				// to convert it to text and see what we make of it.
				let text=(typeof(data)==="object")
					? JSON.stringify(data)
					: String(data);
				text=_.chain(text)
					.deburr()
					// there has got to be a way to do this in one fell swoop?
					.replace(/\n/g, "\\n")
					.replace(/\r/g, "\\r")
					.replace(/\t/g, "\\t")
					.value();
				if(text.length<max) {
					formatted=`${text}`;
				} else {
					const split=Math.floor(max/2)-2;
					formatted=`${text.substr(0, split)}[...]${text.substr(text.length-split)}`;
				}
				// let's make sure it is all within the printable ascii range. If not then we will simply label it "Binary"
				if(formatted.match(/[^\u0020-\u007f]/)) {
					formatted="Binary";
				} else if(typeof(data)==="string") {
					formatted=`"${formatted}"`;
				}
			}
		}
		return formatted;
	}
	/**
	 * Debug information. More detail than verbose and includes params.
	 * @param {DataBlob} data
	 * @returns {{input:string, params:Array<string>}}
	 * @private
	 */
	_formatDebugActionDetails(data) {
		// This max is a somewhat arbitrary number. We want to log as much as reasonable.
		// But the input could be enormous and at some point is just interference.
		const max=256;
		return {
			input: ModuleBase._formatVariableData(data, max),
			params: this.params.map(param=>ModuleBase._formatVariableData(param, max))
		};
	}

	/**
	 * Allows modules to return more detailed info, where appropriate, for detailed logging.
	 * @param {DataBlob} data
	 * @returns {{input:string}}
	 * @private
	 */
	_formatVerboseActionDetails(data) {
		return {
			input: ModuleBase._formatVariableData(data, 80)
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
