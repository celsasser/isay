/**
 * Predicate test - returns the value for the test that passes
 * @required input
 */

step.if(is.lessThan(10))
	.step.then("first")
	.step.elif(is.lessThan(20))
	.step.then("second")
	.step.elif(is.lessThan(30))
	.step.then("third")
	.step.else("fourth")
