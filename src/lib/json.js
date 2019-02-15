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
	 * @resolves path:string in data|this.params[0]
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
	 * @resolves source:Object in data
	 * @resolves options:{compact=false} in this.params[0]
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
	 * @resolves data:Object in data
	 * @resolves path:string in this.params[0]
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
