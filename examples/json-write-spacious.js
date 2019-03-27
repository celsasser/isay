/**
 * mouse.js example of loading and writing JSON to stdout
 * 1. loading our sample JSON formatted, pets database
 * 2. stringify database in a "spacious" encoding. Note: this line could be removed with the same results
 * 3. write to stdout
 */

json.read("./examples/data/pets.json")
	.json.stringify({compact: false})
	.std.outln()
