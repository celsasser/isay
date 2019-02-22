/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const fs=require("fs-extra");
const file=require("../common/file");
const {ModuleIO}=require("./_io");

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
	 * Reads and parses specified json encoded file. The path may either be specified as input data or param data:
	 * @resolves path:string in data|this.params[0]
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async read(data) {
		const path=this._getReadPath(data);
		return fs.readJSON(path, {encoding: "utf8"});
	}

	/**
	 * Converts object to JSON encoded string.
	 * @resolves source:Object in data
	 * @resolves options:{compact=false} in this.params[0]
	 * @param {*} data
	 * @returns {Promise<void>}
	 * @throws {Error} if not JSON object
	 */
	async stringify(data) {
		if(_.get(this.params[0], "compact", true)) {
			return JSON.stringify(data);
		} else {
			return JSON.stringify(data, null, "\t");
		}
	}

	/**
	 * Writes data to file
	 * Note: the data should either be JSON encoded as a string or be anything but a string.
	 * @resolves data:Object in data
	 * @resolves path:string in this.params[0]
	 * @param {*} data - whatever this guy is it will attempt to be JSON.stringify'ed if it is not a string.
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
