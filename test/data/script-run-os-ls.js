/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

os.ls(".")
	.string.split("newline")
	.array.filter(item=>item.length>0)
	.map(item=>`./${item}`)
	.sort()
	.reverse()
	.std.out();
