/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {ModuleStd}=require("../../../src/lib/std");

describe("lib.ModuleStd", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleStd({
			action,
			domain,
			method,
			params
		});
	}

	afterEach(function() {
		proxy.unstub();
	});

	[
		[process.stderr, "error"],
		[process.stdout, "out"]
	].forEach(([stream, method])=>{
		describe(method, function() {
			const buffer=Buffer.from("buffer"),
				object={a: 1, b: 2};
			[
				["string", "string"],
				[5150, "5150"],
				[[1, 2, 3], "[1,2,3]"],
				[buffer, buffer],
				[object, JSON.stringify(object)]
			].forEach(([input, expected])=>{
				it(`should properly write ${input.constructor.name} to stderr and return input data`, async function() {
					const instance=_createInstance();
					proxy.stub(stream, "write", async function(output, callback) {
						try {
							assert.strictEqual(output, expected);
							process.nextTick(callback);
						} catch(error) {
							process.nextTick(callback, error);
						}
					});
					return instance[method](input)
						.then(result=>{
							assert.strictEqual(result, input);
							assert.strictEqual(stream.write.callCount, 1);
						});
				});
			});
		});
	});

	[
		[process.stderr, "errorln"],
		[process.stdout, "outln"]
	].forEach(([stream, method])=>{
		describe(method, function() {
			const buffer=Buffer.from("buffer"),
				object={a: 1, b: 2};
			[
				["string", "string\n"],
				[5150, "5150\n"],
				[[1, 2], "[\n\t1,\n\t2\n]\n"],
				[buffer, "buffer\n"],
				[object, JSON.stringify(object, null, "\t")+"\n"]
			].forEach(([input, expected])=>{
				it(`should properly write ${input.constructor.name} to stderr and return input data`, async function() {
					const instance=_createInstance();
					proxy.stub(stream, "write", async function(output, callback) {
						try {
							assert.strictEqual(output, expected);
							process.nextTick(callback);
						} catch(error) {
							process.nextTick(callback, error);
						}
					});
					return instance[method](input)
						.then(result=>{
							assert.strictEqual(result, input);
							assert.strictEqual(stream.write.callCount, 1);
						});
				});
			});
		});
	});

	describe("in", function() {
		it("should return whatever is in params[0]", async function() {
			const instance=_createInstance({
				params: ["data"]
			});
			return instance.in()
				.then(result=>{
					assert.strictEqual(result, "data");
				});
		});
	});
});
