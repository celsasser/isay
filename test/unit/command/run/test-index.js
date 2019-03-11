/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 20:07
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const proxy=require("../../../support/proxy");
const assert=require("../../../support/assert");
const {run}=require("../../../../src/command/run");

/* eslint-disable no-console */
describe("command.run.index", function() {
	beforeEach(function() {
		proxy.std.stub();
	});

	afterEach(function() {
		proxy.std.unstub();
	});

	describe("run", function() {
		it.skip("debug script", async function() {
			const configuration={
				options: {
					input: undefined,
					script: "test/scripts/script-embedded-predicate-deep.js"
				}
			};
			return run(configuration)
				.then(result=>{
					console.log(result);
				})
				.catch(error=>{
					const {errorToString}=require("../../../../src/common/format");
					assert.fail(errorToString(error, {
						details: true,
						instance: true,
						stack: true
					}));
				});
		});

		[
			{
				script: "test/scripts/script-catch-one.js",
				expected: "error=throw"
			},
			{
				script: "test/scripts/script-catch-two.js",
				expected: "error=throw1"
			},
			{
				script: "test/scripts/script-catch-three.js",
				expected: "blob"
			},
			{
				script: "test/scripts/script-catch-four.js",
				expected: "result"
			},
			{
				script: "test/scripts/script-catch-five.js",
				expected: [2, 3]
			},
			{
				script: "test/scripts/script-chain.js",
				expected: [
					"Wesley",
					"Tiny",
					"George"
				]
			},
			{
				script: "test/scripts/script-closure-test.js",
				expected: {
					"age": 4,
					"name": "George"
				}
			},
			{
				script: "test/scripts/script-embedded-chain.js",
				expected: [
					{
						"age": 5,
						"link1": "link1",
						"link2": "link2",
						"name": "George",
						"species": "cat"
					},
					{
						"age": 12,
						"link1": "link1",
						"link2": "link2",
						"name": "Wesley",
						"species": "dog"
					},
					{
						"age": 0.5,
						"link1": "link1",
						"link2": "link2",
						"name": "Tiny",
						"species": "cat"
					}
				]
			},
			{
				script: "test/scripts/script-embedded-predicate.js",
				expected: [
					{
						"age": 5,
						"inserted": "data",
						"name": "George",
						"species": "cat"
					},
					{
						"age": 12,
						"inserted": "data",
						"name": "Wesley",
						"species": "dog"
					},
					{
						"age": 0.5,
						"inserted": "data",
						"name": "Tiny",
						"species": "cat"
					}
				]
			},
			{
				script: "test/scripts/script-embedded-predicate-deep.js",
				expected: [
					"range(1)=[0]",
					"range(2)=[0,1]",
					"range(3)=[0,1,2]",
					"range(4)=[0,1,2,3]"
				]
			},
			{
				script: "test/scripts/script-function-predicate.js",
				expected: [
					{
						"age": 5,
						"inserted": "data",
						"name": "George",
						"species": "cat"
					},
					{
						"age": 12,
						"inserted": "data",
						"name": "Wesley",
						"species": "dog"
					},
					{
						"age": 0.5,
						"inserted": "data",
						"name": "Tiny",
						"species": "cat"
					}
				]
			},
			{
				script: "test/scripts/script-math-binary.js",
				expected: [
					"1! = 1",
					"2! = 2",
					"3! = 6",
					"4! = 24"
				]
			},
			{
				script: "test/scripts/script-object-get.js",
				expected: "cat"
			},
			{
				script: "test/scripts/script-json-stringify.js",
				expected: "{\"george\":{\"type\":\"cat\"}}"
			},
			{
				script: "test/scripts/script-object-set.js",
				expected: {
					"george": {
						"type": "cat"
					},
					"helen": {
						"type": "cat"
					}
				}
			},
			{
				script: "test/scripts/script-throw-error.js",
				errorText: "as error"
			},
			{
				script: "test/scripts/script-throw-predicate.js",
				errorText: "as predicate"
			},
			{
				script: "test/scripts/script-throw-string.js",
				errorText: "as string"
			},
			{
				script: "test/scripts/script-unknown-action.js",
				errorText: "json.invalid is not a function"
			}
		].forEach(({errorText, expected, script})=>{
			it(`should successfully process '${script}'`, function() {
				const configuration={
					options: {
						// note: we specify input so that we don't look at stdin otherwise we hang
						input: undefined,
						script
					}
				};
				return run(configuration)
					.catch(error=>{
						if(errorText!==undefined) {
							assert.strictEqual(error.message, errorText, script);
						} else {
							assert.fail(`processing '${script}' failed - ${error}`);
						}
					})
					.then(result=>{
						if(errorText===undefined) {
							assert.strictEqual(errorText, undefined);
							if(expected.constructor.name==="String") {
								assert.strictEqual(result, expected);
							} else {
								assert.deepEqual(result, expected);
							}
						}
					});
			});
		});

		it("should successfully process 'test/scripts/script-os-ls.js'", function() {
			const configuration={
				options: {
					input: undefined,
					script: "test/scripts/script-os-ls.js"
				}
			};
			return run(configuration)
				.then(result=>{
					const expected=[
						"mouse.js",
						"node_modules",
						"package.json",
						"readme.md",
						"res",
						"src",
						"test"
					];
					assert.deepEqual(_.intersection(result, expected).sort(), expected);
				})
				.catch(error=>assert.fail(`processing 'test/scripts/script-os-ls.js' failed - ${error}`));
		});
	});
});
