/**
 * Date: 2019-02-23
 * Time: 19:00
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const {resolveNextTick}=require("../../../src/common/promise");
const {ModuleTest}=require("../../../src/lib/_test");

describe("lib.ModuleTest", function() {
	function _createInstance({
		action="action",
		catchModule=undefined,
		domain="domain",
		method="method",
		params=[],
		positive=true
	}={}) {
		return new ModuleTest({
			action,
			catchModule,
			domain,
			method,
			params,
			positive
		});
	}

	describe("constructor", function() {
		it("should properly configure a positive state", function() {
			const instance=_createInstance({
				positive: true
			});
			assert.strictEqual(instance._positive, true);
		});

		it("should properly configure a negative state", function() {
			const instance=_createInstance({
				positive: false
			});
			assert.strictEqual(instance._positive, false);
		});

		it("should properly construct with modules", function() {
			const instance=_createInstance({
				catchModule: "catch"
			});
			assert.strictEqual(instance._catchModule, "catch");
		});
	});

	describe("empty", function() {
		it("should raise exception if blob is undefined", async function() {
			const instance=_createInstance();
			return instance.empty()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array, Object or String but found undefined");
				});
		});

		it("should raise exception if type is not supported", async function() {
			const instance=_createInstance();
			return instance.empty(0)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array, Object or String but found Number");
				});
		});

		it("should return true if input is considered empty", async function() {
			const instance=_createInstance();
			assert.strictEqual(await instance.empty(null), true);
			assert.strictEqual(await instance.empty({}), true);
			assert.strictEqual(await instance.empty([]), true);
		});

		it("should negate if positive is false", async function() {
			const instance=_createInstance({
				positive: false
			});
			assert.strictEqual(await instance.empty(null), false);
			assert.strictEqual(await instance.empty({}), false);
			assert.strictEqual(await instance.empty([]), false);
		});
	});

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

		it("should return opposite if tests are negated", async function() {
			const instance=_createInstance({
				params: [["one", "two"]],
				positive: false
			});
			return instance.endsWith("one.two")
				.then(value=>assert.strictEqual(value, false));
		});
	});

	describe("false", function() {
		it("should return true if no params and input is falsey", async function() {
			const instance=_createInstance();
			assert.strictEqual(await instance.false(false), true);
			assert.strictEqual(await instance.false(), true);
			assert.strictEqual(await instance.false(0), true);
		});

		it("should return false if no params and input is truthy", async function() {
			const instance=_createInstance();
			assert.strictEqual(await instance.false(true), false);
			assert.strictEqual(await instance.false({}), false);
			assert.strictEqual(await instance.false(1), false);
		});

		[
			[true, false],
			[1, false],
			["", false],
			[resolveNextTick.bind(null, true), false],
			[false, true],
			[0, true],
			[undefined, true],
			[null, true],
			[resolveNextTick.bind(null, false), true]
		].forEach(([param, expected])=>{
			it(`should return ${expected} if params[0]=${param}`, async function() {
				const instance=_createInstance({
					params: [param]
				});
				return instance.false("input")
					.then(result=>{
						assert.strictEqual(result, expected);
					});
			});
		});

		it("should return opposite if tests are negated", async function() {
			const instance=_createInstance({positive: false});
			assert.strictEqual(await instance.false(true), true);
		});
	});

	[
		["greaterThan", 1],
		["lessThan", -1]
	].forEach(([action, direction])=>{
		describe(action, function() {
			it("should raise an exception if the input is not a supported type", async function() {
				const instance=_createInstance({
					params: [1]
				});
				return instance[action]()
					.then(assert.notCalled)
					.catch(error=>{
						assert.strictEqual(error.message, "expecting Date, Number or String but found undefined");
					});
			});

			it("should raise an exception if params[0] is not a supported type", async function() {
				const instance=_createInstance();
				return instance[action](1)
					.then(assert.notCalled)
					.catch(error=>{
						assert.strictEqual(error.message, "expecting Date, Number or String but found undefined");
					});
			});

			it("should raise an exception if input and params[0] are not of same type", async function() {
				const instance=_createInstance({
					params: ["string"]
				});
				return instance[action](1)
					.then(assert.notCalled)
					.catch(error=>{
						assert.strictEqual(error.message, "expecting same type but found Number and String");
					});
			});

			it("should test input=1 and params[0]=0 properly", async function() {
				const instance=_createInstance({
					params: [0]
				});
				return instance[action](1)
					.then(result=>{
						assert.strictEqual(result, (direction>0));
					});
			});

			it("should test input=1 and params[0]=2 properly", async function() {
				const instance=_createInstance({
					params: [2]
				});
				return instance[action](1)
					.then(result=>{
						assert.strictEqual(result, (direction<0));
					});
			});
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

		it("should return opposite if tests are negated", async function() {
			const instance=_createInstance({
				params: [[1, 2]],
				positive: false
			});
			return instance.oneOf(2)
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

		it("should return opposite if tests are negated", async function() {
			const instance=_createInstance({
				params: ["one"],
				positive: false
			});
			return instance.startsWith("one.two")
				.then(value=>assert.strictEqual(value, false));
		});
	});

	describe("true", function() {
		it("should return true if no params and input is truthy", async function() {
			const instance=_createInstance();
			assert.strictEqual(await instance.true(true), true);
			assert.strictEqual(await instance.true({}), true);
			assert.strictEqual(await instance.true(1), true);
		});

		it("should return false no params and input is falsey", async function() {
			const instance=_createInstance();
			assert.strictEqual(await instance.true(false), false);
			assert.strictEqual(await instance.true(), false);
			assert.strictEqual(await instance.true(0), false);
		});

		[
			[true, true],
			[1, true],
			["", true],
			[resolveNextTick.bind(null, true), true],
			[false, false],
			[0, false],
			[undefined, false],
			[null, false],
			[resolveNextTick.bind(null, false), false]
		].forEach(([param, expected])=>{
			it(`should return ${expected} if params[0]=${param}`, async function() {
				const instance=_createInstance({
					params: [param]
				});
				return instance.true("input")
					.then(result=>{
						assert.strictEqual(result, expected);
					});
			});
		});

		it("should return opposite if tests are negated", async function() {
			const instance=_createInstance({positive: false});
			assert.strictEqual(await instance.true(true), false);
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
