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
	 * Finds the path as per the following rules
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.param[0]</data> will be used as the path
	 *  Encoding data may be specified in either <code>this.param[0]</code> or <code>this.param[1]</code>
	 *  depending in where the path is specified
	 * @param {string|undefined} data
	 * @returns {string}
	 * @protected
	 */
	_getReadPath(data) {
		const path=(data)
			? data
			: this.params[0];
		if(_.isString(path)===false) {
			throw new Error(`expecting string as file-path but found ${util.name(path)}`);
		}
		return path;
	}

	/**
	 * Finds the path as per the following rules
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.param[0]</data> will be used as the path
	 *  Encoding data may be specified in either <code>this.param[0]</code> or <code>this.param[1]</code>
	 *  depending in where the path is specified
	 * @param {string|undefined} data
	 * @param {string} defaultEncoding
	 * @returns {{path:string, encoding:string}}
	 * @protected
	 */
	_getReadPathAndEncoding(data, defaultEncoding="utf8") {
		let result;
		if(data) {
			result={
				path: data,
				encoding: this.params[0] || defaultEncoding
			};
		} else {
			result={
				path: this.params[0],
				encoding: this.params[1] || defaultEncoding
			};
		}
		if(_.isString(result.path)===false) {
			throw new Error(`expecting string as file-path but found ${util.name(result.path)}`);
		}
		return result;
	}

	/**
	 * Writes data to path that should be in <code>this.param[0]</code>.
	 * @returns {string}
	 */
	_getWritePath() {
		const path=this.params[0];
		if(_.isString(path)===false) {
			throw new Error(`expecting string as file-path but found ${util.name(path)}`);
		}
		return path;
	}

	/**
	 * Writes data to path that should be in <code>this.param[0]</code>.
	 * Encoding may optionally be in <code>this.param[1]</code>
	 * @returns {{path:string, encoding:string}}
	 */
	_getWritePathAndEncoding(defaultEncoding="utf8") {
		const result={
			path: this.params[0],
			encoding: this.params[1] || defaultEncoding
		};
		if(_.isString(result.path)===false) {
			throw new Error(`expecting string as file-path but found ${util.name(result.path)}`);
		}
		return result;
	}
}

module.exports={
	ModuleIO
};
