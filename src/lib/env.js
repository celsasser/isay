/**
 * User: curtis
 * Date: 2019-02-14
 * Time: 23:47
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");
const {resolveType}=require("./_data");

/**
 * @typedef {ModuleBase} ModuleEnv
 */
class ModuleEnv extends ModuleBase {
	/**
	 * Sets env variable to value. The rules for where it finds it's operands are as follows:
	 * @resolves variable:string in this.params[0]
	 * @param {*} blob
	 * @return {Promise<DataBlob>}
	 */
	async delete(blob) {
		const variable=await resolveType(blob, this.params[0], "String");
		delete process.env[variable];
		return blob;
	}

	/**
	 * Follows read rules
	 * - if no params then returns all variables.
	 * - otherwise looks for variable specified in params[0]
	 * @resolves variable:(string|undefined) in this.params[0] - optional
	 * @resolves default:(*|undefined) in this.params[1] - optional
	 * @param {DataBlob} blob
	 * @return {Promise<Object|*>}
	 */
	async get(blob) {
		if(this.params.length===0) {
			return process.env;
		} else {
			const variable=await resolveType(blob, this.params[0], "String");
			if(process.env.hasOwnProperty(variable)) {
				return process.env[variable];
			} else {
				return resolveType(blob, this.params[1], "*", {allowNullish: true});
			}
		}
	}

	/**
	 * Sets env variable to value. The rules for where it finds it's operands are as follows:
	 * @resolves variable:string in this.params[0]
	 * @resolves value:(string|number|boolean) in this.params[1]|blob
	 * @param {string|undefined} blob
	 * @return {Promise<DataBlob>}
	 */
	async set(blob) {
		const variable=await resolveType(blob, this.params[0], "String"),
			value=await resolveType(blob, this.params[1], ["Boolean", "Number", "String"], {
				defaultUndefined: blob
			});
		process.env[variable]=value;
		return blob;
	}
}

module.exports={
	ModuleEnv
};
