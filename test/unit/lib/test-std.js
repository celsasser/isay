/**
 * User: curtis
 * Date: 2019-02-08
 * Time: 10:06 PM
 * Copyright @2019 by Xraymen Inc.
 */

const assert=require("../../support/assert");
const {ModuleStd}=require("../../../src/lib/std");

describe("lib.ModuleStd", function() {
	function _createInstance({
		action="action",
		domain="parse",
		method="method",
		params=[]
	}={}) {
		return new ModuleStd({
			action,
			domain,
			method,
			params
		});
	}

	describe("error", function() {

	});

	describe("out", function() {

	});
});
