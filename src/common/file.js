/**
 * User: curtis
 * Date: 2/14/18
 * Time: 1:47 PM
 * Copyright @2018 by Xraymen Inc.
 *
 * @module common/file
 * @requires node
 * @requires "fs-extra"
 */

const fs=require("fs-extra");
const jsyaml=require("js-yaml");
const path=require("path");
const util=require("./util");

/**
 * Returns full path that travels well regardless of what the current directory is
 * @param {string} relativeToRoot - relative to the project's root directory.
 * @return {string}
 */
function toLocalPath(relativeToRoot) {
	const root=path.resolve(__dirname, "../..");
	return path.join(root, relativeToRoot);
}

/**
 * Determines from path how file is encoded and attempts to do the right thing
 * @param {string} uri
 * @param {string} encoding
 * @param {boolean} local - will apply <code>toLocalPath</code> to uri if true
 * @param {Object} options
 * @param {Function} callback
 * @return {Promise<Object>}
 */
async function readToJSON(uri, {
	encoding="utf-8",
	local=false,
	...options
}={}) {
	if(local) {
		uri=toLocalPath(uri);
	}
	const parsed=path.parse(uri);
	options=Object.assign({encoding, ...options});
	// todo: why is this logging "(node:15295) DeprecationWarning: Deprecation Warning: Suites do not support a return value;load returned :[object Promise]"
	return fs.readFile(uri, options)
		.then(data=>{
			if(parsed.ext.toLowerCase()===".yaml") {
				return jsyaml.safeLoad(data);
			} else {
				return JSON.parse(data);
			}
		});
}

/**
 * Determines from path how file is encoded and attempts to do the right thing
 * @param {string} uri
 * @param {string} encoding
 * @param {boolean} local - will apply <code>toLocalPath</code> to uri if true
 * @param {Object} options
 * @return {Object}
 */
function readToJSONSync(uri, {
	encoding="utf-8",
	local=false,
	...options
}={}) {
	if(local) {
		uri=toLocalPath(uri);
	}
	const parsed=path.parse(uri);
	options=Object.assign({encoding, ...options});
	if(parsed.ext.toLowerCase()===".yaml") {
		return jsyaml.safeLoad(fs.readFileSync(uri, options));
	} else {
		return fs.readJSONSync(uri, options);
	}
}

/**
 * @param {string} uri
 * @param {*} data
 * @param {Boolean} async
 * @param {Boolean} createPath
 * @param {string} encoding
 * @param {string} flag
 * @param {number} mode
 * @returns {Promise<boolean>|undefined}
 * @throws {Error} only if in sync mode
 */
function writeJSON({
	uri, data,
	async=true,
	createPath=true,
	encoding="utf8",
	flag=undefined,
	mode=undefined
}) {
	if(typeof (data)!=="string") {
		data=JSON.stringify(data);
	}
	return exports.writeFile({uri, data, async, createPath, encoding, flag, mode});
}


/**
 * @param {string} uri
 * @param {*} data
 * @param {Boolean} async
 * @param {Boolean} createPath
 * @param {string} encoding
 * @param {string} flag
 * @param {number} mode
 * @returns {Promise<boolean>|undefined}
 * @throws {Error} only if in sync mode
 */
function writeFile({
	uri, data,
	async=true,
	createPath=true,
	encoding=undefined,
	flag=undefined,
	mode=undefined
}) {
	const parsed=path.parse(uri),
		options=util.scrubObject({encoding, flag, mode});
	if(async) {
		return fs.pathExists(parsed.dir)
			.then((exists)=>{
				return (!exists && createPath)
					? fs.mkdirs(parsed.dir)
					: Promise.resolve();
			})
			.then(()=>fs.writeFile(uri, data, options));
	} else {
		if(!fs.pathExistsSync(parsed.dir)) {
			if(createPath) {
				fs.mkdirsSync(parsed.dir);
			}
		}
		fs.writeFileSync(uri, data, options);
	}
}

module.exports={
	toLocalPath,
	readToJSON,
	readToJSONSync,
	writeFile,
	writeJSON
};

