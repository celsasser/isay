/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const file=require("../common/file");

class JsonModule extends ModuleBase {
	constructor() {
		super();
		this._data={};
	}

	/**
	 * Gets value at property path
	 * @param {string} path
	 * @returns {*}
	 */
	get(path) {
		return _.get(this._data, path);
	}

	/**
	 * Loads and sets data to json or yaml file at path
	 * @param {string} path
	 */
	load(path) {
		this._data=file.readToJSON(path);
	}

	/**
	 * Merges json or yaml file at path into data
	 * @param path
	 */
	merge(path) {
		this._data=Object.assign(this._data, file.readToJSON(path));
	}

	/**
	 * Sets property path to data
	 * @param {string} path
	 * @param {string} data
	 */
	set(path, data) {
		this._data=_.set(this._data, path, JSON.parse(data));
	}
}

module.exports={
	JsonModule
};
