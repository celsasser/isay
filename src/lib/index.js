/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:48
 * Copyright @2019 by Xraymen Inc.
 */

const {JsonModule}=require("./json");

/**
 *
 * @param {ModuleDescriptor} descriptor
 * @param {string} defaultType
 * @returns {class}
 * @throws {Error}
 */
function descriptorToClass({
	descriptor,
	defaultType=undefined
}) {
	return JsonModule;
}

module.exports={
	descriptorToClass
};

