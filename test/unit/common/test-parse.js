/**
 * User: curtis
 * Date: 2019-02-04
 * Time: 23:44
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const parse=require("../../../src/common/parse");

describe("common.parse", function() {
	describe("shell", function() {
		it("should return an empty string if arg is empty", function() {
			assert.deepEqual(parse.shell(""), []);
		});

		it("should return a single argument", function() {
			assert.deepEqual(parse.shell("bones"), ["bones"]);
			assert.deepEqual(parse.shell(" bones "), ["bones"]);
			assert.deepEqual(parse.shell("\"quoted\""), ["\"quoted\""]);
			assert.deepEqual(parse.shell("'quoted'"), ["'quoted'"]);
			assert.deepEqual(parse.shell("100.00"), ["100.00"]);
		});

		it("properly parse multiple tokens", function() {
			assert.deepEqual(parse.shell("one two"), ["one", "two"]);
			assert.deepEqual(parse.shell(" one two "), ["one", "two"]);
			assert.deepEqual(parse.shell("1 2"), ["1", "2"]);
			assert.deepEqual(parse.shell(" 1 2 "), ["1", "2"]);
		});

		it("properly parse escaped space", function() {
			assert.deepEqual(parse.shell("one\\ two three"), ["one\\ two", "three"]);
		});

		it("properly parse mixed sequences", function() {
			assert.deepEqual(
				parse.shell(" 'one two' three \"four five\" six\\ seven "),
				[
					"'one two'",
					"three",
					"\"four five\"",
					"six\\ seven"
				]
			);
		});
	});
});
