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
		domain="domain",
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

	describe("_insert", function() {
		it("should throw exception if input not an array", function() {
			const instance=_createInstance();
			assert.throws(()=>instance._insert("string"),
				error=>error.message==="expecting array but found String");
		});

		it("should throw exception if param[1] is anything but undefined or an object", function() {
			const instance=_createInstance({
				params: ["data", "string"]
			});
			assert.throws(()=>instance._insert([]),
				error=>error.message==="expecting Object but found String");
		});

		it("should append to end if tail=true and no insert point is given", function() {
			const instance=_createInstance({
				params: [1]
			});
			assert.deepStrictEqual(instance._insert([0], true), [0, 1]);
		});

		it("should insert at beginning if tail=false and no insert point is given", function() {
			const instance=_createInstance({
				params: [1]
			});
			assert.deepStrictEqual(instance._insert([0], false), [1, 0]);
		});

		it("should expand at end if tail=true and no insert point is given", function() {
			const instance=_createInstance({
				params: [[1, 2], {expand: true}]
			});
			assert.deepStrictEqual(instance._insert([0], true), [0, 1, 2]);
		});

		it("should expand at beginning if tail=false and no insert point is given", function() {
			const instance=_createInstance({
				params: [[1, 2], {expand: true}]
			});
			assert.deepStrictEqual(instance._insert([0], false), [1, 2, 0]);
		});

		it("should not expand an array param if expand is not true", function() {
			const instance=_createInstance({
				params: [[1], {index: 1}]
			});
			assert.deepStrictEqual(instance._insert([0, 2]), [0, [1], 2]);
		});

		[
			[0, [1, 0, 2]],
			[1, [0, 1, 2]],
			[2, [0, 2, 1]],
			[3, [0, 2, 1]]
		].forEach(([index, expected])=>{
			it(`should insert 1 into [0, 2] at ${index} and return ${JSON.stringify(expected)}`, function() {
				const instance=_createInstance({
					params: [1, {index}]
				});
				assert.deepStrictEqual(instance._insert([0, 2]), expected);
			});
		});

		[
			[0, [1, 2, 0, 3]],
			[1, [0, 1, 2, 3]],
			[2, [0, 3, 1, 2]],
			[3, [0, 3, 1, 2]]
		].forEach(([index, expected])=>{
			it(`should expand [1, 2] into [0, 3] at ${index} and return ${JSON.stringify(expected)}`, function() {
				const instance=_createInstance({
					params: [[1, 2], {
						index,
						expand: true
					}]
				});
				assert.deepStrictEqual(instance._insert([0, 3]), expected);
			});
		});

		it(`should throw exception if expand=true and params[0] is not an array`, function() {
			const instance=_createInstance({
				params: [1, {
					expand: true
				}]
			});
			assert.throws(()=>{
				instance._insert([0, 3]);
			}, error=>error.message==="expecting array but found Number");
		});
	});

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

	// we test _insert thoroughly. Here we just do some sanity checking
	describe("append", function() {
		it("should throw exception if input not an array", async function() {
			const instance=_createInstance();
			return instance.append("string")
				.then(assert.notCalled)
				.catch(error=>error.message==="expecting array but found String");
		});

		it("should properly append", async function() {
			const instance=_createInstance({
				params: [1]
			});
			return instance.append([0])
				.then(result=>{
					assert.deepStrictEqual(result, [0, 1]);
				});
		});
	});

	// we test _insert thoroughly. Here we just do some sanity checking
	describe("insert", function() {
		it("should throw exception if input not an array", async function() {
			const instance=_createInstance();
			return instance.insert("string")
				.then(assert.notCalled)
				.catch(error=>error.message==="expecting array but found String");
		});

		it("should properly append", async function() {
			const instance=_createInstance({
				params: [1]
			});
			return instance.insert([0])
				.then(result=>{
					assert.deepStrictEqual(result, [1, 0]);
				});
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
				params: [(value)=>value+value]
			});
			const result=await instance.map(["a", "b"]);
			assert.deepEqual(result, ["aa", "bb"]);
		});
	});

	describe("range", function() {
		it("should raise exception if there is no configuration info", function() {
			const instance=_createInstance({});
			return instance.range()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Number but found undefined");
				});
		});

		it("should use input as endIndex if params.length==0", function() {
			const instance=_createInstance();
			return instance.range(5)
				.then(result=>{
					assert.deepEqual(result, [0, 1, 2, 3, 4]);
				});
		});

		it("should use params[0] as endIndex if params.length==1", function() {
			const instance=_createInstance({
				params: [5]
			});
			return instance.range()
				.then(result=>{
					assert.deepEqual(result, [0, 1, 2, 3, 4]);
				});
		});

		it("should use input[0] as startIndex and input[1] as endIndex if specified as an array", function() {
			const instance=_createInstance();
			return instance.range([1, 5])
				.then(result=>{
					assert.deepEqual(result, [1, 2, 3, 4]);
				});
		});

		it("should use params[0] as startIndex and params[1] as endIndex if params.length===2", function() {
			const instance=_createInstance({
				params: [1, 5]
			});
			return instance.range("blob")
				.then(result=>{
					assert.deepEqual(result, [1, 2, 3, 4]);
				});
		});

		it("should include alternate increment if params.length>3", function() {
			const instance=_createInstance({
				params: [1, 6, 2]
			});
			return instance.range("blob")
				.then(result=>{
					assert.deepEqual(result, [1, 3, 5]);
				});
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

	describe("slice", function() {
		it("should raise exception if input is not a blog", async function() {
			const instance=_createInstance();
			return instance.slice("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting array but found String");
				});
		});

		it("should return input if there are no params", async function() {
			const instance=_createInstance();
			return instance.slice([1])
				.then(result=>{
					assert.deepStrictEqual(result, [1]);
				});
		});

		it("should raise exception if params[0] is not an expected type", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.slice([1])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Number or Object but found String");
				});
		});

		[0, 1, 2, 3, 4].forEach(start=>{
			const input=[1, 2, 3];
			it(`should properly process a positive start offset: start=${start}, input=${JSON.stringify(input)}`, async function() {
				const instance=_createInstance({
					params: [start]
				});
				return instance.slice(input)
					.then(result=>{
						assert.deepStrictEqual(result, input.slice(start));
					});
			});
		});

		[0, 1, 2, 3, 4].forEach(stop=>{
			const input=[1, 2, 3];
			it(`should properly process a positive stop offset: stop=${stop}, input=${JSON.stringify(input)}`, async function() {
				const instance=_createInstance({
					params: [0, stop]
				});
				return instance.slice(input)
					.then(result=>{
						assert.deepStrictEqual(result, input.slice(0, stop));
					});
			});
		});

		[
			[-1, [3]],
			[-2, [2, 3]],
			[-3, [1, 2, 3]],
			[-4, []],
			[-5, []]
		].forEach(([start, expected])=>{
			const input=[1, 2, 3];
			it(`should properly process a negative start offset: start=${start}, input=${JSON.stringify(input)}`, async function() {
				const instance=_createInstance({
					params: [start]
				});
				return instance.slice(input)
					.then(result=>{
						assert.deepStrictEqual(result, expected);
					});
			});
		});

		[
			[-1, [1, 2]],
			[-2, [1]],
			[-3, []],
			[-4, []]
		].forEach(([stop, expected])=>{
			const input=[1, 2, 3];
			it(`should properly process a negative stop offset: stop=${stop}, input=${JSON.stringify(input)}`, async function() {
				const instance=_createInstance({
					params: [0, stop]
				});
				return instance.slice(input)
					.then(result=>{
						assert.deepStrictEqual(result, expected);
					});
			});
		});

		it("should raise an exception if start, stop and count are all configured in params[0] object", async function() {
			const instance=_createInstance({
				params: [{
					start: 0,
					stop: 0,
					count: 0
				}]
			});
			return instance.slice([1])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "invalid slice configuration - {\"start\":0,\"stop\":0,\"count\":0}");
				});
		});

		[
			[{start: 0}, [1, 2, 3]],
			[{start: 1}, [2, 3]],
			[{stop: 3}, [1, 2, 3]],
			[{stop: 2}, [1, 2]],
			[{start: 1, stop: -1}, [2]],
			[{start: -2, stop: -1}, [2]],
			[{start: -2, stop: -2}, []],
			[{start: 0, count: 3}, [1, 2, 3]],
			[{start: 1, count: 1}, [2]],
			[{stop: 3, count: 3}, [1, 2, 3]],
			[{stop: 2, count: 1}, [2]]
		].forEach(([object, expected])=>{
			const input=[1, 2, 3];
			it(`should properly process a object param: object=${JSON.stringify(object)}, input=${JSON.stringify(input)}`, async function() {
				const instance=_createInstance({
					params: [object]
				});
				return instance.slice(input)
					.then(result=>{
						assert.deepStrictEqual(result, expected);
					});
			});
		});
	});

	describe("sort", function() {
		it("should properly sort without value types", async function() {
			const instance=_createInstance({});
			const result=await instance.sort([3, 1, 2]);
			assert.deepEqual(result, [1, 2, 3]);
		});

		it("should properly sort by property in ascending order", async function() {
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

		it("should properly sort by property in ascending order", async function() {
			const instance=_createInstance({
				params: ["-a"]
			});
			const result=await instance.sort([
				{a: 3},
				{a: 1},
				{a: 2}
			]);
			assert.deepEqual(result, [
				{a: 3},
				{a: 2},
				{a: 1}
			]);
		});

		it("should properly sort by primary and secondary when in separate params", async function() {
			const instance=_createInstance({
				params: ["a", "b"]
			});
			const result=await instance.sort([
				{a: 2, b: 3},
				{a: 1, b: 1},
				{a: 1, b: 2}
			]);
			assert.deepEqual(result, [
				{"a": 1, "b": 1},
				{"a": 1, "b": 2},
				{"a": 2, "b": 3}
			]);
		});
	});
});
