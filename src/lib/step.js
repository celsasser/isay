/**
 * User: curtis
 * Date: 2019-04-11
 * Time: 20:59
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleFlow}=require("./_flow");
const {resolveType}=require("./_data");

/**
 * Supports Conditionals with "step into" (vs. looping) functionality
 */
class ModuleStep extends ModuleFlow {
	/**
	 * Calls this.params[1] if this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async if(blob) {
		return this._processConditionalStepAction(blob);
	}

	/**
	 * Calls this.params[1] if this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async elif(blob) {
		return this._processConditionalStepAction(blob);
	}

	/**
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async else(blob) {
		// I can't see the use case for omitting this.params[0] or setting it to null,
		// but I can't justify not allowing it either.
		return resolveType(blob, this.params[0], "*", {allowNullish: true});
	}
}

module.exports={
	ModuleStep
};
