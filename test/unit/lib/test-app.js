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
		domain="domain",
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
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.code, constant.error.code.ABORT);
				});
		});
	});

	describe("assert", function() {
		it("should raise exception if params[0] is not a predicate", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.assert()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting predicate but found String");
				});
		});

		it("should return input if predicate returns true", async function() {
			const instance=_createInstance({
				params: [input=>{
					assert.strictEqual(input, "input");
					return true;
				}]
			});
			return instance.assert("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});

		it("should raise default error if predicate returns false", async function() {
			const instance=_createInstance({
				params: [input=>input]
			});
			return instance.assert(false)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "assertion failed");
				});
		});

		it("should raise specified error if predicate returns false", async function() {
			const instance=_createInstance({
				params: [input=>input, "error message"]
			});
			return instance.assert(false)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "error message");
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
