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
		it("should raise exception if no params are included", async function() {
			const instance=_createInstance();
			return instance.assert()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting a value but found undefined");
				});
		});

		it("should return input if params[0] is truthy", async function() {
			const instance=_createInstance({
				params: [true]
			});
			return instance.assert("input")
				.then(result=>{
					assert.strictEqual(result, "input");
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

		it("should raise default error if params[0] is falsey", async function() {
			const instance=_createInstance({
				params: [false]
			});
			return instance.assert(false)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "assertion failed");
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

		it("should raise specified error with params[1] text if predicate returns false", async function() {
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
		it("should throw error if params[0] is not a number or object", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.sleep()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Number or Object but found String");
				});
		});

		it("should sleep for the number of seconds specified in params[0] as number", async function() {
			const instance=_createInstance({
				params: [2]
			});
			proxy.stub(global, "setTimeout", (callback, millis)=>{
				assert.strictEqual(millis, 2000);
				process.nextTick(callback);
			});
			return instance.sleep("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});

		[
			[{millis: 2}, 2],
			[{seconds: 2}, 2000],
			[{minutes: 2}, 2000*60],
			[{hours: 1}, 1000*60*60],
			[{days: 1}, 1000*60*60*24],
			[{minutes: 1, seconds: 1, millis: 1}, 1000*60+1000+1]
		].forEach(([input, expected])=>{
			it(`should properly convert ${JSON.stringify(input)} to ${expected} millis`, function() {
				const instance=_createInstance({
					params: [input]
				});
				proxy.stub(global, "setTimeout", (callback, millis)=>{
					assert.strictEqual(millis, expected);
					process.nextTick(callback);
				});
				return instance.sleep("input")
					.then(result=>{
						assert.strictEqual(result, "input");
					});
			});
		})
	});
});
