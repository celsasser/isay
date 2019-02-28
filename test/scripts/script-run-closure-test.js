/**
 * User: curtis
 * Date: 2019-02-26
 * Time: 22:50
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Test function closures
 */
std.in({name: "George"})
	object.map(data=>{
		std.in({age: 4})
			object.merge(data)
	})
	.std.out();
