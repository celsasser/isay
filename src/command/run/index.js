/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:32
 * Copyright @2019 by Xraymen Inc.
 */

const {parseScript}=require("./parse");
const {descriptorToClass}=require("../../lib/index");
const {HorseError}=require("../../common/error");

/**
 * @param {CliParsed} configuration
 * @returns {Promise<void>}
 */
exports.run=async function(configuration) {
	try {
		const descriptors=parseScript(configuration),
			pipeline=_parsedScriptToPipeline(descriptors);
		return pipeline.process();
	} catch(error) {
		return Promise.reject(new HorseError({
			error,
			message: "attempt to run failed"
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
			const descriptor=descriptors[index],
				Class=descriptorToClass({
					descriptor,
					defaultType: _type(index)
				});
			const instance=new Class({
				action: descriptor.action,
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
		throw new HorseError({
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
