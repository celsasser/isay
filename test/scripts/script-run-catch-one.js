/**
 * User: curtis
 * Date: 2019-03-02
 * Time: 10:08 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Test catch of a thrown error
 */

std.in("blob")
	.error.throw("error")
	.error.catch((blob, error)=>{
		return `${blob}+${error.message}`;
	})
