/**
 * Date: 2019-02-23
 * Time: 19:00
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const {ModuleNot}=require("../../../src/lib/not");

/**
 * We are testing the base class where all of the functionality lives. We do some sanity checking here.
 */
describe("lib.ModuleNot", function() {
	function _createInstance({
		action="action",
		catchModule=undefined,
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleNot({
			action,
			catchModule,
			domain,
			method,
			params
		});
	}

	it("should create an instance with _positive set to the proper state", function() {
		const instance=_createInstance();
		assert.strictEqual(instance._positive, false);
	});

	it("should properly construct with modules", function() {
		const instance=_createInstance({
			catchModule: "catch"
		});
		assert.strictEqual(instance._catchModule, "catch");
	});
});
