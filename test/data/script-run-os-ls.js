/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

os.ls(".")
	.string.split("newline")
	.map(os.cat())
	.sort()
	.reverse()
	.std.out();
