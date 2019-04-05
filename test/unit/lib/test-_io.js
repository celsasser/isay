/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {resolveNextTick}=require("../../../src/common/promise");
const {ModuleIO}=require("../../../src/lib/_io");

describe("lib.ModuleIO", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleIO({
			action,
			domain,
			method,
			params
		});
	}

	describe("_getReadPath", function() {
		it("should throw exception if the path cannot be found", async function() {
			const instance=_createInstance();
			return instance._getReadPath()
				.then(assert.notCalled)
				.catch(error=>assert.strictEqual(error.message, "expecting String but found undefined"));
		});

		it("should use params[0] as path if included", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getReadPath("path")
				.then(value=>assert.strictEqual(value, "path"));
		});

		it("should use input data as path if no params[0]", async function() {
			const instance=_createInstance();
			return instance._getReadPath("path")
				.then(value=>assert.strictEqual(value, "path"));
		});

		it("should use params[0] over data", async function() {
			const instance=_createInstance({
				params: ["param"]
			});
			return instance._getReadPath("input")
				.then(value=>assert.strictEqual(value, "param"));
		});

		it("should resolve path if params[0] is a predicate", async function() {
			const instance=_createInstance({
				params: [resolveNextTick.bind(null, "path")]
			});
			return instance._getReadPath("input")
				.then(value=>assert.strictEqual(value, "path"));
		});
	});

	describe("_getReadPathAndOptions", function() {
		it("should throw exception if path cannot be found", function() {
			const instance=_createInstance();
			return instance._getReadPathAndOptions()
				.then(assert.notCalled)
				.catch(error=>assert.strictEqual(error.message, "expecting String but found undefined"));
		});

		it("should use params[0] as path if it is a string", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getReadPathAndOptions()
				.then(result=>assert.deepEqual(result, {
					"encoding": "utf8",
					"path": "path"
				}));
		});

		it("should use input data as path if no params", function() {
			const instance=_createInstance();
			return instance._getReadPathAndOptions("path")
				.then(result=>assert.deepEqual(result, {
					"encoding": "utf8",
					"path": "path"
				}));
		});

		it("should use input as path and params[0] as options if both included", async function() {
			const instance=_createInstance({
				params: [{encoding: "binary"}]
			});
			return instance._getReadPathAndOptions("path")
				.then(result=>assert.deepEqual(result, {
					"encoding": "binary",
					"path": "path"
				}));
		});

		it("should resolve path if params[0] is a predicate", async function() {
			const instance=_createInstance({
				params: [
					resolveNextTick.bind(null, "path"),
					resolveNextTick.bind(null, {encoding: "binary"})
				]
			});
			return instance._getReadPathAndOptions("path")
				.then(result=>assert.deepEqual(result, {
					"encoding": "binary",
					"path": "path"
				}));
		});
	});

	describe("_getWritePath", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance._getWritePath()
				.then(assert.notCalled)
				.catch(error=>error.message==="expecting String but found undefined");
		});

		it("should use params[0] as path if string", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getWritePath()
				.then(result=>assert.strictEqual(result, "path"));
		});

		it("should use params[0] as path if predicate", async function() {
			const instance=_createInstance({
				params: [resolveNextTick.bind(null, "path")]
			});
			return instance._getWritePath()
				.then(result=>assert.strictEqual(result, "path"));
		});
	});

	describe("_getWritePathAndOptions", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance._getWritePathAndOptions()
				.then(assert.notCalled)
				.catch(error=>error.message==="expecting String but found undefined");
		});

		it("should use params[0] as path and default encoding", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getWritePathAndOptions()
				.then(result=>assert.deepEqual(result, {
					"encoding": "utf8",
					"mode": 0o666,
					"path": "path"
				}));
		});

		it("should use params[0] as path and params[1] for encoding", async function() {
			const instance=_createInstance({
				params: [
					"path",
					{
						encoding: "ascii",
						mode: 0o111
					}
				]
			});
			return instance._getWritePathAndOptions()
				.then(result=>assert.deepEqual(result, {
					"encoding": "ascii",
					"mode": 0o111,
					"path": "path"
				}));
		});

		it("should find path and options when both are supplied by predicates", async function() {
			const instance=_createInstance({
				params: [
					resolveNextTick.bind(null, "path"),
					resolveNextTick.bind(null, {encoding: "ascii"})
				]
			});
			return instance._getWritePathAndOptions()
				.then(result=>assert.deepEqual(result, {
					"encoding": "ascii",
					"mode": 0o666,
					"path": "path"
				}));
		});
	});
});
