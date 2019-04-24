/**
 * Date: 2019-02-21
 * Time: 9:05 PM
 * @license MIT (see project's LICENSE file)
 */

const fs=require("fs-extra");
const jsyaml=require("js-yaml");
const {assertType, resolveType}=require("./_data");
const {ModuleIO}=require("./_io");

/**
 * @typedef {ModuleIO} ModuleYaml
 */
class ModuleYaml extends ModuleIO {
	/**
	 * Attempts to parse yaml encoding in <param>data</param>
	 * @param {string|Buffer} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async parse(blob) {
		assertType(blob, ["String", "Buffer"]);
		return jsyaml.load(blob.toString("utf8"));
	}

	/**
	 * Reads and parses specified yaml encoded file. See resolution rules at <link>_getReadPath</link>
	 * @param {string} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async read(blob) {
		const {encoding, path}=await this._getReadPathAndOptions(blob);
		return fs.readFile(path, {encoding})
			.then(jsyaml.load.bind(jsyaml));
	}

	/**
	 * Converts object to YAML encoded string.
	 * @resolves source:Object in data
	 * @resolves options:{compact=false, sort=false} in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 * @throws {Error} if not JSON object
	 */
	async stringify(blob) {
		const {
			indent=2,
			lineWidth=-1,
			sort=false
		}=await resolveType(blob, this.params[0], "Object", {defaultUndefined: {}});
		return jsyaml.dump(blob, {
			indent,
			lineWidth,
			sortKeys: sort
		});
	}

	/**
	 * Writes data to file in YAML format. See resolution rules at <link>_getWritePath</link>
	 * Note: the data should either be YAML encoded as a string or be anything but a string.
	 * @param {*} blob - whatever this guy is it will attempt to be YAML'ified if it is not a string.
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if path cannot be found
	 */
	async write(blob) {
		let encoded;
		const {
			encoding, mode, path,
			indent=2,
			lineWidth=-1,
			sort=false
		}=await this._getWritePathAndOptions(blob);
		if(typeof(blob)==="string") {
			encoded=blob;
		} else {
			encoded=jsyaml.dump(blob, {
				indent,
				lineWidth,
				sortKeys: sort
			});
		}
		return fs.outputFile(path, encoded, {encoding, mode})
			.then(Promise.resolve.bind(Promise, blob));
	}
}

module.exports={
	ModuleYaml
};
