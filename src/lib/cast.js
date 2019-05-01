/**
 * Date: 2019-05-01 01:01
 * @license MIT (see project's LICENSE file)
 */

const {ModuleBase}=require("./_base");
const {assertType}=require("./_data");

/**
 * Supports casting from one type to another.
 * @typedef {ModuleBase} ModuleCast
 */
class ModuleCast extends ModuleBase {
	/**
	 * Attempts to cast <param>blob</param> to a <code>Date</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<Date>}
	 */
	async date(blob) {
		assertType(blob, ["Date", "Number", "String"]);
		if(blob.constructor.name==="String") {
			const epoch=Date.parse(blob);
			if(Number.isNaN(epoch)) {
				throw new Error(`invalid date "${blob}"`);
			} else {
				return new Date(blob);
			}
		} else {
			return new Date(blob);
		}
	}

	/**
	 * Attempts to cast <param>blob</param> to a <code>Number</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<number>}
	 */
	async number(blob) {
		assertType(blob, ["Boolean", "Date", "Number", "String"]);
		return Number(blob);
	}

	/**
	 * Attempts to cast <param>blob</param> to a <code>string</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<number>}
	 */
	async string(blob) {
		assertType(blob, ["Boolean", "Date", "Number", "String"]);
		if(blob.constructor.name==="Date") {
			// we are using programmer's bias here and assuming ISO 8601
			return blob.toISOString();
		} else {
			return String(blob);
		}
	}
}

module.exports={
	ModuleCast
};
