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
	assertTypesEqual,
	ensureJson
}=require("../../../src/lib/_data");

describe("lib.ModuleArray", function() {
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

	describe("assertProperties", function() {
		it("should handle string 'properties' param", function() {
			assert.doesNotThrow(assertProperties.bind(null, {a: 1}, "a"));
		});

		it("should handle array 'properties' param", function() {
			assert.doesNotThrow(assertProperties.bind(null, {a: 1}, ["a"]));
		});

		it("should throw exception if string 'properties' is missing", function() {
			assert.throws(()=>{
				assertProperties({a: 1}, "b");
			}, error=>error.message==="Object missing required keys [\"b\"]");
		});

		it("should throw exception if array 'properties' is missing", function() {
			assert.throws(()=>{
				assertProperties({a: 1}, ["a", "b", "c"]);
			}, error=>error.message==="Object missing required keys [\"b\",\"c\"]");
		});
	});

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

	describe("assertTypesEqual", function() {
		[
			[undefined, undefined],
			[null, null],
			["a", "b"],
			[1, 2],
			[{a: 1}, {b: 2}],
			[()=>{}, ()=>{}]
		].forEach(([v1, v2])=>{
			it(`should not throw exception if value1=${v1} and value2=${v2}`, function() {
				assert.doesNotThrow(assertTypesEqual.bind(null, v1, v2));
			});
		});

		[
			[undefined, null, "expecting same type but found undefined and null"],
			["string", 1, "expecting same type but found String and Number"],
			["string", {}, "expecting same type but found String and Object"]
		].forEach(([v1, v2, text])=>{
			it(`should throw exception if value1=${v1} and value2=${v2}`, function() {
				assert.throws(assertTypesEqual.bind(null, v1, v2), error=>error.message===text);
			});
		});
	});

	describe("ensureJson", function() {
		it("should return input if it is an object", function() {
			const input={};
			assert.strictEqual(ensureJson(input), input);
		});

		[
			null,
			10,
			"{\"a\": 1}"
		].forEach(input=>{
			it(`should convert ${input} encoding`, function() {
				assert.deepEqual(ensureJson(input), JSON.parse(input));
			});
		});
	});
});
