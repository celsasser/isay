/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 21:19
 * Copyright @2019 by Xraymen Inc.
 */

const sinon=require("sinon");
const assert=require("../../support/assert");
const {ModuleLoop}=require("../../../src/lib/loop");

describe("lib.ModuleLoop", function() {
	function _createInstance({
		action="action",
		domain="parse",
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

	describe("range", function() {
		it("should raise an exception if params[0] is not a predicate", function() {
			const instance=_createInstance();
			return instance.range("blob")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "missing predicate function");
				});
		});

		it("should raise an exception if params[1] is not an object", function() {
			let index=0;
			const predicate=sinon.spy((blob, _index)=>{
				assert.strictEqual(blob, "blob");
				assert.strictEqual(_index, index++);
			});
			const instance=_createInstance({
				params: [predicate]
			});
			return instance.range("blob")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Object but found undefined");
				});
		});

		it("should iterate if there is the bare minimum of a 'to' in the params object", function() {
			let index=0;
			const predicate=sinon.spy((blob, _index)=>{
				assert.strictEqual(blob, "blob");
				assert.strictEqual(_index, index++);
			});
			const instance=_createInstance({
				params: [predicate, {
					to: 10
				}]
			});
			return instance.range("blob")
				.then(result=>{
					assert.strictEqual(predicate.callCount, 10);
				});
		});

		it("should use 'from' if included", function() {
			let index=1;
			const predicate=sinon.spy((blob, _index)=>{
				assert.strictEqual(blob, "blob");
				assert.strictEqual(_index, index++);
			});
			const instance=_createInstance({
				params: [predicate, {
					from: 1,
					to: 10
				}]
			});
			return instance.range("blob")
				.then(result=>{
					assert.strictEqual(predicate.callCount, 9);
				});
		});

		it("should use increment if included", function() {
			let index=3;
			const predicate=sinon.spy((blob, _index)=>{
				assert.strictEqual(blob, "blob");
				assert.strictEqual(_index, index);
				index+=2;
			});
			const instance=_createInstance({
				params: [predicate, {
					from: 3,
					to: 11,
					increment: 2
				}]
			});
			return instance.range("blob")
				.then(result=>{
					assert.strictEqual(predicate.callCount, 4);
				});
		});

		it("should properly apply 'smart' when there is no input", function() {
			let index=0;
			const predicate=sinon.spy(blob=>{
				assert.strictEqual(blob, index++);
			});
			const instance=_createInstance({
				params: [predicate, {
					to: 10
				}]
			});
			return instance.range()
				.then(result=>{
					assert.strictEqual(predicate.callCount, 10);
				});
		});

		it("should properly apply 'smart' when there is input", function() {
			let index=0;
			const predicate=sinon.spy((blob, _index)=>{
				assert.strictEqual(blob, "blob");
				assert.strictEqual(_index, index++);
			});
			const instance=_createInstance({
				params: [predicate, {
					to: 10
				}]
			});
			return instance.range("blob")
				.then(result=>{
					assert.strictEqual(predicate.callCount, 10);
				});
		});

		it("should force use of input with input=true", function() {
			let index=0;
			const predicate=sinon.spy((blob, _index)=>{
				assert.strictEqual(blob, "blob");
				assert.strictEqual(_index, index++);
			});
			const instance=_createInstance({
				params: [predicate, {
					input: true,
					to: 10
				}]
			});
			return instance.range("blob")
				.then(result=>{
					assert.strictEqual(predicate.callCount, 10);
				});
		});

		it("should force no use of input with input='index'", function() {
			let index=0;
			const predicate=sinon.spy(blob=>{
				assert.strictEqual(blob, index++);
			});
			const instance=_createInstance({
				params: [predicate, {
					input: "index",
					to: 10
				}]
			});
			return instance.range("blob")
				.then(result=>{
					assert.strictEqual(predicate.callCount, 10);
				});
		});
	});
});

