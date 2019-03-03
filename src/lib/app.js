/**
 * User: curtis
 * Date: 2019-02-26
 * Time: 22:12
 * Copyright @2019 by Xraymen Inc.
 */

const constant=require("../common/constant");
const {ModuleIO}=require("./_io");

/**
 * A body of functionality that affects application execution
 * @typedef {ModuleIO} ModuleApp
 */
class ModuleApp extends ModuleIO {
	/**
	 * Forces abort
	 * @throws {Error}
	 */
	async abort() {
		throw this._createExpectedError({
			code: constant.error.code.ABORT
		});
	}

	/**
	 * Sleeps for the number of seconds specified in <code>this.params[0]</code> and then returns <param>blob</param>
	 * @resolves seconds:Number in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<void>}
	 */
	async sleep(blob) {
		this._assertType(this.params[0], "Number");
		const millis=this.params[0]*1000;
		return new Promise((resolve)=>{
			setTimeout(resolve.bind(null, blob), millis);
		});
	}
}

module.exports={
	ModuleApp
};
