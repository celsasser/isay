/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 00:31
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleParse}=require("../../../src/lib/parse");

describe("lib.ModuleParse", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleParse({
			action,
			domain,
			method,
			params
		});
	}

	describe("split", function() {
		it("should use white method by default", async function() {
			const instance=_createInstance({}),
				blob=await instance.split({
					data: "a\\ b"
				});
			assert.deepEqual(blob, {
				"data": [
					"a\\",
					"b"
				],
				"encoding": "object"
			});
		});

		it("should apply default 'delimiter' properly", async function() {
			const instance=_createInstance({
					params: ["delimiter"]
				}),
				blob=await instance.split({
					data: "a,b, c, d"
				});
			assert.deepEqual(blob, {
				"data": ["a", "b", "c", "d"],
				"encoding": "object"
			});
		});

		it("should apply specified 'delimiter' properly", async function() {
			const instance=_createInstance({
					params: ["delimiter", "\\s*:\\s*"]
				}),
				blob=await instance.split({
					data: "a:b: c: d"
				});
			assert.deepEqual(blob, {
				"data": ["a", "b", "c", "d"],
				"encoding": "object"
			});
		});

		it("should apply newline properly", async function() {
			const instance=_createInstance({
					params: ["newline"]
				}),
				blob=await instance.split({
					data: "1\n2 \n 3"
				});
			assert.deepEqual(blob, {
				data: ["1", "2", "3"],
				encoding: "object"
			});
		});

		it("should apply 'white' properly", async function() {
			const instance=_createInstance({
					params: ["white"]
				}),
				blob=await instance.split({
					data: "'a b'"
				});
			assert.deepEqual(blob, {
				"data": [
					"'a",
					"b'"
				],
				"encoding": "object"
			});
		});
	});
});
