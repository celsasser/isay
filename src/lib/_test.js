/**
 * User: curtis
 * Date: 2019-02-23
 * Time: 9:17 PM
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {assertType}=require("./_data");

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
		return _.isEmpty(blob)===this._positive;
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
				return this._positive;
			}
		}
		return !this._positive;
	}

	/**
	 * returns true if <param>blob</param> is equal to <code>params[0]</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<boolean>}
	 */
	async equal(blob) {
		return _.isEqual(blob, this.params[0])===this._positive;
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
				return this._positive;
			}
		}
		return !this._positive;
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
				return this._positive;
			}
		}
		return !this._positive;
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
			return this._positive;
		} catch(error) {
			return !this._positive;
		}
	}

	/********************* Private Interface *********************/
}

module.exports={
	ModuleTest
};
