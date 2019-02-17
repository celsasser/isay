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

	describe("copy", function() {
		it("should copy with source file as input and target as param", async function() {
			const source="./test/data/data-george.csv",
				target="./test/data/output/",
				instance=_createInstance({
					params: [target]
				});
			const result=await instance.copy(source),
				sourceData=await fs.readFile(source, {encoding: "utf8"}),
				targetData=await fs.readFile(`${target}data-george.csv`, {encoding: "utf8"});
			assert.strictEqual(result, source);
			assert.deepEqual(sourceData, targetData);
			return fs.remove(`${target}data-george.csv`);
		});

		it("should copy with source file as param and target as param", async function() {
			const source="./test/data/data-george.csv",
				target="./test/data/output/",
				instance=_createInstance({
					params: [source, target]
				});
			const result=await instance.copy(),
				sourceData=await fs.readFile(source, {encoding: "utf8"}),
				targetData=await fs.readFile(`${target}data-george.csv`, {encoding: "utf8"});
			assert.strictEqual(result, undefined);
			assert.deepEqual(sourceData, targetData);
			return fs.remove(`${target}data-george.csv`);
		});

		it("should copy entire directory to target directory", async function() {
			const source="./test/support",
				target="./test/data/output/target",
				instance=_createInstance({
					params: [source, target]
				});
			await instance.copy();
			const files=await fs.readdir(target)
				.then(files=>files
					.filter(file=>file.endsWith(".js"))
					.sort()
				);
			assert.deepEqual(files, [
				"assert.js",
				"proxy.js"
			]);
			return fs.remove(target);
		});
	});


	describe("create", function() {
		it("should successfully create a path specified as input that does not exist", async function() {
			const path="./test/data/output/create.txt",
				instance=_createInstance(),
				result=await instance.create(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.pathExistsSync(path), true);
			return fs.remove(path);
		});

		it("should successfully create a path specified as a param that does not exist", async function() {
			const path="./test/data/output/create.txt",
				instance=_createInstance({
					params: [path]
				}),
				result=await instance.create();
			assert.strictEqual(result, undefined);
			assert.strictEqual(fs.pathExistsSync(path), true);
			return fs.remove(path);
		});
	});

	describe("delete", function() {
		it("should delete a file", async function() {
			const path="./test/data/output/create.txt",
				instance=_createInstance();
			await instance.create(path);
			const result=await instance.delete(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.pathExistsSync(path), false);
		});

		it("should delete a directory", async function() {
			const instance=_createInstance();
			await instance.create("./test/data/output/new/create.txt");
			const result=await instance.delete("./test/data/output/new");
			assert.strictEqual(result, "./test/data/output/new");
			assert.strictEqual(fs.pathExistsSync("./test/data/output/new"), false);
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
					return fs.remove(path);
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
					return fs.remove("./test/data/output/new");
				});
		});

		it("should append if requested to", async function() {
			const path="./test/data/output/file-save.txt";

			async function _write(append) {
				const instance=_createInstance({
					params: [path, {append}]
				});
				return instance.write("george", {append});
			}

			await _write(false);
			await _write(true);
			assert.strictEqual(fs.readFileSync(path, "utf8"), "georgegeorge");
			return fs.remove(path);
		});
	});

	describe("zip", function() {
		it("should throw exception blob is not a known type", async function() {
			const instance=_createInstance({
				params: ["archive"]
			});
			return instance.zip()
				.then(assert.fail)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String or Array but found undefined");
				});
		});

		it("should throw exception if archive is not known type", async function() {
			const instance=_createInstance();
			return instance.zip("files")
				.then(assert.fail)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found undefined");
				});
		});

		it("should successfull archive single input file", async function() {
			const archive="./test/data/output/archive.zip",
				instance=_createInstance({
					params: [archive]
				});
			return instance.zip("package.json")
				.then(result=>{
					assert.strictEqual(result, "package.json");
					assert.strictEqual(fs.existsSync(archive), true);
					return fs.remove(archive);
				});
		});

		it("should successfully archive multiple input files", async function() {
			const archive="./test/data/output/archive.zip",
				files=[
					"package.json",
					"test/data/data-george.csv",
					"test/data/data-george.json",
					"test/data/data-george.txt"
				],
				instance=_createInstance({
					params: [archive]
				});
			return instance.zip(files)
				.then(result=>{
					assert.strictEqual(result, files);
					assert.strictEqual(fs.existsSync(archive), true);
					return fs.remove(archive);
				});
		});
	});
});
