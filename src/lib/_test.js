/**
 * User: curtis
 * Date: 2019-02-23
 * Time: 9:17 PM
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {assertPredicate, assertType, assertTypesEqual, isPredicate}=require("./_data");

/**
 * Base class for tests so that we can support the positive and negative tests with one set of functionality
 * @typedef {ModuleBase} ModuleTest
 */
class ModuleTest extends ModuleBase {
	/**
	 * @param {string} action
	 * @param {ModuleBase} catchModule
	 * @param {string} domain
	 * @param {ModuleBase} elseModule - else module handler if there is one
	 * @param {string} method
	 * @param {boolean} objectMode
	 * @param {ModuleBase} nextModule
	 * @param {Array<*>} params
	 * @param {ModuleBase} thenModule - if module if there is one
	 */
	constructor({
		action,
		catchModule=undefined,
		domain,
		elseModule=undefined,
		method,
		nextModule=undefined,
		params=[],
		positive,
		thenModule=undefined
	}) {
		super({action, catchModule, domain, method, nextModule, params});
		this._elseModule=elseModule;
		this._positive=positive;
		this._thenModule=thenModule;
	}

	/**
	 * Returns true if empty as tested by lodash
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async empty(blob) {
		return this._processTestResult(blob, _.isEmpty(blob));
	}

	/**
	 * returns true if <param>blob</param> ends with the value, or one of the values, in this.params[0]
	 * @param {string} blob
	 * @returns {Promise<boolean>}
	 */
	async endsWith(blob) {
		assertType(blob, "String");
		assertType(this.params[0], ["Array", "String"]);
		const searchEndings=_.isArray(this.params[0])
			? this.params[0]
			: [this.params[0]];
		for(let search of searchEndings) {
			if(blob.endsWith(search)) {
				return this._processTestResult(blob, true);
			}
		}
		return this._processTestResult(blob, false);
	}

	/**
	 * Is a flow handler much like then and catch. May be used to flow to via a non-flow <code>ModuleTest</code> action
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @resolves result:* in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @attribute flow
	 */
	async else(blob) {
		return this._processIfFlow(blob);
	}

	/**
	 * returns true if <param>blob</param> is equal to <code>params[0]</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async equal(blob) {
		const result=_.isEqual(blob, this.params[0]);
		return this._processTestResult(blob, result);
	}

	/**
	 * Tests for <param>blob</param> > this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 */
	async greaterThan(blob) {
		return this._processBinaryTest(blob, (v1, v2)=>v1>v2);
	}

	/**
	 * Tests for <param>blob</param> < this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 */
	async lessThan(blob) {
		return this._processBinaryTest(blob, (v1, v2)=>v1<v2);
	}

	/**
	 * returns true if <param>blob</param> is included in this.params[0]
	 * @resolves compareToItems:Array<*> in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async oneOf(blob) {
		assertType(this.params[0], "Array");
		for(let value of this.params[0]) {
			if(_.isEqual(blob, value)) {
				return this._processTestResult(blob, true);
			}
		}
		return this._processTestResult(blob, false);
	}

	/**
	 * returns true if <param>blob</param> starts with value, or one of the values, in this.params[0]
	 * @param {string} blob
	 * @returns {boolean}
	 */
	async startsWith(blob) {
		assertType(blob, "String");
		assertType(this.params[0], ["Array", "String"]);
		const searchEndings=_.isArray(this.params[0])
			? this.params[0]
			: [this.params[0]];
		for(let search of searchEndings) {
			if(blob.startsWith(search)) {
				return this._processTestResult(blob, true);
			}
		}
		return this._processTestResult(blob, false);
	}

	/**
	 * Intended to allow predicates to get in the testing business but defers to casting if there is no predicate.
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @resolves state:* in this.params[0] - probably want to use <code>equal</code> but this guy supports it
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async test(blob) {
		if(this.params.length>0) {
			if(isPredicate(this.params[0])) {
				const predicate=assertPredicate(this.params[0]);
				return predicate(blob)
					.then(result=>this._processTestResult(blob, Boolean(result)));
			} else {
				return this._processTestResult(blob, Boolean(this.params[0]));
			}
		} else {
			return this._processTestResult(blob, Boolean(blob));
		}
	}

	/**
	 * Is a flow handler much like else and catch. May be used to flow to via a non-flow <code>ModuleTest</code> action
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @resolves result:* in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @attribute flow
	 */
	async then(blob) {
		return this._processIfFlow(blob);
	}

	/**
	 * returns true if <param>blob</param> is of one of the types specified in this.params[0]
	 * @resolves types:(string|Array<string>) in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async type(blob) {
		assertType(this.params[0], ["Array", "String"]);
		try {
			assertType(blob, this.params[0]);
			return this._processTestResult(blob, true);
		} catch(error) {
			return this._processTestResult(blob, false);
		}
	}

	/********************* Private Interface *********************/
	/**
	 * Performs the <param>test</param> on <param>blob</param> and this.params[0] and forwards the result
	 * to <code>this._processTestResult</code>
	 * @param {DataBlob} blob
	 * @param {function(v1:*, v2:*):boolean} test
	 * @returns {Promise<DataBlob>}
	 * @private
	 */
	_processBinaryTest(blob, test) {
		assertType(blob, ["Date", "Number", "String"]);
		assertType(this.params[0], ["Date", "Number", "String"]);
		assertTypesEqual(blob, this.params[0]);
		const result=test(blob, this.params[0]);
		return this._processTestResult(blob, result);
	}

	/**
	 * Processes then/else action
	 * @param {DataBlob} blob
	 * @returns {Promise<*>}
	 * @private
	 */
	_processIfFlow(blob) {
		if(this.params.length===0) {
			return Promise.resolve(blob);
		} else if(isPredicate(this.params[0])) {
			const predicate=assertPredicate(this.params[0]);
			return predicate(blob);
		} else {
			return Promise.resolve(this.params[0]);
		}
	}

	/**
	 * Processes the result of whatever test up above's results. Puts the result to if/then/else processing.
	 * @param {DataBlob} input
	 * @param {boolean} positive - should be the result of the test itself. <param>this._positive</param> comparison will be applied here.
	 * @returns {Promise<DataBlob>} - what gets returned depends on whether there is then/else processing.
	 *  - if test-state==true and there is a then handler then the result of <code>this._thenModule.process(input)</code> will be returned
	 *  - if test-state==false and there is an else handler then the result of <code>this._elseModule.process(input)</code> will be returned
	 *  - else test-state will be returned
	 * @private
	 */
	_processTestResult(input, positive) {
		const state=positive===this._positive;
		if(this._thenModule && state) {
			return this._thenModule.process(input);
		} else if(this._elseModule && !state) {
			return this._elseModule.process(input);
		} else {
			return Promise.resolve(state);
		}
	}
}

module.exports={
	ModuleTest
};
