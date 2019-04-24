/**
 * Date: 2019-03-02
 * Time: 20:09
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const {ModuleError}=require("../../../src/lib/error");

describe("lib.ModuleError", function() {
	function _createInstance({
		action="action",
		domain="domain",
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
		it("should return input if params[0] is not defined", async function() {
			const instance=_createInstance();
			return instance.catch("error", "input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});

		it("should return params[0] if set and not a predicate", function() {
			const instance=_createInstance({
				params: ["result"]
			});
			return instance.catch("error")
				.then(result=>{
					assert.strictEqual(result, "result");
				});
		});

		it("should return the result of a predicate", function() {
			const instance=_createInstance({
				params: [error=>{
					assert.strictEqual(error, "error");
					return "result";
				}]
			});
			return instance.catch("error")
				.then(result=>{
					assert.strictEqual(result, "result");
				});
		});
	});

	describe("throw", function() {
		it("should raise exception if params[0] is not a valid type", async function() {
			const instance=_createInstance();
			return instance.throw()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Error, Function or String but found undefined");
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
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "failed");
				});
		});

		it("should throw params[0] if it is an Error", function() {
			const instance=_createInstance({
				params: [new Error("failed")]
			});
			return instance.throw("blob")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "failed");
				});
		});

		it("should throw error with params[0] as text if params[0] is a string", function() {
			const instance=_createInstance({
				params: ["failed"]
			});
			return instance.throw("blob")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "failed");
				});
		});
	});
});
