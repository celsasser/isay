/**
 * Predicate test - returns the value for the test that passes
 * @required input
 */

feedback.if(is.lessThan(10))
	.feedback.then(math.add(1))
	.feedback.elif(is.lessThan(20))
	.feedback.then(math.add(1))
	.feedback.elif(is.lessThan(30))
	.feedback.then(math.add(1))
