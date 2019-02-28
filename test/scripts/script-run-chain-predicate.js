/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 8:47 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Testing embedded chains
 */
json.read("./test/data/data-pets.json")
	.array.map(
		object.merge({
			link1: "link1"
		})
		.object.merge({
			link2: "link2"
		})
	)
	.std.out()
