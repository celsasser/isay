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
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async each(blob) {
		const array=this._assertArray(blob),
			predicate=this._assertPredicate(this.params[0]);
		for(let index=0; index<array.length; index++) {
			await predicate(array[index], index);
		}
		return blob;
	}

	/**
	 * Filters array selecting truthy returns by predicate
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async filter(blob) {
		const array=this._assertArray(blob),
			predicate=this._assertPredicate(this.params[0]),
			result=[];
		for(let index=0; index<array.length; index++) {
			if(await predicate(array[index], index)) {
				result.push(array[index]);
			}
		}
		return result;
	}

	/**
	 * Finds first element using predicate
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async find(blob) {
		const array=this._assertArray(blob),
			predicate=this._assertPredicate(this.params[0]);
		for(let index=0; index<array.length; index++) {
			if(await predicate(array[index], index)) {
				return array[index];
			}
		}
		return null;
	}

	/**
	 * Maps each element using predicate's results
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async map(blob) {
		const array=this._assertArray(blob),
			predicate=this._assertPredicate(this.params[0]),
			result=[];
		for(let index=0; index<array.length; index++) {
			result.push(await predicate(array[index], index));
		}
		return result;
	}

	/**
	 * Reduces array down to the little or big guy you make him.
	 * @resolves predicate:function(result:*, data:*, index:Number):* in this.params[0]
	 * @resolves startingValue: in this.params[1] - defaults to []
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async reduce(blob) {
		const array=this._assertArray(blob),
			predicate=this._assertPredicate(this.params[0]);
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
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async reverse(blob) {
		const array=this._assertArray(blob);
		return array.reverse();
	}

	/**
	 * Sorts array elements. By default it sorts using lodash's default comparison operator.
	 * @resolves sortBy:(string|function) in this.params[0] - defaults to undefined
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async sort(blob) {
		const array=this._assertArray(blob);
		// note: sortBy acts like array.sort when the "by" param is undefined
		return _.sortBy(array, this.params[0]);
	}

	/**
	 * Returns unique elements using a deep comparison of elements.
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async unique(blob) {
		const array=this._assertArray(blob);
		return _.uniqWith(array, _.isEqual);
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
