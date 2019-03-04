/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 20:53
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleIO}=require("./_io");

/**
 * Allows one to loop. One must think about what looping means for mouse. We are a very basic scripting language and want
 * to remain a very basic scripting language. I see two valuable and useful means of looping:
 * 1. forever - to give users the ability to repeatedly do something such as probe, test, etc.
 * 2. x number of times - it's a nice way to introduce indexed operations and a finite means of probing, testing, etc.
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

	/**
	 * Loops a finite number of times. There is some flexibility in creating the sequence it iterates over
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @resolves endIndex:Number in this.params[1]
	 * @resolves fromIndex:Number in this.params[1]
	 * @resolves endIndex:Number in this.params[2]
	 * @resolves increment:Number in this.params[3]
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async range(blob) {
		let endIndex,
			increment=1,
			startIndex=0;
		const predicate=this._assertPredicate(this.params[0]);
		this._assertType(this.params[1], "Number");
		if(this.params.length===2) {
			endIndex=this.params[1];
		} else {
			this._assertType(this.params[2], "Number");
			startIndex=this.params[1];
			endIndex=this.params[2];
			if(this.params.length>=4) {
				this._assertType(this.params[3], "Number");
				increment=this.params[3];
			}
		}
		for(startIndex; startIndex<endIndex; startIndex+=increment) {
			await predicate(blob, startIndex);
		}
		return blob;
	}
}

module.exports={
	ModuleLoop
};
