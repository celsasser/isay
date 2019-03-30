/**
 * User: curtis
 * Date: 2019-02-26
 * Time: 22:12
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const constant=require("../common/constant");
const {ModuleIO}=require("./_io");
const {resolveType}=require("./_data");

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
	 * Asserts that the condition in params[0] predicate is true. It is designed to be used with <code>is</code> and <code>not</code>
	 * This guy is one of the few exceptions to the input/output rule. He looks at the input returned by the predicate but returns
	 * <param>blob</param>
	 * @param {DataBlob} blob
	 * @return {Promise<*>}
	 */
	async assert(blob) {
		const result=await resolveType(blob, this.params[0], "*", {
			allowNull: true
		});
		if(Boolean(result)===false) {
			throw new Error(_.get(this.params, 1, "assertion failed"));
		}
		return blob;
	}

	/**
	 * Sleeps for the number of seconds specified in <code>this.params[0]</code> and then returns <param>blob</param>
	 * @resolves seconds:Number in this.params[0]
	 * @resolves {millis:Number, seconds:Number, minutes:Number, hours:Number, days:Number} in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<void>}
	 */
	async sleep(blob) {
		let totalMillis;
		const param=await resolveType(blob, this.params[0], ["Number", "Object"]);
		if(param.constructor.name==="Number") {
			totalMillis=param*1000;
		} else {
			const {
				days=0,
				hours=0,
				millis=0,
				minutes=0,
				seconds=0
			}=param;
			totalMillis=millis
				+seconds*1000
				+minutes*1000*60
				+hours*1000*60*60
				+days*1000*60*60*24;
		}
		return new Promise((resolve)=>{
			setTimeout(resolve.bind(null, blob), totalMillis);
		});
	}
}

module.exports={
	ModuleApp
};
