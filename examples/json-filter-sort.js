/**
 * mouse.js example of:
 * 1. loading our sample JSON formatted, pets database
 * 2. filter on <code>species==="dog"</code>
 * 3. sort in ascending (name) order
 * 4. write to stdout
 */

json.read("./examples/data/pets.json")
	.array.filter(({species})=>species==="dog")
	.array.sort("name")
	.std.out()
``