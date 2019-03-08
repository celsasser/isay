/**
 * Test catch of thrown with an catch immediately following
 */

std.in("blob")
	.error.throw("throw")
	.std.in("unexpected")
	.error.catch("result")
