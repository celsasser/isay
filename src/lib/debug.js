/**
 * User: curtis
 * Date: 2019-02-25
 * Time: 23:27
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");
const {assertAction}=require("./_data");


/**
 * Diagnostic actions
 * @typedef {ModuleBase} ModuleDebug
 */
class ModuleDebug extends ModuleBase {
	/**
	 * Asserts using the predicate in params[0]:  Boolean(this.params[0](blob)).
	 * Intended to be used with domains <code>is</code> and <code>not</code>, but the world is your oyster.
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async assert(blob) {
		return assertAction(this, blob);
	}

	/**
	 * Dumps the state of <param>blob</blob> as well as <code>this.params</code>
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 */
	async dump(blob) {
		const text=JSON.stringify({
			input: blob,
			params: this.params
		}, null, "\t");
		return new Promise(resolve=>{
			process.stdout.write(`${text}\n`, ()=>{
				resolve(blob);
			});
		});
	}
}

module.exports={
	ModuleDebug
};
