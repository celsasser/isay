/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 00:17
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {assertType}=require("./_data");
const {
	formatMouseSpecification,
	unformatMouseSpecification
}=require("./_format");
const string=require("../common/parse");

/**
 * @typedef {ModuleBase} ModuleString
 */
class ModuleString extends ModuleBase {
	/**
	 * Formats the data in <param>blob<param>. We are using a somewhat hybrid approach to formatting. It's a little
	 * sprintf, it's a little es6 template and it's a little custom. See <code>formatMouseSpecification</code> for more information.
	 * @param {DataBlob} blob
	 * @return {Promise<string>}
	 * @throws {Error}
	 */
	async format(blob) {
		assertType(blob, ["Array", "Object"]);
		assertType(this.params[0], "String");
		return formatMouseSpecification(this.params[0], blob);
	}

	/**
	 * Replaces <code>params[0]</code> with <code>params[1]</code>. If <code>params[0]</code> is a string then this guy
	 * is going to make an assumption and apply it globally.
	 * @param {string} blob - string to be replaced
	 * @returns {Promise<string>}
	 * @throws {Error}
	 */
	async replace(blob) {
		if(blob!=null) {
			let search=this.params[0],
				replace=this.params[1];
			assertType(blob, "String");
			assertType(search, ["RegExp", "String"]);
			assertType(replace, ["String"]);
			if(search.constructor.name!=="RegExp") {
				search=new RegExp(search, "g");
			}
			blob=blob.replace(search, replace);
		}
		return blob;
	}

	/**
	 * Parses string to array using specified method in this.params[0]
	 * @resolves method:string in this.params[0]. Defaults to "white"
	 * @supported {"delimiter"|"newline"|"shell"|"white"|RegExp}
	 * @param {string} blob
	 * @returns {Promise<string>}
	 * @throws {Error}
	 */
	async split(blob) {
		if(blob==null) {
			return [];
		} else {
			assertType(blob, "String");
			const argument=_.get(this.params, "0", {method: "white"});
			if(argument.constructor.name==="String") {
				return blob.split(argument);
			} else if(argument.constructor.name==="RegExp") {
				// we consider two possibilities here:
				// 1. they want to split on regex matches
				// 2. they want the split to be capture groups
				// So, if we find capture groups then we assume the latter, otherwise we split on the pattern
				if(/[^\\]\(.+?[^\\]\)/.test(argument.source)) {
					const match=blob.match(argument) || [];
					return match.slice(1);
				} else {
					return blob.split(argument);
				}
			} else {
				assertType(argument, "Object");
				switch(argument.method) {
					case "delimiter": {
						const delimiter=_.get(argument, "delimiter", "\\s*,\\s*"),
							regex=new RegExp(delimiter);
						return blob.split(regex);
					}
					case "newline": {
						const result=blob.split(/\s*\n\s*/);
						if(_.last(result)==="") {
							// What are we doing here? It's an executive decision that we may back out of. The reason is because function such as
							// "ls", "find" all return with a trailing newline which when parsed will result in an empty line. And split
							// includes an empty trailing line. I think it's safe to assume that we never want it.
							result.pop();
						}
						return result;
					}
					case "shell": {
						return string.shell(blob);
					}
					case "unformat": {
						assertType(argument.format, "String");
						return unformatMouseSpecification(argument.format, blob);
					}
					case "white":
					default: {
						return blob.split(/\s+/);
					}
				}
			}
		}
	}

	/**
	 * Converts text to lower case
	 * @param {string} blob
	 * @returns {Promise<string>}
	 */
	async lower(blob) {
		assertType(blob, "String");
		return blob.toLowerCase();
	}

	/**
	 * Converts text to upper case
	 * @param {string} blob
	 * @returns {Promise<string>}
	 */
	async upper(blob) {
		assertType(blob, "String");
		return blob.toUpperCase();
	}
}

module.exports={
	ModuleString
};
