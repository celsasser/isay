/**
 * User: curtis
 * Date: 3/8/18
 * Time: 9:35 PM
 * Copyright @2018 by Xraymen Inc.
 *
 * @module common/introspect
 */

const _=require("lodash");

/**
 * Introspects and object and tracks his goodies
 * @type {exports.Introspect}
 */
module.exports.Introspect=class {
	constructor(object) {
		this._accessors=[];
		this._functions=[];
		this._instance=object;
		this._properties=Object.keys(object);
		this._prototype=Object.getPrototypeOf(object);
		Object.getOwnPropertyNames(this.prototype).forEach((name)=>{
			if(_.isFunction(object[name])) {
				this._functions.push(name);
			} else {
				this._accessors.push(name);
			}
		});
	}

	/**
	 * @returns {Array<string>}
	 */
	get accessors() {
		return this._accessors;
	}
	/**
	 * @returns {Array<string>}
	 */
	get functions() {
		return this._functions;
	}
	/**
	 * @returns {Array<string>}
	 */
	get properties() {
		return this._properties;
	}
	/**
	 * @returns {Object}
	 */
	get prototype() {
		return this._prototype;
	}
};
