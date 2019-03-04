/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 20:53
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
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
	 * @resolves {from:Number=0,increment:Number=1,input:String="smart",to:Number}:Object in this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async range(blob) {
		let predicate=this._assertPredicate(this.params[0]);
		this._assertType(this.params[1], "Object");
		let startIndex=_.get(this.params[1], "from", 0),
			endIndex=this.params[1].to,
			increment=_.get(this.params[1], "increment", 1),
			inputMode=_.get(this.params[1], "input", "smart");
		this._assertType(endIndex, "Number");
		this._assertType(startIndex, "Number");
		this._assertType(increment, "Number");
		this._assertType(inputMode, ["Boolean", "String"]);
		// here we are trying to figure out whether they want <param>blob</param> as input. 99% of the time they probably
		// do not and "smart" (our default) should do the trick which is to say if there is input then use it otherwise
		// the pole position input will be an index.
		if(inputMode==="smart") {
			if(blob!==undefined) {
				predicate=predicate.bind(null, blob);
			}
		} else if(inputMode!=="index") {
			predicate=predicate.bind(null, blob);
		}
		for(startIndex; startIndex<endIndex; startIndex+=increment) {
			await predicate(startIndex);
		}
		return blob;
	}
}

module.exports={
	ModuleLoop
};
