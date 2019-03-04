/**
 * User: curtis
 * Date: 2019-02-18
 * Time: 22:15
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModulePath}=require("../../../src/lib/path");

describe("lib.ModulePath", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModulePath({
			action,
			domain,
			method,
			params
		});
	}

	describe("absolute", function() {
		it("should throw exception if input data is not a string", async function() {
			const instance=_createInstance();
			return instance.absolute(null)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found null");
				});
		});

		it("should properly return relative path to cwd if defaulted", async function() {
			const instance=_createInstance();
			return instance.absolute("test")
				.then(result=>{
					assert.strictEqual(result, `${process.cwd()}/test`);
				});
		});

		it("should properly return relative path to specified from directory when included", async function() {
			const instance=_createInstance({
				params: ["/"]
			});
			return instance.absolute("test")
				.then(result=>{
					assert.strictEqual(result, "/test");
				});
		});
	});

	describe("relative", function() {
		it("should throw exception if input data is not a string", async function() {
			const instance=_createInstance();
			return instance.relative(null)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found null");
				});
		});

		it("should properly return relative path to cwd if defaulted", async function() {
			const instance=_createInstance();
			return instance.relative(`${process.cwd()}/test`)
				.then(result=>{
					assert.strictEqual(result, "test");
				});
		});

		it("should properly return relative path to specified from directory when included", async function() {
			const instance=_createInstance({
				params: ["/a/b/c"]
			});
			return instance.relative("/a/b")
				.then(result=>{
					assert.strictEqual(result, "..");
				});
		});
	});
});
