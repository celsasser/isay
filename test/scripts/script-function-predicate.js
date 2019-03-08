/**
 * Test a non chain predicate function
 */
json.read("./test/data/data-pets.json")
	array.map(data=>{
		let merge={inserted: "data"};
		return {
			...merge,
			...data
		};
	})
	.std.out();
