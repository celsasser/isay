/**
 * Date: 2019-04-07
 * Time: 21:14
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {ModuleTty}=require("../../../src/lib/tty");

describe("lib.ModuleTty", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleTty({
			action,
			domain,
			method,
			params
		});
	}

	beforeEach(()=>{
		proxy.setProperty(process.stdout, "clear", ()=>{});
		proxy.setProperty(process.stdout, "clearScreenDown", ()=>{});
		proxy.setProperty(process.stdout, "cursorTo", ()=>{});
		proxy.setProperty(process.stdout, "isTTY", true);
		proxy.setProperty(process.stdout, "rows", 20);
		proxy.setProperty(process.stdout, "columns", 80);
	});

	afterEach(()=>{
		proxy.unstub();
		proxy.restoreProperty(process.stdout, "clear");
		proxy.restoreProperty(process.stdout, "clearScreenDown");
		proxy.restoreProperty(process.stdout, "cursorTo");
		proxy.restoreProperty(process.stdout, "isTTY");
		proxy.restoreProperty(process.stdout, "rows");
		proxy.restoreProperty(process.stdout, "columns");
	});

	describe("_assertTty", function() {
		it("should throw exception if stdout is not a TTY", function() {
			const instance=_createInstance();
			proxy.setProperty(process.stdout, "isTTY", false);
			assert.throws(instance._assertTty.bind(instance),
				error=>error.message==="must be in a terminal (TTY)"
			);
			proxy.restoreProperty(process.stdout, "isTTY");
		});

		it("should return normally if stdout is TTY", function() {
			const instance=_createInstance();
			instance._assertTty();
		});
	});

	describe("clear", function() {
		it("should successfully clear if process.stdout is a tty", async function() {
			const instance=_createInstance();
			proxy.spy(process.stdout, "clearScreenDown");
			return instance.clear("input")
				.then(result=>{
					assert.strictEqual(result, "input");
					assert.strictEqual(process.stdout.clearScreenDown.callCount, 1);
				});
		});
	});

	describe("height", function() {
		it("should return process.stdout.rows", async function() {
			const instance=_createInstance();
			return instance.height("input")
				.then(result=>{
					assert.strictEqual(result, 20);
				});
		});
	});

	describe("width", function() {
		it("should return process.stdout.columns", async function() {
			const instance=_createInstance();
			return instance.width("input")
				.then(result=>{
					assert.strictEqual(result, 80);
				});
		});
	});
});
