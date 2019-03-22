/**
 * User: curtis
 * Date: 2019-03-20
 * Time: 22:40
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {assertType}=require("./_data");

/* eslint-disable no-inner-declarations */

/**
 * Formats the data in <param>blob<param>. We are using a somewhat hybrid approach to formatting. It's a little
 * sprintf, it's a little es6 template and it's a little custom.
 * The format spec is as follows: "${[path:][0][width][.precision]<l|r|c>}"
 * @param {string} spec
 * @param {Array|Object} data
 * @returns {string}
 */
function formatMouseSpecification(spec, data) {
	let match,
		result=spec;
	const regex=/(\$\\{)|(\${([^:]+?:)?([^1-9])?(\d+)?(\.\d+)?([lrc])})/g;
	for(let index=0; (match=regex.exec(result)); index++) {
		if(match[1]!==undefined) {
			result=`${result.substr(0, match.index)}$\{${result.substr(regex.lastIndex)}`;
		} else {
			/**
			 * @param {*} data
			 * @returns {string}
			 */
			function _format(data) {
				if(data===undefined) {
					return "undefined";
				} else if(data===null) {
					return "null";
				} else if(precision!==undefined) {
					assertType(data, "Number");
					return data.toFixed(precision);
				}
				return String(data);
			}

			/**
			 * @param {string} formatted
			 * @returns {string}
			 */
			function _pad(formatted) {
				if(width!==undefined) {
					switch(align) {
						case "l": {
							return _.padEnd(formatted, width, fill);
						}
						case "r": {
							return _.padStart(formatted, width, fill);
						}
						case "c": {
							return _.pad(formatted, width, fill);
						}
					}
				}
				return formatted;
			}

			let path=(match[3]!==undefined) ? match[3].substr(0, match[3].length-1) : index,
				fill=match[4] || " ",
				width=(match[5]!==undefined) ? Number(match[5]) : undefined,
				precision=(match[6]!==undefined) ? Number(match[6].substr(1)) : undefined,
				align=match[7],
				format=_.get(data, path);
			if(format===undefined) {
				throw new Error(`data[${path}] cannot be found`);
			} else {
				let formatted=_pad(_format(format));
				result=`${result.substr(0, match.index)}${formatted}${result.substr(regex.lastIndex)}`;
				regex.lastIndex=match.index+formatted.length;
			}
		}
	}
	return result;
}

module.exports={
	formatMouseSpecification
};
