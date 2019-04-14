/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 20:53
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleFlow}=require("./_flow");
const {resolveType}=require("./_data");

/**
 * Supports looping.
 * We are a very basic scripting language and want to remain one, But what is a scripting language without looping?
 * Let's take a look at the kind of looping we may want to support:
 *  1. forever - to give users the ability to repeatedly do something such as probe, test, etc.
 *  2. conditional - do, until...
 *  3. n iterations - for, each, forEach...
 * "forever": is a no brainer and fits nicely into our model.
 * "conditional": could fit nicely should we use separate params for the test and processing. What the input is
 *    is a little muddy - is it the input to the calling method or is it feedback from the loop?
 * "n iterations": this guy gets muddy. What should the input to its predicate be? I presume the iteration index
 *    would be the preference most of the time. But what about the blob param? There isn't any one nice solution
 *    here that is going to solve all problems. And I want to avoid assumptions and cheap hacks. So, instead of
 *    making "times" an action we are going to create array.range allowing for the consistent and single (more or less)
 *    input model we want to maintain.
 *
 *    Note: see history before 3/5/2019 if you are curious about an implementation for "times" (called range) that I am rejecting.
 *
 * @typedef {ModuleFlow} ModuleLoop
 */
class ModuleLoop extends ModuleFlow {
	/**
	 * Loops while this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async if(blob) {
		return this._processConditionalLoopAction(blob, {
			feedback: false
		});
	}

	/**
	 * Loops while this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async elif(blob) {
		return this._processConditionalLoopAction(blob, {
			feedback: false
		});
	}

	/**
	 * Loops endlessly if the params[0] is a predicate. And returns params[0] if it is not a predicate.
	 * Hmmm, that doesn't seem right, you say. And I say you are right. Buyer beware. But we are keeping it because
	 * we are treating loop and step identically and we don't want to make exceptions within the interpreter nor in
	 * the language. So here he lies, in wait, like a hungry tiger at a watering hole - that's it, just a little closer tiny gazelle...
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async else(blob) {
		if(_.isFunction(this.params[0])) {
			return this._processEndlessLoopAction(blob);
		} else {
			return resolveType(blob, this.params[0], "*", {allowNullish: true});
		}
	}

	/**
	 * Loops forever. One may exit via error.throw or an interrupt signal (to app)
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async forever(blob) {
		this._processEndlessLoopAction(blob);
	}
}

module.exports={
	ModuleLoop
};
