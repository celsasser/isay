/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Example of setting data in a JSON object and writing to stdout
 */
json.read("./test/data/data-pet.json")
	.object.set("helen", {type: "cat"})
	.std.out()
