/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 20:07
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const file=require("../../../../src/common/file");
const {errorToString}=require("../../../../src/common/format");
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
		/**
		 * @returns {Array<{fail, pass, script}>}
		 * @private
		 */
		function getTestSpecs() {
			const all=file.readToJSONSync("./test/scripts/test-spec.yaml")
					.filter(test=>Boolean(test.skip)===false),
				only=_.filter(all, {only: true});
			return (only.length>0)
				? only
				: all;
		}

		it.skip("debug script", async function() {
			const configuration={
				options: {
					input: undefined,
					script: "test/scripts/script-if-then-with-domain.js"
				}
			};
			return run(configuration)
				.then(result=>{
					console.log(result);
				})
				.catch(error=>{
					assert.fail(errorToString(error, {
						details: true,
						instance: true,
						stack: true
					}));
				});
		});

		getTestSpecs().forEach(({fail, pass, script})=>{
			it(`should successfully process '${script}'`, function() {
				const configuration={
					options: {
						// note: we specify input so that we don't look at stdin otherwise we hang
						input: undefined,
						script: `./test/scripts/${script}`
					}
				};
				if(pass!==undefined) {
					return run(configuration)
						.catch(assert.notCalled)
						.then(result=>{
							if(pass.constructor.name==="String") {
								assert.strictEqual(result, pass);
							} else {
								assert.deepEqual(result, pass);
							}
						});
				} else {
					assert.notStrictEqual(fail, undefined);
					return run(configuration)
						.catch(error=>{
							assert.strictEqual(error.message, fail, script);
						})
						.then(assert.notCalled);
				}
			});
		});

		it("should successfully process 'test/scripts/script-ls.js'", function() {
			const configuration={
				options: {
					input: undefined,
					script: "test/scripts/script-ls.js"
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
