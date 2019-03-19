/**
 * User: curtis
 * Date: 2019-02-25
 * Time: 23:40
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {ModuleDebug}=require("../../../src/lib/debug");

describe("lib.ModuleDebug", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleDebug({
			action,
			domain,
			method,
			params
		});
	}

	afterEach(function() {
		proxy.unstub();
	});

	describe("dump", function() {
		it("should write blob to stdout and return input blob", async function() {
			const instance=_createInstance({
				params: ["param"]
			});
			proxy.stub(process.stdout, "write", (text, callback)=>{
				assert.strictEqual(text, '{\n\t"input": "input",\n\t"params": [\n\t\t"param"\n\t]\n}\n');
				callback();
			});
			return instance.dump("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});
	});
});
