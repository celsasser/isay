/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 00:51
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Translates parsed script into a sequence of modules
 * @param {Array<ModuleDescriptor>} descriptors
 * @returns {ModuleBase}
 */
function createChain(descriptors) {
	/**
	 * Builds chain of modules. Works it's way forward
	 * @param {number} index
	 * @param {ModuleBase} next
	 * @returns {ModuleBase}
	 */
	function _build(index, next=undefined) {
		if(index<0) {
			return next;
		} else {
			const descriptor=descriptors[index];
			const instance=new descriptor.class({
				action: descriptor.action,
				domain: descriptor.domain,
				method: descriptor.method,
				output: next,
				params: descriptor.params
			});
			return _build(index-1, instance);
		}
	}

	return _build(descriptors.length-1);
}

module.exports={
	createChain
};
