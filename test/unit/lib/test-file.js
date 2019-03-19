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
		domain="domain",
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

	beforeEach(function() {
		fs.removeSync("./test/data/output/file");
		fs.mkdirpSync("./test/data/output/file");
	});

	describe("copy", function() {
		it("should copy with source file as input and target as param", async function() {
			const source="./test/data/data-pets.csv",
				target="./test/data/output/file/",
				instance=_createInstance({
					params: [target]
				});
			const result=await instance.copy(source),
				sourceData=await fs.readFile(source, {encoding: "utf8"}),
				targetData=await fs.readFile(`${target}data-pets.csv`, {encoding: "utf8"});
			assert.strictEqual(result, source);
			assert.deepEqual(sourceData, targetData);
		});

		it("should copy with source file as param and target as param", async function() {
			const source="./test/data/data-pets.csv",
				target="./test/data/output/file/",
				instance=_createInstance({
					params: [source, target]
				});
			const result=await instance.copy(),
				sourceData=await fs.readFile(source, {encoding: "utf8"}),
				targetData=await fs.readFile(`${target}data-pets.csv`, {encoding: "utf8"});
			assert.strictEqual(result, undefined);
			assert.deepEqual(sourceData, targetData);
		});

		it("should create target directory hierarchy that does not exist", async function() {
			const source="./test/data/data-pets.csv",
				target="./test/data/output/file/new/",
				instance=_createInstance({
					params: [source, target]
				});
			const result=await instance.copy(),
				sourceData=await fs.readFile(source, {encoding: "utf8"}),
				targetData=await fs.readFile(`${target}data-pets.csv`, {encoding: "utf8"});
			assert.strictEqual(result, undefined);
			assert.deepEqual(sourceData, targetData);
		});

		it("should copy entire directory to target directory", async function() {
			const source="./test/support",
				target="./test/data/output/file/target",
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
		});
	});


	describe("create", function() {
		it("should successfully create a file specified as input that does not exist", async function() {
			const path="./test/data/output/file/create.txt",
				instance=_createInstance(),
				result=await instance.create(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.lstatSync(path).isFile(), true);
		});

		it("should successfully create a file specified as a param that does not exist", async function() {
			const path="./test/data/output/file/create.txt",
				instance=_createInstance({
					params: [path]
				}),
				result=await instance.create();
			assert.strictEqual(result, undefined);
			assert.strictEqual(fs.lstatSync(path).isFile(), true);
		});

		it("should successfully create directory hierarchy that does not exist for the target file", async function() {
			const path="./test/data/output/file/new/create.txt",
				instance=_createInstance({
					params: [path]
				}),
				result=await instance.create();
			assert.strictEqual(result, undefined);
			assert.strictEqual(fs.lstatSync(path).isFile(), true);
		});

		it("should successfully create a directory specified as input that does not exist", async function() {
			const path="./test/data/output/file/create",
				instance=_createInstance({
					params: [{type: "directory"}]
				}),
				result=await instance.create(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.lstatSync(path).isDirectory(), true);
		});

		it("should recreate a directory that already exists", async function() {
			const path="./test/data/output/file/ensure",
				instance=_createInstance({
					params: [{type: "directory"}]
				});
			fs.outputFileSync(`${path}/dummy.txt`, "text");
			const result=await instance.create(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.pathExistsSync(`${path}/dummy.txt`), false);
		});
	});

	describe("delete", function() {
		it("should delete a file", async function() {
			const path="./test/data/output/file/create.txt",
				instance=_createInstance();
			await instance.create(path);
			const result=await instance.delete(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.pathExistsSync(path), false);
		});

		it("should delete a directory", async function() {
			const instance=_createInstance();
			await instance.create("./test/data/output/file/create.txt");
			const result=await instance.delete("./test/data/output/file");
			assert.strictEqual(result, "./test/data/output/file");
			assert.strictEqual(fs.pathExistsSync("./test/data/output/file"), false);
		});
	});

	describe("ensure", function() {
		it("should create a file that does not exist", async function() {
			const path="./test/data/output/file/ensure.txt",
				instance=_createInstance(),
				result=await instance.ensure(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.lstatSync(path).isFile(), true);
		});

		it("should not recreate a file that already exists", async function() {
			const path="./test/data/output/file/ensure.txt",
				instance=_createInstance();
			fs.outputFileSync(path, "text");
			const result=await instance.ensure(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.readFileSync(path, {encoding: "utf8"}), "text");
		});

		it("should create a directory that does not exist", async function() {
			const path="./test/data/output/file/ensure",
				instance=_createInstance({
					params: [{type: "directory"}]
				}),
				result=await instance.ensure(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.lstatSync(path).isDirectory(), true);
		});

		it("should not recreate a file that already exists", async function() {
			const path="./test/data/output/file/ensure",
				instance=_createInstance({
					params: [{type: "directory"}]
				});
			fs.outputFileSync(`${path}/dummy.txt`, "text");
			const result=await instance.ensure(path);
			assert.strictEqual(result, path);
			assert.strictEqual(fs.readFileSync(`${path}/dummy.txt`, {encoding: "utf8"}), "text");
		});

		it("should throw exception if mismatch on file type", async function() {
			const path="./test/data/output/file/ensure",
				instance=_createInstance({
					params: [{type: "directory"}]
				});
			fs.outputFileSync(path, "text");
			return instance.ensure(path)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, '"./test/data/output/file/ensure" already exists but is not a directory');
				});
		});
	});

	describe("move", function() {
		it("should move a file from a source and to a target within the same directory", async function() {
			const source="./test/data/output/file/data-pets.csv",
				target="./test/data/output/file/moved.csv",
				instance=_createInstance({
					params: [target]
				});
			fs.copyFileSync("./test/data/data-pets.csv", source);
			const result=await instance.move(source);
			assert.strictEqual(result, source);
			assert.strictEqual(fs.pathExistsSync(source), false);
			assert.strictEqual(fs.pathExistsSync(target), true);
		});
	});

	describe("read", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance.read()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting string as file-path but found undefined");
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-pet.txt",
				instance=_createInstance();
			return instance.read(path)
				.then(data=>{
					assert.strictEqual(typeof (data), "string");
					assert.deepEqual(data, fs.readFileSync(path, "utf8"));
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-pet.txt",
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
				.then(assert.notCalled)
				.catch(error=>{
					assert.ok(error.message.startsWith("expecting string"));
				});
		});

		it("should save to an existing directory", async function() {
			const path="./test/data/output/file/file-save.txt",
				instance=_createInstance({
					params: [path]
				});
			return instance.write("george")
				.then(data=>{
					assert.strictEqual(data, "george");
					assert.strictEqual(fs.readFileSync(path, "utf8"), "george");
				});
		});

		it("should create a directory that does not exist", async function() {
			const path="./test/data/output/file/file-save.txt",
				instance=_createInstance({
					params: [path]
				});
			return instance.write("george")
				.then(data=>{
					assert.strictEqual(data, "george");
					assert.strictEqual(fs.readFileSync(path, "utf8"), "george");
				});
		});

		it("should append if requested to", async function() {
			const path="./test/data/output/file/file-save.txt";

			async function _write(append) {
				const instance=_createInstance({
					params: [path, {append}]
				});
				return instance.write("george", {append});
			}

			await _write(false);
			await _write(true);
			assert.strictEqual(fs.readFileSync(path, "utf8"), "georgegeorge");
		});
	});

	describe("zip", function() {
		it("should throw exception blob is not a known type", async function() {
			const instance=_createInstance({
				params: ["archive"]
			});
			return instance.zip()
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String or Array but found undefined");
				});
		});

		it("should throw exception if archive is not known type", async function() {
			const instance=_createInstance();
			return instance.zip("files")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found undefined");
				});
		});

		it("should successfull archive single input file", async function() {
			const archive="./test/data/output/file/archive.zip",
				instance=_createInstance({
					params: [archive]
				});
			return instance.zip("package.json")
				.then(result=>{
					assert.strictEqual(result, "package.json");
					assert.strictEqual(fs.existsSync(archive), true);
				});
		});

		it("should successfully archive multiple input files", async function() {
			const archive="./test/data/output/file/archive.zip",
				files=[
					"package.json",
					"test/data/data-pets.csv",
					"test/data/data-pet.json",
					"test/data/data-pet.txt"
				],
				instance=_createInstance({
					params: [archive]
				});
			return instance.zip(files)
				.then(result=>{
					assert.strictEqual(result, files);
					assert.strictEqual(fs.existsSync(archive), true);
				});
		});
	});
});
