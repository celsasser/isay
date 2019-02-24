/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const fs=require("fs-extra");
const path=require("path");
const {ModuleIO}=require("./_io");
const spawn=require("../common/spawn");

/**
 * read and write file support for any and all data types
 * @typedef {ModuleIO} ModuleFile
 */
class ModuleFile extends ModuleIO {
	/**
	 * It copies the source file or directory to the target path.  The rules for finding the source and target
	 * path treat the params as a sequence: [source, target]. And it looks for them in the following order:
	 * @resolves source:string in data|this.params[0]
	 * @resolves target:string in this.params[0]|this.params[1]
	 * @param {DataBlob} data
	 * @return {Promise<void>}
	 * @throws {Error}
	 */
	async copy(data) {
		let source, target;
		if(data) {
			source=data;
			target=this.params[0];
		} else {
			source=this.params[0];
			target=this.params[1];
		}
		this._assetPath(source);
		this._assetPath(target);
		// copy assumes that the target points to the file that you want to copy to. We want to behave
		// more like the shell: if the source is a file and the target is a directory then we will
		// append the source name and extension to the target.
		const targetExists=fs.pathExistsSync(target);
		if(targetExists) {
			const sourceStats=fs.lstatSync(source);
			if(sourceStats.isFile()) {
				const targetStats=fs.lstatSync(target);
				if(targetStats.isDirectory()) {
					const parsed=path.parse(source);
					target=path.join(target, `${parsed.name}${parsed.ext}`);
				}
			}
		}
		return fs.copy(source, target)
			.then(Promise.resolve.bind(Promise, data));
	}

	/**
	 * This guy will force the file to either be:
	 * - created because it doesn't exist
	 * - truncated to 0 length and saved
	 * It looks for the path as follows:
	 * @resolves path:string in data|this.params[0]
	 * @param {string|undefined} data
	 * @return {Promise<void>}
	 * @throws {Error}
	 */
	async create(data) {
		const path=this._getReadPath(data);
		return fs.pathExists(path)
			.then(exists=>{
				return (exists)
					? fs.remove(path)
					: Promise.resolve();
			})
			.then(fs.outputFile.bind(fs, path, ""))
			.then(Promise.resolve.bind(Promise, data));
	}

	/**
	 * Removes the file or directory if it exists. Rules for finding path:
	 * @resolves path:string in data|this.params[0]
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async delete(data) {
		const path=this._getReadPath(data);
		return fs.remove(path)
			.then(Promise.resolve.bind(Promise, data));
	}

	/**
	 * Reads path specified as either input data or param data:
	 * @resolves path:string in data|this.params[0]
	 * @resolves options:(Object|undefined) in this.params[0]|this.params[1]
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async read(data) {
		const {path, encoding}=this._getReadPathAndOptions(data);
		return fs.readFile(path, {encoding});
	}

	/**
	 * Writes data to file
	 * @resolves path:string in this.params[0]
	 * @resolves options:(undefined|Object) in this.params[1]
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async write(data) {
		const {append, encoding, path}=this._getWritePathAndOptions({
			append: false,
			encoding: "utf8"
		});
		return fs.outputFile(path, data, {
			encoding,
			flag: (append) ? "a" : "w"
		}).then(Promise.resolve.bind(Promise, data));
	}

	/**
	 * Zips up all file paths
	 * @resolves files:Array<string> in data
	 * @resolves archive:string in this.params[0]
	 * @resolves options:(undefined|Object) this.params[1]
	 * @param {DataBlob} data
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async zip(data) {
		this._assertType(data, ["String", "Array"]);
		this._assertType(this.params[0], "String");
		// if we don't terminate it with .zip then zip will. We want the final name so that we may
		// find it when we want to remove it (if we remove it)
		const archive=this.params[0].endsWith(".zip")
			? this.params[0]
			: `${this.params[0]}.zip`,
			archiveParsed=path.parse(archive);
		const {replace}=Object.assign({
			replace: true
		}, this.params[1]);
		const files=_.isArray(data)
			? data
			: [data];
		const options=["-q"];

		return ((replace)
			? fs.remove(archive)
			: Promise.resolve())
			.then(()=>fs.ensureDir(archiveParsed.dir))
			.then(spawn.command.bind(null, {
				args: options
					.concat([archive])
					.concat(files),
				command: "zip"
			}))
			.then(Promise.resolve.bind(Promise, data));
	}
}

module.exports={
	ModuleFile
};
