/**
 * User: curtis
 * Date: 2019-02-12
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleBase}=require("../../../src/lib/_base");

describe("lib.ModuleBase", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleBase({
			action,
			domain,
			method,
			params
		});
	}

	describe("_assertType", function() {
		it("should allow null if allowed", function() {
			const instance=_createInstance();
			instance._assertType(null, "String", {allowNull: true});
		});

		it("should throw exception if null and not allowed", function() {
			const instance=_createInstance();
			assert.throws(()=>{
				instance._assertType(null, "String", {allowNull: false});
			}, error=>error.message==="expecting String but found null");
		});

		it("should test and pass single type properly", function() {
			const instance=_createInstance();
			instance._assertType("value", "String");
		});

		it("should test and fail single type properly", function() {
			const instance=_createInstance();
			assert.throws(()=>{
				instance._assertType("value", "Number");
			}, error=>error.message==="expecting Number but found String");
		});
	});
});
