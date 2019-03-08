/**
 * Testing object.get
 */
json.read("./test/data/data-pet.json")
	.object.get("george.type")
	.std.out()
