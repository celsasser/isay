/**
 * Date: 05/27/18
 * Time: 7:15 PM
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const assert=require("../../support/assert");
const proxy=require("../../support/proxy");
const util=require("../../../src/common/util");


describe("util", function() {
	afterEach(function() {
		proxy.unstub();
	});

	describe("compare", function() {
		it("should return 0 if objects are the same", function() {
			assert.strictEqual(util.compare(null, null), 0);
			assert.strictEqual(util.compare(1, 1), 0);
			assert.strictEqual(util.compare("1", "1"), 0);
		});

		it("should return proper values when one param is null and the other is not", function() {
			assert.strictEqual(util.compare(1, undefined), -1);
			assert.strictEqual(util.compare(1, null), -1);
			assert.strictEqual(util.compare(undefined, 1), 1);
			assert.strictEqual(util.compare(null, 1), 1);
		});

		it("should do date compare if dates", function() {
			const date1=new Date("2000-01-01"),
				date2=new Date("2000-01-02");
			assert.strictEqual(util.compare(date1, date2), -1);
			assert.strictEqual(util.compare(date2, date1), 1);
		});

		it("should do string compare if string", function() {
			assert.strictEqual(util.compare("a", "a"), 0);
			assert.strictEqual(util.compare("a", "b"), -1);
			assert.strictEqual(util.compare("b", "a"), 1);
			assert.strictEqual(util.compare("A", "a", {ignoreCase: false}), 1);
			assert.strictEqual(util.compare("a", "A", {ignoreCase: false}), -1);
			assert.strictEqual(util.compare("a", "A"), 0);
		});

		it("should default to treating as numbers", function() {
			assert.strictEqual(util.compare(0, 0), 0);
			assert.strictEqual(util.compare(1, 0), 1);
			assert.strictEqual(util.compare(0, 1), -1);
		});
	});

	describe("Object", function() {
		describe("clonePath", function() {
			it("should always clone the root", function() {
				const object={},
					immutable=assert.immutable(object);
				const result=util.clonePath(object, "");
				assert.notStrictEqual(object, result);
				assert.deepEqual(result, {});
				immutable();
			});

			it("should clone a path with multiple tiers", function() {
				const l2={
						c: "tail"
					},
					l1={
						b: l2
					},
					object={
						a: l1
					},
					immutable=assert.immutable(object, l1, l2);
				const result=util.clonePath(object, "a.b.c");
				assert.deepEqual(result, {
					a: {
						b: {
							c: "tail"
						}
					}
				});
				assert.notStrictEqual(object, result);
				assert.notStrictEqual(result.a, l1);
				assert.notStrictEqual(result.a.b, l2);
				immutable();
			});

			it("should not clone the 'minus' elements", function() {
				const l2={
						c: "tail"
					},
					l1={
						b: l2
					},
					object={
						a: l1
					},
					immutable=assert.immutable(object, l1, l2);
				const result=util.clonePath(object, "a.b", {minus: 1});
				assert.deepEqual(result, {
					a: {
						b: {
							c: "tail"
						}
					}
				});
				assert.notStrictEqual(object, result);
				assert.notStrictEqual(result.a, l1);
				assert.strictEqual(result.a.b, l2);
				immutable();
			});
		});

		describe("delete", function() {
			it("should not do anything if object is empty", function() {
				assert.deepEqual(util.delete({}, "a"), {});
			});

			it("should not do anything if path does not exist", function() {
				assert.deepEqual(util.delete({a: {b: 1}}, "a.c"), {a: {b: 1}});
			});

			it("should delete root if no depth", function() {
				assert.deepEqual(util.delete({a: {b: 1}}, "a"), {});
			});

			it("should nested property properly", function() {
				assert.deepEqual(util.delete({
					a: {
						b: {
							c: 1,
							d: 2
						}
					}
				}, "a.b.c"), {a: {b: {d: 2}}});
			});

			it("should delete array element if target is an array", function() {
				assert.deepEqual(util.delete({a: [1, 2]}, "a.1"), {a: [1]});
			});
		});

		describe("ensure", function() {
			it("should set an object and return the value", function() {
				const object={a: 1},
					result=util.ensure(object, "b", 2);
				assert.equal(result.value, 2);
				assert.deepStrictEqual(result.root, {
					a: 1,
					b: 2
				});
			});

			it("should find an existing value, not update it and return it", function() {
				const object={
						a: {
							b: 1
						}
					},
					result=util.ensure(object, "a", {});
				assert.deepStrictEqual(result.value, {b: 1});
				assert.deepStrictEqual(result.root, {
					a: {
						b: 1
					}
				});
			});

			it("should create the object if not specified", function() {
				const result=util.ensure("b", 2);
				assert.equal(result.value, 2);
				assert.deepStrictEqual(result.root, {
					b: 2
				});
			});
		});

		describe("name", function() {
			it("should properly get name of value type", function() {
				assert.equal(util.name(null), "null");
				assert.equal(util.name(1), "Number");
				assert.equal(util.name("s"), "String");
			});

			it("should properly get name of reference type", function() {
				class Dummy {}
				assert.equal(util.name({}), "Object");
				assert.equal(util.name(new Dummy()), "Dummy");
			});
		});

		describe("objectToData", function() {
			it("should return empty of input is empty", function() {
				assert.deepStrictEqual(util.objectToData(null), null);
				assert.deepStrictEqual(util.objectToData({}), {});
			});

			it("should return object identical to input if all are properties and within depth", function() {
				const input={property: "value"};
				assert.deepStrictEqual(util.objectToData(input), input);
				assert.deepStrictEqual(util.objectToData(input, {depth: 1}), input);
			});

			it("should return object identical to input if all are properties and within depth", function() {
				let input={property: "value"};
				assert.deepStrictEqual(util.objectToData(input), input);
				assert.deepStrictEqual(util.objectToData(input, {depth: 1}), input);
			});

			it("should retain array charecteristics", function() {
				assert.deepStrictEqual(util.objectToData({
					array: [1, 2]
				}), {
					array: [1, 2]
				});
			});

			it("should not sort object properties if not asked to", function() {
				assert.notEqual(
					JSON.stringify(util.objectToData({
						b: 2,
						a: 1
					})),
					JSON.stringify({
						a: 1,
						b: 2
					})
				);
			});

			it("should sort object properties if asked to", function() {
				assert.equal(
					JSON.stringify(util.objectToData({
						b: 2,
						a: 1
					}, {sort: true})),
					JSON.stringify({
						a: 1,
						b: 2
					})
				);
			});

			it("should strip out functions", function() {
				assert.deepStrictEqual(util.objectToData({
					property: "value",
					function: ()=>{}
				}), {property: "value"});
			});

			it("should limit the depth", function() {
				const input={
					outside: {
						inside: "strip"
					}
				};
				assert.deepStrictEqual(util.objectToData(input, {depth: 1}), {outside: "<Object>"});
				assert.deepStrictEqual(util.objectToData(input, {depth: 2}), input);
			});

			it("should prevent circular references", function() {
				const inner={
						inside: true
					},
					outter={
						outside: true,
						inside: inner
					};
				inner.circular=outter;
				assert.deepStrictEqual(util.objectToData(outter), {
					"inside": {
						"circular": {
							"inside": "<Object:circular>",
							"outside": true
						},
						"inside": true
					},
					"outside": true
				});
			});
		});

		describe("scrubObject", function() {
			beforeEach(function() {
				proxy.spy(_, "forEach");
			});

			it("should bypass undefined", function() {
				util.scrubObject(undefined);
				assert.equal(_.forEach.callCount, 0);
			});

			it("should bypass null", function() {
				util.scrubObject(null);
				assert.equal(_.forEach.callCount, 0);
			});

			it("should bypass string", function() {
				util.scrubObject("string");
				assert.equal(_.forEach.callCount, 0);
			});

			it("should descend into object", function() {
				util.scrubObject({});
				assert.equal(_.forEach.callCount, 1);
			});

			it("should not recurse if told not to", function() {
				util.scrubObject({
					a: {
						b: "big"
					}
				}, {recursive: false});
				assert.equal(_.forEach.callCount, 1);
			});

			it("should recurse if told to", function() {
				util.scrubObject({
					a: {
						b: "boy"
					}
				}, {recursive: true});
				assert.equal(_.forEach.callCount, 2);
			});

			it("should remove shallow undefined property", function() {
				const o={
					a: "a",
					b: undefined
				};
				assert.deepStrictEqual(util.scrubObject(o), {a: "a"});
			});

			it("should remove deep undefined property if recursive==true", function() {
				const o={
					a: {
						b: undefined
					}
				};
				assert.deepStrictEqual(util.scrubObject(o), {a: {}});
			});

			it("should remove extended set of objects in removables param", function() {
				const o={
						a: {
							b: undefined,
							c: null
						}
					},
					s=util.scrubObject(o, {recursive: true, removables: [undefined, null, {}]});
				assert.deepStrictEqual(s, {});
			});

			it("should remove removables from objects in an array", function() {
				const a=[
					{
						a: "a",
						b: undefined
					}
				];
				assert.deepEqual(util.scrubObject(a), [{a: "a"}]);
			});
		});
	});
});
