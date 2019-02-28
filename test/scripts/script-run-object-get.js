/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Testing object.get
 */
json.read("./test/data/data-pet.json")
	.object.get("george.type")
	.std.out()
