/**
 * Testing use of both then and else
 */

array.range(6)
	.array.map(
		not.lessThan(3)
			.is.then(math.multiply(2))
			.is.else(math.multiply(4))
	)
