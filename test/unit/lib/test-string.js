/**
 * Date: 2019-02-05
 * Time: 00:31
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const {resolveNextTick}=require("../../../src/common/promise");
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

		it("should resolve the format spec from predicate", async function() {
			const instance=_createInstance({
				params: [resolveNextTick.bind(null, "${l}")]
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
						assert.startsWith(error.message, "expecting");
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

		it("should successfully process valid non-global regex search", async function() {
			const input="dog, cat, dog",
				search=/dog/,
				replace="bird",
				instance=new _createInstance({
					params: [search, replace]
				});
			return instance.replace(input)
				.then(result=>assert.strictEqual(result, "bird, cat, dog"));
		});

		it("should successfully process valid global regex search", async function() {
			const input="dog, cat, dog",
				search=/dog/g,
				replace="bird",
				instance=new _createInstance({
					params: [search, replace]
				});
			return instance.replace(input)
				.then(result=>assert.strictEqual(result, "bird, cat, bird"));
		});

		it("should get search and replace args from predicates", async function() {
			const input="dog, cat, dog",
				search=resolveNextTick.bind(null, "cat"),
				replace=resolveNextTick.bind(null, "dog"),
				instance=new _createInstance({
					params: [search, replace]
				});
			return instance.replace(input)
				.then(result=>assert.strictEqual(result, "dog, dog, dog"));
		});
	});

	describe("split", function() {
		it("should raise exception if blob is not a string", async function() {
			const instance=_createInstance();
			return instance.split(10)
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting String but found Number");
				});
		});

		it("should raise exception if param is unknown", async function() {
			const instance=_createInstance({
				params: [10]
			});
			return instance.split("")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Object, RegExp or String but found Number");
				});
		});

		it("should use white method by default", async function() {
			const instance=_createInstance(),
				blob=await instance.split("a\\ b");
			assert.deepEqual(blob, ["a\\", "b"]);
		});

		describe("literal", function() {
			it("should split via '.'", async function() {
				const instance=_createInstance({
						params: ["."]
					}),
					blob=await instance.split("a.b.c.d");
				assert.deepEqual(blob, ["a", "b", "c", "d"]);
			});
		});

		describe("regex", function() {
			it("should split /[a-z]/ without capture groups", async function() {
				const instance=_createInstance({
						params: [/[a-z]/]
					}),
					blob=await instance.split("AaBbC");
				assert.deepEqual(blob, ["A", "B", "C"]);
			});

			it("should return capture groups if regex includes capture groups", async function() {
				const instance=_createInstance({
						params: [/(\d+)\w+(\d+)(.+)/]
					}),
					blob=await instance.split("1a2->");
				assert.deepEqual(blob, ["1", "2", "->"]);
			});

			it("should not be fooled by escaped parenthesis", async function() {
				const instance=_createInstance({
						params: [/\(\w+\)/]
					}),
					blob=await instance.split("a(1)b");
				assert.deepEqual(blob, ["a", "b"]);
			});
		});

		describe("method", function() {
			it("should raise exception if method cannot be divined", async function() {
				const instance=_createInstance({
					params: [{
						unknown: "configuration"
					}]
				});
				return instance.split(" a b")
					.then(assert.notCalled)
					.catch(error=>{
						assert.strictEqual(error.message, 'unsupported configuration {"unknown":"configuration"}');
					});
			});

			describe("delimiter", function() {
				it("should raise exception if 'delimiter' property is unknown", async function() {
					const instance=_createInstance({
						params: [{
							delimiter: 10
						}]
					});
					return instance.split("a,b")
						.then(assert.notCalled)
						.catch(error=>{
							assert.strictEqual(error.message, "expecting RegExp or String but found Number");
						});
				});

				it("should by default to '/s*,/s*'", async function() {
					const instance=_createInstance({
							params: [{method: "delimiter"}]
						}),
						blob=await instance.split("a , b , c");
					assert.deepEqual(blob, ["a", "b", "c"]);
				});

				it("should infer method by 'delimiter' property", async function() {
					const instance=_createInstance({
							params: [{delimiter: ";"}]
						}),
						blob=await instance.split("a;b;c");
					assert.deepEqual(blob, ["a", "b", "c"]);
				});

				it("should apply specified 'delimiter' string properly", async function() {
					const instance=_createInstance({
							params: [{
								method: "delimiter",
								delimiter: ":"
							}]
						}),
						blob=await instance.split("a : b : c");
					assert.deepEqual(blob, ["a ", " b ", " c"]);
				});

				it("should apply specified 'delimiter' regex properly", async function() {
					const instance=_createInstance({
							params: [{
								method: "delimiter",
								delimiter: /\s*:\s*/
							}]
						}),
						blob=await instance.split("a : b : c");
					assert.deepEqual(blob, ["a", "b", "c"]);
				});
			});

			describe("format", function() {
				it("should raise exception if method='format' and format is missing from configuration", async function() {
					const instance=_createInstance({
						params: [{
							method: "format"
						}]
					});
					return instance.split("")
						.then(assert.notCalled)
						.catch(error=>{
							assert.strictEqual(error.message, "expecting String but found undefined");
						});
				});

				it("should split via unformatMouseSpecification if requirements satisified", async function() {
					const instance=_createInstance({
							params: [{
								format: "${2r}${2r}",
								method: "format"
							}]
						}),
						result=await instance.split(" a b");
					assert.deepEqual(result, ["a", "b"]);
				});

				it("should infer method by 'format' property if not explicitly specified", async function() {
					const instance=_createInstance({
							params: [{
								format: "${2r}${2r}"
							}]
						}),
						result=await instance.split(" a b");
					assert.deepEqual(result, ["a", "b"]);
				});
			});

			describe("newline", function() {
				it("should apply newline properly", async function() {
					const instance=_createInstance({
							params: [{method: "newline"}]
						}),
						blob=await instance.split("1\n2\n3");
					assert.deepEqual(blob, ["1", "2", "3"]);
				});

				it("should remove empty lines and leading and trailing space by default", async function() {
					const instance=_createInstance({
							params: [{method: "newline"}]
						}),
						blob=await instance.split("1\n2 \n 3");
					assert.deepEqual(blob, ["1", "2", "3"]);
				});

				it("should remove empty lines and leading and trailing space if trim=true", async function() {
					const instance=_createInstance({
							params: [{method: "newline", trim: true}]
						}),
						blob=await instance.split("1\n2 \n 3\n");
					assert.deepEqual(blob, ["1", "2", "3"]);
				});

				it("should not remove empty lines and leading and trailing space if trime=false", async function() {
					const instance=_createInstance({
							params: [{method: "newline", trim: false}]
						}),
						blob=await instance.split("1\n2 \n 3\n");
					assert.deepEqual(blob, ["1", "2 ", " 3", ""]);
				});
			});

			describe("white", function() {
				it("should apply 'white' properly", async function() {
					const instance=_createInstance({
							params: [{method: "white"}]
						}),
						blob=await instance.split("'a b'");
					assert.deepEqual(blob, ["'a", "b'"]);
				});
			});
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
