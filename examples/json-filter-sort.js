/**
 * mouse.js example of loading a JSON file and filtering it.
 * 1. loading our sample JSON formatted, pets database
 * 2. filter on <code>species==="dog"</code>
 * 3. sort in ascending (name) order
 * 4. write to stdout
 */

json.read("./examples/data/pets.json")
	.array.filter(function(pet) {
		return pet.species==="dog";
	})
	.array.sort("name")
	.std.outln()
