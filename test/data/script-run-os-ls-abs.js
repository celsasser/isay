/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Example of running "ls", filtering, and translating relative paths to absolute paths
 */
os.ls(".")
	.string.split("newline")
	.filter(not.empty())
	.map(path.absolute())
	.sort(path=>path.length)
	.std.out()
