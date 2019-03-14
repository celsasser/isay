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
	describe("_functionArgumentToPojo", function() {
		it("should return input if they are already POJOs", function() {
			const object={a: 1};
			assert.strictEqual(execute._functionArgumentToPojo(undefined), undefined);
			assert.strictEqual(execute._functionArgumentToPojo(null), null);
			assert.strictEqual(execute._functionArgumentToPojo(1), 1);
			assert.strictEqual(execute._functionArgumentToPojo("string"), "string");
			assert.strictEqual(execute._functionArgumentToPojo(object), object);
		});

		it("should properly translate an error into a POJO", function() {
			assert.deepEqual(execute._functionArgumentToPojo(new Error("error")), {
				message: "error"
			});
		});

		it("should properly translate an XRayError into a POJO", function() {
			// bare minimum
			let error=new XRayError({
				"message": "MESSAGE"
			});
			assert.deepEqual(execute._functionArgumentToPojo(error), {
				"message": "MESSAGE"
			});
			// more full featured
			error=new XRayError({
				"code": "CODE",
				"details": "DETAILS",
				"instance": "INSTANCE",
				"message": "MESSAGE"
			});
			assert.deepEqual(execute._functionArgumentToPojo(error), {
				"code": "CODE",
				"details": "DETAILS",
				"message": "MESSAGE"
			});
		});
	});

	describe("_parseFunction", function() {
		it("should return empty array when no params", function() {
			assert.deepEqual(execute._parseFunction("()=>{}"), {
				body: "{}",
				params: []
			});
			assert.deepEqual(execute._parseFunction(" ( ) => { }"), {
				body: "{ }",
				params: []
			});
			assert.deepEqual(execute._parseFunction("function(){}"), {
				body: "{}",
				params: []
			});
			assert.deepEqual(execute._parseFunction(" function ( ) { }"), {
				body: "{ }",
				params: []
			});
		});

		it("should properly find a single param", function() {
			assert.deepEqual(execute._parseFunction("(a)=>{}"), {
				body: "{}",
				params: ["a"]
			});
			assert.deepEqual(execute._parseFunction("( _$Mix )=>{}"), {
				body: "{}",
				params: ["_$Mix"]
			});
			assert.deepEqual(execute._parseFunction(" ( a ) => { }"), {
				body: "{ }",
				params: ["a"]
			});
			assert.deepEqual(execute._parseFunction(" ( _$Mix ) => { }"), {
				body: "{ }",
				params: ["_$Mix"]
			});
			assert.deepEqual(execute._parseFunction("function(a){}"), {
				body: "{}",
				params: ["a"]
			});
			assert.deepEqual(execute._parseFunction("function(_$Mix){}"), {
				body: "{}",
				params: ["_$Mix"]
			});
			assert.deepEqual(execute._parseFunction(" function ( a ) { }"), {
				body: "{ }",
				params: ["a"]
			});
			assert.deepEqual(execute._parseFunction(" function ( _$Mix ) { }"), {
				body: "{ }",
				params: ["_$Mix"]
			});
		});

		it("should properly find a multiple params", function() {
			assert.deepEqual(execute._parseFunction("(a,b)=>{}"), {
				body: "{}",
				params: ["a", "b"]
			});
			assert.deepEqual(execute._parseFunction("(a,b,)=>{}"), {
				body: "{}",
				params: ["a", "b"]
			});
			assert.deepEqual(execute._parseFunction(" ( a , b ) => {}"), {
				body: "{}",
				params: ["a", "b"]
			});
			assert.deepEqual(execute._parseFunction(" ( a , b, ) => {}"), {
				body: "{}",
				params: ["a", "b"]
			});
			assert.deepEqual(execute._parseFunction("function(a,b){}"), {
				body: "{}",
				params: ["a", "b"]
			});
			assert.deepEqual(execute._parseFunction("function(a,b,){}"), {
				body: "{}",
				params: ["a", "b"]
			});
			assert.deepEqual(execute._parseFunction(" function ( a , b ) { }"), {
				body: "{ }",
				params: ["a", "b"]
			});
			assert.deepEqual(execute._parseFunction(" function ( a , b, ) { }"), {
				body: "{ }",
				params: ["a", "b"]
			});
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
			const script="os.ls(\"*.js\")",
				transpiled=execute._transpileScript({library, script});
			assert.strictEqual(transpiled, "os.ls(0,\"*.js\")");
		});

		it("should properly insert an index into a single [non-os-domain].action", function() {
			const script="array.map(()=>{})",
				transpiled=execute._transpileScript({library, script});
			assert.strictEqual(transpiled, "array.map(0,()=>{})");
		});

		it("should properly transpile a more complex chain", function() {
			const script="json.read(\"path\").array.map(object.get(\"property\"))",
				transpiled=execute._transpileScript({library, script});
			assert.strictEqual(transpiled, "json.read(0,\"path\").array.map(1,object.get(2,\"property\"))");
		});
	});
});
