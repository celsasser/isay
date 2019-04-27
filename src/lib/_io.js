/**
 * Date: 2019-02-10
 * Time: 00:21
 * @license MIT (see project's LICENSE file)
 *
 * Base class for all domains that interact with files
 */

const {ModuleBase}=require("./_base");
const {assertType, getType, resolveType}=require("./_data");

/**
 * He's an extension of ModuleBase with some protected members for helping deal with and
 * keep file path consistency
 * @typedef {ModuleBase} ModuleIO
 */
class ModuleIO extends ModuleBase {
	/**
	 * Finds the path as per the following rules
	 *  - if <code>params[0]</code> then it will be used as the path
	 *  - else <code>data</data> will be used as the path
	 * @resolves path:string in this.params[0]|data
	 * @param {DataBlob} blob
	 * @returns {Promise<string>}
	 * @throws {Error}
	 * @protected
	 */
	async _getReadPath(blob) {
		if(this.params.length>=1) {
			return resolveType(blob, this.params[0], "String");
		} else {
			return assertType(blob, "String");
		}
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Finds the path and options. <code>this.params</code> get priority but will defer to <param>blob</param>.
	 * @resolves path:string in this.params[0]|data
	 * @resolves options:(Object|undefined) in this.params[1]|this.params[0]
	 * @param {DataBlob} blob
	 * @param {Encoding} encoding - default encoding
	 * @param {...*} options
	 * @returns {{path:string, encoding:string, ...*}} - will include whatever other options are discovered
	 * @throws {Error}
	 * @protected
	 */
	async _getReadPathAndOptions(blob, {
		encoding="utf8",
		...options
	}={}) {
		// we are going to assume it is in param[0] and adjust course if we need to.
		const param0=await resolveType(blob, this.params[0], ["Object", "String"], {allowNullish: true});
		if(getType(param0)==="String") {
			const param1=await resolveType(blob, this.params[1], "Object", {allowNullish: true});
			return Object.assign({
				encoding,
				path: param0
			}, options, param1);
		} else {
			return Object.assign({
				encoding,
				path: assertType(blob, "String")
			}, options, param0);
		}
	}

	/**
	 * The path should always be in <code>this.params[0]</code>.
	 * @param {DataBlob} blob
	 * @returns {string}
	 * @throws {Error}
	 */
	async _getWritePath(blob) {
		return resolveType(blob, this.params[0], "String");
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * The path should always be in <code>this.params[0]</code>.
	 * Options may optionally be in <code>this.params[1]</code>
	 * @param {DataBlob} blob
	 * @param {Encoding} encoding
	 * @param {uint} mode
	 * @param {...*} options
	 * @returns {{path:string, encoding:string, ...*}}
	 * @throws {Error}
	 */
	async _getWritePathAndOptions(blob, {
		encoding="utf8",
		mode=0o666,
		...options
	}={}) {
		const path=await resolveType(blob, this.params[0], "String"),
			overrides=await resolveType(blob, this.params[1], "Object", {allowNullish: true});
		return Object.assign({
			encoding,
			mode,
			path
		}, options, overrides);
	}
}

module.exports={
	ModuleIO
};
