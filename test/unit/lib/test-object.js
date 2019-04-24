/**
 * Date: 2019-02-08
 * Time: 10:06 PM
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const sinon=require("sinon");
const assert=require("../../support/assert");
const {resolveNextTick}=require("../../../src/common/promise");
const {ModuleObject}=require("../../../src/lib/object");

describe("lib.ModuleObject", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleObject({
			action,
			domain,
			method,
			params
		});
	}

	describe("_objectToKeyValuePairs", function() {
		it("should return empty array for null and undefined input", function() {
			assert.deepEqual(ModuleObject._objectToKeyValuePairs(undefined, false), []);
			assert.deepEqual(ModuleObject._objectToKeyValuePairs(undefined, true), []);
			assert.deepEqual(ModuleObject._objectToKeyValuePairs(null, false), []);
			assert.deepEqual(ModuleObject._objectToKeyValuePairs(null, true), []);
		});

		it("should only get top level properties of object if not recurse", function() {
			assert.deepEqual(ModuleObject._objectToKeyValuePairs({
				a: 1,
				b: {
					c: 2
				}
			}, false), [
				["a", 1],
				["b", {"c": 2}]
			]);
		});

		it("should get all properties of object if recursing", function() {
			assert.deepEqual(ModuleObject._objectToKeyValuePairs({
				a: 1,
				b: {
					c: 2
				}
			}, true), [
				["a", 1],
				["b.c", 2],
				["b", {"c": 2}]
			]);
		});

		it("should only get top level properties of array if not recurse", function() {
			assert.deepEqual(ModuleObject._objectToKeyValuePairs([
				{a: 1},
				{b: 2}
			], false), [
				["0", {"a": 1}],
				["1", {"b": 2}]
			]);
		});

		it("should get all properties of array if recursing", function() {
			assert.deepEqual(ModuleObject._objectToKeyValuePairs([
				{a: 1},
				{b: 2}
			], true), [
				["0.a", 1],
				["0", {"a": 1}],
				["1.b", 2],
				["1", {"b": 2}]
			]);
		});
	});

	describe("each", function() {
		it("should throw exception if data is an unsupported type", async function() {
			const instance=_createInstance({
				params: [_.noop]
			});
			return instance.each("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or Object but found String");
				});
		});

		it("should throw exception if params[0] is not a predicate", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.each({})
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting predicate but found String");
				});
		});

		it("should throw exception if params[1] is an unsupported type", async function() {
			const instance=_createInstance({
				params: [_.noop, "string"]
			});
			return instance.each({})
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Object but found String");
				});
		});

		it("should iterate over all shallow properties by default", async function() {
			const input={
					a: 1,
					b: {
						c: 3
					}
				},
				spy=sinon.spy(),
				instance=_createInstance({
					params: [spy]
				});
			return instance.each(input)
				.then(result=>{
					assert.strictEqual(result, input);
					assert.deepEqual(spy.getCall(0).args, [input.a, "a"]);
					assert.deepEqual(spy.getCall(1).args, [input.b, "b"]);
				});
		});

		it("should iterate over all deep properties if told to do so", async function() {
			const input={
					a: 1,
					b: {
						c: 3
					}
				},
				spy=sinon.spy(),
				instance=_createInstance({
					params: [spy, {
						recurse: true
					}]
				});
			return instance.each(input)
				.then(result=>{
					assert.strictEqual(result, input);
					assert.deepEqual(spy.getCall(0).args, [input.a, "a"]);
					assert.deepEqual(spy.getCall(1).args, [input.b.c, "b.c"]);
					assert.deepEqual(spy.getCall(2).args, [input.b, "b"]);
				});
		});
	});

	describe("get", function() {
		it("should throw exception if data is an unsupported type", async function() {
			const instance=_createInstance();
			return instance.get("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or Object but found String");
				});
		});

		it("should return input data if no params are specified", async function() {
			const instance=_createInstance(),
				data={
					property: "value"
				},
				result=await instance.get(data);
			assert.deepEqual(result, data);
		});

		it("should return property if one is specified", async function() {
			const instance=_createInstance({
					params: ["property"]
				}),
				result=await instance.get({
					property: "value"
				});
			assert.strictEqual(result, "value");
		});

		it("should get property via predicate", async function() {
			const instance=_createInstance({
					params: [resolveNextTick.bind(null, "property")]
				}),
				result=await instance.get({
					property: "value"
				});
			assert.strictEqual(result, "value");
		});
	});

	describe("map", function() {
		it("should throw exception if params[0] is not an array or function", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.map()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or Function but found String");
				});
		});

		it("should throw exception if blob is not an object or array and params[0] is not a predicate", async function() {
			const instance=_createInstance({
				params: [[]]
			});
			return instance.map("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or Object but found String");
				});
		});

		it("should properly perform shallow map properties by predicate", async function() {
			const input={a: 1, b: {c: 1}},
				instance=_createInstance({
					params: [(value, key)=>{
						assert.ok(_.includes(["a", "b"], key));
						return key;
					}]
				});
			return instance.map(input)
				.then(result=>{
					assert.deepEqual(result, {a: "a", b: "b"});
				});
		});

		it("should properly perform deep map properties by predicate", async function() {
			const input={a: 1, b: {c: 2}},
				instance=_createInstance({
					params: [(value, key)=>{
						assert.ok(_.includes(["a", "b", "c", "b.c"], key));
						return _.isPlainObject(value)
							? value
							: value+1;
					}, {
						recurse: true
					}]
				});
			return instance.map(input)
				.then(result=>{
					assert.deepEqual(result, {
						"a": 2,
						"b": {
							"c": 3
						}
					});
				});
		});

		it("should return an object with selected paths if params[0] is an array of strings", async function() {
			const instance=_createInstance({
					params: [["a", "b"]]
				}),
				data={
					a: "one",
					b: "two",
					c: "three"
				},
				result=await instance.map(data);
			assert.deepEqual(result, {
				a: "one",
				b: "two"
			});
		});

		it("should include arrays in the result by default", async function() {
			const instance=_createInstance({
					params: [["a", "b.0.c", "b.0.d.1"]]
				}),
				data={
					a: "one",
					b: [{
						c: "three",
						d: [0, 1]
					}]
				},
				result=await instance.map(data);
			assert.deepEqual(result, {
				"a": "one",
				"b": [
					{
						"c": "three",
						"d": [undefined, 1]
					}
				]
			});
		});

		it("should deep flatten references to array indexes when params[0] is an array of strings", async function() {
			const instance=_createInstance({
					params: [
						["a", "b.0.c", "b.0.d.1"],
						{flatten: true}
					]
				}),
				data={
					a: "one",
					b: [{
						c: "three",
						d: [0, 1]
					}]
				},
				result=await instance.map(data);
			assert.deepEqual(result, {
				"a": "one",
				"b": {
					"c": "three",
					"d": 1
				}
			});
		});

		it("should map objects properly if param is a 'from', 'to' object", async function() {
			const instance=_createInstance({
					params: [["a", {from: "b", to: "x"}]]
				}),
				data={
					a: "one",
					b: "two",
					c: "three"
				},
				result=await instance.map(data);
			assert.deepEqual(result, {
				a: "one",
				x: "two"
			});
		});
	});

	describe("mutate", function() {
		it("should throw exception if params[0] is not a function", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.mutate()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting predicate but found String");
				});
		});

		it("should return the returned value of the predicate", async function() {
			const input={a: 1},
				instance=_createInstance({
					params: [object=>{
						assert.deepEqual(object, input);
						return "result";
					}]
				});
			return instance.mutate(input)
				.then(result=>{
					assert.strictEqual(result, "result");
				});
		});
	});


	describe("merge", function() {
		it("should raise exception if params[0] cannot be resolved to accepted type", async function() {
			const source={property: "value"},
				instance=_createInstance({
					params: "string"
				});
			return instance.merge(source)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or Object but found String");
				});
		});

		it("should merge json into json", async function() {
			const source={property: "value"},
				merge={merge: "data"},
				instance=_createInstance({
					params: [merge]
				}),
				result=await instance.merge(source);
			assert.deepEqual(result, {
				"merge": "data",
				"property": "value"
			});
		});

		it("should merge array into array", async function() {
			const source=[{a: 1}, {b: 2}],
				merge=[{c: 3}, {d: 4}],
				instance=_createInstance({
					params: [merge]
				}),
				result=await instance.merge(source);
			assert.deepEqual(result, [{a: 1, c: 3}, {b: 2, d: 4}]);
		});

		it("should merge predicate result", async function() {
			const source={property: "value"},
				merge={merge: "data"},
				instance=_createInstance({
					params: [resolveNextTick.bind(null, merge)]
				}),
				result=await instance.merge(source);
			assert.deepEqual(result, {
				"merge": "data",
				"property": "value"
			});
		});
	});

	describe("set", function() {
		it("should properly set specified path", async function() {
			const instance=_createInstance({
					params: ["set.path", "data"]
				}),
				data={
					property: "value"
				},
				result=await instance.set(data);
			assert.deepEqual(result, {
				"property": "value",
				"set": {
					"path": "data"
				}
			});
		});

		it("should properly set as per predicate results", async function() {
			const instance=_createInstance({
					params: [
						resolveNextTick.bind(null, "path"),
						resolveNextTick.bind(null, "value")
					]
				}),
				result=await instance.set({});
			assert.deepEqual(result, {
				"path": "value"
			});
		});
	});

	describe("toArray", function() {
		it("should return empty array when blob is null", async function() {
			const instance=_createInstance(),
				result=await instance.toArray(null);
			assert.deepEqual(result, []);
		});

		it("should by default return array elements without keys", async function() {
			const instance=_createInstance(),
				object={
					a: 1,
					b: 2
				},
				result=await instance.toArray(object);
			assert.deepEqual(result, [1, 2]);
		});

		it("should use predicate if provided", async function() {
			const instance=_createInstance({
					params: [
						(object, key)=>{
							return Object.assign({
								key
							}, object);
						}
					]
				}),
				object={
					a: {
						value: 1
					},
					b: {
						value: 2
					}
				},
				result=await instance.toArray(object);
			assert.deepEqual(result, [
				{
					"key": "a",
					"value": 1
				},
				{
					"key": "b",
					"value": 2
				}
			]);
		});
	});
});
