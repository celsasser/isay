/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Example of running "ls", filtering, altering the order and writing to stdout
 */
os.ls(".")
	.string.split("newline")
	.array.filter(not.empty())
	.array.sort()
	.std.out()
