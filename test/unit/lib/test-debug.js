/**
 * User: curtis
 * Date: 2019-02-25
 * Time: 23:40
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const constant=require("../../../src/common/constant");
const {ModuleDebug}=require("../../../src/lib/debug");

describe("lib.ModuleDebug", function() {
	function _createInstance({
		action="action",
		domain="parse",
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

	describe("abort", function() {
		it("should throw an exception", async function() {
			const instance=_createInstance();
			instance.abort()
				.catch(error=>{
					assert.strictEqual(error.statusCode, constant.status.code.ABORT);
				});
		});
	});

	describe("dump", function() {
		it("should write blob to stdout and return input blob", async function() {
			const instance=_createInstance();
			proxy.stub(process.stdout, "write", (text, callback)=>{
				assert.strictEqual(text, "text\n");
				callback();
			});
			return instance.dump("text")
				.then(result=>{
					assert.strictEqual(result, "text");
				});
		});
	});
});
