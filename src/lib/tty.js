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
		this._assertTty();
		process.stdout.cursorTo(0, 0);
		process.stdout.clearScreenDown();
		return blob;
	}

	/**
	 * Returns the number of columns in the terminal
	 * @return {Promise<Number>}
	 */
	async height() {
		this._assertTty();
		return process.stdout.rows;
	}

	/**
	 * Returns the number of rows in the terminal
	 * @return {Promise<Number>}
	 */
	async width() {
		this._assertTty();
		return process.stdout.columns;
	}

	/********************* Private Interface *********************/
	_assertTty() {
		if(!process.stdout.isTTY) {
			throw new Error("must be in a terminal (TTY)");
		}
	}
}

module.exports={
	ModuleTty
};
