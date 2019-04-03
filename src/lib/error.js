/**
 * User: curtis
 * Date: 2019-03-02
 * Time: 19:39
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");
const {assertPredicate, assertType}=require("./_data");

/**
 * Supports error creation and handling.
 * @typedef {ModuleBase} ModuleError
 */
class ModuleError extends ModuleBase {
	/**
	 * Exception handling. Processing rules are as follows:
	 * - no params: <param>blob</param> is returned
	 * - params[0] is a predicate: predicate(blob) called and its result is returned
	 * - params[0] is not a predicate: params[0] is returned
	 * Note: which exception handler is called follows after and nearest rules. See <link>ModuleBase.process</link> for more info.
	 * @resolves predicate:CatchPredicate in this.params[0]
	 * @resolves result:(*) in this.params[0]
	 * @param {Error} error
	 * @param {DataBlob} blob
	 * @returns {Promise<*>}
	 * @attribute flow
	 */
	async catch(error, blob) {
		if(this.params.length===0) {
			return blob;
		} else if(typeof(this.params[0])==="function") {
			const predicate=assertPredicate(this.params[0], blob);
			return predicate(error);
		} else {
			return this.params[0];
		}
	}

	/**
	 * I thought this guy over and concluded that it should exist for three reasons:
	 * 1. where there is a catch there should be a throw
	 * 2. a user may want to catch and rethrow an error.
	 * 3. a user may want to use exceptions as a means of flow control
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @resolves text:(string|Error} in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 * @attribute flow
	 */
	async throw(blob) {
		assertType(this.params[0], ["Error", "Function", "String"]);
		if(this.params[0].constructor.name==="Error") {
			throw this._createExpectedError({
				error: this.params[0]
			});
		} else if(this.params[0].constructor.name==="String") {
			throw this._createExpectedError({
				message: this.params[0]
			});
		} else {
			return assertPredicate(this.params[0])(blob)
				.catch(error=>{
					throw this._createExpectedError({error});
				});
		}
	}
}

module.exports={
	ModuleError
};
