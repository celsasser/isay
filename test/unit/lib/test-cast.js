/**
 * Date: 2019-05-01 01:38
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const {ModuleCast}=require("../../../src/lib/cast");

describe("lib.ModuleCast", function() {
	function _createInstance({
		action="action",
		domain="domain",
		method="method",
		params=[]
	}={}) {
		return new ModuleCast({
			action,
			domain,
			method,
			params
		});
	}

	describe("date", function() {
		it("should throw exception if blob type is not supported", async function() {
			const instance=_createInstance();
			return instance.date({})
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Date, Number or String but found Object");
				});
		});

		it("should properly parse a valid string encoding", function() {
			const instance=_createInstance(),
				date=new Date("2000-01-01T12:00:00.000Z");
			return instance.date(date.toISOString())
				.then(result=>{
					assert.strictEqual(result.constructor.name, "Date");
					assert.deepEqual(result, date);
				});
		});

		it("should throw exception if string encoding is not valid", function() {
			const instance=_createInstance();
			return instance.date("naughty")
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, 'invalid date "naughty"');
				})
		});

		it("should create a Date instance from numeric epoch", function() {
			const instance=_createInstance(),
				date=new Date();
			return instance.date(date.getTime())
				.then(result=>{
					assert.strictEqual(result.constructor.name, "Date");
					assert.deepEqual(result, date);
				});
		});

		it("should create a Date instance from a date", function() {
			const instance=_createInstance(),
				date=new Date();
			return instance.date(date)
				.then(result=>{
					assert.strictEqual(result.constructor.name, "Date");
					assert.deepEqual(result, date);
				});
		});
	});

	describe("number", function() {
		it("should throw exception if blob type is not supported", async function() {
			const instance=_createInstance();
			return instance.number({})
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Boolean, Date, Number or String but found Object");
				});
		});

		[
			["Boolean", false, 0],
			["Boolean", true, 1],
			["Date", new Date(100), 100],
			["Number", 100, 100],
			["String", "10", 10],
			["String", "-10", -10],
			["String", "0.125", 0.125]
		].forEach(([type, blob, expected])=>{
			it(`should convert ${blob} of ${type} to ${expected}`, function() {
				const instance=_createInstance();
				return instance.number(blob)
					.then(result=>assert.strictEqual(result, expected));
			});
		});
	});

	describe("string", function() {
		it("should throw exception if blob type is not supported", async function() {
			const instance=_createInstance();
			return instance.string({})
				.then(assert.notCalled)
				.catch(error=>{
					assert.strictEqual(error.message, "expecting Boolean, Date, Number or String but found Object");
				});
		});

		[
			["Boolean", false, "false"],
			["Boolean", true, "true"],
			["Date", new Date("2000-01-01T12:00:00.000Z"), "2000-01-01T12:00:00.000Z"],
			["Number", 100, "100"],
			["Number", -100, "-100"],
			["Number", 0.125, "0.125"],
			["String", "string", "string"]
		].forEach(([type, blob, expected])=>{
			it(`should convert ${blob} of ${type} to ${expected}`, function() {
				const instance=_createInstance();
				return instance.string(blob)
					.then(result=>assert.strictEqual(result, expected));
			});
		});
	});
});
