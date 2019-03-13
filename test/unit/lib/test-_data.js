/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {
	assertPredicate,
	assertProperties,
	assertType,
	ensureJson
}=require("../../../src/lib/_data");

describe("lib.ModuleArray", function() {
	describe("assertType", function() {
		it("should allow null if allowed", function() {
			assertType(null, "String", {allowNull: true});
		});

		it("should throw exception if null and not allowed", function() {
			assert.throws(()=>{
				assertType(null, "String", {allowNull: false});
			}, error=>error.message==="expecting String but found null");
		});

		it("should test and pass single type properly", function() {
			assertType("value", "String");
		});

		it("should test and fail single type properly", function() {
			assert.throws(()=>{
				assertType("value", "Number");
			}, error=>error.message==="expecting Number but found String");
		});
	});

	describe("assertPredicate", function() {
		it("should throw exception if not a function", function() {
			assert.throws(()=>assertPredicate("string"));
		});

		it("should return input if the function is a promise", async function() {
			const predicate=async(value)=>value,
				conditioned=assertPredicate(predicate);
			assert.strictEqual(conditioned, predicate);
			return conditioned("george")
				.then(value=>assert.strictEqual(value, "george"));
		});

		it("should wrap function if it is note a promise", async function() {
			const predicate=(value)=>value,
				conditioned=assertPredicate(predicate);
			assert.notEqual(conditioned, predicate);
			return conditioned("george")
				.then(value=>assert.strictEqual(value, "george"));
		});
	});
});
