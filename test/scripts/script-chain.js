/**
 * Test of our basic chain functionality
 */
json.read("./test/data/data-pets.json")
	.array.map(object.get("name"))
	.array.sort()
	.array.reverse()
	.std.out()
