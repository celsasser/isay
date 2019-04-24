/**
 * Date: 12/13/17
 * Time: 5:12 PM
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const shortid=require("shortid");

/**
 * Creates a urn
 * @param {string} type
 * @param {string} name will default to a unique id if not specified
 * @returns {string}
 */
module.exports.create=function(type, name=shortid.generate()) {
	return (type.startsWith("urn:"))
		? `${type}:${name}`
		: `urn:${type}:${name}`;
};

/**
 * Parses a urn and returns bits
 * @param {string} urn
 * @returns {{type:String, name:string}}
 */
module.exports.parse=function(urn) {
	const indexFirst=_.indexOf(urn, ":"),
		indexLast=_.lastIndexOf(urn, ":");
	if(indexFirst===indexLast) {
		throw new Error(`invalid urn ${urn}`);
	} else {
		return {
			type: urn.substr(indexFirst+1, indexLast-indexFirst-1),
			name: urn.substr(indexLast+1)
		};
	}
};
