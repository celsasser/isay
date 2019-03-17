/**
 * User: curtis
 * Date: 2019-02-23
 * Time: 9:17 PM
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {assertPredicate, assertType}=require("./_data");

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
	 * returns true if empty
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async empty(blob) {
		return this._processTestResult(blob, _.isEmpty(blob));
	}

	/**
	 * returns true if <param>blob</param> ends with value, or one of the values, in this.params[0]
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
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @attribute flow
	 */
	async else(blob) {
		const predicate=assertPredicate(this.params[0]);
		return predicate(blob);
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
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async test(blob) {
		if(this.params.length>0) {
			const predicate=assertPredicate(this.params[0]);
			return predicate(blob)
				.then(result=>this._processTestResult(blob, Boolean(result)));
		} else {
			return this._processTestResult(blob, Boolean(blob));
		}
	}

	/**
	 * Is a flow handler much like else and catch. May be used to flow to via a non-flow <code>ModuleTest</code> action
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @attribute flow
	 */
	async then(blob) {
		const predicate=assertPredicate(this.params[0]);
		return predicate(blob);
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
	 * Processes the result of whatever test up above's results. Puts the result to if/then/else processing.
	 * @param {DataBlob} input
	 * @param {boolean} positive - should be the result of the test itself. <param>this._positive</param> comparison will be applied here.
	 * @returns {Promise<DataBlob>} - what gets returned depends on whether there is then/else processing.
	 *  - if neither exists then <param>positive</param> will be returned
	 *  - else either <param>input</param> or the result of then/else will be returned.
	 * @private
	 */
	_processTestResult(input, positive) {
		const state=positive===this._positive;
		if(this._thenModule || this._elseModule) {
			if(state) {
				if(this._thenModule) {
					return this._thenModule.process(input);
				} else {
					return Promise.resolve(input);
				}
			} else {
				if(this._elseModule) {
					return this._elseModule.process(input);
				} else {
					return Promise.resolve(input);
				}
			}
		} else {
			return Promise.resolve(state);
		}
	}
}

module.exports={
	ModuleTest
};
