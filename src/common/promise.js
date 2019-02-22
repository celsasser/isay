/**
 * User: curtis
 * Date: 3/5/2018
 * Time: 9:10 PM
 * Copyright @2019 by Xraymen Inc.
 *
 * @module common/promise
 */

/**
 * Creates a process chain out of an array of promise factories.  Why can't they be promises? Because promises execute immediately.
 * We want to defer execution until the prior promise has resolved.
 * @param {[Function]} series of promise
 * @param {Object} [initialParameter] parameter into the first handler
 * @returns {Promise}
 */
module.exports.series=function(series=[], initialParameter=undefined) {
	if(series.length>0) {
		if(series[0] instanceof Promise) {
			throw new Error("elements must be promise factores");
		}
	}
	return series.reduce((current, next)=>current.then(next), Promise.resolve(initialParameter));
};

module.exports.parallel=Promise.all;
