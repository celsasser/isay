/**
 * Date: 2019-02-10
 * Time: 00:21
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const fs=require("fs-extra");
const node_path=require("path");
const {ModuleIO}=require("./_io");
const {assertType, getType, resolveType}=require("./_data");
const spawn=require("../common/spawn");

/* eslint-disable indent */

/**
 * file support for any and all data types
 * @typedef {ModuleIO} ModuleFile
 */
class ModuleFile extends ModuleIO {
	/**
	 * It copies the source file or directory to the target path.
	 * See <code>_copy</code> for param order processing rules and info
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async copy(blob) {
		return this._copy(blob)
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * This guy will force the file to either be:
	 * - created because it doesn't exist
	 * - or will delete it and recreate it
	 * See resolution rules at <link>_getReadPathAndOptions</link>
	 * @param {string|undefined} blob
	 * @return {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async create(blob) {
		const {path, type}=await this._getReadPathAndOptions(blob),
			directory=_.includes(["dir", "directory"], (type||"").toLocaleLowerCase());
		return fs.pathExists(path)
			.then(exists=>{
				return (exists)
					? fs.remove(path)
					: Promise.resolve();
			})
			.then(()=>{
				return (directory)
					? fs.mkdir(path)
					: fs.outputFile(path, "");
			})
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * Removes the file or directory if it exists. See resolution rules at <link>_getReadPath</link>
	 * @param {string|undefined} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async delete(blob) {
		const path=await this._getReadPath(blob);
		return fs.remove(path)
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * Ensures that the file or directory pointed to by "path" exists. See resolution rules at <link>_getReadPathAndOptions</link>
	 * @param {string|undefined} blob
	 * @return {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async ensure(blob) {
		const {path, type}=await this._getReadPathAndOptions(blob),
			directory=_.includes(["dir", "directory"], (type||"").toLocaleLowerCase());
		return fs.pathExists(path)
			.then(exists=>{
				if(exists) {
					// here we are making sure that the existing file is of the desired type
					return fs.lstat(path)
						.then(stat=>{
							if(directory) {
								if(stat.isDirectory()===false) {
									throw new Error(`"${path}" already exists but is not a directory`);
								}
							} else if(stat.isFile()===false) {
								throw new Error(`"${path}" already exists but is not a file`);
							}
						});
				} else {
					return (directory)
						? fs.mkdir(path)
						: fs.outputFile(path, "");
				}
			})
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * A convenience function that combines copy and delete.
	 * See <code>_copy</code> for param order processing rules and info
	 * @param {DataBlob} blob
	 * @return {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async move(blob) {
		return this._copy(blob)
			.then(({source})=>fs.remove(source))
			.then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * Loads file. See resolution rules at <link>_getReadPathAndOptions</link>.
	 * @param {string|undefined} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async read(blob) {
		const {path, encoding}=await this._getReadPathAndOptions(blob);
		return fs.readFile(path, {encoding});
	}

	/**
	 * Writes data to file. See resolution rules at <link>_getWritePathAndOptions</link>
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async write(blob) {
		const {append, encoding, mode, path}=await this._getWritePathAndOptions(blob, {append: false});
		return fs.outputFile(path, blob, {
			encoding,
			flag: (append) ? "a" : "w",
			mode
		}).then(Promise.resolve.bind(Promise, blob));
	}

	/**
	 * Zips up all file paths
	 * @resolves files:Array<string> in data
	 * @resolves archive:string in this.params[0]
	 * @resolves options:(undefined|Object) this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async zip(blob) {
		assertType(blob, ["String", "Array"]);
		const param0=await resolveType(blob, this.params[0], "String"),
			param1=await resolveType(blob, this.params[1], "Object", {allowNullish: true});
		// if we don't terminate it with .zip then zip will. We want the final name so that we may
		// find it when we want to remove it (if we remove it)
		const archivePath=param0.endsWith(".zip") ? param0 : `${param0}.zip`,
			archiveParsed=node_path.parse(archivePath),
			{replace}=Object.assign({replace: true}, param1),
			files=_.isArray(blob) ? blob : [blob],
			options=["-q"];

		return ((replace)
			? fs.remove(archivePath)
			: Promise.resolve())
				.then(()=>fs.ensureDir(archiveParsed.dir))
				.then(spawn.command.bind(null, {
					args: options
						.concat([archivePath])
						.concat(files),
					command: "zip"
				}))
				.then(Promise.resolve.bind(Promise, blob));
	}

	/**************** Private Interface ****************/
	/**
	 * Copies the source file or directory to the target path.  The rules for finding the source and target
	 * path treat the params as a sequence: [source, target]. And it looks for them in the following order:
	 * @resolves source:string in this.params[0]|data
	 * @resolves target:string in this.params[1]|this.params[0]
	 * @resolves options:Object in this.params[1]|this.params[2]
	 * @param {DataBlob} blob
	 * @return {Promise<{source:string, target:string}>}
	 * @throws {Error}
	 */
	async _copy(blob) {
		let source, target, options;
		const param0=await resolveType(blob, this.params[0], "String"),
			param1=await resolveType(blob, this.params[1], ["Object", "String"], {allowNullish: true});
		if(getType(param1)==="String") {
			source=param0;
			target=param1;
			options=await resolveType(blob, this.params[2], "Object", {allowNullish: true});
		} else {
			source=assertType(blob, "String");
			target=param0;
			options=param1;
		}
		options=options || {};
		// Keeping with i-say's rule of creating hierarchy that does not exists, we are going to
		// ensure that as much of the target that can be known to be directories exists
		await this._ensureDirectoryHierarchy(target);
		if(options.rebuild) {
			// in this case they are asking that we rebuild the hierarchy of the source. We assume
			// that the target they gave to us is a path. All we need to do is append the target to it.
			target=node_path.join(target, source);
		} else {
			// copy assumes that the target points to the file that you want to copy to. We want to behave
			// more like the shell: if the source is a file and the target is a directory then we will
			// append the source name and extension to the target.
			const targetExists=fs.pathExistsSync(target);
			if(targetExists) {
				const sourceStats=fs.lstatSync(source);
				if(sourceStats.isFile()) {
					const targetStats=fs.lstatSync(target);
					if(targetStats.isDirectory()) {
						const parsed=node_path.parse(source);
						target=node_path.join(target, `${parsed.name}${parsed.ext}`);
					}
				}
			}
		}
		return fs.copy(source, target)
			.then(()=>Promise.resolve({source, target}));
	}

	/**
	 * Ensures that as much of the path that can be determined to be directory hierarchy exists.
	 * If it doesn't it is created.
	 * @param {string} path
	 * @returns {Promise<any>}
	 * @private
	 */
	async _ensureDirectoryHierarchy(path) {
		const hierarchy=_.get(path.match(/^.+\//), 0);
		return (hierarchy)
			? fs.ensureDir(hierarchy)
			: Promise.resolve();
	}
}

module.exports={
	ModuleFile
};
