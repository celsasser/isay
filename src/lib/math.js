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
	 * @returns {Promise<(Number|Array<Number>)}
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
	 * @returns {Promise<(Number|Array<Number>)}
	 */
	async divide(input) {
		return this._applyBinary(input, (a, b)=>a/b);
	}

	/**
	 * Calculates floor(input/params[0]) and input%params[0]. It incoming <param>input</param> from whatever is in this.params[0] provided it is a number
	 * @param {Number|Array<Number>} input
	 * @returns {Promise<([div:Number, mod:Number]|Array<[div:Number, mod:Number]>)>}
	 */
	async divmod(input) {
		this._assertType(input, ["Array", "Number"]);
		this._assertType(this.params[0], "Number");
		const _calculate=(value)=>{
			const div=Math.floor(value/this.params[0]),
				mod=(value-div*this.params[0]);
			// We can represent this as an array or object. Being in the math domain I am going to keep everything arrays
			// to keep our interface consistent.
			return [div, mod];
		}
		if(input.constructor.name==="Array") {
			return input.map(_calculate);
		} else {
			return _calculate(input);
		}
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
	 * @returns {Promise<(Number|Array<Number>)}
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
	 * @returns {Promise<(Number|Array<Number>)}
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
		} else if(typeof(this.params[0])==="number") {
			// here we assume that the user wants to apply this.params[0] to each element: operator(input[n], this.params[0])
			return input.map(value=>operator(value, this.params[0]));
		} else {
			// here we assume that the user wants to reduce and calculate a single result
			return input.slice(1)
				.reduce(operator, input[0]);
		}
	}
}

module.exports={
	ModuleMath
};
