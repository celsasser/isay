/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 21:11
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./base");
const log=require("../common/log");
const util=require("../common/util");

/**
 * Supports operations on piped arrays
 * Note: All function use lodash. The input to the functions is as follows: _.<method>(array, param[0], param[1]...)
 * @typedef {ModuleBase} ModuleArray
 */
class ModuleArray extends ModuleBase {
	/**
	 * Filters using param[0] as the predicate
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async filter(blob) {
		return this._apply(blob, _.filter);
	}

	/**
	 * Finds element using param[0] as the predicate
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async find(blob) {
		return this._apply(blob, _.find);
	}

	/**
	 * Maps using param[0] as the predicate
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async map(blob) {
		return this._apply(blob, _.map);
	}

	/**
	 * Reverses elements. No params supported
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async reverse(blob) {
		return this._apply(blob, _.reverse);
	}

	/**
	 * Sorts array elements. By default it sorts using lodash's default comparison operator.
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async sort(blob) {
		return this._apply(blob, _.sortBy);
	}

	/********************* Private Interface *********************/
	/**
	 * Validates and applies the function to the blob using all params as input.
	 * @param {DataBlob} blob
	 * @param {function(array:Array, predicate:Function):Array} func
	 * @return {DataBlob}
	 * @private
	 */
	_apply(blob, func) {
		if(blob.data==null) {
			return {
				data: [],
				encoding: "object"
			};
		} else if(!_.isArray(blob.data)) {
			log.warn(`array.${this.action} - expecting array but found type=${util.name(blob.data)}`);
			return {
				data: [],
				encoding: "object"
			};
		} else {
			return {
				data: func.apply(null, [blob.data].concat(this.params)),
				encoding: "object"
			};
		}
	}
}

module.exports={
	ModuleArray
};
