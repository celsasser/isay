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
		domain="domain",
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

	describe("format", function() {
		it("should raise exception if blob is not an array or object", function() {
			const instance=_createInstance({
				params: ["spec"]
			});
			instance.format("string")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Array or Object but found String");
				});
		});

		it("should raise exception if spec is not a string", function() {
			const instance=_createInstance({
				params: [{}]
			});
			instance.format([])
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found Object");
				});
		});

		it("should properly format according to spec and return result", async function() {
			const instance=_createInstance({
				params: ["${l}"]
			});
			return instance.format(["input"])
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});
	});

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
		it("should raise exception if param is unknown", async function() {
			const instance=_createInstance({
				params: [10]
			});
			instance.split("")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Object but found Number");
				});
		});

		it("should use white method by default", async function() {
			const instance=_createInstance({}),
				blob=await instance.split("a\\ b");
			assert.deepEqual(blob, ["a\\", "b"]);
		});

		it("should split via string", async function() {
			const instance=_createInstance({
					params: ["."]
				}),
				blob=await instance.split("a.b.c.d");
			assert.deepEqual(blob, ["a", "b", "c", "d"]);
		});

		it("should split via regex without capture groups", async function() {
			const instance=_createInstance({
					params: [/\W/]
				}),
				blob=await instance.split("a.b.c.d");
			assert.deepEqual(blob, ["a", "b", "c", "d"]);
		});

		it("should return capture groups if regex includes capture groups", async function() {
			const instance=_createInstance({
					params: [/(\d+)\w+(\d+)(.+)/]
				}),
				blob=await instance.split("1a2--");
			assert.deepEqual(blob, ["1", "2", "--"]);
		});

		it("should not split on escaped parenthesis", async function() {
			const instance=_createInstance({
					params: [/\(\w+\)/]
				}),
				blob=await instance.split("a(1)b");
			assert.deepEqual(blob, ["a", "b"]);
		});

		it("should apply default 'delimiter' properly", async function() {
			const instance=_createInstance({
					params: [{method: "delimiter"}]
				}),
				blob=await instance.split("a,b, c, d");
			assert.deepEqual(blob, ["a", "b", "c", "d"]);
		});

		it("should apply specified 'delimiter' properly", async function() {
			const instance=_createInstance({
					params: [{method: "delimiter", delimiter: "\\s*:\\s*"}]
				}),
				blob=await instance.split("a:b: c: d");
			assert.deepEqual(blob, ["a", "b", "c", "d"]);
		});

		it("should apply newline properly", async function() {
			const instance=_createInstance({
					params: [{method: "newline"}]
				}),
				blob=await instance.split("1\n2 \n 3");
			assert.deepEqual(blob, ["1", "2", "3"]);
		});

		it("should apply 'white' properly", async function() {
			const instance=_createInstance({
					params: [{method: "white"}]
				}),
				blob=await instance.split("'a b'");
			assert.deepEqual(blob, ["'a", "b'"]);
		});
	});

	describe("lower", function() {
		it("should reject all but strings", function() {
			const instance=_createInstance();
			return instance.lower(10)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found Number");
				});
		});

		it("should properly lower case", function() {
			const instance=_createInstance();
			return instance.lower("Ab")
				.then(result=>assert.strictEqual(result, "ab"));
		});
	});

	describe("upper", function() {
		it("should reject all but strings", function() {
			const instance=_createInstance();
			return instance.upper(10)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found Number");
				});
		});

		it("should properly raise case", function() {
			const instance=_createInstance();
			return instance.upper("Ab")
				.then(result=>assert.strictEqual(result, "AB"));
		});
	});
});
