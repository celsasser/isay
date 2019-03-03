/**
 * User: curtis
 * Date: 2019-03-02
 * Time: 20:09
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleError}=require("../../../src/lib/error");

describe("lib.ModuleError", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleError({
			action,
			domain,
			method,
			params
		});
	}

	describe("catch", function() {
		it("should raise exception if params[0] is not a predicate", async function() {
			const instance=_createInstance();
			return instance.catch()
				.catch(error=>{
					assert.strictEqual(error.message, "missing predicate function");
				});
		});

		it("should return the result of the predicate", function() {
			const instance=_createInstance({
				params: [(blob, error)=>{
					assert.strictEqual(blob, "blob");
					assert.strictEqual(error, "error");
					return "result";
				}]
			});
			return instance.catch("blob", "error")
				.then(result=>{
					assert.strictEqual(result, "result");
				});
		});
	});

	describe("throw", function() {
		it("should raise exception if params[0] is not a valid type", async function() {
			const instance=_createInstance();
			return instance.throw()
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Error or Function or String but found undefined");
				});
		});

		it("should forward to predicate if params[0] is a predicate", function() {
			const instance=_createInstance({
				params: [blob=>{
					assert.strictEqual(blob, "blob");
					throw new Error("failed");
				}]
			});
			return instance.throw("blob")
				.catch(error=>{
					assert.strictEqual(error.message, "failed");
				});
		});

		it("should throw params[0] if it is an Error", function() {
			const instance=_createInstance({
				params: [new Error("failed")]
			});
			return instance.throw("blob")
				.catch(error=>{
					assert.strictEqual(error.message, "failed");
				});
		});

		it("should throw error with params[0] as text if params[0] is a string", function() {
			const instance=_createInstance({
				params: ["failed"]
			});
			return instance.throw("blob")
				.catch(error=>{
					assert.strictEqual(error.message, "failed");
				});
		});
	});
});
