/**
 * mouse.js example of looping over a numeric range and some basic math functionality
 */

array.range(2, 10)
	.array.map(value=>{
		array.range(1, value)
			.math.multiply()
			.object.map(result=>`${value}!=${result}`)
			.std.out()
	})
