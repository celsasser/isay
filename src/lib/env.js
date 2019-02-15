/**
 * User: curtis
 * Date: 2019-02-14
 * Time: 23:47
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");

/**
 * @typedef {ModuleBase} ModuleEnv
 */
class ModuleEnv extends ModuleBase {
	/**
	 * Sets env variable to value. The rules for where it finds it's operands are as follows:
	 * @resolves variable:string in this.params[0]
	 * @param {*} data
	 * @return {Promise<*>}
	 */
	async delete(data) {
		const variable=this.params[0];
		this._assertType(variable, "String");
		delete process.env[variable];
		return data;
	}

	/**
	 * Gets all environment variables.
	 * @return {Promise<Object>}
	 */
	async get() {
		return process.env;
	}

	/**
	 * Sets env variable to value. The rules for where it finds it's operands are as follows:
	 * @resolves variable:string in this.params[0]
	 * @resolves value:(string|number|boolean) in this.params[1]|data
	 * @param {string|undefined} data
	 * @return {Promise<*>}
	 */
	async set(data) {
		const variable=this.params[0],
			value=_.get(this.params, 1, data);
		this._assertType(variable, "String");
		this._assertType(variable, ["Boolean", "Number", "String"]);
		process.env[variable]=value;
		return data;
	}
}

module.exports={
	ModuleEnv
};
