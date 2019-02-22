/**
 * User: curtis
 * Date: 3/5/2018
 * Time: 9:10 PM
 * Copyright @2019 by Xraymen Inc.
 *
 * @module common/diagnostics
 */


/**
 * Gets the current execution stack
 * @param {Object} options
 * @param {number} [options.popCount=0]
 * @param {number} [options.maxLines=10]
 * @returns {string}
 */
module.exports.getStack=function(options=undefined) {
	options=Object.assign({
		popCount: 0
	}, options);
	// pop ourselves
	options.popCount++;
	return exports.groomStack(new Error().stack, options);
};

/**
 * Grooms the textual stack
 * @param {string} stack
 * @param {number} popCount
 * @param {number} maxLines
 * @returns {string}
 */
module.exports.groomStack=function(stack, {
	popCount=0,
	maxLines=10
}={}) {
	stack=(stack || "").split("\n");
	if(popCount>0) {
		stack.splice(0, popCount);
	}
	if(maxLines<stack.length) {
		stack.splice(maxLines);
	}
	return stack.join("\n");
};

