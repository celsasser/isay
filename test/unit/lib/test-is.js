/**
 * Date: 2019-02-23
 * Time: 19:00
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const {ModuleIs}=require("../../../src/lib/is");

/**
 * We are testing the base class where all of the functionality lives. We do some sanity checking here.
 */
describe("lib.ModuleIs", function() {
	function _createInstance({
		action="action",
		catchModule=undefined,
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleIs({
			action,
			catchModule,
			domain,
			method,
			params
		});
	}

	it("should create an instance with _positive set to the proper state", function() {
		const instance=_createInstance();
		assert.strictEqual(instance._positive, true);
	});

	it("should properly construct with modules", function() {
		const instance=_createInstance({
			catchModule: "catch"
		});
		assert.strictEqual(instance._catchModule, "catch");
	});
});
