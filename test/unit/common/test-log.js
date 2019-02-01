/**
 * User: curtis
 * Date: 2019-01-12
 * Time: 13:17
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("assert");
const log=require("../../../src/common/log");

describe("common.log", function() {
	describe("configure", function() {
		it("should properly configure the log", function() {
			log.configure({
				applicationName: "mouse",
				logLevel: "info"
			});
			assert.strictEqual(log.level.get(), "info");
		});
	});
});
