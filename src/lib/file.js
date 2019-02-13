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
	 * [data, params[0], params[1]]
	 * @param {DataBlob} data
	 * @return {Promise<void>}
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
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.param[0]</data> will be used as the path
	 * @param data
	 * @return {Promise<void>}
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
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.param[0]</data> will be used as the path
	 *  Encoding data may be specified in either <code>this.param[0]</code> or <code>this.param[1]</code>
	 *  depending in where the path is specified
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 */
	async delete(data) {
		const path=this._getReadPath(data);
		return fs.remove(path)
			.then(Promise.resolve.bind(Promise, data));
	}

	/**
	 * Reads path specified as either input data or param data:
	 *  - if <param>data</param> is not empty then it will be used as the path
	 *  - if <param>data</param> is empty then <code>this.param[0]</data> will be used as the path
	 *  Encoding data may be specified in either <code>this.param[0]</code> or <code>this.param[1]</code>
	 *  depending in where the path is specified
	 * @param {string|undefined} data
	 * @returns {Promise<DataBlob>}
	 */
	async read(data) {
		const {path, encoding}=this._getReadPathAndOptions(data);
		return fs.readFile(path, {encoding});
	}

	/**
	 * Writes data to path that should be in <code>this.param[0]</code>.
	 * Encoding and append options may be in <code>this.param[1]</code>: ["append", "encoding"]
	 * @param {Object} data
	 * @returns {Promise<DataBlob>}
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
	 * Zips up all file paths in <param>blob</param>. It expects the target archive to be in <code>params[0]</code>
	 * and optional options in <code>params[1]</code>
	 * Note: this guy assumes that zip is in the user's path. It's a cheap and light weight way of pulling off zip
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async zip(blob) {
		this._assertType(blob, ["String", "Array"]);
		this._assertType(this.params[0], "String");
		// if we don't terminate it with .zip then zip will. We want the final name so that we may
		// find it when we want to remove it (if we remove it)
		const archive=this.params[0].endsWith(".zip")
			? this.params[0]
			: `${this.params[0]}.zip`;
		const {replace}=Object.assign({
			replace: true
		}, this.params[1]);
		const files=_.isArray(blob)
			? blob
			: [blob];
		const options=["-q"];
		const _preprocess=()=>(replace)
			? fs.remove(archive)
			: Promise.resolve();

		return _preprocess()
			.then(spawn.command.bind(null, {
				args: options
					.concat([archive])
					.concat(files),
				command: "zip"
			}))
			.then(Promise.resolve.bind(Promise, blob));
	}
}

module.exports={
	ModuleFile
};
