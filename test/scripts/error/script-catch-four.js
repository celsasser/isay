/**
 * Test catch of thrown with an catch immediately following
 */

std.in("input1")
	.error.throw("throw")
	.std.in("input2")
	.error.catch("catch")
