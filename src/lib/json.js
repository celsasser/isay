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
 * @typedef {ModuleBase} ModuleJson
 */
class ModuleJson extends ModuleBase {
	/**
	 * Gets value at property path
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 */
	async get({data}) {
		return {
			data: (this.params.length>0)
				? _.get(data, this.params[0])
				: data,
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
		const loaded=await file.readToJSON(this.params[0]);
		return {
			data: _.merge(data, loaded),
			encoding: "object"
		};
	}

	/**
	 * Parses the input parameter
	 * @param {*} data
	 * @returns {Promise<DataBlob>}
	 */
	async parse({data}) {
		return {
			data: this._ensureJson(this.params[0]),
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
			value=this._ensureJson(this.params[1]);
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
	 * Parses the object if it is not already in a legitimate JSON encoding
	 * @param {*} value
	 * @returns {Object|number}
	 * @private
	 */
	_ensureJson(value) {
		return (_.isString(value) || Buffer.isBuffer(value))
			? JSON.parse(value.toString())
			: value;
	}

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
	ModuleJson
};
