/**
 * User: curtis
 * Date: 2019-02-12
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleBase}=require("../../../src/lib/_base");

describe("lib.ModuleBase", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleBase({
			action,
			domain,
			method,
			params
		});
	}
});
