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

describe("command.run.index", function() {
	beforeEach(function() {
		proxy.std.stub();
	});

	afterEach(function() {
		proxy.std.unstub();
	});

	describe("run", function() {
		it("should throw error when processing 'test/scripts/script-run-unknown-action.js'", async function() {
			const configuration={
				options: {
					script: "test/scripts/script-run-unknown-action.js"
				}
			};
			return run(configuration)
				.catch(error=>{
					assert.strictEqual(error.message, "run failed");
					assert.strictEqual(error.details, "json.invalid is not a function");
				});
		});

		[
			{
				script: "test/scripts/script-run-chain.js",
				expected: [
					"Wesley",
					"Tiny",
					"George"
				]
			},
			{
				script: "test/scripts/script-run-chain-embedded.js",
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
				script: "test/scripts/script-run-chain-predicate.js",
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
				script: "test/scripts/script-run-closure-test.js",
				expected: {
					"age": 4,
					"name": "George"
				}
			},
			{
				script: "test/scripts/script-run-function-predicate.js",
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
				script: "test/scripts/script-run-object-get.js",
				expected: "cat"
			},
			{
				script: "test/scripts/script-run-json-stringify.js",
				expected: "{\"george\":{\"type\":\"cat\"}}"
			},
			{
				script: "test/scripts/script-run-object-set.js",
				expected: {
					"george": {
						"type": "cat"
					},
					"helen": {
						"type": "cat"
					}
				}
			}
		].forEach(({expected, script})=>{
			it(`should successfully process '${script}'`, function() {
				const configuration={
					options: {script}
				};
				return run(configuration)
					.then(result=>{
						if(expected.constructor.name==="String") {
							assert.strictEqual(result, expected);
						} else {
							assert.deepEqual(result, expected);
						}
					})
					.catch(error=>assert.fail(`processing '${script}' failed - ${error}`));
			});
		});

		it("should successfully process 'test/scripts/script-run-os-ls.js'", function() {
			const configuration={
				options: {
					script: "test/scripts/script-run-os-ls.js"
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
				.catch(error=>assert.fail(`processing 'test/scripts/script-run-os-ls.js' failed - ${error}`));
		});
	});
});
