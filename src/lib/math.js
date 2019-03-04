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
	 * Adds whatever is in this.params[0], provided it is a number, to the incoming value
	 * @param {Number} value
	 * @returns {Promise<Number>}
	 */
	async add(value) {
		this._assertType(value, "Number");
		this._assertType(this.params[0], "Number");
		return value+this.params[0];
	}

	/**
	 * Applies ceiling to the incoming value
	 * @param {Number} value
	 * @returns {Promise<Number>}
	 */
	async ceiling(value) {
		this._assertType(value, "Number");
		return Math.ceil(value);
	}

	/**
	 * Divides incoming value from whatever is in this.params[0] provided it is a number
	 * @param {Number} value
	 * @returns {Promise<Number>}
	 */
	async divide(value) {
		this._assertType(value, "Number");
		this._assertType(this.params[0], "Number");
		return value/this.params[0];
	}

	/**
	 * Applies floor to the incoming value
	 * @param {Number} value
	 * @returns {Promise<Number>}
	 */
	async floor(value) {
		this._assertType(value, "Number");
		return Math.floor(value);
	}

	/**
	 * Multiplies incoming value from whatever is in this.params[0] provided it is a number
	 * @param {Number} value
	 * @returns {Promise<Number>}
	 */
	async multiply(value) {
		this._assertType(value, "Number");
		this._assertType(this.params[0], "Number");
		return value*this.params[0];
	}

	/**
	 * Rounds the incoming value
	 * @param {Number} value
	 * @returns {Promise<Number>}
	 */
	async round(value) {
		this._assertType(value, "Number");
		return Math.round(value);
	}

	/**
	 * Subtracts whatever is in this.params[0], provided it is a number, from the incoming value
	 * @param {Number} value
	 * @returns {Promise<Number>}
	 */
	async subtract(value) {
		this._assertType(value, "Number");
		this._assertType(this.params[0], "Number");
		return value-this.params[0];
	}
}

module.exports={
	ModuleMath
};
