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
	 * Gets value at property path
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async get(data) {
		this._assertJson(data);
		return (this.params.length>0)
			? _.get(data, this.params[0])
			: data;
	}

	/**
	 * Merges param data in <code>params[0]</code> into <param>data</param>
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async merge(data) {
		let merge=this.params[0];
		if(_.isString(merge)) {
			merge=JSON.parse(merge);
		} else {
			this._assertJson(merge);
		}
		return _.merge(data, merge);
	}

	/**
	 * Parses the input parameter
	 * @param {*} data
	 * @returns {Promise<DataBlob>}
	 */
	async parse(data) {
		return (_.isString(data) || Buffer.isBuffer(data))
			? JSON.parse(data.toString("utf8"))
			: data;
	}

	/**
	 * Sets the path stored in <code>param[0]</code> on <param>data</param> with <code>param[1]</code>
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async set(data) {
		const path=this.params[0],
			value=this.params[1];
		return _.set(data, path, value);
	}

	/**
	 * Reads and parses specified json or yaml file. The path may either be specified as input data or param data:
	 *  - if <code>this.param[0]</code> is not empty then it will be used as the path
	 *  - if <code>this.param[0]</data> is empty then <param>data</param> will be used as the path
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 */
	async read(data) {
		const path=this._getReadPath(data);
		return file.readToJSON(path);
	}

	/**
	 * Writes data to path
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
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

	/**************** Private Interface ****************/
	/**
	 * We always want this to be parsed.
	 * @param {*} data
	 * @returns {DataBlob}
	 * @private
	 */
	_preprocessChunk(data) {
		if(_.isString(data)) {
			return JSON.parse(data);
		} else if(Buffer.isBuffer(data)) {
			return JSON.parse(data.toString("utf8"));
		}
		return data;
	}
}

module.exports={
	ModuleJson
};
