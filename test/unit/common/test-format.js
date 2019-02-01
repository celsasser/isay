/**
 * User: curtis
 * Date: 2019-01-12
 * Time: 19:59
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const format=require("../../../src/common/format");

describe("common.format", function() {
	describe("objectToString", function() {
		it("should properly translate a null and undefined object", function() {
			assert.strictEqual(format.objectToString(undefined), "undefined");
			assert.strictEqual(format.objectToString(null), "null");
		});

		it("should properly sort and format a shallow object", function() {
			const result=format.objectToString({
				b: 1,
				a: true,
				c: "string"
			});
			assert.strictEqual(result, "a=true, b=1, c=string");
		});

		it("should properly sort and format a deep object", function() {
			const result=format.objectToString({
				ab: {
					bb: [1, 2],
					ba: "ba"
				},
				aa: {
					ba: {
						ca: 1,
						cb: 2
					}
				}
			});
			assert.strictEqual(result, "aa.ba.ca=1, aa.ba.cb=2, ab.ba=ba, ab.bb.0=1, ab.bb.1=2");
		});
	});
});
