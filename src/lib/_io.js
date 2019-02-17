/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const util=require("../common/util");

/**
 * He's an extension of ModuleBase with some protected members for helping deal with and
 * keep file path consistency
 * @typedef {ModuleBase} ModuleIO
 */
class ModuleIO extends ModuleBase {
	/**
	 * Asserts that the path is a string type
	 * @param {*} value
	 * @throws {Error}
	 * @protected
	 */
	_assetPath(value) {
		if(_.isString(value)===false) {
			throw new Error(`expecting string as file-path but found ${util.name(value)}`);
		}
	}

	/**
	 * Finds the path as per the following rules
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.params[0]</data> will be used as the path
	 * @resolves path:string in data|this.params[0]
	 * @param {string|undefined} data
	 * @returns {string}
	 * @throws {Error}
	 * @protected
	 */
	_getReadPath(data) {
		const path=(data)
			? data
			: this.params[0];
		this._assetPath(path);
		return path;
	}

	/**
	 * Finds the path as per the following rules
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.params[0]</data> will be used as the path
	 * @resolves path:string in data|this.params[0]
	 * @resolves options:(Object|undefined) in this.params[0]|this.params[1]
	 * @param {string|undefined} data
	 * @param {Object} defaults
	 * @returns {{path:string, encoding:string, ...options}}
	 * @throws {Error}
	 * @protected
	 */
	_getReadPathAndOptions(data, defaults={
		encoding: "utf8"
	}) {
		let result;
		if(data) {
			result=Object.assign({
				path: data
			}, this.params[0] || defaults);
		} else {
			result=Object.assign({
				path: this.params[0]
			}, this.params[1] || defaults);
		}
		this._assetPath(result.path);
		return result;
	}

	/**
	 * Writes data to path that should be in <code>this.params[0]</code>.
	 * @returns {string}
	 * @throws {Error}
	 */
	_getWritePath() {
		const path=this.params[0];
		this._assetPath(path);
		return path;
	}

	/**
	 * Writes data to path that should be in <code>this.params[0]</code>.
	 * Write options may optionally be in <code>this.params[1]</code>
	 * @param {Object} defaults
	 * @returns {{path:string, encoding:string, ...options}}
	 * @throws {Error}
	 */
	_getWritePathAndOptions(defaults={
		encoding: "utf8"
	}) {
		const result=Object.assign({
			path: this.params[0]
		}, this.params[1] || defaults);
		this._assetPath(result.path);
		return result;
	}
}

module.exports={
	ModuleIO
};
