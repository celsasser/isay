/**
 * Date: 2019-02-08
 * Time: 10:06 PM
 * @license MIT (see project's LICENSE file)
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

	describe("_normalizeIndex", function() {
		[
			[[0], 0, 0],
			[[0], 1, 1],
			[[0], -1, 0],
			[[0], -2, 1]
		].forEach(([array, index, expected])=>{
			it(`should properly translate start index of ${index} to ${expected} for ${JSON.stringify(array)}`, function() {
				assert.strictEqual(ModuleArray._normalizeIndex(array, index, true), expected);
			});
		});

		[
			[[0], 0, 0],
			[[0], 1, 1],
			[[0], -1, 0],
			[[0], -2, 0]
		].forEach(([array, index, expected])=>{
			it(`should properly translate end index of ${index} to ${expected} for ${JSON.stringify(array)}`, function() {
				assert.strictEqual(ModuleArray._normalizeIndex(array, index, false), expected);
			});
		});
	});

	describe("_insert", function() {
		it("should throw exception if input not an array", async function() {
			const instance=_createInstance();
			return instance._insert("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting array but found String");
				});
		});

		it("should throw exception if param[0] is undefined", async function() {
			const instance=_createInstance({
				params: []
			});
			return instance._insert([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting a value but found undefined");
				});
		});

		it("should throw exception if param[1] is anything but undefined or an object", async function() {
			const instance=_createInstance({
				params: ["data", "string"]
			});
			return instance._insert([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Object but found String");
				});
		});

		it("should append to end if tail=true and no insert point is given", async function() {
			const instance=_createInstance({
				params: [1]
			});
			return instance._insert([0], true)
				.then(result=>{
					assert.deepEqual(result, [0, 1]);
				});
		});

		it("should insert at beginning if tail=false and no insert point is given", async function() {
			const instance=_createInstance({
				params: [1]
			});
			return instance._insert([0], false)
				.then(result=>{
					assert.deepEqual(result, [1, 0]);
				});
		});

		it("should expand at end if tail=true and no insert point is given", async function() {
			const instance=_createInstance({
				params: [[1, 2], {expand: true}]
			});
			return instance._insert([0], true)
				.then(result=>{
					assert.deepEqual(result, [0, 1, 2]);
				});
		});

		it("should expand at beginning if tail=false and no insert point is given", async function() {
			const instance=_createInstance({
				params: [[1, 2], {expand: true}]
			});
			return instance._insert([0], false)
				.then(result=>{
					assert.deepEqual(result, [1, 2, 0]);
				});
		});

		it("should not expand an array param if expand is not true", async function() {
			const instance=_createInstance({
				params: [[1], {index: 1}]
			});
			return instance._insert([0, 2])
				.then(result=>{
					assert.deepEqual(result, [0, [1], 2]);
				});
		});

		[
			[0, [1, 0, 2]],
			[1, [0, 1, 2]],
			[2, [0, 2, 1]],
			[3, [0, 2, 1]]
		].forEach(([index, expected])=>{
			it(`should insert 1 into [0, 2] at ${index} and return ${JSON.stringify(expected)}`, async function() {
				const instance=_createInstance({
					params: [1, {index}]
				});
				return instance._insert([0, 2])
					.then(result=>{
						assert.deepEqual(result, expected);
					});
			});
		});

		[
			[0, [1, 2, 0, 3]],
			[1, [0, 1, 2, 3]],
			[2, [0, 3, 1, 2]],
			[3, [0, 3, 1, 2]]
		].forEach(([index, expected])=>{
			it(`should expand [1, 2] into [0, 3] at ${index} and return ${JSON.stringify(expected)}`, async function() {
				const instance=_createInstance({
					params: [[1, 2], {
						index,
						expand: true
					}]
				});
				return instance._insert([0, 3])
					.then(result=>{
						assert.deepEqual(result, expected);
					});
			});
		});

		it("should properly process predicate value result", function() {
			const instance=_createInstance({
				params: [()=>{
					assert.strictEqual(arguments.length, 0);
					return Promise.resolve(2);
				}]
			});
			return instance._insert([0, 1])
				.then(result=>{
					assert.deepEqual(result, [0, 1, 2]);
				});
		});

		it("should properly expand predicate array result", function() {
			const instance=_createInstance({
				params: [()=>{
					assert.strictEqual(arguments.length, 0);
					return Promise.resolve([2, 3]);
				}, {
					expand: true
				}]
			});
			return instance._insert([0, 1])
				.then(result=>{
					assert.deepEqual(result, [0, 1, 2, 3]);
				});
		});

		it("should raise exception if predicate does not return a value", function() {
			const instance=_createInstance({
				params: [()=>Promise.resolve()]
			});
			return instance._insert([0, 1])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting a value but found undefined");
				});
		});

		it("should throw exception if expand=true and params[0] is not an array", async function() {
			const instance=_createInstance({
				params: [1, {
					expand: true
				}]
			});
			return instance._insert([0, 3])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting array but found Number");
				});
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
					assert.deepEqual(result, [0, 1]);
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

		it("should filter elements by value", async function() {
			const instance=_createInstance({
				params: [2]
			});
			const result=await instance.filter([1, 2, 3, 2, 1]);
			assert.deepEqual(result, [2, 2]);
		});

		it("should find element by partial match", async function() {
			const instance=_createInstance({
				params: [{a: 2}]
			});
			const result=await instance.filter([
				{a: 1, b: 1},
				{a: 2, b: 2},
				{a: 3, b: 3},
				{a: 2, b: 4},
				{a: 1, b: 5}
			]);
			assert.deepEqual(result, [
				{a: 2, b: 2},
				{a: 2, b: 4}
			]);
		});
	});

	describe("find", function() {
		it("should find the first result by predicate and return element", async function() {
			const instance=_createInstance({
				params: [value=>value===3]
			});
			const result=await instance.find([1, 2, 3]);
			assert.deepEqual(result, 3);
		});

		it("should return null if predicate doesn't find his man by predicate", async function() {
			const instance=_createInstance({
				params: [()=>false]
			});
			const result=await instance.find([1, 2, 3]);
			assert.strictEqual(result, null);
		});

		it("should find element by value", async function() {
			const instance=_createInstance({
				params: [2]
			});
			const result=await instance.find([1, 2, 3]);
			assert.strictEqual(result, result);
		});

		it("should find element by partial match", async function() {
			const instance=_createInstance({
				params: [{a: 2}]
			});
			const result=await instance.find([
				{a: 1, b: 1},
				{a: 2, b: 2},
				{a: 3, b: 3}
			]);
			assert.deepEqual(result, {a: 2, b: 2});
		});
	});

	describe("first", function() {
		it("should throw exception if input not an array", async function() {
			const instance=_createInstance();
			return instance.first("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting array but found String");
				});
		});

		it("should throw exception if param is not supported", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.first([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Number but found String");
				});
		});

		it("should return first element if no params are specified", async function() {
			const instance=_createInstance();
			return instance.first([1, 2])
				.then(result=>assert.strictEqual(result, 1));
		});

		it("should return undefined if no elements and no params", async function() {
			const instance=_createInstance();
			return instance.first([])
				.then(result=>assert.strictEqual(result, undefined));
		});

		it("should return the first n number of elements if params[0] is number", async function() {
			const instance=_createInstance({
				params: [2]
			});
			return instance.first([0, 1, 2])
				.then(result=>assert.deepEqual(result, [0, 1]));
		});

		it("should return the first n number of elements as specified by predicate in params[0]", async function() {
			const input=[0, 1, 2],
				instance=_createInstance({
					params: [_input=>{
						assert.strictEqual(_input, _input);
						return 2;
					}]
				});
			return instance.first(input)
				.then(result=>assert.deepEqual(result, [0, 1]));
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
					assert.deepEqual(result, [1, 0]);
				});
		});
	});

	describe("last", function() {
		it("should throw exception if input not an array", async function() {
			const instance=_createInstance();
			return instance.last("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting array but found String");
				});
		});

		it("should throw exception if param is not supported", async function() {
			const instance=_createInstance({
				params: ["string"]
			});
			return instance.last([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Number but found String");
				});
		});

		it("should return last element if no params are specified", async function() {
			const instance=_createInstance();
			return instance.last([1, 2])
				.then(result=>assert.strictEqual(result, 2));
		});

		it("should return undefined if no elements and no params", async function() {
			const instance=_createInstance();
			return instance.last([])
				.then(result=>assert.strictEqual(result, undefined));
		});

		it("should return the last n number of elements if params[0] is number", async function() {
			const instance=_createInstance({
				params: [2]
			});
			return instance.last([0, 1, 2])
				.then(result=>assert.deepEqual(result, [1, 2]));
		});

		it("should return the last n number of elements as specified by predicate in params[0]", async function() {
			const input=[0, 1, 2],
				instance=_createInstance({
					params: [_input=>{
						assert.strictEqual(_input, _input);
						return 2;
					}]
				});
			return instance.last(input)
				.then(result=>assert.deepEqual(result, [1, 2]));
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
					assert.deepEqual(result, [1]);
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
						assert.deepEqual(result, input.slice(start));
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
						assert.deepEqual(result, input.slice(0, stop));
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
						assert.deepEqual(result, expected);
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
						assert.deepEqual(result, expected);
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
						assert.deepEqual(result, expected);
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

		it("should properly sort by positive array index", async function() {
			const instance=_createInstance({
				params: [1]
			});
			const result=await instance.sort([
				[0, 2],
				[1, 1],
				[2, 0]
			]);
			assert.deepEqual(result, [
				[2, 0],
				[1, 1],
				[0, 2]
			]);
		});

		it("should properly reverse sort by negative array index", async function() {
			const instance=_createInstance({
				params: [-1]
			});
			const result=await instance.sort([
				[2, 0],
				[1, 1],
				[0, 2]
			]);
			assert.deepEqual(result, [
				[0, 2],
				[1, 1],
				[2, 0]
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

		it("should raise exception if sort param is an unsupported type", async function() {
			const instance=_createInstance({
				params: [{a: 1}]
			});
			return instance.sort([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Number or String but found Object");
				});
		});
	});
});
