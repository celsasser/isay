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

/**
 * Some read and write support for CSV files
 * @typedef {ModuleIO} ModuleCsv
 */
class ModuleCsv extends ModuleIO {
	/**
	 * Parses input and returns csv. Overrides may exist in param[0] or param[1] depending on
	 * where the input path is specified.
	 * @param {string} data
	 * @returns {Promise<CsvDoc>}
	 */
	async parse(data) {
		const options=(data)
			? this._ensureJson(this.params[0])
			: this._ensureJson(this.params[1]);
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
	 *  - if <code>this.param[0]</code> is not empty then it will be used as the path
	 *  - if <code>this.param[0]</data> is empty then <param>data</param> will be used as the path
	 * @param {string|undefined} data
	 * @returns {Promise<CsvDoc>}
	 */
	async read(data) {
		const path=this._getReadPath(data);
		return fs.readFile(path, {encoding: "utf8"})
			.then(data=>this.parse(data));
	}

	/**
	 * Writes data to path that should be in <code>this.param[0]</code>. Options may optionally
	 * be in <code>this.param[1]</code>
	 * @param {CsvDoc} data
	 * @returns {Promise<CsvDoc>}
	 */
	async write(data) {
		const path=this._getWritePath(),
			options=this._ensureJson(this.params[1]);
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
