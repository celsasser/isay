/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleJson}=require("../../../src/lib/json");

describe("lib.ModuleJson", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleJson({
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

	describe("load", function() {
		it("should load and parse a valid path", async function() {
			const instance=_createInstance({
					params: ["./test/data/json-data-george.json"]
				}),
				result=await instance.load();
			assert.deepEqual(result, {
				"george": {
					"type": "cat"
				}
			});
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

	describe("parse", function() {
		it("should parse input string data", async function() {
			const instance=_createInstance(),
				json={property: "value"},
				result=await instance.parse(JSON.stringify(json));
			assert.deepEqual(result, json);
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

	describe("write", function() {

	});
});
