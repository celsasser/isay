/**
 * Testing embedded chains
 */
json.read("./test/data/data-pets.json")
	.array.map(
		object.merge({
			link1: "link1"
		})
		.object.merge({
			link2: "link2"
		})
	)
	.std.outln()
