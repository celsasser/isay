/**
 * Testing use of both then and else
 */

array.range(6)
	.array.map(
		is.lessThan(3)
			.is.then(math.multiply(2))
			.is.else(math.multiply(4))
	)
	.std.out()
