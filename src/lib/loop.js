/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 20:53
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleFlow}=require("./_flow");
const {assertPredicate}=require("./_data");

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
	 * Loops while this.params[0] returns a truthy value.
	 * "But this is else?" you ask. Yes, but if we don't test we will never exit else.
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async else(blob) {
		return this._processConditionalLoopAction(blob, {
			feedback: false
		});
	}

	/**
	 * Loops while this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async feedback(blob) {
		return this._processConditionalLoopAction(blob, {
			feedback: true
		});
	}

	/**
	 * Loops forever. One may exit via error.throw or an interrupt signal (to app)
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async forever(blob) {
		const predicate=assertPredicate(this.params[0]);
		return new Promise((resolve, reject)=>{
			const _run=()=>{
				predicate(blob)
					.then(()=>{
						process.nextTick(_run);
					})
					.catch(reject);
			};
			_run();
		});
	}

	/**
	 * Loops while this.params[0] returns a truthy value
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async while(blob) {
		return this._processConditionalLoopAction(blob, {
			feedback: false
		});
	}
}

module.exports={
	ModuleLoop
};
