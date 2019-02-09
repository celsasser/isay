/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleArray}=require("../../../src/lib/array");

describe("lib.ModuleArray", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleArray({
			action,
			domain,
			method,
			params
		});
	}

	describe("_assertArray", function() {
		it("should throw exception if not an array", function() {
			const instance=_createInstance();
			assert.throws(()=>instance._assertArray("string"));
		});

		it("should return input if it is an array", function() {
			const instance=_createInstance(),
				input=[];
			assert.strictEqual(instance._assertArray(input), input);
		});
	});

	describe("_conditionPredicate", function() {
		it("should throw exception if not a function", function() {
			const instance=_createInstance();
			assert.throws(()=>instance._conditionPredicate("string"));
		});

		it("should return input if the function is a promise", async function() {
			const instance=_createInstance(),
				predicate=async(value)=>value,
				conditioned=instance._conditionPredicate(predicate);
			assert.strictEqual(conditioned, predicate);
			return conditioned("george")
				.then(value=>assert.strictEqual(value, "george"));
		});

		it("should wrap function if it is note a promise", async function() {
			const instance=_createInstance(),
				predicate=(value)=>value,
				conditioned=instance._conditionPredicate(predicate);
			assert.notEqual(conditioned, predicate);
			return conditioned("george")
				.then(value=>assert.strictEqual(value, "george"));
		});
	});

	describe("each", function() {
		it("should call synchronous predicate for every element in the array", async function() {
			const sequence=[],
				instance=_createInstance({
					params: [(value, index)=>sequence.push({value, index})]
				});
			await instance.each(["a", "b"]);
			assert.deepEqual(sequence, [
				{
					"index": 0,
					"value": "a"
				},
				{
					"index": 1,
					"value": "b"
				}
			]);
		});

		it("should call asynchronous predicate for every element in the array", async function() {
			const sequence=[],
				instance=_createInstance({
					params: [async(value, index)=>sequence.push({value, index})]
				});
			await instance.each(["a", "b"]);
			assert.deepEqual(sequence, [
				{
					"index": 0,
					"value": "a"
				},
				{
					"index": 1,
					"value": "b"
				}
			]);
		});
	});

	describe("filter", function() {
		it("should filter and return result", async function() {
			const instance=_createInstance({
				params: [value=>value>1]
			});
			const result=await instance.filter([1, 2, 3]);
			assert.deepEqual(result, [2, 3]);
		});

		it("should return empty array if nothing passes", async function() {
			const instance=_createInstance({
				params: [()=>false]
			});
			const result=await instance.filter([1, 2, 3]);
			assert.deepEqual(result, []);
		});
	});

	describe("find", function() {
		it("should find the first result and return element", async function() {
			const instance=_createInstance({
				params: [value=>value===3]
			});
			const result=await instance.find([1, 2, 3]);
			assert.deepEqual(result, 3);
		});

		it("should return null if predicate doesn't find his man", async function() {
			const instance=_createInstance({
				params: [()=>false]
			});
			const result=await instance.find([1, 2, 3]);
			assert.strictEqual(result, null);
		});
	});

	describe("map", function() {
		it("should map predicate for every element in the array", async function() {
			const instance=_createInstance({
					params: [(value, index)=>value+value]
				});
			const result=await instance.map(["a", "b"]);
			assert.deepEqual(result, ["aa", "bb"]);
		});
	});

	describe("reduce", function() {
		it("should reduce and return result", async function() {
			const instance=_createInstance({
				params: [(result, value)=>{
					if(value>1) {
						result.push(value);
					}
					return result;
				}]
			});
			const result=await instance.reduce([1, 2, 3]);
			assert.deepEqual(result, [2, 3]);
		});

		it("should use specified starting value if included", async function() {
			const instance=_createInstance({
				params: [
					(result, value)=>result+value,
					0
				]
			});
			const result=await instance.reduce([1, 2, 3]);
			assert.strictEqual(result, 6);
		});
	});

	describe("reverse", function() {
		it("should properly reverse input", async function() {
			const instance=_createInstance({});
			const result=await instance.reverse([1, 2, 3]);
			assert.deepEqual(result, [3, 2, 1]);
		});
	});

	describe("sort", function() {
		it("should properly sort without predicate", async function() {
			const instance=_createInstance({});
			const result=await instance.sort([3, 1, 2]);
			assert.deepEqual(result, [1, 2, 3]);
		});

		it("should properly reverse with predicate", async function() {
			const instance=_createInstance({
				params: ["a"]
			});
			const result=await instance.sort([
				{a: 3},
				{a: 1},
				{a: 2}
			]);
			assert.deepEqual(result, [
				{a: 1},
				{a: 2},
				{a: 3}
			]);
		});
	});
});
