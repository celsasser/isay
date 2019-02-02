/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./base");
const file=require("../common/file");

/**
 * @typedef {ModuleBase} JsonModule
 */
class JsonModule extends ModuleBase {
	/**
	 * Gets value at property path
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async get({data}) {
		const path=this.params[0];
		return {
			data: _.get(data, path),
			encoding: "object"
		};
	}

	/**
	 * Loads and sets data to json or yaml file at path
	 * @returns {Promise<DataBlob>}
	 */
	async load() {
		const path=this.params[0],
			data=await file.readToJSON(path);
		return {
			data,
			encoding: "object"
		};
	}

	/**
	 * Merges json or yaml file at path into data
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async merge({data}) {
		const path=this.params[0],
			loaded=await file.readToJSON(path);
		return {
			data: _.merge(data, loaded),
			encoding: "object"
		};
	}

	/**
	 * Sets property path to data
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async set({data}) {
		const path=this.params[0],
			value=this.params[1];
		return {
			data: _.set(data, path, value),
			encoding: "object"
		};
	}

	/**
	 * Writes data to path
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async write({data}) {
		const path=this.params[0];
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
	 * @param {string} encoding
	 * @returns {DataBlob}
	 * @private
	 */
	_preprocessChunk({data, encoding}) {
		if(_.isString(data)) {
			data=JSON.stringify(data);
			encoding="object";
		} else if(Buffer.isBuffer(encoding)) {
			data=JSON.stringify(data.toString("utf8"));
			encoding="object";
		}
		return {data, encoding};
	}
}

module.exports={
	JsonModule
};
