/**
 * User: curtis
 * Date: 2019-02-12
 * Time: 12:05 AM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleEnv}=require("../../../src/lib/env");

describe("lib.ModuleEnv", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleEnv({
			action,
			domain,
			method,
			params
		});
	}

	describe("delete", function() {
		it("should throw exception if variable name not found", async function() {
			const instance=_createInstance();
			return instance.delete()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found undefined");
				});
		});

		it("should properly delete an existing variable", async function() {
			const instance=_createInstance({
				params: ["test"]
			});
			process.env["test"]="delete";
			assert.strictEqual(process.env["test"], "delete");
			return instance.delete("irrelevant")
				.then(result=>{
					assert.strictEqual(result, "irrelevant");
					assert.strictEqual(process.env.hasOwnProperty("test"), false);
				});
		});
	});

	describe("get", function() {
		it("should get the whole enchilada", async function() {
			const instance=_createInstance();
			return instance.get()
				.then(result=>{
					assert.deepEqual(result, process.env);
				});
		});
	});

	describe("set", function() {
		it("should throw exception if variable name not found", async function() {
			const instance=_createInstance();
			return instance.set("value")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found undefined");
				});
		});

		it("should throw exception if name is not a string", async function() {
			const instance=_createInstance({
				params: [1]
			});
			return instance.set()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found Number");
				});
		});

		it("should properly set variable if value in data", async function() {
			const instance=_createInstance({
				params: ["test", "right"]
			});
			return instance.set("wrong")
				.then(result=>{
					assert.strictEqual(result, "wrong");
					assert.strictEqual(process.env.test, "right");
				});
		});

		it("should properly set variable if value in param", async function() {
			const instance=_createInstance({
				params: ["test"]
			});
			return instance.set("right")
				.then(result=>{
					assert.strictEqual(result, "right");
					assert.strictEqual(process.env.test, "right");
				});
		});
	});
});
