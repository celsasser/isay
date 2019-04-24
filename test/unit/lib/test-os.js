/**
 * Date: 2019-02-08
 * Time: 10:06 PM
 * @license MIT (see project's LICENSE file)
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
			proxy.stub(spawn, "command", async({args, command, input, output})=>{
				assert.deepEqual(command, instance.action);
				assert.deepEqual(args, instance.params);
				assert.strictEqual(input, "input");
				assert.strictEqual(output, undefined);
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
			return ModuleOs._paramsToArguments("input", [])
				.then(result=>assert.deepEqual(result, []));
		});

		it("should return params if length is greater than 1", async function() {
			return ModuleOs._paramsToArguments("input", ["1", "2"])
				.then(result=>assert.deepEqual(result, ["1", "2"]));
		});

		it("should parse params if length is 1", async function() {
			return ModuleOs._paramsToArguments("input", ["1 2"])
				.then(result=>assert.deepEqual(result, ["1", "2"]));
		});

		it("should allow params to be supplied by predicate in params[0]", async function() {
			return ModuleOs._paramsToArguments("input", [resolveNextTick.bind(null, "a b")])
				.then(result=>assert.deepEqual(result, ["a", "b"]));
		});
	});

	describe("_preprocessParams", function() {
		it("should return params as input if params is empty", function() {
			const {
				options,
				params
			}=ModuleOs._preprocessParams([]);
			assert.strictEqual(options, undefined);
			assert.deepEqual(params, []);
		});

		it("should return params if last param does not look like options", function() {
			const {
				options,
				params
			}=ModuleOs._preprocessParams(["a", "b"]);
			assert.strictEqual(options, undefined);
			assert.deepEqual(params, ["a", "b"]);
		});

		it("should properly process options in params[0]", function() {
			const {
				options,
				params
			}=ModuleOs._preprocessParams([{
				stdout: "live"
			}]);
			assert.deepEqual(options, {
				stdout: "live"
			});
			assert.deepEqual(params, []);
		});

		it("should properly process options in any other position", function() {
			const {
				options,
				params
			}=ModuleOs._preprocessParams(["a", {
				stdout: "live"
			}]);
			assert.deepEqual(options, {
				stdout: "live"
			});
			assert.deepEqual(params, ["a"]);
		});
	});
});
