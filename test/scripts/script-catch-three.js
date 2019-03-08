/**
 * Test catch without a param which acts as both a handler as well as a throughput filter
 */

std.in("blob")
	.error.throw("throw")
	.std.in("skipped")
	.error.catch()
