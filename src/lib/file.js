/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const fs=require("fs-extra");
const {ModuleBase}=require("./base");
const util=require("../common/util");

/**
 * @typedef {ModuleBase} ModuleFile
 */
class ModuleFile extends ModuleBase {
	/**
	 * Reads path specified as either input data or param data:
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.param[0]</data> will be used as the path
	 *  Encoding data may be specified in either <code>this.param[0]</code> or <code>this.param[1]</code>
	 *  depending in where the path is specified
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 */
	async read(data) {
		let path, encoding;
		if(data) {
			path=data;
			encoding=this.params[0]||"utf8";
		} else {
			path=this.params[0];
			encoding=this.params[1]||"utf8";
		}
		if(_.isString(path)===false) {
			throw new Error(`expecting string as file-path but found ${util.name(path)}`);
		}
		return await fs.readFile(path, {encoding});
	}

	/**
	 * Writes data to path that should be in <code>this.param[0]</code>. Encoding may optionally
	 * be in <code>this.param[1]</code>
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async write(data) {
		const path=this.params[0],
			encoding=this.params[1]||"utf8";
		if(_.isString(path)===false) {
			throw new Error(`expecting string but found ${util.name(path)}`);
		}
		await fs.outputFile(path, data, {encoding});
		return data;
	}
}

module.exports={
	ModuleFile
};
