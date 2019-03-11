/**
 * User: curtis
 * Date: 2019-02-23
 * Time: 19:00
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleIs}=require("../../../src/lib/is");

describe("lib.ModuleIs", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleIs({
			action,
			domain,
			method,
			params
		});
	}

	describe("endsWith", function() {
		it("should raise exception if blob is not a string", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.endsWith([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found Array");
				});
		});

		it("should return true if found single possibility", async function() {
			const instance=_createInstance({
				params: ["two"]
			});
			return instance.endsWith("one.two")
				.then(value=>assert.strictEqual(value, true));
		});

		it("should return true if found one of many possibilities", async function() {
			const instance=_createInstance({
				params: [["one", "two"]]
			});
			return instance.endsWith("one.two")
				.then(value=>assert.strictEqual(value, true));
		});

		it("should return false if not found single possibility", async function() {
			const instance=_createInstance({
				params: ["three"]
			});
			return instance.endsWith("one.two")
				.then(value=>assert.strictEqual(value, false));
		});

		it("should return false if not found one of many possibilities", async function() {
			const instance=_createInstance({
				params: [["three", "four"]]
			});
			return instance.endsWith("one.two")
				.then(value=>assert.strictEqual(value, false));
		});
	});

	describe("oneOf", function() {
		it("should raise exception if param is not an array", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.oneOf("data")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array but found String");
				});
		});

		it("should return true if found", async function() {
			const instance=_createInstance({
				params: [[1, 2]]
			});
			return instance.oneOf(2)
				.then(value=>assert.strictEqual(value, true));
		});

		it("should return false if not found", async function() {
			const instance=_createInstance({
				params: [[1, 2]]
			});
			return instance.oneOf(3)
				.then(value=>assert.strictEqual(value, false));
		});
	});

	describe("startsWith", function() {
		it("should raise exception if blob is not a string", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.startsWith([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found Array");
				});
		});

		it("should return true if found single possibility", async function() {
			const instance=_createInstance({
				params: ["one"]
			});
			return instance.startsWith("one.two")
				.then(value=>assert.strictEqual(value, true));
		});

		it("should return true if found one of many possibilities", async function() {
			const instance=_createInstance({
				params: [["one", "two"]]
			});
			return instance.startsWith("one.two")
				.then(value=>assert.strictEqual(value, true));
		});

		it("should return false if not found single possibility", async function() {
			const instance=_createInstance({
				params: ["three"]
			});
			return instance.startsWith("one.two")
				.then(value=>assert.strictEqual(value, false));
		});

		it("should return false if not found one of many possibilities", async function() {
			const instance=_createInstance({
				params: [["three", "four"]]
			});
			return instance.startsWith("one.two")
				.then(value=>assert.strictEqual(value, false));
		});
	});

	describe("type", function() {
		it("should raise exception if params[0] is not an array or string", async function() {
			const instance=_createInstance({
				params: [10]
			});
			return instance.type()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or String but found Number");
				});
		});

		it("should properly assess positive match", async function() {
			const instance=_createInstance({
				params: ["Number"]
			});
			return instance.type(10)
				.then(result=>{
					assert.strictEqual(result, true);
				});
		});

		it("should properly assess a negative match", async function() {
			const instance=_createInstance({
				params: ["Number"]
			});
			return instance.type("string")
				.then(result=>{
					assert.strictEqual(result, false);
				});
		});
	});
});
