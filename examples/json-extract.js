/**
 * isay.js example of loading and mapping a JSON file
 * 1. loading our sample JSON formatted, pets database
 * 2. extract name from each element
 * 3. sort in ascending (name) order
 * 4. reverse the sort
 * 5. write to stdout
 */

json.read("./examples/data/pets.json")
	.array.map(object.get("name"))
	.array.sort()
	.array.reverse()
	.std.outln()
