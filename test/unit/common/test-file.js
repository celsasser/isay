/**
 * Date: 05/27/18
 * Time: 1:08 AM
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const fs=require("fs-extra");
const os=require("os");
const assert=require("../../support/assert");
const file=require("../../../src/common/file");

describe("file", function() {
	describe("toLocalPath", function() {
		it("should properly translate a local path into a full path relative to root", function() {
			const path=file.toLocalPath("./mouse.js");
			assert.strictEqual(fs.existsSync(path), true);
		});
	});

	describe("readToJSON", function() {
		it("should properly read a json file", async function() {
			const result=await file.readToJSON("./test/data/data-pet.json");
			assert.deepEqual(result, {
				"george": {
					"type": "cat"
				}
			});
		});
	});

	describe("readToJSONSync", function() {
		it("should properly read a json file", function() {
			const result=file.readToJSONSync("./test/data/data-pet.json");
			assert.true(_.isPlainObject(result));
		});
	});

	describe("writeFile", function() {
		it("should fail if path does not exist and not told to create", function() {
			return file.writeFile({
				uri: `${os.tmpdir()}/${_.uniqueId()}/test.json`,
				data: {},
				createPath: false
			})
				.then(assert.notCalled)
				.catch(error=>{
					assert.startsWith(error.message, "ENOENT: no such file or directory");
				});
		});

		it("should succeed if path does not exist but told to create", function() {
			return file.writeFile({
				uri: `${os.tmpdir()}/${_.uniqueId()}/test.json`,
				data: {},
				createPath: true
			})
				.catch(assert.notCalled);
		});
	});
});
