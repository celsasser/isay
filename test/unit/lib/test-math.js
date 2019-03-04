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
		domain="parse",
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
					assert.strictEqual(error.message, "expecting Number but found String");
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
						assert.strictEqual(error.message, "expecting Number but found String");
					});
			});
		}
	});

	[
		["ceiling", 10.5, 11],
		["floor", 10.5, 10],
		["round", 10.51, 11],
	].forEach(([action, input, expected])=>{
		it(`${action} should properly convert ${input} to ${expected}`, async function() {
			const instance=_createInstance();
			return instance[action](input)
				.then(result=>{
					assert.strictEqual(result, expected);
				});
		});
	});

	[
		["add", 50, 150],
		["divide", 50, 2],
		["multiply", 50, 5000],
		["subtract", 50, 50]
	].forEach(([action, operand, expected])=>{
		it(`${action} should properly ${action} ${operand} and get ${expected}`, async function() {
			const instance=_createInstance({
				params: [operand]
			});
			return instance[action](100)
				.then(result=>{
					assert.strictEqual(result, expected);
				});
		});
	});
});
