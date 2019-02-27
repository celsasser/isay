/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Testing os with "ls". Throwing in sort for fun.
 */
os.ls(".")
	.string.split("newline")
	.sort()
	.std.out()
