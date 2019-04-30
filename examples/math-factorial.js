/**
 * isay.js example of looping over a numeric range and some basic math functionality
 */

array.range(1, 10)
	.array.map(function(value) {
		array.range(1, value+1)
			.math.multiply()
			.object.mutate(function(result) {
				return `${value}! = ${result}`;
			})
	})
	.std.outln()
