/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {ModuleOs}=require("../../../src/lib/os");
const spawn=require("../../../src/common/spawn");

describe("lib.ModuleOs", function() {
	function _createInstance({
		action="action",
		domain="domain",
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
		it("should properly ", async function() {
			const instance=_createInstance({
				params: ["param"]
			});
			proxy.stub(spawn, "command", async({args, command, stdin})=>{
				assert.deepEqual(command, instance.action);
				assert.deepEqual(args, instance.params);
				assert.strictEqual(stdin, "input");
				return Promise.resolve("result");
			});
			return instance.executionHandler("input")
				.then(result=>{
					assert.strictEqual(result, "result");
				});
		});
	});

	describe("_paramsToArguments", function() {
		it("should return params if length is 0", function() {
			const instance=_createInstance({
				params: []
			});
			assert.deepEqual(instance._paramsToArguments(), []);
		});

		it("should return params if length is greater than 1", function() {
			const instance=_createInstance({
				params: ["1", "2"]
			});
			assert.deepEqual(instance._paramsToArguments(), ["1", "2"]);
		});

		it("should parse params if length is 1", function() {
			const instance=_createInstance({
				params: ["1 2"]
			});
			assert.deepEqual(instance._paramsToArguments(), ["1", "2"]);
		});
	});
});
