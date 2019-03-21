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
	for(let index=0; (match=regex.exec(spec)); index++) {
		if(match[1]!==undefined) {
			result=`${result.substr(0, regex.lastIndex)}$\{${result.substr(regex.lastIndex+match[1].length)}`;
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
							return _.padStart(fill, width, formatted);
						}
						case "r": {
							return _.padEnd(fill, width, formatted);
						}
						case "c": {
							return _.pad(fill, width, formatted);
						}
					}
				}
				return formatted;
			}

			let path=(match[2]!==undefined) ? match[2].substr(0, match[2].length-1) : index,
				fill=match[3] || " ",
				width=(match[4]!==undefined) ? Number(match[4]) : undefined,
				precision=(match[5]!==undefined) ? Number(match[5].substr(1)) : undefined,
				align=match[6],
				formatted=_pad(_format(_.get(data, path)));
			result=`${result.substr(0, regex.lastIndex)}${formatted}${result.substr(regex.lastIndex+match[0].length)}`;
		}
	}
	return result;
}

module.exports={
	formatMouseSpecification
};
