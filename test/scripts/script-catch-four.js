/**
 * User: curtis
 * Date: 2019-03-02
 * Time: 10:08 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Test catch of thrown with an catch immediately following
 */

std.in("blob")
	.error.throw("throw")
	.std.in("unexpected")
	.error.catch("result")
