/**
 * Date: 2019-02-05
 * Time: 00:17
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {
	assertType,
	resolveType
}=require("./_data");
const {formatMouseSpecification}=require("./_format");
const {unformatMouseSpecification}=require("./_unformat");
const string=require("../common/parse");

/**
 * String manipulation
 * @typedef {ModuleBase} ModuleString
 */
class ModuleString extends ModuleBase {
	/**
	 * Formats the data in <param>blob<param>. We are using a somewhat hybrid approach to formatting. It's a little
	 * sprintf, it's a little es6 template and it's a little custom. See <code>formatMouseSpecification</code> for more information.
	 * @resolves spec:string in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<string>}
	 * @throws {Error}
	 */
	async format(blob) {
		assertType(blob, ["Array", "Object"]);
		const format=await resolveType(blob, this.params[0], "String");
		return formatMouseSpecification(format, blob);
	}

	/**
	 * Replaces text.
	 * @resolves searchText:(string|RegExp) in this.params[0]
	 * @resolves replaceText:string in this.params[1]
	 * Note: If <code>params[0]</code> is a string then we make an assumption and replace "searchText" globally.
	 * @param {string} blob - string to be replaced
	 * @returns {Promise<string>}
	 * @throws {Error}
	 */
	async replace(blob) {
		if(blob==null) {
			return blob;
		} else {
			assertType(blob, "String");
			let search=await resolveType(blob, this.params[0], ["RegExp", "String"]),
				replace=await resolveType(blob, this.params[1], "String");
			if(search.constructor.name!=="RegExp") {
				search=new RegExp(search, "g");
			}
			return blob.replace(search, replace);
		}
	}

	/**
	 * Parses and splits string into an array
	 * @resolves method:(Object|RegExp|string|undefined) in this.params[0]. Defaults to "white"
	 * @supported {"delimiter"|"format"|"newline"|"shell"|"white"|RegExp}
	 * @param {string} blob
	 * @returns {Promise<string>}
	 * @throws {Error}
	 */
	async split(blob) {
		if(blob==null) {
			return [];
		} else {
			assertType(blob, "String");
			const argument=(this.params.length>0)
				? await resolveType(blob, this.params[0], ["Object", "RegExp", "String"])
				: {method: "white"};
			if(argument.constructor.name==="String") {
				return blob.split(argument);
			} else if(argument.constructor.name==="RegExp") {
				return this._splitByRegex(blob, argument);
			} else {
				return this._splitByMethod(blob, argument);
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

	/**************** Private Interface ****************/
	/**
	 * We are being asked to spit by one of the methods we support. Figure out which one it is and apply it.
	 * @param {string} blob
	 * @param {Object} spec
	 * @returns {string}
	 * @throws {Error}
	 * @private
	 */
	_splitByMethod(blob, spec) {
		/**
		 * Most methods can be uniquely identified by their properties in which case we let the method slip
		 * @type {string}
		 */
		const method=(()=>{
			if(spec.method) {
				return spec.method;
			} else if(spec.hasOwnProperty("delimiter")) {
				return "delimiter";
			} else if(spec.hasOwnProperty("format")) {
				return "format";
			}
			throw new Error(`unsupported configuration ${JSON.stringify(spec)}`);
		})();
		switch(method) {
			case "delimiter": {
				const delimiter=assertType(_.get(spec, "delimiter", /\s*,\s*/), ["RegExp", "String"]);
				return blob.split(delimiter);
			}
			case "format": {
				assertType(spec.format, "String");
				return unformatMouseSpecification(spec.format, blob);
			}
			case "newline": {
				const result=blob.split(/\s*\n\s*/);
				if(_.last(result)==="") {
					// What are we doing here? We are trimming off the trailing empty string included when a string is
					// terminated with "\n". Is it right? Yes and no. My decision is motivated by our integration and
					// focus on OS commands. "ls", "find" and friends all return with a trailing newline which when
					// parsed will result in an empty line. I think it's safe to assume that we never want it.
					// In conclusion - it's an executive decision that we may back out of.
					result.pop();
				}
				return result;
			}
			case "shell": {
				return string.shell(blob);
			}
			case "white":
			default: {
				return blob.split(/\s+/);
			}
		}
	}

	/**
	 * Splits string using regular expressions. It splits in one of two ways:
	 * 1. by regular expression matches
	 * 2. by regular expression capture groups
	 * @param {string} blob
	 * @param {RegExp} regex
	 * @returns {DataBlob}
	 * @private
	 */
	_splitByRegex(blob, regex) {
		// if we find capture groups then we assume method #2 (see javadoc header), otherwise the pattern.
		if(/[^\\]\(.+?[^\\]\)/.test(regex.source)) {
			// method #2 - they want the split to be matched capture groups
			const match=blob.match(regex) || [];
			return match.slice(1);
		} else {
			// method #1 - they want to split on regex matches
			return blob.split(regex);
		}
	}
}

module.exports={
	ModuleString
};
