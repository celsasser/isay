/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 8:47 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Test a non chain predicate function
 */
json.read("./test/data/data-pets.json")
	array.map(data=>{
		let merge={inserted: "data"};
		return {
			...merge,
			...data
		};
	})
	.std.out();
