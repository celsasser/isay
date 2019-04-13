/**
 * User: curtis
 * Date: 2019-04-10
 * Time: 20:15
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");
const {boolean, resolveType}=require("./_data");

/**
 * Base class for all modules that can alter the flow of execution
 * @typedef {ModuleBase} ModuleFlow
 */
class ModuleFlow extends ModuleBase {
	/**
	 * @param {string} action
	 * @param {ModuleBase} catchModule
	 * @param {string} domain
	 * @param {ModuleBase} elseModule - else or elif module handler (if there is one)
	 * @param {string} method
	 * @param {ModuleBase} nextModule
	 * @param {ModuleBase} thenModule
	 * @param {Array<*>} params
	 */
	constructor({
		action,
		catchModule=undefined,
		domain,
		elseModule=undefined,
		method,
		nextModule=undefined,
		params=[],
		thenModule=undefined
	}) {
		super({action, catchModule, domain, method, nextModule, params});
		this._elseModule=elseModule;
		this._thenModule=thenModule;
	}

	/**
	 * Simple beast that resolves the value/predicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async then(blob) {
		// I can't see the use case for omitting this.params[0] or setting it to null,
		// but I can't justify not allowing it either.
		return resolveType(blob, this.params[0], "*", {allowNullish: true});
	}

	/********************* Protected Interface *********************/
	/**
	 * Processes non-feedback conditional "loop" test.
	 * @resolves testPredicate:TestPredicate in this.params[0]
	 * @resolves actPredicate:ActionPredicate in this.params[1]
	 * @param {DataBlob} blob
	 * @param {boolean} feedback - should loop result be fed back into loop
	 * @returns {Promise<DataBlob>} - what gets returned depends on whether there is then/else processing.
	 * @protected
	 */
	async _processConditionalLoopAction(blob, {
		feedback=false
	}={}) {
		// here we are not going to all null/undefined. Cause the use cases are fewer
		// that the mistake that omitting it likely is.
		if(boolean(await resolveType(blob, this.params[0], "*"))) {
			// Now we loop until this.params[0] returns falsey
			return new Promise((resolve, reject)=>{
				const _loop=(blob)=>{
					this._thenModule.process(blob)
						.then(async(result)=>{
							const input=(feedback)
								? result
								: blob;
							if(boolean(await resolveType(input, this.params[0], "*"))) {
								process.nextTick(_loop, input);
							} else {
								resolve(result);
							}
						})
						.catch(reject);
				};
				_loop(blob);
			});
		} else if(this._elseModule) {
			return this._elseModule.process(blob);
		} else {
			return blob;
		}
	}

	/**
	 * Processes any conditional "step" test.
	 * @resolves testPredicate:TestPredicate in this.params[0]
	 * @resolves actPredicate:ActionPredicate in this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>} - what gets returned depends on whether there is then/else processing.
	 * @protected
	 */
	async _processConditionalStepAction(blob) {
		if(boolean(await resolveType(blob, this.params[0], "*"))) {
			return this._thenModule.process(blob);
		} else if(this._elseModule) {
			return this._elseModule.process(blob);
		} else {
			return blob;
		}
	}
}

module.exports={
	ModuleFlow
};
