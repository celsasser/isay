/**
 * Date: 2019-02-12
 * Time: 10:06 PM
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const {ModuleBase}=require("../../../src/lib/_base");

describe("lib.ModuleBase", function() {
	function _createInstance({
		action="action",
		catchModule=undefined,
		domain="domain",
		method="method",
		nextModule=undefined,
		params=[]
	}={}) {
		return new ModuleBase({
			action,
			catchModule,
			domain,
			method,
			nextModule,
			params
		});
	}

	describe("constructor", function() {
		it("should properly setup data members", function() {
			const instance=_createInstance({
				catchModule: "catch",
				nextModule: "next",
				params: "params"
			});
			assert.strictEqual(instance.action, "action");
			assert.strictEqual(instance.domain, "domain");
			assert.strictEqual(instance.method, "method");
			assert.strictEqual(instance.params, "params");
			assert.strictEqual(instance._catchModule, "catch");
			assert.strictEqual(instance._nextModule, "next");
		});
	});

	describe("_formatVariableData", function() {
		it("should return empty string if undefined", function() {
			const input=undefined;
			assert.strictEqual(ModuleBase._formatVariableData(input), "");
		});

		it("should return 'null' if null", function() {
			const input=null;
			assert.strictEqual(ModuleBase._formatVariableData(input), "null");
		});

		it("should return 'function' if function", function() {
			const input=()=>{};
			assert.strictEqual(ModuleBase._formatVariableData(input), "Function");
		});

		it("should return string in quotes", function() {
			const input="string";
			assert.strictEqual(ModuleBase._formatVariableData(input), '"string"');
		});

		it("should convert pesky white space", function() {
			const input="newline\ntab\tfeed\r";
			assert.strictEqual(ModuleBase._formatVariableData(input), '"newline\\ntab\\tfeed\\r"');
		});

		it("should properly handle numbers", function() {
			const input=10;
			assert.strictEqual(ModuleBase._formatVariableData(input), "10");
		});

		it("should encode objects in JSON", function() {
			const input={a: 1, b: 2};
			assert.strictEqual(ModuleBase._formatVariableData(input), '{"a":1,"b":2}');
		});

		it("should return 'Binary' if out of printable range characters are found", function() {
			const input="one¶two";
			assert.strictEqual(ModuleBase._formatVariableData(input), "Binary");
		});

		it("should truncate in the middle if the length exceeds max", function() {
			const input="123456789";
			assert.strictEqual(ModuleBase._formatVariableData(input, 8), '"1[...]9"');
		});
	});
});
