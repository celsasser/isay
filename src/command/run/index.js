/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:32
 * Copyright @2019 by Xraymen Inc.
 */

const {parseScript}=require("./parse");
const {XRayError}=require("../../common/error");
const log=require("../../common/log");

/**
 * @param {CliParsed} configuration
 * @returns {Promise<void>}
 */
exports.run=async function(configuration) {
	try {
		log.verbose("- parsing script");
		const descriptors=parseScript(configuration);
		log.verbose("- building pipeline");
		const pipeline=_parsedScriptToPipeline(descriptors);
		log.verbose("- processing pipeline");
		return pipeline.process();
	} catch(error) {
		return Promise.reject(new XRayError({
			error,
			message: "run failed"
		}));
	}
};

/**
 * Translates parsed script into a sequence of modules
 * @param {Array<ModuleDescriptor>} descriptors
 * @returns {ModuleBase}
 * @private
 */
function _parsedScriptToPipeline(descriptors) {
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
				output: next,
				params: descriptor.params
			});
			return _build(index-1, instance);
		}
	}

	/**
	 * Finds the proper type for the descriptor at <param>index</param>
	 * @param {number} index
	 * @returns {string}
	 */
	function _type(index) {
		while(index> -1) {
			if(descriptors[index].type) {
				return descriptors[index].type;
			}
		}
		throw new XRayError({
			message: "insufficient type specifications"
		});
	}

	return _build(descriptors.length-1);
}

/**
 *
 * @param {ModuleDescriptor} descriptor
 * @returns {}
 * @private
 */
function _descriptorToClass(descriptor) {

}
