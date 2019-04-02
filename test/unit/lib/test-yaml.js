/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
const jsyaml=require("js-yaml");
const assert=require("../../support/assert");
const {ModuleYaml}=require("../../../src/lib/yaml");

describe("lib.ModuleYaml", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleYaml({
			action,
			domain,
			method,
			params
		});
	}

	describe("parse", function() {
		it("should parse input string data", async function() {
			const instance=_createInstance(),
				json={property: "value"},
				result=await instance.parse(jsyaml.dump(json));
			assert.deepEqual(result, json);
		});
	});

	describe("read", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance.read()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found undefined");
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-pet.yaml",
				instance=_createInstance();
			return instance.read(path)
				.then(data=>{
					assert.strictEqual(typeof (data), "object");
					assert.deepEqual(data, {
						"george": {
							"type": "cat"
						}
					});
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-pet.yaml",
				instance=_createInstance({
					params: [path]
				});
			return instance.read()
				.then(data=>{
					assert.strictEqual(typeof (data), "object");
					assert.deepEqual(data, {
						"george": {
							"type": "cat"
						}
					});
				});
		});
	});

	describe("stringify", function() {
		it("should encode as properly", function() {
			const instance=_createInstance(),
				data={b: 2, a: 1};
			return instance.stringify(data)
				.then(result=>{
					assert.strictEqual(result, "b: 2\na: 1\n");
				});
		});

		it("should sort if asked to", function() {
			const instance=_createInstance({
					params: [{sort: true}]
				}),
				data={b: 2, a: 1};
			return instance.stringify(data)
				.then(result=>{
					assert.strictEqual(result, "a: 1\nb: 2\n");
				});
		});
	});

	describe("write", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance.write()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found undefined");
				});
		});

		it("should save to an existing directory", async function() {
			const data={"george": "cat"},
				path="./test/data/output/file-save.yaml",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					assert.strictEqual(fs.readFileSync(path, "utf8"), "george: cat\n");
					fs.removeSync(path);
				});
		});

		it("should create a directory that does not exist", async function() {
			const data={"george": "cat"},
				path="./test/data/output/new/file-save.yaml",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					assert.strictEqual(fs.readFileSync(path, "utf8"), "george: cat\n");
					fs.removeSync("./test/data/output/new");
				});
		});
	});
});
