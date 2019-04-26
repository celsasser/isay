/**
 * Date: 2019-02-08
 * Time: 10:06 PM
 * @license MIT (see project's LICENSE file)
 */

const fs=require("fs-extra");
const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const file=require("../../../src/common/file");
const {resolveNextTick}=require("../../../src/common/promise");
const {ModuleJson}=require("../../../src/lib/json");

describe("lib.ModuleJson", function() {
	function _createInstance({
		action="action",
		domain="domain",
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

	describe("parse", function() {
		it("should parse input string data", async function() {
			const instance=_createInstance(),
				json={property: "value"},
				result=await instance.parse(JSON.stringify(json));
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
			const path="./test/data/data-pet.json",
				instance=_createInstance();
			return instance.read(path)
				.then(data=>{
					assert.strictEqual(typeof (data), "object");
					assert.deepEqual(data, fs.readJSONSync(path, "utf8"));
				});
		});

		it("should use input data as path if specified", async function() {
			const path="./test/data/data-pet.json",
				instance=_createInstance({
					params: [path]
				});
			return instance.read()
				.then(data=>{
					assert.strictEqual(typeof (data), "object");
					assert.deepEqual(data, fs.readJSONSync(path, "utf8"));
				});
		});

		it("should resolve path and options via predicate", function() {
			const path="./test/data/data-pet.json",
				instance=_createInstance({
					params: [
						resolveNextTick.bind(null, path),
						resolveNextTick.bind(null, {encoding: "binary"})
					]
				});
			proxy.stub(fs, "readJSON", (_path, _options)=>{
				assert.strictEqual(_path, path);
				assert.deepEqual(_options, {encoding: "binary"});
				return Promise.resolve("success");
			});
			return instance.read()
				.then(data=>assert.strictEqual(data, "success"));
		});
	});

	describe("stringify", function() {
		it("should encode as 'compact' by default", function() {
			const instance=_createInstance(),
				data={a: 1};
			return instance.stringify(data)
				.then(result=>{
					assert.strictEqual(result, "{\"a\":1}");
				});
		});

		it("should encode as 'compact' if explicit", function() {
			const instance=_createInstance({
					params: [{compact: true}]
				}),
				data={a: 1};
			return instance.stringify(data)
				.then(result=>{
					assert.strictEqual(result, "{\"a\":1}");
				});
		});

		it("should encode as 'spacious' if !compact", function() {
			const instance=_createInstance({
					params: [{compact: false}]
				}),
				data={a: 1};
			return instance.stringify(data)
				.then(result=>{
					assert.strictEqual(result, "{\n\t\"a\": 1\n}");
				});
		});

		it("should resolve options via predicate", function() {
			const instance=_createInstance({
					params: [resolveNextTick.bind(null, {compact: false})]
				}),
				data={a: 1};
			return instance.stringify(data)
				.then(result=>{
					assert.strictEqual(result, "{\n\t\"a\": 1\n}");
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
				path="./test/data/output/file-save.json",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(result=>{
					assert.strictEqual(result, data);
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
				.then(result=>{
					assert.strictEqual(result, data);
					assert.deepEqual(fs.readJSONSync(path, "utf8"), data);
					fs.removeSync("./test/data/output/new");
				});
		});

		it("should get path and options from predicate", async function() {
			const data={"george": "cat"},
				path="./test/data/output/file-save.json",
				instance=_createInstance({
					params: [
						resolveNextTick.bind(null, path),
						resolveNextTick.bind(null, {encoding: "binary"})
					]
				});
			proxy.stub(file, "writeJSON", (options)=>{
				assert.deepEqual(options, {
					"data": data,
					"encoding": "binary",
					"mode": 0o666,
					"uri": path
				});
				return Promise.resolve();
			});
			return instance.write(data)
				.then(result=>assert.strictEqual(result, data));
		});
	});
});
