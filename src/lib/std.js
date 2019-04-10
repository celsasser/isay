/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const util=require("util");
const {ModuleBase}=require("./_base");
const {resolveType}=require("./_data");

/**
 * stdio support. NodeJS process.stdout and process.stderr support text and buffers. So we only ever attempt
 * to write those two data types.  Within those constraints we support two different flavors of output:
 * - error|out: convert to a string if the type is not a buffer or string but do nothing more.
 * - errorln|outln - ALWAYS converts to a string, spacious formatting of objects and always appends a newline.
 * @typedef {ModuleBase} ModuleStd
 */
class ModuleStd extends ModuleBase {
	/**
	 * Writes to stderr. Only ensures that data is text or a buffer. Assumes compact formatting of objects.
	 * @resolves output:* in (this.params[0..n]|blob)
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async error(blob) {
		const writer=util.promisify(process.stderr.write.bind(process.stderr)),
			input=await this._getInput(blob);
		return writer(this._inputToRaw(input))
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * Writes to stderr. Always converts to text and always adds a newline. Assumes spacious formatting of objects.
	 * Note: I borrowed the naming convention from java. Not crazy about it but want to keep it close to raw's "error"
	 * @resolves output:* in (this.params[0..n]|blob)
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async errorln(blob) {
		const writer=util.promisify(process.stderr.write.bind(process.stderr)),
			input=await this._getInput(blob);
		return writer(`${this._inputToString(input)}\n`)
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * "stdin?" you may be wondering. Well, not exactly. It is simply another way for you to introduce data into a chain.
	 * You may think of it a pipe or file redirection in the shell world.
	 * Note: There probably are not may use cases at the top but it can be useful when you are working with an embedded chain.
	 * @resolves result:DataBlob in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async in(blob) {
		return resolveType(blob, this.params[0], "*", {allowNullish: true});
	}

	/**
	 * Writes output to stdout. Only ensures that data is text or a buffer. Assumes compact formatting of objects.
	 * @resolves output:* in (this.params[0..n]|blob)
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async out(blob) {
		const writer=util.promisify(process.stdout.write.bind(process.stdout)),
			input=await this._getInput(blob);
		return writer(this._inputToRaw(input))
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * Writes output to stdout. Always converts to text and always adds a newline. Assumes spacious formatting of objects.
	 * Note: I borrowed the naming convention from java. Not crazy about it but want to keep it close to raw's "out"
	 * @resolves output:* in (this.params[0..n]|blob)
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async outln(blob) {
		const writer=util.promisify(process.stdout.write.bind(process.stdout)),
			input=await this._getInput(blob);
		return writer(`${this._inputToString(input)}\n`)
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**************** Private Interface ****************/
	/**
	 * We want to be able to write data coming from params as well as input data. But we are not going to
	 * ever try and figure out how the two should be mixed. So, we always chose one (if we have a choice)
	 * and we stick to our rules (see readme.md):
	 * - if the user has specified one or more arguments then we use it/them.
	 * - otherwise we use the input blob
	 * @param {DataBlob} blob
	 * @returns {DataBlob}
	 * @private
	 */
	async _getInput(blob) {
		if(this.params.length===0) {
			return blob;
		} else if(this.params.length===1) {
			return resolveType(blob, this.params[0], "*", {allowNullish: true});
		} else {
			return this.params;
		}
	}

	/**
	 * Make sure it is a buffer or string. If neither then it is converted to a string.
	 * @param {DataBlob} input
	 * @param {boolean} compact
	 * @returns {Buffer|string}
	 * @private
	 */
	_inputToRaw(input, compact=true) {
		if(Buffer.isBuffer(input)) {
			return input;
		} else {
			return this._inputToString(input, compact);
		}
	}

	/**
	 * Accepts any type and returns a string.
	 * @param {DataBlob} input
	 * @param {boolean} compact
	 * @returns {string}
	 * @private
	 */
	_inputToString(input, compact=false) {
		if(Buffer.isBuffer(input)) {
			return input.toString("utf8");
		} else if(_.isObject(input)) {
			return (compact)
				? JSON.stringify(input)
				: JSON.stringify(input, null, "\t");
		} else {
			return String(input);
		}
	}
}

module.exports={
	ModuleStd
};
