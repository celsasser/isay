/**
 * Example of embedding a chain in an input function.
 * Note: allows one to save state in variables.
 */
json.read("./test/data/data-pets.json")
	.array.map((data)=>{
		std.in(data)
			.object.merge({
				inserted: "data"
			})
	})
	.std.outln()
