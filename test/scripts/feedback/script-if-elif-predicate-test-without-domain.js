/**
 * Predicate test - returns the value for the test that passes
 * @required input
 */

feedback.if(is.lessThan(10))
	.then(math.add(1))
	.elif(is.lessThan(20))
	.then(math.add(1))
	.elif(is.lessThan(30))
	.then(math.add(1))
