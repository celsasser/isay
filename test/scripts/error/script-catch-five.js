/**
 * Test the scope of the handler. Here the error thrown in the nested chain should handle
 * the error and return the input+1 (just for fun and to make sure he is having an effect)
 */

std.in([1, 2])
	.array.map(value=>{
		std.outln(value)
			.error.throw(`throw${value}`)
			.error.catch(`catch${value}`)
	})
	.error.catch("catch")
