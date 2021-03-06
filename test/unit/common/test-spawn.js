/**
 * Date: 2019-02-08
 * Time: 10:06 PM
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const spawn=require("../../../src/common/spawn");

describe("common.spawn", function() {
	describe("command", function() {
		it("should successfully return results with a valid command", async function() {
			return spawn.command({
				command: "ls"
			})
				.then(result=>{
					assert.strictEqual(typeof (result), "string");
					assert.notStrictEqual(result.indexOf("package.json"), -1);
				});
		});
	});
});
