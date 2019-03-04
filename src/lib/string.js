/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 00:17
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const string=require("../common/parse");

/**
 * @typedef {ModuleBase} ModuleStd
 */
class ModuleString extends ModuleBase {
	/**
	 * Replaces <code>params[0]</code> with <code>params[1]</code>. If <code>params[0]</code> then this guy is
	 * going to apply it globally
	 * @param {string} data - string to be replaced
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async replace(data) {
		if(data!=null) {
			let search=this.params[0],
				replace=this.params[1];
			this._assertType(data, "String");
			this._assertType(search, ["RegExp", "String"], {allowNull: false});
			this._assertType(replace, ["String"], {allowNull: false});
			if(search.constructor.name!=="RegExp") {
				search=new RegExp(search, "g");
			}
			data=data.replace(search, replace);
		}
		return data;
	}

	/**
	 * Parses string to array using specified method in this.params[0]
	 * @resolves method:string in this.params[0]. Defaults to "white"
	 * @supported {"delimiter"|"newline"|"shell"|"white"|RegExp}
	 * @param {string} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async split(data) {
		if(data==null) {
			return [];
		} else {
			this._assertType(data, "String");
			const method=_.get(this.params, "0", "white");
			if(method.constructor.name==="RegExp") {
				return data.split(method);
			} else {
				switch(method) {
					case "delimiter": {
						const delimiter=_.get(this.params, "1", "\\s*,\\s*"),
							regex=new RegExp(delimiter);
						return data.split(regex);
					}
					case "newline": {
						const result=data.split(/\s*\n\s*/);
						if(_.last(result)==="") {
							// What are we doing here? It's an executive decision that we may back out of. The reason is because function such as
							// "ls", "find" all return with a trailing newline which when parsed will result in an empty line. And split
							// includes an empty trailing line. I think it's safe to assume that we never want it.
							result.pop();
						}
						return result;
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
}

module.exports={
	ModuleString
};
