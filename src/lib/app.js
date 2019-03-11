/**
 * User: curtis
 * Date: 2019-02-26
 * Time: 22:12
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
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
	 * Asserts that the condition in params[0] predicate are true. It is designed to be used with <code>is</code> and <code>note</code>
	 * This guy is one of the few exceptions to the input/output rule. He looks at the input returned by the predicate but returns
	 * <param>blob</param>
	 * @param {DataBlob} blob
	 * @return {Promise<*>}
	 */
	async assert(blob) {
		const predicate=this._assertPredicate(this.params[0]),
			result=await predicate(blob);
		if(Boolean(result)===false) {
			throw new Error(_.get(this.params, 1, "assertion failed"));
		}
		return blob;
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
