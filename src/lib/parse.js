/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 00:17
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./base");
const log=require("../common/log");
const parse=require("../common/parse");
const util=require("../common/util");

/**
 * @typedef {ModuleBase} ModuleStd
 */
class ModuleParse extends ModuleBase {
	/**
	 * Parses string to array using specified method in param[0]. Defaults to "white":
	 * @supported {"delimiter"|"newline"|"shell"|"white"}
	 * @param {Object} data
	 * @param {string} encoding
	 * @returns {Promise<DataBlob>}
	 */
	async split({data, encoding}) {
		if(data==null) {
			return {
				data: [],
				encoding: "object"
			};
		} else if(!_.isString(data)) {
			log.warn(`parse.split - expecting string but found type=${util.name(data)}`);
			return {
				data: [],
				encoding: "object"
			};
		} else {
			const method=_.get(this.params, "0", "white");
			switch(method) {
				case "delimiter": {
					const delimiter=_.get(this.params, "1", "\\s*,\\s*"),
						regex=new RegExp(delimiter);
					return {
						data: data.split(regex),
						encoding: "object"
					};
				}
				case "newline": {
					return {
						data: data.split(/\s*\n\s*/),
						encoding: "object"
					};
				}
				case "shell": {
					return {
						data: parse.shell(data),
						encoding: "object"
					};
				}
				case "white":
				default: {
					return {
						data: data.split(/\s+/),
						encoding: "object"
					};
				}
			}
		}
	}
}

module.exports={
	ModuleParse
};
