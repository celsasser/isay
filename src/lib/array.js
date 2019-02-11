/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 21:11
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const util=require("../common/util");

/**
 * Supports operations on piped arrays. The <code>predicate</code> may either be a function or a chain.
 * The <code>predicate</code> is called as follows: param[0](blob[index], index):*
 * @typedef {ModuleBase} ModuleArray
 */
class ModuleArray extends ModuleBase {
	/**
	 * Calls predicate for every element in blob
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async each(blob) {
		const array=this._assertArray(blob),
			predicate=this._conditionPredicate(this.params[0]);
		for(let index=0; index<array.length; index++) {
			await predicate(array[index], index);
		}
		return blob;
	}

	/**
	 * Filters using param[0] as the predicate
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async filter(blob) {
		const array=this._assertArray(blob),
			predicate=this._conditionPredicate(this.params[0]),
			result=[];
		for(let index=0; index<array.length; index++) {
			if(await predicate(array[index], index)) {
				result.push(array[index]);
			}
		}
		return result;
	}

	/**
	 * Finds element using param[0] as the predicate
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async find(blob) {
		const array=this._assertArray(blob),
			predicate=this._conditionPredicate(this.params[0]);
		for(let index=0; index<array.length; index++) {
			if(await predicate(array[index], index)) {
				return array[index];
			}
		}
		return null;
	}

	/**
	 * Maps using param[0] as the predicate
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async map(blob) {
		const array=this._assertArray(blob),
			predicate=this._conditionPredicate(this.params[0]),
			result=[];
		for(let index=0; index<array.length; index++) {
			result.push(await predicate(array[index], index));
		}
		return result;
	}

	/**
	 * Reduces array down to the little or big guy you make him. He will use <code>param[1]</code> as a default start value.
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async reduce(blob) {
		const array=this._assertArray(blob),
			predicate=this._conditionPredicate(this.params[0]);
		let result=_.get(this.params, 1, []);
		for(let index=0; index<array.length; index++) {
			result=await predicate(result, array[index], index);
		}
		return result;
	}

	/**
	 * Reverses elements. No params supported
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async reverse(blob) {
		const array=this._assertArray(blob);
		return array.reverse();
	}

	/**
	 * Sorts array elements. By default it sorts using lodash's default comparison operator.
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async sort(blob) {
		const array=this._assertArray(blob);
		// note: may optionally specify a property or function by which to sort
		return _.sortBy(array, this.params[0]);
	}

	/********************* Private Interface *********************/
	/**
	 * Validates and applies the function to the blob using all params as input.
	 * @param {DataBlob} blob
	 * @return {Array<*>}
	 * @private
	 */
	_assertArray(blob) {
		if(_.isArray(blob)) {
			return blob;
		} else if(blob==null) {
			return [];
		} else {
			throw new Error(`expecting array but found ${util.name(blob)}`);
		}
	}
}

module.exports={
	ModuleArray
};
