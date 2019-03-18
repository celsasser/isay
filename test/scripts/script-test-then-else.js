/**
 * Testing use of both then and else
 */

array.range(6)
	.array.map(
		is.test(value=>{
			return value<3;
		})
		.is.then(math.multiply(2))
		.is.else(math.multiply(4))
	)
