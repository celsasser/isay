/**
 * Testing json.stringify
 */
json.read("./test/data/data-pet.json")
	.json.stringify({compact: true})
	.std.outln()
