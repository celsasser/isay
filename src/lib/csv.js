/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const stringify=require("csv-stringify");
const parse=require("csv-parse");
const fs=require("fs-extra");
const {ModuleIO}=require("./_io");
const {assertType, resolveType}=require("./_data");

/**
 * Some read and write support for CSV files
 * @typedef {ModuleIO} ModuleCsv
 */
class ModuleCsv extends ModuleIO {
	/**
	 * Parses input and returns csv. Overrides may exist in params[0] or params[1] depending on
	 * where the input path is specified.
	 * @resolves data:string in data
	 * @resolves options:(Object|undefined) in params[0]
	 * @param {string} blob
	 * @returns {Promise<CsvDoc>}
	 * @throws {Error}
	 */
	async parse(blob) {
		assertType(blob, "String");
		const options=await resolveType(blob, this.params[0], "Object", {allowNullish: true});
		return new Promise((resolve, reject)=>{
			parse(blob, {
				delimiter: _.get(options, "delimiter", ",")
			}, (error, parsed)=>{
				if(error) {
					reject(error);
				} else {
					resolve(parsed);
				}
			});
		});
	}

	/**
	 * Reads and parses specified csv file. See resolution rules at <link>_getReadPathAndOptions</link>
	 * @param {string|undefined} blob
	 * @returns {Promise<CsvDoc>}
	 * @throws {Error}
	 */
	async read(blob) {
		const {path, encoding}=await this._getReadPathAndOptions(blob);
		return fs.readFile(path, {encoding})
			.then(data=>this.parse(data));
	}

	/**
	 * Writes data to path. See resolution rules at <link>_getWritePathAndOptions</link>
	 * @param {CsvDoc} blob
	 * @returns {Promise<CsvDoc>}
	 * @throws {Error}
	 */
	async write(blob) {
		const {
			delimiter,
			encoding,
			mode,
			path
		}=await this._getWritePathAndOptions(blob, {delimiter: ","});
		return new Promise((resolve, reject)=>{
			stringify(blob, {delimiter}, (error, text)=>{
				if(error) {
					reject(error);
				} else {
					fs.outputFile(path, text, {encoding, mode})
						.then(resolve.bind(null, blob))
						.catch(reject);
				}
			});
		});
	}
}

module.exports={
	ModuleCsv
};
