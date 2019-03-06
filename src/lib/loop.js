/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 20:53
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleIO}=require("./_io");

/**
 * Allows one to loop. But one must think about what looping means for mouse. We are a very basic scripting language
 * and want to remain a very basic scripting language. I see two valuable and useful means of looping:
 *  1. forever - to give users the ability to repeatedly do something such as probe, test, etc.
 *  2. n iterations - lets call it "times"
 * The first - forever - does not pose any problems. The input to forever becomes the input to its predicate and that is that.
 * But the second - times - gets muddy. What should the input its predicate be? I presume the iteration index
 * would be the preference most of the time. But what about when there is input to times? There isn't a single approach
 * that makes sense. And I don't want to start make assumptions or having different behaviors. So, instead of making "times"
 * an action we are going to create array.range allowing for the consistent and single input model we want to maintain.
 *
 * Note: see history before 3/5/2019 if you are curious about an implementation for "times" (called range) that I am rejecting.
 *
 * @typedef {ModuleIO} ModuleLoop
 */
class ModuleLoop extends ModuleIO {
	/**
	 * Loops forever. One may exit via error.throw or an interrupt signal (to app)
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async forever(blob) {
		const predicate=this._assertPredicate(this.params[0]);
		return new Promise((resolve, reject)=>{
			/**
			 * Calls the predicate but we want to be careful to avoid creating an endless then chain.
			 */
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
}

module.exports={
	ModuleLoop
};
