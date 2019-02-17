/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleObject}=require("../../../src/lib/object");

describe("lib.ModuleObject", function() {
	function _createInstance({
		action="action",
		domain="parse",
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

	describe("get", function() {
		it("should throw exception if data is not JSON", async function() {
			const instance=_createInstance();
			instance.get("string")
				.then(assert.fail)
				.catch(()=>{

				});
			instance.get(10)
				.then(assert.fail)
				.catch(()=>{

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
				data={
					property: "value"
				},
				result=await instance.get(data);
			assert.strictEqual(result, "value");
		});
	});

	describe("merge", function() {
		it("should merge json into json", async function() {
			const jsonSource={property: "value"},
				jsonMerge={merge: "data"},
				instance=_createInstance({
					params: [jsonMerge]
				}),
				result=await instance.merge(jsonSource);
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
