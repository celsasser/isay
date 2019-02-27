/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 8:16 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Testing json.stringify
 */
json.read("./test/data/data-pet.json")
	.json.stringify({compact: true})
	.std.out()
