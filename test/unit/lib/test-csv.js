/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
const assert=require("../../support/assert");
const {ModuleCsv}=require("../../../src/lib/csv");

describe("lib.ModuleCsv", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleCsv({
			action,
			domain,
			method,
			params
		});
	}

	describe("parse", function() {
		it("should parse input string data properly", async function() {
			const instance=_createInstance(),
				csv=fs.readFileSync("./test/data/data-pets.csv", {encoding: "utf8"}),
				result=await instance.parse(csv);
			assert.deepEqual(result.slice(0, 2), [
				[
					"name",
					"species",
					"age"
				],
				[
					"George",
					"cat",
					"5"
				]
			]);
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

		it("should load and parse data", async function() {
			const path="./test/data/data-pets.csv",
				instance=_createInstance();
			return instance.read(path)
				.then(result=>{
					assert.deepEqual(result.slice(0, 2), [
						[
							"name",
							"species",
							"age"
						],
						[
							"George",
							"cat",
							"5"
						]
					]);
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
			const data=[["a", "b"], [1, 2]],
				path="./test/data/output/file-save.csv",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					assert.strictEqual(fs.readFileSync(path, "utf8"), "a,b\n1,2\n");
					fs.removeSync(path);
				});
		});

		it("should create a directory that does not exist", async function() {
			const data=[["a", "b"], [1, 2]],
				path="./test/data/output/new/file-save.csv",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					assert.strictEqual(fs.readFileSync(path, "utf8"), "a,b\n1,2\n");
					fs.removeSync("./test/data/output/new");
				});
		});

		it("should use alternate delimiter", async function() {
			const data=[["a", "b"], [1, 2]],
				path="./test/data/output/file-save.csv",
				instance=_createInstance({
					params: [path, {delimiter: ":"}]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					assert.strictEqual(fs.readFileSync(path, "utf8"), "a:b\n1:2\n");
					fs.removeSync(path);
				});
		});
	});
});
