/**
 * User: curtis
 * Date: 2019-02-04
 * Time: 23:41
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");

/**
 * Parses what is assumed to be a command as it would be split by bash quoting rules:
 * https://www.gnu.org/software/bash/manual/html_node/Quoting.html
 * @param {string} line
 * @returns {Array<string>}
 */
function shell(line) {
	if(_.isEmpty(line)) {
		return [];
	} else {
		// (".+?(?<!\\)") - looks for double quoted strings
		// ('.+(?<!')') - looks for single quoted strings
		// ([^\s\\]|(\\.))+ - looks for all other text included escaped space
		return line
			.match(/(".+?(?<!\\)")|('.+(?<!')')|([^\s\\]|(\\.))+/g);
	}
}

module.exports={
	shell
};
