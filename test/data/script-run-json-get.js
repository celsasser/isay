/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Example of loading and extracting data from a json file and writing the result to stdout
 */
json.read("./test/data/data-pet.json")
	.object.get("george.type")
	.std.out()
