/**
 * User: curtis
 * Date: 2019-04-14
 * Time: 18:44
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleFlow}=require("./_flow");
const {resolveType}=require("./_data");

/**
 * Supports looping with feedback - loop output becomes the next cycles input.
 * @typedef {ModuleFlow} ModuleFeedback
 */
class ModuleFeedback extends ModuleFlow {
	/**
	 * Loops while this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async if(blob) {
		return this._processConditionalLoopAction(blob, {
			feedback: true
		});
	}

	/**
	 * Loops while this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async elif(blob) {
		return this._processConditionalLoopAction(blob, {
			feedback: true
		});
	}

	/**
	 * See loop.else for criticism and explanation of else here.
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async else(blob) {
		if(_.isFunction(this.params[0])) {
			return this._processEndlessLoopAction(blob, {
				feedback: true
			});
		} else {
			return resolveType(blob, this.params[0], "*", {allowNullish: true});
		}
	}
}

module.exports={
	ModuleFeedback
};
