/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 19:37
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");

/**
 * Support for basic arithmetic
 * @typedef {ModuleBase} ModuleMath
 */
class ModuleMath extends ModuleBase {
	/**
	 * Adds whatever is in this.params[0], provided it is a number, to the incoming <param>input</param>
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<Number>}
	 */
	async add(input) {
		return this._applyBinary(input, (a, b)=>a+b);
	}

	/**
	 * Applies ceiling to the incoming <param>input</param>
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<(Number|Array<Number>)}
	 */
	async ceiling(input) {
		return this._applyUnary(input, Math.ceil);
	}

	/**
	 * Divides incoming <param>input</param> from whatever is in this.params[0] provided it is a number
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<Number>}
	 */
	async divide(input) {
		return this._applyBinary(input, (a, b)=>a/b);
	}

	/**
	 * Applies floor to the incoming <param>input</param>
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<(Number|Array<Number>)}
	 */
	async floor(input) {
		return this._applyUnary(input, Math.floor);
	}

	/**
	 * Returns the largest number in the <param>input</param> sequence
	 * @param {Array<Number>} input
	 * @returns {Promise<Number>}
	 */
	async max(input) {
		this._assertType(input, "Array");
		return Math.max.apply(null, input);
	}

	/**
	 * Returns the smallest number in the <param>input</param> sequence
	 * @param {Array<Number>} input
	 * @returns {Promise<Number>}
	 */
	async min(input) {
		this._assertType(input, "Array");
		return Math.min.apply(null, input);
	}

	/**
	 * Multiplies incoming <param>input</param> from whatever is in this.params[0] provided it is a number
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<Number>}
	 */
	async multiply(input) {
		return this._applyBinary(input, (a, b)=>a*b);
	}

	/**
	 * Rounds the incoming <param>input</param>
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<(Number|Array<Number>)}
	 */
	async round(input) {
		return this._applyUnary(input, Math.round);
	}

	/**
	 * Subtracts whatever is in this.params[0], provided it is a number, from the incoming <param>input</param>
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<Number>}
	 */
	async subtract(input) {
		return this._applyBinary(input, (a, b)=>a-b);
	}

	/********************* Private Interface *********************/
	/**
	 * Applies operation to either the <param>input</param> and params[0] or to the sequence of <param>input</param>
	 * @param {Number|Array<Number>} input
	 * @param {function(a:Number):Number} operation
	 * @return {Number}
	 * @throws {Error}
	 * @private
	 */
	_applyUnary(input, operation) {
		this._assertType(input, ["Array", "Number"]);
		return (input.constructor.name==="Number")
			? operation(input)
			: input.map(operation);
	}

	/**
	 * Applies operator either the <param>input</param> and params[0] or to the sequence of <param>input</param>
	 * @param {Number|Array<Number>} input
	 * @param {function(a:Number,b:Number):Number} operator
	 * @return {Number}
	 * @throws {Error}
	 * @private
	 */
	_applyBinary(input, operator) {
		this._assertType(input, ["Array", "Number"]);
		if(input.constructor.name==="Number") {
			this._assertType(this.params[0], "Number");
			return operator(input, this.params[0]);
		} else {
			return input.slice(1)
				.reduce(operator, input[0]);
		}
	}
}

module.exports={
	ModuleMath
};
