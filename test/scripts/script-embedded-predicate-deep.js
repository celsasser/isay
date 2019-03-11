/**
 * Example of embedding multiple layers of predicate functions. Making sure we don't loose variables on the way down.
 * Note: allows one to save state in variables.
 */
array.range(1, 5)
	.array.map(outter=>{
		array.range(outter)
			.object.map(inner=>`range(${outter})=${JSON.stringify(inner)}`)
	})
