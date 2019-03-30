/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 19:45
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleMath}=require("../../../src/lib/math");

describe("lib.ModuleMath", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleMath({
			action,
			domain,
			method,
			params
		});
	}

	[
		["add", "binary"],
		["ceiling", "unary"],
		["divide", "binary"],
		["divmod", "binary"],
		["floor", "unary"],
		["multiply", "binary"],
		["round", "unary"],
		["subtract", "binary"]
	].forEach(([action, cardinality])=>{
		it(`${action} should throw exception if input is not a number`, async function() {
			const instance=_createInstance();
			return instance[action]("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or Number but found String");
				});
		});

		if(cardinality==="binary") {
			it(`${action} should throw exception if params[0] is not a number`, async function() {
				const instance=_createInstance({
					params: ["string"]
				});
				return instance[action](100)
					.then(assert.notCalled)
					.catch(error=>{
						assert.strictEqual(error.message, "expecting Array or Number but found String");
					});
			});
		}
	});

	[
		["ceiling", 10.5, 11],
		["floor", 10.5, 10],
		["round", 10.51, 11]
	].forEach(([action, input, expected])=>{
		it(`${action} should properly calculate ${action}(${input})=${expected}`, async function() {
			const instance=_createInstance();
			return instance[action](input)
				.then(result=>{
					assert.strictEqual(result, expected);
				});
		});
	});

	[
		["ceiling", [0, 1.25, 2.5, 3.75], [0, 2, 3, 4]],
		["floor", [0, 1.25, 2.5, 3.75], [0, 1, 2, 3]],
		["round", [0, 1.25, 2.5, 3.75], [0, 1, 3, 4]]
	].forEach(([action, input, expected])=>{
		it(`${action} should properly calculate ${action}(${JSON.stringify(input)}) to ${JSON.stringify(expected)}`, async function() {
			const instance=_createInstance();
			return instance[action](input)
				.then(result=>{
					assert.deepEqual(result, expected);
				});
		});
	});

	[
		["add", [1, 2, 3], 6],
		["divide", [20, 5, 2], 2],
		["multiply", [2, 3, 4], 24],
		["subtract", [10, 5, 1], 4]
	].forEach(([action, input, expected])=>{
		it(`input=array, param=none: ${action} should ${action} ${JSON.stringify(input)} and reduce to ${expected}`, async function() {
			const instance=_createInstance();
			return instance[action](input)
				.then(result=>{
					assert.strictEqual(result, expected);
				});
		});
	});

	[
		["add", 100, 50, 150],
		["divide", 100, 50, 2],
		["divmod", 100, 50, [2, 0]],
		["divmod", 100, 51, [1, 49]],
		["divmod", 100, 100, [1, 0]],
		["multiply", 100, 50, 5000],
		["subtract", 100, 50, 50]
	].forEach(([action, input, operand, expected])=>{
		it(`input=value-type, param=value-type: should properly ${action} ${input} to or by ${operand} and get ${expected}`, async function() {
			const instance=_createInstance({
				params: [operand]
			});
			return instance[action](input)
				.then(result=>{
					assert.deepEqual(result, expected);
				});
		});
	});

	[
		["add", [1, 2, 3], 10, [11, 12, 13]],
		["divide", [5, 10, 20], 10, [0.5, 1, 2]],
		["divmod", [5, 10, 15], 10, [[0, 5], [1, 0], [1, 5]]],
		["multiply", [2, 3, 4], 10, [20, 30, 40]],
		["subtract", [10, 11, 12], 10, [0, 1, 2]]
	].forEach(([action, input, param, expected])=>{
		it(`input=array, param=value-type: should properly ${action} ${JSON.stringify(input)} to or by ${param} and get ${expected}`, async function() {
			const instance=_createInstance({
				params: [param]
			});
			return instance[action](input)
				.then(result=>{
					assert.deepEqual(result, expected);
				});
		});
	});

	[
		["add", 10, [1, 2, 3], [11, 12, 13]],
		["divide", 10, [5, 10, 20], [2, 1, 0.5]],
		["divmod", 10, [1, 2, 3], [[10, 0], [5, 0], [3, 1]]],
		["multiply", 10, [1, 2, 3], [10, 20, 30]],
		["subtract", 10, [1, 2, 3], [9, 8, 7]]
	].forEach(([action, input, param, expected])=>{
		it(`input=value-type, param=array: should properly ${action} ${JSON.stringify(input)} to or by ${param} and get ${expected}`, async function() {
			const instance=_createInstance({
				params: [param]
			});
			return instance[action](input)
				.then(result=>{
					assert.deepEqual(result, expected);
				});
		});
	});

	[
		["add", [1, 2, 3], [4, 5, 6], [5, 7, 9]],
		["divide", [10, 20, 30], [5, 4, 3], [2, 5, 10]],
		["divmod", [5, 10, 15], [4, 5, 6], [[1, 1], [2, 0], [2, 3]]],
		["multiply", [1, 2, 3], [4, 5, 6], [4, 10, 18]],
		["subtract", [1, 2, 3], [4, 5, 6], [-3, -3, -3]]
	].forEach(([action, input, param, expected])=>{
		it(`input=array, param=array: should properly ${action} ${JSON.stringify(input)} to or by 10 and get ${expected}`, async function() {
			const instance=_createInstance({
				params: [param]
			});
			return instance[action](input)
				.then(result=>{
					assert.deepEqual(result, expected);
				});
		});
	});

	[
		["add", [1, 2, 3], [1, 2]],
		["divide", [1, 2, 3], [1, 2]],
		["divmod", [1, 2, 3], [1, 2]],
		["multiply", [1, 2, 3], [1, 2]],
		["subtract", [1, 2, 3], [1, 2]]
	].forEach(([action, input, param])=>{
		it(`input=array, param=array: should raise exception if ${action}'s input and param array lengths differ`, async function() {
			const instance=_createInstance({
				params: [param]
			});
			return instance[action](input)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "input array (3) and param (2) differ in length");
				});
		});
	});

	[
		["max", [1, 2, 3], 3],
		["min", [1, 2, 3], 1]
	].forEach(([action, input, expected])=>{
		it(`${action} should throw exception if input is not an array of numbers`, async function() {
			const instance=_createInstance();
			return instance[action]("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array but found String");
				});
		});

		it(`${action} of ${JSON.stringify(input)} should equal ${expected}`, async function() {
			const instance=_createInstance();
			return instance[action](input)
				.then(result=>{
					assert.strictEqual(result, expected);
				});
		});
	});
});
