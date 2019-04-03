/**
 * User: curtis
 * Date: 2019-02-21
 * Time: 9:05 PM
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const fs=require("fs-extra");
const jsyaml=require("js-yaml");
const {assertType}=require("./_data");
const {ModuleIO}=require("./_io");

/**
 * @typedef {ModuleIO} ModuleYaml
 */
class ModuleYaml extends ModuleIO {
	/**
	 * Parses <param>data</param>
	 * @param {string|Buffer} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async parse(data) {
		assertType(data, ["String", "Buffer"]);
		return jsyaml.load(data.toString("utf8"));
	}

	/**
	 * Reads and parses specified yaml encoded file. The path may either be specified as input data or param data:
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async read(data) {
		const path=await this._getReadPath(data);
		return fs.readFile(path, {encoding: "utf8"})
			.then(jsyaml.load.bind(jsyaml));
	}

	/**
	 * Converts object to YAML encoded string.
	 * @resolves source:Object in data
	 * @resolves options:{compact=false, sort=false} in this.params[0]
	 * @param {Object} data
	 * @returns {Promise<void>}
	 * @throws {Error} if not JSON object
	 */
	async stringify(data) {
		return jsyaml.dump(data, {
			sortKeys: _.get(this.params[0], "sort", false)
		});
	}

	/**
	 * Writes data to file in YAML format. See resolution rules at <link>_getWritePath</link>
	 * Note: the data should either be YAML encoded as a string or be anything but a string.
	 * @param {*} data - whatever this guy is it will attempt to be YAML'ified if it is not a string.
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if path cannot be found
	 */
	async write(data) {
		const path=await this._getWritePath(data),
			encoded=(typeof (data)==="string")
				? data
				: jsyaml.dump(data);
		await fs.outputFile(path, encoded, {
			encoding: "utf8"
		});
		return data;
	}
}

module.exports={
	ModuleYaml
};
