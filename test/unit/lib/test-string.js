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
