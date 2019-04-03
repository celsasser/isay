/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 19:37
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");
const {assertType, resolveType}=require("./_data");

/**
 * Support for basic arithmetic
 * @typedef {ModuleBase} ModuleMath
 */
class ModuleMath extends ModuleBase {
	/**
	 * Adds whatever is in this.params[0], provided it is a number, to the incoming <param>input</param>
	 * @param {number|Array<number>} input
	 * @returns {Promise<(number|Array<number>)>}
	 */
	async add(input) {
		return this._applyBinary(input, (a, b)=>a+b);
	}

	/**
	 * Applies ceiling to the incoming <param>input</param>
	 * @param {number|Array<number>} input
	 * @returns {Promise<(number|Array<number>)>}
	 */
	async ceiling(input) {
		return this._applyUnary(input, Math.ceil);
	}

	/**
	 * Divides incoming <param>input</param> from whatever is in this.params[0] provided it is a number
	 * @param {number|Array<number>} input
	 * @returns {Promise<(number|Array<number>)>}
	 */
	async divide(input) {
		return this._applyBinary(input, (a, b)=>a/b);
	}

	/**
	 * Calculates floor(input/params[0]) and input%params[0]. It incoming <param>input</param> from whatever is in this.params[0] provided it is a number
	 * @param {number|Array<number>} input
	 * @returns {Promise<([number:div, number:mod]|Array<[number:div, number:mod]>)>}
	 */
	async divmod(input) {
		return this._applyBinary(input, (a, b)=>{
			const div=Math.floor(a/b),
				mod=(a-div*b);
			// We can represent this as an array or object. Being in the math domain I am going to keep everything arrays
			// to keep our interface consistent.
			return [div, mod];
		});
	}

	/**
	 * Applies floor to the incoming <param>input</param>
	 * @param {number|Array<number>} input
	 * @returns {Promise<(number|Array<number>)>}
	 */
	async floor(input) {
		return this._applyUnary(input, Math.floor);
	}

	/**
	 * Returns the largest number in the <param>input</param> sequence
	 * @param {Array<number>} input
	 * @returns {Promise<number>}
	 */
	async max(input) {
		assertType(input, "Array");
		return Math.max.apply(null, input);
	}

	/**
	 * Returns the smallest number in the <param>input</param> sequence
	 * @param {Array<number>} input
	 * @returns {Promise<number>}
	 */
	async min(input) {
		assertType(input, "Array");
		return Math.min.apply(null, input);
	}

	/**
	 * Multiplies incoming <param>input</param> from whatever is in this.params[0] provided it is a number
	 * @param {number|Array<number>} input
	 * @returns {Promise<(number|Array<number>)>}
	 */
	async multiply(input) {
		return this._applyBinary(input, (a, b)=>a*b);
	}

	/**
	 * Rounds the incoming <param>input</param>
	 * @param {number|Array<number>} input
	 * @returns {Promise<(number|Array<number>)>}
	 */
	async round(input) {
		return this._applyUnary(input, Math.round);
	}

	/**
	 * Subtracts whatever is in this.params[0], provided it is a number, from the incoming <param>input</param>
	 * @param {number|Array<number>} input
	 * @returns {Promise<(number|Array<number>)>}
	 */
	async subtract(input) {
		return this._applyBinary(input, (a, b)=>a-b);
	}

	/********************* Private Interface *********************/
	/**
	 * Applies operation to either the <param>input</param> and params[0] or to the sequence of <param>input</param>
	 * @param {number|Array<number>} input
	 * @param {function(a:number):number} operation
	 * @return {number}
	 * @throws {Error}
	 * @private
	 */
	_applyUnary(input, operation) {
		assertType(input, ["Array", "Number"]);
		return (input.constructor.name==="Number")
			? operation(input)
			: input.map(operation);
	}

	/**
	 * Applies operator either the <param>input</param> and params[0] or to the sequence of <param>input</param>
	 * There are three different types of operations this function supports:
	 * 1. input=value-type: how we treat this depends on the <param>input</param>
	 *    a. params.length=0: this is an error condition
	 *    b. params[0]=value-type: return value-type calculated as follows - <code>operator(input, params[0])</code>
	 *    c. params[0]=array: return array result as follows - <code>operator(input, params[0][n])</code>
	 * 2. input=array: how we treat this depends on the <param>input</param>
	 *    a. params.length=0: no param then we reduce and apply the operation in succession to <param>input</param>
	 *    b. params[0]=value-type: then we return an array <code>operator(input, param[n])</code>
	 *    c. params[0]=array: we process each element as follows - <code>operator(input[n], param[n])</code>
	 *       if the array lengths differ then error is thrown
	 * @param {number|Array<number>} input
	 * @param {function(a:number,b:number):number} operation
	 * @return {number}
	 * @throws {Error}
	 * @private
	 */
	async _applyBinary(input, operation) {
		assertType(input, ["Array", "Number"]);
		if(input.constructor.name==="Number") {
			const param=await resolveType(input, this.params[0], ["Array", "Number"]);
			if(param.constructor.name==="Number") {
				// this is the 1.b condition described in the documentation header
				return operation(input, param);
			} else {
				// this is the 1.c condition described in the documentation header
				return param.map(operation.bind(null, input));
			}
		} else {
			// input is an Array<number>
			if(this.params.length===0) {
				// this is the 2.a condition in the documentation header
				return input.slice(1)
					.reduce(operation, input[0]);
			} else {
				const param=await resolveType(input, this.params[0], ["Array", "Number"]);
				if(param.constructor.name==="Number") {
					// this is the 2.b condition in the documentation header
					return input.map(value=>operation(value, param));
				} else {
					// this is the 2.c condition in the documentation header
					if(input.length!==param.length) {
						throw new Error(`input array (${input.length}) and param (${param.length}) differ in length`);
					} else {
						return input.map((value, index)=>operation(value, param[index]));
					}
				}
			}
		}
	}
}

module.exports={
	ModuleMath
};
