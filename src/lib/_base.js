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

/**
 * Base class for everything that gets exposed as a module
 */
class ModuleBase {
	/**
	 * @param {string} action - the API name of the action
	 * @param {ModuleBase} catchModule - exceptions thrown during processing are forwarded to it if set
	 * @param {string} domain
	 * @param {string} method - the internal name of the action's method.
	 * @param {ModuleBase} nextModule
	 * @param {Array<*>} params
	 */
	constructor({
		action,
		catchModule=undefined,
		domain,
		method,
		nextModule=undefined,
		params=[]
	}) {
		this.action=action;
		this.domain=domain;
		this.method=method;
		this.params=params;
		this._catchModule=catchModule;
		this._nextModule=nextModule;
	}

	/**
	 * Processes data for this module and passes results down the pipeline
	 * @param {DataBlob} data
	 * @param {Array<*>} args - a few of our action predicates offering extra params such as array.map
	 * @returns {Promise<DataBlob>}
	 */
	async process(data=undefined, ...args) {
		let blob;

		/**
		 * Logs the action with input and params info
		 * @return {Promise}
		 */
		const _logDebug=(max=512)=>{
			const {input, params}=this._formatDebugActionDetails(blob, max),
				inputText=(data!==undefined)
					? `\n   input = ${input}`
					: "",
				paramsText=params.map((text, index)=>`\n   params[${index}] = ${text}`, "").join("");
			return log.console(`- executing ${this.domain}.${this.action}()${inputText}${paramsText}`);
		};

		/**
		 * Logs the action with at most a single line of input
		 * @return {Promise}
		 */
		const _logVerbose=()=>{
			const prefix=`- executing ${this.domain}.${this.action}`,
				// here we are preventing the write from exceeding a single line if in a TTY
				maxLength=(process.stdin.isTTY)
					? process.stdout.columns-prefix.length-3
					: 80,
				{input}=this._formatVerboseActionDetails(blob, maxLength);
			return log.console(`${prefix}(${input})`);
		};

		const configuration=getApplicationConfiguration();
		try {
			blob=this._preprocessChunk(data);
			if(configuration.options.debug) {
				// let's allow them to dump without limits if they have also specified "verbose"
				await _logDebug(log.level.isLog("verbose") 
					? Number.MAX_SAFE_INTEGER
					: 512);
			} else if(log.level.isLog("verbose")) {
				await _logVerbose();
			}
			blob= await this[this.method](blob, ...args);
			return (this._nextModule)
				? this._nextModule.process(blob)
				: Promise.resolve(blob);
		} catch(error) {
			if(this._catchModule) {
				// we have a "catch" error handler so we let him handle it.
				return this._catchModule.process(error, blob, ...args);
			} else {
				// look to see whether this was reported by us. If so then it means that
				// the chain was nested. We just want the top level error.
				if(!(error.instance instanceof ModuleBase)) {
					error=this._createUnexpectedError(error);
				}
				return Promise.reject(error);
			}
		}
	}

	/**************** Protected Interface ****************/
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
	 * Formats data for verbose or debug presentation. It is assumed that <param>data</param> was received as input or param data.
	 * @param {*} data
	 * @param {number} max
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
					const split=Math.floor(max/2)-(typeof(data)==="string" ? 3 : 2);
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
	 * @param {number} max - max length
	 * @returns {{input:string, params:Array<string>}}
	 * @private
	 */
	_formatDebugActionDetails(data, max=512) {
		// Our default max is a somewhat arbitrary number. We want to log as much as reasonable.
		// But the input could be enormous and at some point is just interference.
		return {
			input: ModuleBase._formatVariableData(data, max),
			params: this.params.map(param=>ModuleBase._formatVariableData(param, max))
		};
	}

	/**
	 * Allows modules to return more detailed info, where appropriate, for detailed logging.
	 * @param {DataBlob} data
	 * @param {number} max - max length
	 * @returns {{input:string}}
	 * @private
	 */
	_formatVerboseActionDetails(data, max=80) {
		return {
			input: ModuleBase._formatVariableData(data, max)
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
