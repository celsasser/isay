/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {ModuleStd}=require("../../../src/lib/std");

describe("lib.ModuleStd", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleStd({
			action,
			domain,
			method,
			params
		});
	}

	afterEach(function() {
		proxy.unstub();
	});

	[
		[process.stderr, "error"],
		[process.stdout, "out"],
	].forEach(([stream, method])=>{
		describe(method, function() {
			it("should properly write data to stderr and return input data", async function() {
				const instance=_createInstance();
				proxy.stub(stream, "write", async function(text, callback) {
					assert.strictEqual(text, "test\n");
					process.nextTick(callback);
				});
				return instance[method]("test")
					.then(result=>{
						assert.strictEqual(result, "test");
						assert.strictEqual(stream.write.callCount, 1);
					});
			});
		});
	});

	describe("in", function() {
		it("should return whatever is in params[0]", async function() {
			const instance=_createInstance({
				params: ["data"]
			});
			return instance.in()
				.then(result=>{
					assert.strictEqual(result, "data");
				});
		});
	});
});
