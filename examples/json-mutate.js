/**
 * mouse.js example of loading and mutating a JSON file
 * 1. loading our sample JSON formatted, pets database
 * 2. add "maturity" to each element using a silly calculation
 * 3. sort in ascending maturity order
 * 4. reverse the sort
 * 5. add an ascending "index"
 * 6. write to stdout
 */

json.read("./examples/data/pets.json")
	.array.map(function(element, index) {
		return {
			maturity: (element.species==="dog")
				? element.age**2
				: element.age*2,
			name: element.name,
			type: element.species
		}
	})
	.array.sort("maturity")
	.array.reverse()
	.array.map(function(element, index) {
		return {index, ...element}
	})
	.std.out()
