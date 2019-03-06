/**
 * User: curtis
 * Date: 2019-03-02
 * Time: 10:08 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Test catch without a param which acts as both a handler as well as a throughput filter
 */

std.in("blob")
	.error.throw("throw")
	.std.in("skipped")
	.error.catch()
