/**
 * Predicate test - returns the value for the test that passes
 * @required input
 */

step.if(is.lessThan(10))
	.then("first")
	.elif(is.lessThan(20))
	.then("second")
	.elif(is.lessThan(30))
	.then("third")
	.else("fourth")
