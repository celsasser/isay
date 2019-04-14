/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 20:07
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const file=require("../../../../src/common/file");
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
					script: "test/scripts/script-test-then-no-domain.js"
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

		const tests=file.readToJSONSync("./test/scripts/test-spec.yaml");
		tests.forEach(({fail, pass, script})=>{
			it(`should successfully process '${script}'`, function() {
				const configuration={
					options: {
						// note: we specify input so that we don't look at stdin otherwise we hang
						input: undefined,
						script: `./test/scripts/${script}`
					}
				};
				return run(configuration)
					.catch(error=>{
						if(fail!==undefined) {
							assert.strictEqual(error.message, fail, script);
						} else {
							assert.fail(`processing '${script}' failed - ${error}`);
						}
					})
					.then(result=>{
						if(fail===undefined) {
							if(pass.constructor.name==="String") {
								assert.strictEqual(result, pass);
							} else {
								assert.deepEqual(result, pass);
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
