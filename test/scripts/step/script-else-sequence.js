/**
 * Testing use of both then and else
 */

array.range(6)
	.array.map(
		step.if(is.lessThan(3))
			.then(math.multiply(2))
			.else(math.multiply(4))
	)
	.std.outln()
