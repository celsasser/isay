/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
const assert=require("../../support/assert");
const {ModuleFile}=require("../../../src/lib/file");

describe("lib.ModuleFile", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleFile({
			action,
			domain,
			method,
			params
		});
	}

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
			const path="./test/data/data-george.txt",
				instance=_createInstance();
			return instance.read(path)
				.then(data=>{
					assert.strictEqual(typeof (data), "string");
					assert.deepEqual(data, fs.readFileSync(path, "utf8"));
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-george.txt",
				instance=_createInstance({
					params: [path]
				});
			return instance.read()
				.then(data=>{
					assert.strictEqual(typeof (data), "string");
					assert.deepEqual(data, fs.readFileSync(path, "utf8"));
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
			const path="./test/data/output/file-save.txt",
				instance=_createInstance({
					params: [path]
				});
			return instance.write("george")
				.then(data=>{
					assert.strictEqual(data, "george");
					assert.strictEqual(fs.readFileSync(path, "utf8"), "george");
					fs.removeSync(path);
				});
		});

		it("should create a directory that does not exist", async function() {
			const path="./test/data/output/new/file-save.txt",
				instance=_createInstance({
					params: [path]
				});
			return instance.write("george")
				.then(data=>{
					assert.strictEqual(data, "george");
					assert.strictEqual(fs.readFileSync(path, "utf8"), "george");
					fs.removeSync("./test/data/output/new");
				});
		});
	});
});
