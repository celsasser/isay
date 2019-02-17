/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 20:07
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../../support/assert");
const {run}=require("../../../../src/command/run");

describe("command.run.index", function() {
	describe("run", function() {
		it("should successfully process a valid script", function() {
			const configuration={
				options: {
					script: "test/data/script-run-json-parse.js"
				}
			};
			return run(configuration)
				.then(result=>{
					assert.deepEqual(result, {
						"george": {
							"type": "cat"
						}
					});
				});
		});

		it("should throw error on an invalid script", async function() {
			const configuration={
				options: {
					script: "test/data/script-run-unknown-action.js"
				}
			};
			return run(configuration)
				.catch(error=>{
					assert.strictEqual(error.message, "run failed");
					assert.strictEqual(error.details, "json.invalid is not a function");
				});
		});
	});
});
