/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {resolveNextTick}=require("../../../src/common/promise");
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
			const buffer=Buffer.from("buffer");
			[
				["string", "string"],
				[buffer, buffer],
				[5150, "5150"],
				[[1, 2, 3], "[1,2,3]"],
				[{a: 1, b: 2}, JSON.stringify({a: 1, b: 2})]
			].forEach(([input, expected])=>{
				it(`should properly write blob type=${input.constructor.name} to stderr and return input data`, async function() {
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

			[
				["string", "string"],
				[buffer, buffer],
				[5150, "5150"],
				[[1, 2, 3], "[1,2,3]"],
				[{a: 1, b: 2}, JSON.stringify({a: 1, b: 2})],
				[resolveNextTick.bind(null, "string"), "string"],
				[resolveNextTick.bind(null, [1, 2, 3]), "[1,2,3]"]
			].forEach(([input, expected])=>{
				it(`should properly write params[0] type=${input.constructor.name} to stderr and return input data`, async function() {
					const instance=_createInstance({
						params: [input]
					});
					proxy.stub(stream, "write", async function(output, callback) {
						try {
							assert.strictEqual(output, expected);
							process.nextTick(callback);
						} catch(error) {
							process.nextTick(callback, error);
						}
					});
					return instance[method]()
						.then(result=>{
							assert.strictEqual(result, undefined);
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
				it(`should properly write blob type=${input.constructor.name} to stderr and return input data`, async function() {
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

			[
				["string", "string\n"],
				[buffer, "buffer\n"],
				[5150, "5150\n"],
				[[1, 2], JSON.stringify([1, 2], null, "\t")+"\n"],
				[object, JSON.stringify(object, null, "\t")+"\n"],
				[resolveNextTick.bind(null, "string"), "string\n"],
				[resolveNextTick.bind(null, 5150), "5150\n"]
			].forEach(([input, expected])=>{
				it(`should properly write params[0] type=${input.constructor.name} to stderr and return input data`, async function() {
					const instance=_createInstance({
						params: [input]
					});
					proxy.stub(stream, "write", async function(output, callback) {
						try {
							assert.strictEqual(output, expected);
							process.nextTick(callback);
						} catch(error) {
							process.nextTick(callback, error);
						}
					});
					return instance[method]()
						.then(result=>{
							assert.strictEqual(result, undefined);
							assert.strictEqual(stream.write.callCount, 1);
						});
				});
			});
		});
	});

	describe("in", function() {
		it("should return literal", async function() {
			const instance=_createInstance({
				params: ["data"]
			});
			return instance.in()
				.then(result=>{
					assert.strictEqual(result, "data");
				});
		});

		it("should return result of predicate", async function() {
			const instance=_createInstance({
				params: [resolveNextTick.bind(null, "predicate")]
			});
			return instance.in()
				.then(result=>{
					assert.strictEqual(result, "predicate");
				});
		});
	});
});
