/**
 * User: curtis
 * Date: 2019-02-23
 * Time: 9:17 PM
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {
	assertType,
	assertTypesEqual,
	boolean,
	resolveType
}=require("./_data");


/**
 * Base class for tests so that we can support the positive and negative tests with one set of functionality
 * @typedef {ModuleBase} ModuleTest
 */
class ModuleTest extends ModuleBase {
	/**
	 * @param {string} action
	 * @param {ModuleBase} catchModule
	 * @param {string} domain
	 * @param {string} method
	 * @param {ModuleBase} nextModule
	 * @param {Array<*>} params
	 * @param {boolean} positive - what state should evaluate to true
	 */
	constructor({
		action,
		catchModule=undefined,
		domain,
		method,
		nextModule=undefined,
		params=[],
		positive,
	}) {
		super({action, catchModule, domain, method, nextModule, params});
		this._positive=positive;
	}

	/**
	 * Returns true if <param>blob</param> is empty as tested by lodash, but it is restrictive about types
	 * 'cause isEmpty is meaningless on types such as numbers and dates.
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async empty(blob) {
		assertType(blob, ["Array", "Object", "String"], {allowNull: true});
		return this._processTestResult(blob, _.isEmpty(blob));
	}

	/**
	 * returns true if <param>blob</param> ends with the value or one of the values in this.params[0]
	 * @param {string} blob
	 * @returns {Promise<boolean>}
	 */
	async endsWith(blob) {
		assertType(blob, "String");
		let values=await resolveType(blob, this.params[0], ["Array", "String"]);
		if(values.constructor.name!=="Array") {
			values=[values];
		}
		for(let value of values) {
			if(blob.endsWith(value)) {
				return this._processTestResult(blob, true);
			}
		}
		return this._processTestResult(blob, false);
	}

	/**
	 * returns true if <param>blob</param> is equal to <code>params[0]</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async equal(blob) {
		const value=await resolveType(blob, this.params[0], "*", {allowNullish: true}),
			result=_.isEqual(blob, value);
		return this._processTestResult(blob, result);
	}

	/**
	 * Simple fella that evaluates whether the input is false as evaluated by <code>boolean(value)</code>
	 * @resolves state:* in (this.params[0]|blob)
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async false(blob) {
		if(this.params.length>0) {
			const value=await resolveType(blob, this.params[0], "*", {allowNullish: true});
			return this._processTestResult(blob, boolean(value)===false);
		} else {
			return this._processTestResult(blob, boolean(blob)===false);
		}
	}

	/**
	 * Tests for leftOperand > rightOperand
	 * @resolves leftOperand:* in blob
	 * @resolves rightOperand:* in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 */
	async greaterThan(blob) {
		return this._processBinaryTest(blob, (v1, v2)=>v1>v2);
	}

	/**
	 * Tests for leftOperand < rightOperand
	 * @resolves leftOperand:* in blob
	 * @resolves rightOperand:* in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 */
	async lessThan(blob) {
		return this._processBinaryTest(blob, (v1, v2)=>v1<v2);
	}

	/**
	 * returns true if <param>blob</param> is included in this.params[0]
	 * @resolves compareSource:* in blob
	 * @resolves compareToItems:Array<*> in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async oneOf(blob) {
		const values=await resolveType(blob, this.params[0], "Array");
		for(let value of values) {
			if(_.isEqual(blob, value)) {
				return this._processTestResult(blob, true);
			}
		}
		return this._processTestResult(blob, false);
	}

	/**
	 * returns true if <param>blob</param> starts with the value or one of the values in this.params[0]
	 * @param {string} blob
	 * @returns {boolean}
	 */
	async startsWith(blob) {
		assertType(blob, "String");
		let values=await resolveType(blob, this.params[0], ["Array", "String"]);
		if(values.constructor.name!=="Array") {
			values=[values];
		}
		for(let value of values) {
			if(blob.startsWith(value)) {
				return this._processTestResult(blob, true);
			}
		}
		return this._processTestResult(blob, false);
	}

	/**
	 * Simple fella that evaluates whether the input is true as evaluated by <code>boolean(value)</code>
	 * @resolves state:* in (this.params[0]|blob)
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async true(blob) {
		if(this.params.length>0) {
			const value=await resolveType(blob, this.params[0], "*", {allowNullish: true});
			return this._processTestResult(blob, boolean(value));
		} else {
			return this._processTestResult(blob, boolean(blob));
		}
	}

	/**
	 * returns true if <param>blob</param> is of one of the types specified in this.params[0]
	 * @resolves types:(string|Array<string>) in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async type(blob) {
		const types=await resolveType(blob, this.params[0], ["Array", "String"]);
		try {
			assertType(blob, types);
			return this._processTestResult(blob, true);
		} catch(error) {
			return this._processTestResult(blob, false);
		}
	}

	/********************* Private Interface *********************/
	/**
	 * Performs the <param>test</param> on <param>blob</param> and this.params[0] and forwards the result
	 * to <code>this._processTestResult</code>
	 * @param {DataBlob} blob - input to the calling operation
	 * @param {function(v1:*, v2:*):boolean|Date|Number|String} test
	 * @returns {Promise<DataBlob>}
	 * @private
	 */
	async _processBinaryTest(blob, test) {
		assertType(blob, ["Date", "Number", "String"]);
		const value=await resolveType(blob, this.params[0], ["Date", "Number", "String"]);
		assertTypesEqual(blob, value);
		const result=test(blob, value);
		return this._processTestResult(blob, result);
	}

	/**
	 * Processes the result of whatever test up above's results.
	 * 4/12/2019 - We used to have then/else processing here. But we changed the way conditionals get processed.
	 * @param {DataBlob} input
	 * @param {boolean} positive - should be the result of the test itself. <param>this._positive</param> comparison will be applied here.
	 * @returns {Promise<DataBlob>}
	 * @private
	 */
	_processTestResult(input, positive) {
		const state=(positive===this._positive);
		return Promise.resolve(state);
	}
}

module.exports={
	ModuleTest
};
