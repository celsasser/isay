/**
 * Date: 2019-03-21
 * Time: 21:48
 * @license MIT (see project's LICENSE file)
 */

const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const {
	formatMouseSpecification,
	unformatMouseSpecification
}=require("../../../src/lib/_format");

describe("lib._format", function() {
	beforeEach(function() {
		proxy.log.stub();
	});

	afterEach(function() {
		proxy.log.unstub();
	});

	describe("formatMouseSpecification", function() {
		it("should return spec string if no format specs are in the spec string", function() {
			assert.strictEqual(formatMouseSpecification(""), "");
			assert.strictEqual(formatMouseSpecification("input", null), "input");
		});

		[
			["${l}", null, "data[0] cannot be found"],
			["${0:l}", null, "data[0] cannot be found"],
			["${1:l}", [0], "data[1] cannot be found"],
			["${a:l}", null, "data[a] cannot be found"],
			["${a:l}", {}, "data[a] cannot be found"]
		].forEach(([spec, data, text])=>{
			it(`should throw 'cannot be found' exception for spec ${spec} and ${JSON.stringify(data)}`, function() {
				assert.throws(formatMouseSpecification.bind(null, spec, data),
					error=>error.message===text);
			});
		});

		[
			["${l}", [5], "5"],
			["${0:l}", [5], "5"],
			["${l}", ["five"], "five"],
			["${0:l}", ["five"], "five"],
			["${1:l}", [5, 6], "6"],
			["${a:l}", {a: 5}, "5"],
			["${a:l}", {a: "five"}, "five"],
			["${a.b:l}", {a: {b: 5}}, "5"],
			["${a.b:l}", {a: {b: "five"}}, "five"]
		].forEach(([spec, data, expected])=>{
			it(`should properly make basic single substitutions for spec ${spec} and data=${JSON.stringify(data)}`, function() {
				assert.strictEqual(formatMouseSpecification(spec, data), expected);
			});
		});

		[
			["${3l}", [5], "5  "],
			["${3c}", [5], " 5 "],
			["${3r}", [5], "  5"],
			["${03l}", [5], "500"],
			["${03c}", [5], "050"],
			["${03r}", [5], "005"],
			["${*3l}", [5], "5**"],
			["${*3c}", [5], "*5*"],
			["${*3r}", [5], "**5"],
			["${6.2l}", [5.1234], "5.12  "],
			["${6.2c}", [5.1234], " 5.12 "],
			["${6.2r}", [5.1234], "  5.12"]
		].forEach(([spec, data, expected])=>{
			it(`should properly apply format options for spec ${spec} and ${JSON.stringify(data)}`, function() {
				assert.strictEqual(formatMouseSpecification(spec, data), expected);
			});
		});

		[
			["test: ${l}, ${l}, ${l}", [1, 2, 3], "test: 1, 2, 3"],
			["test: ${2:l}, ${1:l}, ${0:l}", [1, 2, 3], "test: 3, 2, 1"],
			["test: ${0:l}, ${0:l}, ${0:l}", [1], "test: 1, 1, 1"],
			["$\\{0:l}=${0:l}", ["one"], "${0:l}=one"]
		].forEach(([spec, data, expected])=>{
			it(`should properly format more complex configuration: spec=${spec} and data=${JSON.stringify(data)}`, function() {
				assert.strictEqual(formatMouseSpecification(spec, data), expected);
			});
		});
	});

	describe("unformatMouseSpecification", function() {
		it("should throw error (by default) if there are literal mismatches", function() {
			assert.throws(unformatMouseSpecification.bind(null, "spec", "encoded"),
				error=>error.message==="failed to match \"spec\" to \"encoded\"");
		});

		it("should return empty array if literal mismatches and not throwing errors", function() {
			assert.deepEqual(unformatMouseSpecification("spec", "encoded", {
				exceptionOnMismatch: false
			}), []);
			assert.strictEqual(proxy.log.debug.callCount, 1);
		});

		[
			["${4l}", "4   ", ["4"]],
			["${-4l}", "4---", ["4"]],
			["${4r}", "   4", ["4"]],
			["${04r}", "0004", ["4"]],
			["${4c}", " 4  ", ["4"]],
			["${04c}", "0040", ["4"]]
		].forEach(([spec, encoding, expected])=>{
			it(`should successfully parse single field spec (w/width) ${spec} for "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		[
			["${l}", "4   ", ["4"]],
			["${-l}", "4---", ["4"]],
			["${r}", "   4", ["4"]],
			["${0r}", "0004", ["4"]],
			["${c}", " 4  ", ["4"]],
			["${0c}", "0040", ["4"]]
		].forEach(([spec, encoding, expected])=>{
			it(`should successfully parse single field spec (wo/width) ${spec} for "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		[
			["${4li}", "4", [4]],
			["${li}", "4", [4]],
			["${li}", "4.4", [4]],
			["${li+}", "4", [4]],
			["${lf}", "4", [4]],
			["${lf}", "4.4", [4.4]],
			["${lf}", "4.4", [4.4]],
			["${ld}", "2020-01-01T00:00:00.000Z", [new Date("2020-01-01T00:00:00.000Z")]]
		].forEach(([spec, encoding, expected])=>{
			it(`should properly make type conversions for spec ${spec} and "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		it("should raise exception if date cannot be parsed", function() {
			assert.throws(unformatMouseSpecification.bind(null, "${ld}", "fail"),
				error=>error.message==='unknown date encoding "fail"'
			);
		});

		[
			["${l+}", "4 ", ["4"]],
			["${l+}", " 4 ", [" 4"]],
			["${l+}", "4 5", ["4 5"]],
			["${l+}", "4 5 ", ["4 5"]],
			["${-l+}", "4 ", ["4 "]],
			["${-l+}", "4-", ["4"]],
			["${-l+}", "4-4-", ["4-4"]],
			["${r+}", " 4", ["4"]],
			["${r+}", " 4 5 ", ["4 5 "]],
			["${c+}", " 4 ", ["4"]],
			["${c+}", " 4 5 ", ["4 5"]]
		].forEach(([spec, encoding, expected])=>{
			it(`should successfully parse trailing (+) field spec ${spec} for "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		[
			["a${02r}", "b01", "failed to match \"a\" to \"b\""],
			["${02r}a${02r}", "01b02", "failed to match \"a\" to \"b\""],
			["${02r}a${02r}b", "01a02c", "failed to match \"b\" to \"c\""]
		].forEach(([spec, encoding, errorText])=>{
			it(`should catch literal mismatches around field spec ${spec} for ${encoding}`, function() {
				assert.throws(unformatMouseSpecification.bind(null, spec, encoding),
					error=>error.message===errorText);
			});
		});

		[
			["${3l}${3l}", "4  5  ", ["4", "5"]],
			["${3r}${3r}", "  4  5", ["4", "5"]],
			["${3c}${3c}", " 4  5 ", ["4", "5"]],
			// this one is debatable - the width spec is not fulfilled but it's the last spec. We are going to let it ride.
			["${2l}${2l}", "4 5", ["4", "5"]],
			["${2l}${2l}", "4455", ["44", "55"]],
			["${2r}${2l}", "4455", ["44", "55"]],
			["${-2l}${-2r}", "4--5", ["4", "5"]],
			["${-2l}-${-2r}", "4---5", ["4", "5"]]
		].forEach(([spec, encoding, expected])=>{
			it(`should successfully parse complex field spec (w/width) ${spec} for "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		it("should fail if more fields specs than there are encoded fields (with width)", function() {
			assert.throws(unformatMouseSpecification.bind(null, "${2r}{2r}", "2 "),
				error=>error.message==="failed to match \"{2r}\" to \"\"");
		});

		[
			["${l}${l}", "4  5  ", ["4", "5"]],
			["${r}${r}", "  4  5", ["4", "5"]],
			["${c}${c}", " 4  5 ", ["4", "5"]],
			["${l}|${-r}", "4   |---5", ["4", "5"]],
			[" ${l}${-c} ", " 4 -5- ", ["4", "5"]]
		].forEach(([spec, encoding, expected])=>{
			it(`should successfully parse complex field spec (wo/width) ${spec} for "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		[
			["${r}${l}", " 45 ", ["45", ""]],
			["${l}${l}", "44aa", ["44aa", ""]]
		].forEach(([spec, encoding, expected])=>{
			it(`should return wonky results due to ambiguity when no width included: spec ${spec} for "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		[
			["${0:2l}", "4 ", ["4"]],
			["${a:2l}", "4 ", {a: "4"}],
			["${0:2l}${a:2l}", "4 c ", {0: "4", a: "c"}],
			["${a.b:2l}${a.c:2l}", "4455", {a: {b: "44", c: "55"}}]
		].forEach(([spec, encoding, expected])=>{
			it(`should properly encode result for specs with path variables: ${spec} for "${encoding}"`, function() {
				assert.deepEqual(unformatMouseSpecification(spec, encoding), expected);
			});
		});

		it("should be smart about interleaved text and fields without width", function() {
			const encoded="curtis            1481  97  3949620 201:24.66 124:35.77 Google Chrome   ",
				spec="${l} ${ri} ${ri} ${ri} ${r} ${r} ${l+}",
				result=unformatMouseSpecification(spec, encoded);
			assert.deepEqual(result, [
				"curtis",
				1481,
				97,
				3949620,
				"201:24.66",
				"124:35.77",
				"Google Chrome"
			]);
		});
	});
});
