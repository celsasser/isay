/**
 * User: curtis
 * Date: 2019-02-25
 * Time: 23:40
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const constant=require("../../../src/common/constant");
const {ModuleApp}=require("../../../src/lib/app");

describe("lib.ModuleApp", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleApp({
			action,
			domain,
			method,
			params
		});
	}

	afterEach(function() {
		proxy.unstub();
	});

	describe("abort", function() {
		it("should throw an exception", async function() {
			const instance=_createInstance();
			instance.abort()
				.catch(error=>{
					assert.strictEqual(error.code, constant.error.code.ABORT);
				});
		});
	});

	describe("sleep", function() {
		it("should throw error if params[0] is not a number", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.sleep()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Number but found String");
				});
		});

		it("should sleep for the number of seconds specified in params[0]", async function() {
			const instance=_createInstance({
				params: [10/1000]
			});
			return instance.sleep("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});
	});
});
