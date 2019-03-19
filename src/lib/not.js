/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleTest}=require("./_test");

/**
 * support for testing for negative conditions
 * @typedef {ModuleTest} ModuleNot
 */
class ModuleNot extends ModuleTest {
	/**
	 * @param {string} action
	 * @param {ModuleBase} catchModule
	 * @param {string} domain
	 * @param {ModuleBase} elseModule - else module handler if there is one
	 * @param {string} method
	 * @param {ModuleBase} nextModule
	 * @param {Array<*>} params
	 * @param {ModuleBase} thenModule - if module if there is one
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
		super({
			action,
			catchModule,
			domain,
			elseModule,
			method,
			nextModule,
			params,
			positive: false,
			thenModule
		});
	}
}

module.exports={
	ModuleNot
};
