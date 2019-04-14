/**
 * Testing object.s
 */
json.read("./test/data/data-pet.json")
	.object.set("helen", {type: "cat"})
	.std.outln()
