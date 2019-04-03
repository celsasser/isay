/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {resolveNextTick}=require("../../../src/common/promise");
const spawn=require("../../../src/common/spawn");
const {ModuleOs}=require("../../../src/lib/os");

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
		it("should return params if length is 0", async function() {
			const instance=_createInstance({
				params: []
			});
			return instance._paramsToArguments()
				.then(result=>assert.deepEqual(result, []));
		});

		it("should return params if length is greater than 1", async function() {
			const instance=_createInstance({
				params: ["1", "2"]
			});
			return instance._paramsToArguments()
				.then(result=>assert.deepEqual(result, ["1", "2"]));
		});

		it("should parse params if length is 1", async function() {
			const instance=_createInstance({
				params: ["1 2"]
			});
			return instance._paramsToArguments()
				.then(result=>assert.deepEqual(result, ["1", "2"]));
		});

		it("should allow params to be supplied by predicate in params[0]", async function() {
			const instance=_createInstance({
				params: [resolveNextTick.bind(null, "a b")]
			});
			return instance._paramsToArguments()
				.then(result=>assert.deepEqual(result, ["a", "b"]));
		});
	});
});
