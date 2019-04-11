/**
 * User: curtis
 * Date: 2019-04-11
 * Time: 22:21
 * Copyright @2019 by Xraymen Inc.
 */

const sinon=require("sinon");
const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {resolveNextTick}=require("../../../src/common/promise");
const {ModuleFlow}=require("../../../src/lib/_flow");

describe("lib.ModuleLoop", function() {
	function _createInstance({
		action="action",
		domain="domain",
		elseModule=undefined,
		method="method",
		params=[]
	}={}) {
		return new ModuleFlow({
			action,
			domain,
			elseModule,
			method,
			params
		});
	}

	afterEach(function() {
		proxy.unstub();
	});

	describe("_processConditionalLoopAction", function() {
		it("should raise an exception if params[0] is missing", async function() {
			const instance=_createInstance();
			return instance._processConditionalLoopAction("input")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting a value but found undefined");
				});
		});

		it("should test and return blob if test fails and else does not exist", async function() {
			const instance=_createInstance({
				params: [false]
			});
			return instance._processConditionalLoopAction("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});

		it("should process loop without feedback if test passes", async function() {
			let callIndex=5;
			const predicate=sinon.spy(async(input)=>{
				assert.strictEqual(input, 0);
				return predicate.callCount;
			});
			const instance=_createInstance({
				params: [
					(input)=>{
						assert.strictEqual(input, 0);
						return --callIndex;
					},
					predicate
				]
			});
			return instance._processConditionalLoopAction(0)
				.then(result=>{
					assert.strictEqual(result, 4);
					assert.strictEqual(predicate.callCount, 4);
				});
		});

		it("should process loop with feedback if test passes", async function() {
			let callIndex=5;
			const predicate=sinon.spy(async(input)=>{
				assert.strictEqual(input, predicate.callCount-1);
				return predicate.callCount;
			});
			const instance=_createInstance({
				params: [
					(input)=>--callIndex,
					predicate
				]
			});
			return instance._processConditionalLoopAction(0, {feedback: true})
				.then(result=>{
					assert.strictEqual(result, 4);
					assert.strictEqual(predicate.callCount, 4);
				});
		});

		it("should process else if test fails and else is included", async function() {
			const elseModule=_createInstance(),
				instance=_createInstance({
					elseModule,
					params: [false]
				});

			proxy.stub(elseModule, "process", (input)=>{
				assert.strictEqual(input, "input");
				return Promise.resolve("else");
			});
			return instance._processConditionalLoopAction("input")
				.then(result=>{
					assert.strictEqual(result, "else");
				});
		});
	});

	describe("_processConditionalStepAction", function() {
		it("should raise an exception if params[0] is missing", async function() {
			const instance=_createInstance();
			return instance._processConditionalStepAction("input")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting a value but found undefined");
				});
		});

		it("should test and pass on literal in this.params[0] if test passes", async function() {
			const instance=_createInstance({
				params: [
					true,
					"output"
				]
			});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "output");
				});
		});

		it("should test and else on literal in this.params[0] if test fails", async function() {
			const instance=_createInstance({
				params: [
					false,
					"output"
				]
			});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});

		it("should test and pass on predicate in this.params[0] if test passes", async function() {
			const instance=_createInstance({
				params: [
					resolveNextTick.bind(null, true),
					"output"
				]
			});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "output");
				});
		});

		it("should test and else on predicate in this.params[0] if test fails", async function() {
			const instance=_createInstance({
				params: [
					resolveNextTick.bind(null, false),
					"output"
				]
			});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});

		it("should process else if test fails and else is included", async function() {
			const elseModule=_createInstance(),
				instance=_createInstance({
					elseModule,
					params: [false]
				});

			proxy.stub(elseModule, "process", (input)=>{
				assert.strictEqual(input, "input");
				return Promise.resolve("else");
			});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "else");
				});
		});
	});
});
