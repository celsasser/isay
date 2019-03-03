/**
 * User: curtis
 * Date: 2019-03-02
 * Time: 19:39
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");

/**
 * Supports error creation and handling.
 * @typedef {ModuleBase} ModuleError
 */
class ModuleError extends ModuleBase {
	/**
	 * Allows for a user to insert error handlers. There are two possible outcomes:
	 * - they throw an error in which case it goes to the next handler or we exit
	 * - whatever the return becomes input for whatever follows this action
	 * @resolves predicate:CatchPredicate in this.params[0]
	 * @param {Error} error
	 * @returns {Promise<*>}
	 */
	async catch(error) {
		const predicate=this._assertPredicate(this.params[0]);
		return predicate(error);
	}

	/**
	 * I thought this guy over and concluded that it should exist for two reasons:
	 * 1. where there is a catch there should be a throw
	 * 2. a user may want to catch and rethrow an error.
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @resolves text:(string|Error} in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async throw(blob) {
		this._assertType(this.params[0], ["Error", "Function", "String"]);
		if(this.params[0].constructor.name==="Error") {
			throw this._createExpectedError({
				error: this.params[0]
			});
		} else if(this.params[0].constructor.name==="String") {
			throw this._createExpectedError({
				message: this.params[0]
			});
		} else {
			return this._assertPredicate(this.params[0])(blob)
				.catch(error=>{
					throw this._createExpectedError({error});
				});
		}
	}
}

module.exports={
	ModuleError
};
