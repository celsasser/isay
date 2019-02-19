/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 8:47 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Example using a chain as a predicate function.
 */
json.read("./test/data/data-pets.json")
	.map(object.get("name"))
	.sort()
	.reverse()
	.std.out()
