/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 00:17
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const string=require("../common/parse");
const util=require("../common/util");

/**
 * @typedef {ModuleBase} ModuleStd
 */
class ModuleString extends ModuleBase {
	/**
	 * Parses string to array using specified method in param[0]. Defaults to "white":
	 * @supported {"delimiter"|"newline"|"shell"|"white"}
	 * @param {string} data
	 * @returns {Promise<DataBlob>}
	 */
	async split(data) {
		if(data==null) {
			return [];
		} else if(!_.isString(data)) {
			throw new Error(`expecting string but found ${util.name(data)}`);
		} else {
			const method=_.get(this.params, "0", "white");
			switch(method) {
				case "delimiter": {
					const delimiter=_.get(this.params, "1", "\\s*,\\s*"),
						regex=new RegExp(delimiter);
					return data.split(regex);
				}
				case "newline": {
					return data.split(/\s*\n\s*/);
				}
				case "shell": {
					return string.shell(data);
				}
				case "white":
				default: {
					return data.split(/\s+/);
				}
			}
		}
	}
}

module.exports={
	ModuleString
};
