/**
 * Test function closures
 */
std.in({name: "George"})
	.object.mutate(data=>{
		std.in({age: 4})
			object.merge(data)
	})
	.std.outln();
