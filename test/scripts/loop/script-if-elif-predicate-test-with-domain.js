/**
 * Predicate test - returns the value for the test that passes
 * @required input
 */

loop.if(is.lessThan(10))
	.loop.then(math.add(1))
	.loop.elif(is.lessThan(20))
	.loop.then(math.add(1))
	.loop.elif(is.lessThan(30))
	.loop.then(math.add(1))
