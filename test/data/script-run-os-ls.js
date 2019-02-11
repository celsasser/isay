/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

os.ls(".")
	.string.split("newline")
	.filter(not.empty())
	.map(std.out())
	.sort()
	.reverse()
	.std.out();
