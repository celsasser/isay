/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 00:31
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleString}=require("../../../src/lib/string");

describe("lib.ModuleString", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleString({
			action,
			domain,
			method,
			params
		});
	}

	describe("replace", function() {
		[
			["input", 0, "search", "replace"],
			["search", "input", 0, "replace"],
			["replace", "input", "search", 0]
		].forEach(args=>{
			it(`should reject unknown ${args[0]} type`, async function() {
				const input=args[1],
					search=args[2],
					replace=args[3],
					instance=new _createInstance({
						params: [search, replace]
					});
				return instance.replace(input)
					.then(assert.notCalled)
					.catch(error=>{
						assert.ok(error.message.startsWith("expecting"));
					});
			});
		});

		it("should successfully process valid string search", async function() {
			const input="dog, cat, dog",
				search="dog",
				replace="bird",
				instance=new _createInstance({
					params: [search, replace]
				});
			return instance.replace(input)
				.then(result=>assert.strictEqual(result, "bird, cat, bird"));
		});

		it("should successfully process valid non-global, regex search", async function() {
			const input="dog, cat, dog",
				search=/dog/,
				replace="bird",
				instance=new _createInstance({
					params: [search, replace]
				});
			return instance.replace(input)
				.then(result=>assert.strictEqual(result, "bird, cat, dog"));
		});

		it("should successfully process valid global, regex search", async function() {
			const input="dog, cat, dog",
				search=/dog/g,
				replace="bird",
				instance=new _createInstance({
					params: [search, replace]
				});
			return instance.replace(input)
				.then(result=>assert.strictEqual(result, "bird, cat, bird"));
		});
	});

	describe("split", function() {
		it("should use white method by default", async function() {
			const instance=_createInstance({}),
				blob=await instance.split("a\\ b");
			assert.deepEqual(blob, ["a\\", "b"]);
		});

		it("should apply default 'delimiter' properly", async function() {
			const instance=_createInstance({
					params: ["delimiter"]
				}),
				blob=await instance.split("a,b, c, d");
			assert.deepEqual(blob, ["a", "b", "c", "d"]);
		});

		it("should apply specified 'delimiter' properly", async function() {
			const instance=_createInstance({
					params: ["delimiter", "\\s*:\\s*"]
				}),
				blob=await instance.split("a:b: c: d");
			assert.deepEqual(blob, ["a", "b", "c", "d"]);
		});

		it("should apply newline properly", async function() {
			const instance=_createInstance({
					params: ["newline"]
				}),
				blob=await instance.split("1\n2 \n 3");
			assert.deepEqual(blob, ["1", "2", "3"]);
		});

		it("should apply 'white' properly", async function() {
			const instance=_createInstance({
					params: ["white"]
				}),
				blob=await instance.split("'a b'");
			assert.deepEqual(blob, ["'a", "b'"]);
		});
	});
});
