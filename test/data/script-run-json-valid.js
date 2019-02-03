/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 00:30
 * Copyright @2019 by Xraymen Inc.
 */

json.load("./test/data/json-data-george.json")
	json.set("helen", {type: "cat"})
	.get("george")
	.std.out();
