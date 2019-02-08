/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:32
 * Copyright @2019 by Xraymen Inc.
 */

const {createChain}=require("./_chain");
const {parseScript}=require("./_parse");
const {XRayError}=require("../../common/error");
const log=require("../../common/log");

/**
 * @param {CliParsed} configuration
 * @returns {Promise<DataBlob>}
 */
exports.run=async function(configuration) {
	try {
		log.verbose("- parsing script");
		const descriptors=parseScript(configuration);
		log.verbose("- building pipeline");
		const chain=createChain(descriptors);
		log.verbose("- processing pipeline");
		return chain.process();
	} catch(error) {
		return Promise.reject(new XRayError({
			error,
			message: "run failed"
		}));
	}
};

