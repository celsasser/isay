/**
 * User: curtis
 * Date: 2019-02-09
 * Time: 20:38
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Gets params for spawning vi or vim
 * @param {string} editor
 * @param {string} path
 * @returns {Array<string>}
 */
function getSpawnOptions({editor, path}) {
	return [
		// move to the end
		"+normal G",
		// open in insert mode
		"+startinsert",
		// and the file we want to open
		path
	];
}

module.exports={
	getSpawnOptions
};
