/**
 * mouse.js example of looping via a numeric range and some basic math functionality
 */

array.range(1, 10)
	.array.map(value=>{
		array.sequence(1, value)
			.math.multiply()
			.object.map(result=>`${value}!=${result}`)
			.std.out()
	})
