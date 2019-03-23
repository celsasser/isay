/**
 * User: curtis
 * Date: 2019-03-20
 * Time: 22:40
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {assertType}=require("./_data");
const log=require("../common/log");

/* eslint-disable no-inner-declarations */

/**
 * Formats the data in <param>blob<param>. We are using a somewhat hybrid approach to formatting. It's a little
 * sprintf, it's a little es6 template and it's a little custom.
 * The format spec is as follows: "${[path:][0][width][.precision]<l|r|c>}"
 * @param {string} format
 * @param {Array|Object} data
 * @returns {string}
 */
function formatMouseSpecification(format, data) {
	let result=format;
	const regex=/(\$\\{)|(\${([^:]+?:)?([^1-9])?(\d+)?(\.\d+)?([lrc])})/g;
	for(let match, index=0; (match=regex.exec(result)); index++) {
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

/**
 * Disassembles what could have been put together by formatMouseSpecification. But everything it does is not 100%
 * dissectable without ambiguity. If width is included then all is fine. If not....then there are some potential gray areas.
 * The format spec is as follows: "${[path:][0][width][.precision]<l|r|c>}"
 * @param {string} format
 * @param {string} encoded
 * @param {boolean} exceptionOnMismatch - can't see value in partial matches but leaving wiggle room.
 * @returns {Array<string>}
 */
function unformatMouseSpecification(format, encoded, {
	exceptionOnMismatch=true
}={}) {
	/**
	 * Finds fields specifiers in <param>format</param> and returns them in order of appearance
	 * @returns {Object}
	 */
	function _getFieldSpecifiers() {
		let result=[];
		const matches=[],
			regex=/(\${([^:]+?:)?([^1-9])?(\d+)?(\.\d+)?([lrc])})/g;
		for(let match, index=0; (match=regex.exec(format)); index++) {
			let parsed={
				specEndIndex: regex.lastIndex,
				specStartIndex: match.index,
				path: (match[2]!==undefined) ? match[2].substr(0, match[2].length-1) : index,
				fill: match[3] || " ",
				width: (match[4]!==undefined) ? Number(match[4]) : undefined,
				precision: (match[5]!==undefined) ? Number(match[5].substr(1)) : undefined,
				align: match[6]
			};
			matches.push(parsed);
			// here we make adjustments to the result type. If any of the params are non-integers then we assume
			// that they want to resulting type to be an object
			if(/^\d+$/.test(parsed.path)===false) {
				result={};
			}
		}
		return {
			matches,
			result
		};
	}

	/**
	 * What do we want to do here? I don't think we can assume anything.
	 * @param {string} text
	 * @returns {Array<string>}
	 * @throws {Error}
	 */
	function _processMismatch(text) {
		if(exceptionOnMismatch) {
			throw new Error(text);
		} else {
			log.debug(`- incomplete match: ${text}`, {
				meta: {
					encoded,
					format
				}
			});
			return matches;
		}
	}

	let lastEncodedEndIndex=0,
		lastSpecEndIndex=0;
	const {matches, result}=_getFieldSpecifiers();
	for(let index=0; index<matches.length; index++) {
		let {align, fill, match, path, specStartIndex, specEndIndex, width}=matches[index];

		/**
		 * @param {string} data
		 * @return {string|undefined}
		 */
		function _depad(data) {
			switch(align) {
				case "l": {
					const regex=new RegExp(`^[^${fill}]*`),
						match=regex.exec(data);
					return _.get(match, "0");
				}
				case "r":
				case "c": {
					const regex=new RegExp(`^${fill}*([^${fill}]*)`),
						match=regex.exec(data);
					return _.get(match, "1");
				}
			}
		}

		/**
		 * This algorithm is for the problem children that don't have widths. It is here that we have potential issues.
		 * And those issues will be caused by encodings that are not padded. Buyer beware.
		 * @returns {({data:string, length:Number}|null)}
		 */
		function _decipher() {
			// all we know is that our data is somewhere between now and the end of time
			const data=encoded.substring(lastEncodedEndIndex);
			switch(align) {
				case "l": {
					const regex=new RegExp(`^([^${fill}]*)${fill}*`),
						match=regex.exec(data);
					return (match===null)
						? null
						: {
							data: match[1],
							length: match[0].length
						};
				}
				case "r": {
					const trailingFill=_.get(matches[index+1], "fill", fill),
						regex=new RegExp(`^${fill}*([^${trailingFill}]*)`),
						match=regex.exec(data);
					return (match===null)
						? null
						: {
							data: match[1],
							length: match[0].length
						};
				}
				case "c": {
					const regex=new RegExp(`^${fill}*([^${fill}]*)${fill}*`),
						match=regex.exec(data);
					return (match===null)
						? null
						: {
							data: match[1],
							length: match[0].length
						};
				}
			}
		}

		// 1. make sure the junk between the end of the last field specifier and this field specifier are identical
		let specGap=format.substr(lastSpecEndIndex, specStartIndex-lastSpecEndIndex),
			encodedGap=encoded.substr(lastEncodedEndIndex, specStartIndex-lastSpecEndIndex);
		if(specGap!==encodedGap) {
			return _processMismatch(`failed to match "${specGap}" to "${encodedGap}"`);
		} else {
			lastEncodedEndIndex+=specStartIndex-lastSpecEndIndex;
		}
		// 2. match the field specifier to the encoded text. The algorithm differs depending on whether there is a width or not.
		if(width!==undefined) {
			let encodedField=encoded.substr(lastEncodedEndIndex, width),
				data=_depad(encodedField);
			if(data===undefined) {
				return _processMismatch(`could not parse "${encodedField}" with "${match[0]}"`);
			} else {
				_.set(result, path, data);
				lastEncodedEndIndex+=width;
			}
		} else {
			let deciphered=_decipher();
			if(deciphered===undefined) {
				return _processMismatch(`could not match "${match[0]}"`);
			} else {
				_.set(result, path, deciphered.data);
				lastEncodedEndIndex+=deciphered.length;
			}
		}
		lastSpecEndIndex=specEndIndex;
	}
	const specTrailing=format.substr(lastSpecEndIndex),
		encodedTrailing=encoded.substr(lastEncodedEndIndex);
	if(specTrailing!==encodedTrailing) {
		return _processMismatch(`failed to match "${specTrailing}" to "${encodedTrailing}"`);
	}
	return result;
}

module.exports={
	formatMouseSpecification,
	unformatMouseSpecification
};
