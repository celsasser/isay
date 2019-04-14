/**
 * Test catch without a param which acts as both a handler as well as a throughput filter
 */

std.in("input1")
	.error.throw("throw")
	.std.in("input2")
	.error.catch()
