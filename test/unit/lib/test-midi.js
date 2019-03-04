/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
const midi=require("midi-file-io");
const assert=require("../../support/assert");
const {ModuleMidi}=require("../../../src/lib/midi");

describe("lib.ModuleMidi", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleMidi({
			action,
			domain,
			method,
			params
		});
	}

	describe("parse", function() {
		it("should parse input buffer data properly", async function() {
			const instance=_createInstance(),
				buffer=fs.readFileSync("./test/data/q-q-q-q.mid", {encoding: "binary"}),
				result=await instance.parse(buffer);
			assert.deepEqual(result.header, {
				"formatType": 0,
				"ticksPerQuarter": 480,
				"trackCount": 1
			});
		});

		it("should parse input string data properly", async function() {
			const instance=_createInstance(),
				text=fs.readFileSync("./test/data/q-q-q-q.mid", {encoding: "binary"}).toString("utf8"),
				result=await instance.parse(text);
			assert.deepEqual(result.header, {
				"formatType": 0,
				"ticksPerQuarter": 480,
				"trackCount": 1
			});
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

		it("should load and parse data", async function() {
			const instance=_createInstance(),
				result=await instance.read("./test/data/q-q-q-q.mid");
			assert.deepEqual(result.header, {
				"formatType": 0,
				"ticksPerQuarter": 480,
				"trackCount": 1
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
			const data=midi.parseMidiFile("./test/data/q-q-q-q.mid"),
				path="./test/data/output/file-save.mid",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					fs.removeSync(path);
				});
		});

		it("should create a directory that does not exist", async function() {
			const data=midi.parseMidiFile("./test/data/q-q-q-q.mid"),
				path="./test/data/output/new/file-save.mid",
				instance=_createInstance({
					params: [path]
				});
			return instance.write(data)
				.then(_data=>{
					assert.strictEqual(_data, data);
					fs.removeSync("./test/data/output/new");
				});
		});
	});
});
