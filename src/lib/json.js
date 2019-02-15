/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleIO}=require("./_io");
const file=require("../common/file");

/**
 * @typedef {ModuleIO} ModuleJson
 */
class ModuleJson extends ModuleIO {
	/**
	 * Parses <param>data</param>
	 * @param {string|Buffer} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async parse(data) {
		this._assertType(data, ["String", "Buffer"]);
		return JSON.parse(data.toString("utf8"));
	}

	/**
	 * Reads and parses specified json or yaml file. The path may either be specified as input data or param data:
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.param[0]</data> will be used as the path
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async read(data) {
		const path=this._getReadPath(data);
		return file.readToJSON(path);
	}

	/**
	 * Converts object to JSON encoded string.
	 * - <code>this.param[0]</code> may be used to specify options: {{compact:boolean}}
	 * @param {Object} data
	 * @returns {Promise<void>}
	 * @throws {Error} if not JSON object
	 */
	async stringify(data) {
		this._assertJson(data);
		if(_.get(this.params[0], "compact", true)) {
			return JSON.stringify(data);
		} else {
			return JSON.stringify(data, null, "\t");
		}
	}

	/**
	 * Writes data to file
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if path cannot be found
	 */
	async write(data) {
		const path=this._getWritePath();
		await file.writeJSON({
			async: true,
			data: data,
			uri: path
		});
		return data;
	}
}

module.exports={
	ModuleJson
};
