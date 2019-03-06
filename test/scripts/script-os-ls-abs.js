/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Another os test with ls with a little more functionality
 */
os.ls(".")
	.string.split("newline")
	.array.filter(not.empty())
	.array.map(path.absolute())
	.array.sort(path=>path.length)
	.std.out()
