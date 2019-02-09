/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleOs}=require("../../../src/lib/os");

describe("lib.ModuleOs", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleOs({
			action,
			domain,
			method,
			params
		});
	}

	describe("executionHandler", function() {
		// There is no shell when run via the mocha test runner. Gonna let this guy go for now.
		it.skip("should successfully return results with a valid command", async function() {
			const instance=_createInstance({
				params: ["ls"]
			});
			return instance.executionHandler()
				.then(result=>{
					assert.ok(result.indexOf("..")>-1);
				})
				.catch(assert.fail);
		});
	});
});
