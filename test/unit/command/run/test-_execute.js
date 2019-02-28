/**
 * User: curtis
 * Date: 2019-02-27
 * Time: 20:07
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const assert=require("../../../support/assert");
const execute=require("../../../../src/command/run/_execute");
const {loadLibrary}=require("../../../../src/lib/index");

describe("command.run._execute", function() {
	describe("_transpileScript", function() {
		const library=loadLibrary();

		it("should do nothing to an empty script", function() {
			const script="",
				transpiled=execute._transpileScript({library, script});
			assert.strictEqual(transpiled, "");
		});

		it("should properly insert an index into a single os.action", function() {
			const script='os.ls("*.js")',
				transpiled=execute._transpileScript({library, script});
			assert.strictEqual(transpiled, 'os.ls(0,"*.js")');
		});

		it("should properly insert an index into a single [non-os-domain].action", function() {
			const script="array.map(()=>{})",
				transpiled=execute._transpileScript({library, script});
			assert.strictEqual(transpiled, "array.map(0,()=>{})");
		});

		it("should properly transpile a more complex chain", function() {
			const script='json.read("path").array.map(object.get("property"))',
				transpiled=execute._transpileScript({library, script});
			assert.strictEqual(transpiled, "json.read(0,\"path\").array.map(1,object.get(2,\"property\"))");
		});
	});
});
