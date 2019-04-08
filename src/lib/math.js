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
		return this._applyMinMax(input, Math.max);
	}

	/**
	 * Returns the smallest number in the <param>input</param> sequence
	 * @param {Array<number>} input
	 * @returns {Promise<number>}
	 */
	async min(input) {
		return this._applyMinMax(input, Math.min);
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
	 * Operates on two operands. Where those operands come from are determined by the number of params:
	 * - this.params.length=1: operand1=input, operand2=this.params[0]
	 * - this.params.length=2: operand1=this.params[0], operand2=this.params[1]
	 *
	 * Applies operator either to the <param>operand1</param> and operand2 or to the sequence of <param>operand1</param>
	 * There are three different types of operations this function supports:
	 * 1. operand1=value-type: how we treat this depends on <param>operand2</param>
	 *    a. params.length=0: this is an error condition
	 *    b. operand2=value-type: return value-type calculated as follows - <code>operator(operand1, operand2)</code>
	 *    c. operand2=array: return array calculated as follows - <code>operator(operand1, operand2[n])</code>
	 * 2. operand1=array: how we treat this depends on the <param>operand2</param>
	 *    a. params.length=0: no param then we reduce and apply the operation in succession to <param>operand1</param>
	 *    b. operand2=value-type: then we return an array <code>operator(operand1, operand2[n])</code>
	 *    c. operand2=array: we process each element as follows - <code>operator(operand1[n], operand2[n])</code>
	 *       if the array lengths differ then error is thrown
	 *
	 * @param {number|Array<number>} input
	 * @param {function(a:number,b:number):number} operation
	 * @return {number}
	 * @throws {Error}
	 * @private
	 */
	async _applyBinary(input, operation) {
		let operand1, operand2;
		if(this.params.length>1) {
			operand1=this.params[0];
			operand2=this.params[1];
		} else {
			operand1=input;
			operand2=this.params[0];
		}
		operand1=await resolveType(input, operand1, ["Array", "Number"]);
		if(operand1.constructor.name==="Number") {
			operand2=await resolveType(input, operand2, ["Array", "Number"]);
			if(operand2.constructor.name==="Number") {
				// this is the 1.b condition described in the documentation header
				return operation(operand1, operand2);
			} else {
				// this is the 1.c condition described in the documentation header
				return operand2.map(operation.bind(null, operand1));
			}
		} else {
			// operand1 is an Array<number>
			if(this.params.length===0) {
				// this is the 2.a condition in the documentation header
				return operand1.slice(1)
					.reduce(operation, operand1[0]);
			} else {
				operand2=await resolveType(input, operand2, ["Array", "Number"]);
				if(operand2.constructor.name==="Number") {
					// this is the 2.b condition in the documentation header
					return operand1.map(value=>operation(value, operand2));
				} else {
					// this is the 2.c condition in the documentation header
					if(operand1.length!==operand2.length) {
						throw new Error(`operand arrays (${operand1.length}) and (${operand2.length}) differ in length`);
					} else {
						return operand1.map((value, index)=>operation(value, operand2[index]));
					}
				}
			}
		}
	}

	/**
	 * Operates on a single value or an array of values. Where that operand come from is determined by the number of params:
	 * - this.params.length=0: operand=input
	 * - this.params.length>0: operand=this.params[0] or this.params
	 * Applies operation to either the <param>input</param> and params[0] or to the sequence of <param>input</param>
	 * @param {number|Array<number>} input
	 * @param {function(a:number):number} operation
	 * @return {Promise<number>}
	 * @throws {Error}
	 * @private
	 */
	async _applyMinMax(input, operation) {
		let operand;
		if(this.params.length===0) {
			operand=assertType(input, "Array");
		} else if(this.params===1) {
			operand=await resolveType(input, this.params[0], "Array");
		} else {
			operand=this.params;
		}
		return operation(...operand);
	}

	/**
	 * Operates on a single value or an array of values. Where that operand come from is determined by the number of params:
	 * - this.params.length=0: operand=input
	 * - this.params.length>0: operand=this.params[0] or this.params
	 * Applies operation to either the <param>input</param> and params[0] or to the sequence of <param>input</param>
	 * @param {number|Array<number>} input
	 * @param {function(a:number):number} operation
	 * @return {Promise<number>}
	 * @throws {Error}
	 * @private
	 */
	async _applyUnary(input, operation) {
		let operand;
		if(this.params.length===0) {
			operand=assertType(input, ["Array", "Number"]);
		} else {
			operand=await resolveType(input, this.params[0], ["Array", "Number"]);
		}
		return (operand.constructor.name==="Number")
			? operation(operand)
			: operand.map(operation);
	}
}

module.exports={
	ModuleMath
};
