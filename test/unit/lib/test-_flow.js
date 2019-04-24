/**
 * Date: 2019-04-11
 * Time: 22:21
 * @license MIT (see project's LICENSE file)
 */

const sinon=require("sinon");
const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {resolveNextTick}=require("../../../src/common/promise");
const {ModuleFlow}=require("../../../src/lib/_flow");

describe("lib.ModuleFlow", function() {
	function _createInstance({
		action="action",
		domain="domain",
		elseModule=undefined,
		method="method",
		params=[],
		thenModule=undefined
	}={}) {
		return new ModuleFlow({
			action,
			domain,
			elseModule,
			method,
			params,
			thenModule
		});
	}

	afterEach(function() {
		proxy.unstub();
	});

	describe("_processConditionalLoopAction", function() {
		it("should test on blob if params[0] is missing", async function() {
			const thenModule=_createInstance({
					method: "then",
					params: ["output"]
				}),
				instance=_createInstance({
					thenModule
				});
			return instance._processConditionalLoopAction(false)
				.then(result=>{
					assert.strictEqual(result, false);
				})
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

		it("should process loop (then) without feedback if test passes", async function() {
			let callIndex=5;
			const thenPredicate=sinon.spy(async(input)=>{
				assert.strictEqual(input, 0);
				// we do this so that we know that no intermittent state was captured
				return thenPredicate.callCount;
			});
			const thenModule=_createInstance({
					method: "then",
					params: [thenPredicate]
				}),
				instance=_createInstance({
					params: [
						(input)=>{
							assert.strictEqual(input, 0);
							return Boolean(--callIndex);
						}
					],
					thenModule
				});
			return instance._processConditionalLoopAction(0)
				.then(result=>{
					assert.strictEqual(result, 4);
					assert.strictEqual(thenPredicate.callCount, 4);
				});
		});

		it("should process loop (then) with feedback if test passes", async function() {
			let callIndex=5;
			const thenPredicate=sinon.spy(async(input)=>{
				assert.strictEqual(input, thenPredicate.callCount-1);
				return thenPredicate.callCount;
			});
			const thenModule=_createInstance({
					method: "then",
					params: [thenPredicate]
				}),
				instance=_createInstance({
					params: [
						(input)=>{
							assert.strictEqual(input, thenPredicate.callCount);
							return Boolean(--callIndex);
						}
					],
					thenModule
				});
			return instance._processConditionalLoopAction(0, {feedback: true})
				.then(result=>{
					assert.strictEqual(result, 4);
					assert.strictEqual(thenPredicate.callCount, 4);
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
		it("should test on blob if params[0] is missing", async function() {
			const thenModule=_createInstance({
					method: "then",
					params: ["output"]
				}),
				instance=_createInstance({
					thenModule
				});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "output");
				})
		});

		it("should test and pass on literal in this.params[0] if test passes", async function() {
			const thenModule=_createInstance({
					method: "then",
					params: ["output"]
				}),
				instance=_createInstance({
					params: [true],
					thenModule
				});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "output");
				});
		});

		it("should test and return blob if test fails and no else exists", async function() {
			const instance=_createInstance({
				params: [false]
			});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "input");
				});
		});

		it("should test via predicate and return result of then if test passes", async function() {
			const thenModule=_createInstance({
					method: "then",
					params: ["output"]
				}),
				instance=_createInstance({
					params: [resolveNextTick.bind(null, true)],
					thenModule
				});
			return instance._processConditionalStepAction("input")
				.then(result=>{
					assert.strictEqual(result, "output");
				});
		});

		it("should test via predicate and else if test fails", async function() {
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
