/**
 * Testing use of both then and else
 */

array.range(6)
	.array.map(
		step.if(is.lessThan(3), math.multiply(2))
			.step.else(math.multiply(4))
	)
	.std.outln()
