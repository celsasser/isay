/**
 * User: curtis
 * Date: 2019-02-25
 * Time: 23:27
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleIO}=require("./_io");

/**
 * Diagnostic actions
 * @typedef {ModuleIO} ModuleDebug
 */
class ModuleDebug extends ModuleIO {
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
