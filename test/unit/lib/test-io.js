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
		domain="parse",
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
		it("should throw exception if path cannot be found", function() {
			const instance=_createInstance();
			assert.throws(()=>instance._getReadPath(),
				error=>error.message==="expecting string as file-path but found undefined");
		});

		it("should use input data as path if specified", function() {
			const instance=_createInstance();
			assert.strictEqual(instance._getReadPath("path"), "path");
		});

		it("should use params[0] as path if specified", function() {
			const instance=_createInstance({
				params: ["path"]
			});
			assert.strictEqual(instance._getReadPath(), "path");
		});
	});

	describe("_getReadPathAndOptions", function() {
		it("should throw exception if path cannot be found", function() {
			const instance=_createInstance();
			assert.throws(()=>instance._getReadPathAndOptions(),
				error=>error.message==="expecting string as file-path but found undefined");
		});

		it("should use input data as path if specified", function() {
			const instance=_createInstance();
			assert.deepEqual(instance._getReadPathAndOptions("path"), {
				"encoding": "utf8",
				"path": "path"
			});
		});

		it("should use params[0] as path if specified", function() {
			const instance=_createInstance({
				params: ["path"]
			});
			assert.deepEqual(instance._getReadPathAndOptions(), {
				"encoding": "utf8",
				"path": "path"
			});
		});
	});

	describe("_getWritePath", function() {
		it("should throw exception if path cannot be found", function() {
			const instance=_createInstance();
			assert.throws(()=>instance._getWritePath(),
				error=>error.message==="expecting string as file-path but found undefined");
		});

		it("should use params[0] as path", function() {
			const instance=_createInstance({
				params: ["path"]
			});
			assert.strictEqual(instance._getWritePath(), "path");
		});
	});

	describe("_getWritePathAndOptions", function() {
		it("should throw exception if path cannot be found", function() {
			const instance=_createInstance();
			assert.throws(()=>instance._getWritePathAndOptions(),
				error=>error.message==="expecting string as file-path but found undefined");
		});

		it("should use params[0] as path and default encoding", function() {
			const instance=_createInstance({
				params: ["path"]
			});
			assert.deepEqual(instance._getWritePathAndOptions(), {
				"encoding": "utf8",
				"path": "path"
			});
		});

		it("should use params[0] as path and params[1] for encoding", function() {
			const instance=_createInstance({
				params: ["path", {
					encoding: "utf8"
				}]
			});
			assert.deepEqual(instance._getWritePathAndOptions(), {
				"encoding": "utf8",
				"path": "path"
			});
		});
	});
});
