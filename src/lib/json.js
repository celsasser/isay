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
const {assertType, resolveType}=require("./_data");

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
		assertType(data, ["String", "Buffer"]);
		return JSON.parse(data.toString("utf8"));
	}

	/**
	 * Reads and parses specified json encoded file. See resolution rules at <link>_getReadPathAndOptions</link>
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async read(data) {
		const {path, encoding}=await this._getReadPathAndOptions(data, {
			encoding: "utf8"
		});
		return fs.readJSON(path, {encoding});
	}

	/**
	 * Converts object to JSON encoded string.
	 * @resolves source:Object in data
	 * @resolves options:{compact=false} in this.params[0]
	 * @param {string|Buffer} data
	 * @returns {Promise<void>}
	 * @throws {Error} if not JSON object
	 */
	async stringify(data) {
		const options=await resolveType(data, this.params[0], "Object", {allowNullish: true});
		if(_.get(options, "compact", true)) {
			return JSON.stringify(data);
		} else {
			return JSON.stringify(data, null, "\t");
		}
	}

	/**
	 * Writes data to file. See resolution rules at <link>_getWritePathAndOptions</link>
	 * Note: the data should either be JSON encoded as a string or be anything but a string.
	 * @param {*} data - whatever this guy is it will attempt to be JSON.stringify'ed if it is not a string.
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if path cannot be found
	 */
	async write(data) {
		const {encoding, path}=await this._getWritePathAndOptions(data);
		await file.writeJSON({
			async: true,
			data: data,
			encoding,
			uri: path
		});
		return data;
	}
}

module.exports={
	ModuleJson
};
