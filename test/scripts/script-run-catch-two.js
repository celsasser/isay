/**
 * User: curtis
 * Date: 2019-03-03
 * Time: 12:04 AM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Test catch of a thrown error
 */

std.in([1, 2])
	.array.map(value=>{
		std.out(value)
			.error.throw(`throw+${value}`)
	})
	.error.catch(error=>{
		return `error=${error.message}`
	})
