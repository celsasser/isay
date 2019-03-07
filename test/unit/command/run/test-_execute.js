/**
 * User: curtis
 * Date: 2019-02-27
 * Time: 20:07
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../../support/assert");
const execute=require("../../../../src/command/run/_execute");
const {XRayError}=require("../../../../src/common/error");
const {loadLibrary}=require("../../../../src/lib/index");

describe("command.run._execute", function() {
	describe("_functionParamToPOJO", function() {
		it("should return input if they are already POJOs", function() {
			const object={a: 1};
			assert.strictEqual(execute._functionParamToPOJO(undefined), undefined);
			assert.strictEqual(execute._functionParamToPOJO(null), null);
			assert.strictEqual(execute._functionParamToPOJO(1), 1);
			assert.strictEqual(execute._functionParamToPOJO("string"), "string");
			assert.strictEqual(execute._functionParamToPOJO(object), object);
		});

		it("should properly translate an error into a POJO", function() {
			assert.deepEqual(execute._functionParamToPOJO(new Error("error")), {
				message: "error"
			});
		});

		it("should properly translate an XRayError into a POJO", function() {
			// bare minimum
			let error=new XRayError({
				"message": "MESSAGE"
			});
			assert.deepEqual(execute._functionParamToPOJO(error), {
				"message": "MESSAGE"
			});
			// more full featured
			error=new XRayError({
				"code": "CODE",
				"details": "DETAILS",
				"instance": "INSTANCE",
				"message": "MESSAGE"
			});
			assert.deepEqual(execute._functionParamToPOJO(error), {
				"code": "CODE",
				"details": "DETAILS",
				"message": "MESSAGE"
			});
		});
	});

	describe("_getFunctionParamNames", function() {
		it("should return empty array when no params", function() {
			assert.deepEqual(execute._getFunctionParamNames("()=>{}"), []);
			assert.deepEqual(execute._getFunctionParamNames(" ( ) => { }"), []);
			assert.deepEqual(execute._getFunctionParamNames("function(){}"), []);
			assert.deepEqual(execute._getFunctionParamNames(" function ( ) { }"), []);
		});

		it("should properly find a single param", function() {
			assert.deepEqual(execute._getFunctionParamNames("(a)=>{}"), ["a"]);
			assert.deepEqual(execute._getFunctionParamNames("( _$Mix )=>{}"), ["_$Mix"]);
			assert.deepEqual(execute._getFunctionParamNames(" ( a ) => { }"), ["a"]);
			assert.deepEqual(execute._getFunctionParamNames(" ( _$Mix ) => { }"), ["_$Mix"]);
			assert.deepEqual(execute._getFunctionParamNames("function(a){}"), ["a"]);
			assert.deepEqual(execute._getFunctionParamNames("function(_$Mix){}"), ["_$Mix"]);
			assert.deepEqual(execute._getFunctionParamNames(" function ( a ) { }"), ["a"]);
			assert.deepEqual(execute._getFunctionParamNames(" function ( _$Mix ) { }"), ["_$Mix"]);
		});

		it("should properly find a multiple params", function() {
			assert.deepEqual(execute._getFunctionParamNames("(a,b)=>{}"), ["a", "b"]);
			assert.deepEqual(execute._getFunctionParamNames("(a,b,)=>{}"), ["a", "b"]);
			assert.deepEqual(execute._getFunctionParamNames(" ( a , b ) => {}"), ["a", "b"]);
			assert.deepEqual(execute._getFunctionParamNames(" ( a , b, ) => {}"), ["a", "b"]);
			assert.deepEqual(execute._getFunctionParamNames("function(a,b){}"), ["a", "b"]);
			assert.deepEqual(execute._getFunctionParamNames("function(a,b,){}"), ["a", "b"]);
			assert.deepEqual(execute._getFunctionParamNames(" function ( a , b ) { }"), ["a", "b"]);
			assert.deepEqual(execute._getFunctionParamNames(" function ( a , b, ) { }"), ["a", "b"]);
		});
	});

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
