/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
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
	 *  - if <code>params[0]</code> is not empty then it will be used as the path
	 *  - if <code>params[0]</code> is empty then <code>data</data> will be used as the path
	 * @resolves path:string in data|this.params[0]
	 * @param {string|undefined} blob
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

	/**
	 * Finds the path and options. params get priority but will defer to <param>blob</param> if it cannot find the path in params.
	 * @resolves path:string in data|this.params[0]
	 * @resolves options:(Object|undefined) in this.params[0]|this.params[1]
	 * @param {string|undefined} blob
	 * @param {Object} defaults
	 * @returns {{path:string, encoding:string}} - will include whatever other options are discovered
	 * @throws {Error}
	 * @protected
	 */
	async _getReadPathAndOptions(blob, defaults={
		encoding: "utf8"
	}) {
		// we are going to assume it is in param[0] and adjust course if we need to.
		const param0=await resolveType(blob, this.params[0], ["Object", "String"], {allowAll: true});
		if(getType(param0)==="String") {
			return Object.assign({
				path: param0
			}, defaults, this.params[1]);
		} else {
			return Object.assign({
				path: assertType(blob, "String")
			}, defaults, param0);
		}
	}

	/**
	 * Writes data to path that should be in <code>this.params[0]</code>.
	 * @param {DataBlob} blob
	 * @returns {string}
	 * @throws {Error}
	 */
	async _getWritePath(blob) {
		return resolveType(blob, this.params[0], "String");
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Writes data to path that should be in <code>this.params[0]</code>.
	 * Write options may optionally be in <code>this.params[1]</code>
	 * @param {DataBlob} blob
	 * @param {Object} defaults
	 * @returns {{path:string, encoding:string, ...options}}
	 * @throws {Error}
	 */
	async _getWritePathAndOptions(blob, defaults={
		encoding: "utf8"
	}) {
		return Object.assign({
			path: await resolveType(blob, this.params[0], "String")
		}, defaults, this.params[1]);
	}
}

module.exports={
	ModuleIO
};
