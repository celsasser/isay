/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
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

	describe("read", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance.read()
				.then(assert.fail)
				.catch(error=>{
					assert.ok(error.message.startsWith("expecting string"));
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-george.json",
				instance=_createInstance();
			return instance.read(path)
				.then(data=>{
					assert.strictEqual(typeof (data), "object");
					assert.deepEqual(data, fs.readJSONSync(path, "utf8"));
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-george.json",
				instance=_createInstance({
					params: [path]
				});
			return instance.read()
				.then(data=>{
					assert.strictEqual(typeof (data), "object");
					assert.deepEqual(data, fs.readJSONSync(path, "utf8"));
				});
		});
	});

	describe("write", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance.write()
				.then(assert.fail)
				.catch(error=>{
					assert.ok(error.message.startsWith("expecting string"));
				});
		});

		it("should save to an existing directory", async function() {
			const data={"george": "cat"},
				path="./test/data/output/file-save.json",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					assert.deepEqual(fs.readJSONSync(path, "utf8"), data);
					fs.removeSync(path);
				});
		});

		it("should create a directory that does not exist", async function() {
			const data={"george": "cat"},
				path="./test/data/output/new/file-save.json",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					assert.deepEqual(fs.readJSONSync(path, "utf8"), data);
					fs.removeSync("./test/data/output/new");
				});
		});
	});
});
