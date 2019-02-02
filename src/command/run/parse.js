/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:28
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * @param {CliParsed} configuration
 * @returns {Array<ModuleDescriptor>}
 */
function parseScript(configuration) {
	return [{
		type: "json",
		action: "load",
		params: ["./test/data/dummy.json"]
	}];
};

module.exports={
	parseScript
};
