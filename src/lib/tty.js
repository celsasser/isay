/**
 * User: curtis
 * Date: 2019-03-14
 * Time: 02:27
 * Copyright @2019 by Xraymen Inc.
 */

const {ModuleBase}=require("./_base");

/**
 * Terminal API
 * @typedef {ModuleBase} ModuleTty
 */
class ModuleTty extends ModuleBase {
	/**
	 * Clears window in which application is running
	 * @param {DataBlob} blob
	 * @returns {Promise<*>}
	 * @throws {Error}
	 */
	async clear(blob) {
		if(process.stdout.isTTY) {
			process.stdout.cursorTo(0, 0);
			process.stdout.clearScreenDown();
			return blob;
		} else {
			throw new Error("must be run in TTY");
		}
	}
}

module.exports={
	ModuleTty
};
