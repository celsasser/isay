/**
 * User: curtis
 * Date: 2019-02-25
 * Time: 23:27
 * Copyright @2019 by Xraymen Inc.
 */

const constant=require("../common/constant");
const {XRayError}=require("../common/error");
const {ModuleIO}=require("./_io");

/**
 * Diagnostic operations and flow control (abort)
 * @typedef {ModuleIO} ModuleDebug
 */
class ModuleDebug extends ModuleIO {
	/**
	 * Forces abort
	 * @throws {Error}
	 */
	async abort() {
		throw new XRayError({
			statusCode: constant.status.code.ABORT
		});
	}

	/**
	 * Dumps the state of <param>blob</blob> as well as <code>this.params</code>
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 */
	async dump(blob) {
		const data={
				input: blob,
				params: this.params
			},
			text=JSON.stringify(data, null, "\t");
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
