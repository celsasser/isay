/**
 * Date: 2019-03-03
 * Time: 21:19
 * @license MIT (see project's LICENSE file)
 */

const sinon=require("sinon");
const assert=require("../../support/assert");
const {ModuleLoop}=require("../../../src/lib/loop");

describe("lib.ModuleLoop", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleLoop({
			action,
			domain,
			method,
			params
		});
	}

	describe("forever", function() {
		it("should raise an exception if params[0] is not a predicate", function() {
			const instance=_createInstance();
			return instance.forever("blob")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "missing predicate function");
				});
		});

		it("should call until he's interrupted", function() {
			let index=0;
			const predicate=sinon.spy((blob)=>{
				assert.strictEqual(blob, "blob");
				if(++index===10) {
					throw new Error("abort");
				}
			});
			const instance=_createInstance({
				params: [predicate]
			});
			return instance.forever("blob")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "abort");
					assert.strictEqual(predicate.callCount, 10);
				});
		});
	});
});

