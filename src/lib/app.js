/**
 * User: curtis
 * Date: 2019-02-26
 * Time: 22:12
 * Copyright @2019 by Xraymen Inc.
 */

const constant=require("../common/constant");
const {ModuleBase}=require("./_base");
const {assertAction, resolveType}=require("./_data");

/**
 * A body of functionality that affects application execution
 * @typedef {ModuleIO} ModuleApp
 */
class ModuleApp extends ModuleBase {
	/**
	 * Forces abort and exits with error code = 1
	 * @throws {Error}
	 */
	async abort() {
		throw this._createExpectedError({
			code: constant.error.code.ABORT
		});
	}

	/**
	 * Asserts using the predicate in params[0]:  Boolean(this.params[0](blob)).
	 * Intended to be used with domains <code>is</code> and <code>not</code>, but the world is your oyster.
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async assert(blob) {
		return assertAction(this, blob);
	}

	/**
	 * Sleeps for the number of seconds specified in <code>this.params[0]</code> and then returns <param>blob</param>
	 * @resolves duration:(DurationObject|Number) in this.params[0]
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
