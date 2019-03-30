/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
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
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance._getReadPath()
				.then(assert.notCalled)
				.catch(error=>assert.strictEqual(error.message, "expecting String but found undefined"));
		});

		it("should use input data as path if specified", async function() {
			const instance=_createInstance();
			return instance._getReadPath("path")
				.then(value=>assert.strictEqual(value, "path"));
		});

		it("should use params[0] as path if specified", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getReadPath("path")
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

		it("should use input data as path if specified", function() {
			const instance=_createInstance();
			return instance._getReadPathAndOptions("path")
				.then(result=>assert.deepEqual(result, {
					"encoding": "utf8",
					"path": "path"
				}));
		});

		it("should use params[0] as path if specified", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getReadPathAndOptions()
				.then(result=>assert.deepEqual(result, {
					"encoding": "utf8",
					"path": "path"
				}));
		});
	});

	describe("_getWritePath", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance._getWritePath()
				.then(assert.notCalled)
				.catch(error=>error.message==="expecting string as file-path but found undefined");
		});

		it("should use params[0] as path", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getWritePath()
				.then(result=>assert.strictEqual(result, "path"));
		});
	});

	describe("_getWritePathAndOptions", function() {
		it("should throw exception if path cannot be found", async function() {
			const instance=_createInstance();
			return instance._getWritePathAndOptions()
				.catch(error=>error.message==="expecting string as file-path but found undefined");
		});

		it("should use params[0] as path and default encoding", async function() {
			const instance=_createInstance({
				params: ["path"]
			});
			return instance._getWritePathAndOptions()
				.then(result=>assert.deepEqual(result, {
					"encoding": "utf8",
					"path": "path"
				}));
		});

		it("should use params[0] as path and params[1] for encoding", async function() {
			const instance=_createInstance({
				params: ["path", {
					encoding: "ascii"
				}]
			});
			return instance._getWritePathAndOptions()
				.then(result=>assert.deepEqual(result, {
					"encoding": "ascii",
					"path": "path"
				}));
		});
	});
});
