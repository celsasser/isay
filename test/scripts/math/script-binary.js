/**
 * Test single value type binary operations
 */
array.range(1, 5)
	.array.map(value=>{
		array.range(1, value+1)
			.math.multiply()
			.object.mutate(result=>`${value}! = ${result}`)
	})
	.std.outln()
