/**
 * Make sure our casting functions look good
 */

std.in("2000-01-01")
	.cast.date()
	.debug.assert(is.type("Date"))
.std.in("0.125")
	.cast.number()
	.debug.assert(is.type("Number"))
.std.in(0.125)
	.cast.string()
	.debug.assert(is.type("String"))
