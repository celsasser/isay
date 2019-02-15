/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleIO}=require("./_io");

/**
 * @typedef {ModuleIO} ModuleObject
 */
class ModuleObject extends ModuleIO {
	/**
	 * Gets value at property path
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
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
	 * @throws {Error}
	 */
	async merge(data) {
		let merge=this.params[0];
		this._assertJson(merge);
		return _.merge(data, merge);
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

	/**************** Private Interface ****************/
	/**
	 * We always want this to be parsed.
	 * todo: I liked this when I started, but am not so crazy about the implied behavior
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
	ModuleObject
};
