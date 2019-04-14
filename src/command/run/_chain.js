/**
 * User: curtis
 * Date: 2019-04-13
 * Time: 13:18
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");


/**
 * Translates parsed script into a sequence of modules
 * @param {Array<ModuleDescriptor>} descriptors
 * @returns {ModuleBase}
 */
function buildChain(descriptors) {
	/**
	 * This guys job is to make sure descriptors[index] is fully described. If it isn't then it searches
	 * up the chain until it finds its "parent".  Throws exception if it cannot be fully described.
	 * @param {number} index
	 * @return {ModuleDescriptor}
	 * @throws {Error}
	 */
	function getFullyDescribedModule(index) {
		const descriptor=descriptors[index];
		if(descriptor.domain) {
			return descriptor;
		} else {
			// what do we know? We know that our "parent" must be "if" because all of the loner
			// actions that we support all stem from "if"
			for(--index; index>-1; index--) {
				if(descriptors[index].action==="if") {
					return _.merge({
						class: descriptors[index].class,
						domain: descriptors[index].domain
					}, descriptor);
				}
			}
		}
		throw new Error(`"${descriptor.action}" missing a parent "if"`);
	}

	/**
	 * Builds chain of modules. Works it's from back to front
	 * @param {number} index
	 * @param {ModuleBase} nextModule
	 * @param {ModuleBase} catchModule - "catch" handler
	 * @param {ModuleBase} elseModule
	 * @param {ModuleBase} thenModule
	 * @param {ModuleDescriptorValidator} validate
	 * @returns {ModuleBase}
	 */
	function _build({
		catchModule=undefined,
		elseModule=undefined,
		index,
		nextModule=undefined,
		thenModule=undefined,
		validate=_.noop
	}) {
		if(index<0) {
			return nextModule;
		}
		const descriptor=getFullyDescribedModule(index);
		validate(descriptor);
		const instance=new descriptor.class({
			action: descriptor.action,
			catchModule,
			domain: descriptor.domain,
			elseModule,
			method: descriptor.method,
			nextModule,
			params: descriptor.params,
			thenModule
		});

		/**
		 * Asserts that the current descriptor is not at the head of a chain
		 */
		const assertNotHead=()=>{
			if(index===0) {
				throw new Error(`unexpected "${descriptor.domain}.${descriptor.action}" at head of the chain`);
			}
		};

		/**
		 * Asserts that <param>module</param> is the same domain as <code>instance</code> and is "else" or "elif"
		 * @param {ModuleDescriptor} module
		 */
		const assertIfConditional=(module)=>{
			if(module.domain!==instance.domain
				|| (module.action!=="if" && module.action!=="elif")) {
				throw new Error(`misplaced "${instance.domain}.${instance.action}" statement`);
			}
		};

		/**
		 * Asserts that <param>module</param> is a then action
		 * @param {ModuleDescriptor} module
		 */
		const assertThen=(module)=>{
			if(_.get(module, "action")!=="then") {
				throw new Error(`"${descriptor.domain}.${descriptor.action}" missing a "then" action`);
			}
		};

		switch(descriptor.action) {
			case "catch": {
				// This instance is an exception handler. We never want to flow into him. If an error is thrown then we want
				// to flow around him. But from here on he will be installed as the catch handler (until superseded)
				assertNotHead();
				return _build({
					index: index-1,
					catchModule: instance,
					nextModule
				});
			}
			case "elif": {
				assertNotHead();
				assertThen(thenModule);
				return _build({
					index: index-1,
					catchModule,
					elseModule: instance,
					nextModule,
					validate: assertIfConditional
				});
			}
			case "else": {
				assertNotHead();
				return _build({
					index: index-1,
					catchModule,
					elseModule: instance,
					nextModule,
					validate: assertIfConditional
				});
			}
			case "if": {
				assertThen(thenModule);
				return _build({
					index: index-1,
					catchModule,
					nextModule: instance
				});
			}
			case "then": {
				assertNotHead();
				return _build({
					index: index-1,
					catchModule,
					elseModule: instance,
					nextModule,
					thenModule: instance,
					validate: assertIfConditional
				});
			}
			default: {
				return _build({
					index: index-1,
					catchModule,
					nextModule: instance
				});
			}
		}
	}

	return _build({index: descriptors.length-1});
}


module.exports={
	buildChain
};
