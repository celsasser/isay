/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
const {ModuleIO}=require("./_io");

/**
 * read and write file support for any and all data types
 * @typedef {ModuleIO} ModuleFile
 */
class ModuleFile extends ModuleIO {
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
		const {path, encoding}=this._getReadPathAndEncoding(data);
		return await fs.readFile(path, {encoding});
	}

	/**
	 * Writes data to path that should be in <code>this.param[0]</code>. Encoding may optionally
	 * be in <code>this.param[1]</code>
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async write(data) {
		const {encoding, path}=this._getWritePathAndEncoding();
		await fs.outputFile(path, data, {encoding});
		return data;
	}
}

module.exports={
	ModuleFile
};
