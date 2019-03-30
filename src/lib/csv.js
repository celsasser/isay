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
const {ensureJson}=require("./_data");

/**
 * Some read and write support for CSV files
 * @typedef {ModuleIO} ModuleCsv
 */
class ModuleCsv extends ModuleIO {
	/**
	 * Parses input and returns csv. Overrides may exist in params[0] or params[1] depending on
	 * where the input path is specified.
	 * @param {string} data
	 * @returns {Promise<CsvDoc>}
	 * @throws {Error}
	 */
	async parse(data) {
		const options=(data)
			? ensureJson(this.params[0])
			: ensureJson(this.params[1]);
		return new Promise((resolve, reject)=>{
			parse(data, {
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
	 * Reads and parses specified csv file. The path may either be specified as input data or param data:
	 * @resolves path:string in data|this.params[0]
	 * @param {string|undefined} data
	 * @returns {Promise<CsvDoc>}
	 * @throws {Error}
	 */
	async read(data) {
		const path=await this._getReadPath(data);
		return fs.readFile(path, {encoding: "utf8"})
			.then(data=>this.parse(data));
	}

	/**
	 * Writes data to path
	 * @resolves path:string in this.params[0]
	 * @resolves options:(undefined|Object) in this.params[1]
	 * @param {CsvDoc} data
	 * @returns {Promise<CsvDoc>}
	 * @throws {Error}
	 */
	async write(data) {
		const path=await this._getWritePath(data),
			options=ensureJson(this.params[1]);
		return new Promise((resolve, reject)=>{
			stringify(data, {
				delimiter: _.get(options, "delimiter", ",")
			}, (error, text)=>{
				if(error) {
					reject(error);
				} else {
					fs.outputFile(path, text, {encoding: "utf8"})
						.then(resolve.bind(null, data))
						.catch(reject);
				}
			});
		});
	}
}

module.exports={
	ModuleCsv
};
