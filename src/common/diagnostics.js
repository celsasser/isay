/**
 * Date: 3/5/2018
 * Time: 9:10 PM
 * @license MIT (see project's LICENSE file)
 */


/**
 * Gets the current execution stack
 * @param {Object} options
 * @param {number} [options.popCount=0]
 * @param {number} [options.maxLines=10]
 * @returns {string}
 */
module.exports.getStack=function({
	maxLines=10,
	popCount=0
}={}) {
	return exports.groomStack(new Error().stack, {
		maxLines,
		popCount: popCount+2,	// we pop the error message and ourselves
	});
};

/**
 * Grooms the textual stack
 * @param {string} stack
 * @param {number} popCount
 * @param {number} maxLines
 * @returns {string}
 */
module.exports.groomStack=function(stack, {
	maxLines=10,
	popCount=0
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

