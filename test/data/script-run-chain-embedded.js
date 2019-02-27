/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 8:47 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Example of embedding a chain in an input function.
 * Note: allows one to save state in variables.
 */
json.read("./test/data/data-pets.json")
	.array.map((data)=>{
		std.in(data)
			.object.merge({
				inserted: "data"
			})
	})
	.std.out()
