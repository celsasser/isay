/**
 * Date: 2019-02-18
 * Time: 21:48
 * @license MIT (see project's LICENSE file)
 */

const node_path=require("path");
const {ModuleBase}=require("./_base");
const {assertType, resolveType}=require("./_data");

/**
 * Basic set of path manipulation functions
 * @typedef {ModuleBase} ModulePath
 */
class ModulePath extends ModuleBase {
	/**
	 * Returns absolute path of <param>path</param>. Defaults the relative-from location to <code>process.cwd()</code>
	 * @resolves path:string in data
	 * @resolves from:string=process.cwd() in this.params[0]
	 * @param {string} path
	 * @returns {Promise<string>}
	 */
	async absolute(path) {
		const from=await resolveType(path, this.params[0], "String", {
			defaultUndefined: process.cwd()
		});
		assertType(path, "String");
		return node_path.resolve(from, path);
	}

	/**
	 * Returns relative path of <param>path</param>. Defaults the relative-from location to <code>process.cwd()</code>
	 * @resolves path:string in data
	 * @resolves from:string=process.cwd() in this.params[0]
	 * @param {string} path
	 * @returns {Promise<string>}
	 */
	async relative(path) {
		const from=await resolveType(path, this.params[0], "String", {
			defaultUndefined: process.cwd()
		});
		assertType(path, "String");
		return node_path.relative(from, path);
	}
}

module.exports={
	ModulePath
};
