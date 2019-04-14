/**
 * User: curtis
 * Date: 2019-02-09
 * Time: 20:38
 * Copyright @2019 by Xraymen Inc.
 */

const {spawn}=require("child_process");
const fs=require("fs-extra");
const os=require("os");
const node_path=require("path");
const shortid=require("shortid");
const constant=require("../common/constant");
const {XRayError}=require("../common/error");


/**
 * Launches editor and returns the results
 * @param {string} template - data to prep editor with
 * @return {Promise<string>}
 */
async function getScript({
	template=""
}={}) {
	const path=await _createTmpFile(template),
		editor=_findEditor(),
		options=_editorToSpawnOptions({editor, path});
	await _edit({editor, options, path});
	return fs.readFile(path, {
		encoding: "utf8"
	});
}

/**
 * Creates a temporary file with <param>data</param> in it
 * @param {string} data
 * @return {Promise<string>}
 * @private
 */
function _createTmpFile(data) {
	const uri=node_path.join(os.tmpdir(), shortid.generate()+".js");
	return fs.writeFile(uri, data, {
		encoding: "utf8"
	}).then(Promise.resolve.bind(Promise, uri));
}

/**
 * Attempts to find text editor preferred in the current environment
 * @returns {string}
 * @private
 */
function _findEditor() {
	if(process.env.EDIT) {
		return process.env.EDIT;
	} else if(process.env.VISUAL) {
		return process.env.VISUAL;
	} else {
		return "vim";
	}
}

/**
 * Rub the editor the right way
 * @param {string} editor
 * @param {string} path
 * @returns {Array<string>}
 * @private
 */
function _editorToSpawnOptions({editor, path}) {
	if(editor.startsWith("vi")) {
		return require("./_vi").getSpawnOptions({editor, path});
	}
	// todo: insert your favorite editors here.
	return [path];
}

/**
 * Edit file at <param>path</param>
 * @param {string} editor
 * @param {Array<string>} options
 * @param {string} path
 * @return {Promise<string>}
 * @throws {Error}
 * @private
 */
function _edit({editor, options, path}) {
	return new Promise((resolve, reject)=>{
		// vim, nano, emacs all write directly to the tty.  If we are being run from
		// a terminal (which we should be) then our stdin and stdout should be tty versions
		// of streams.  We want our child to inherit these guys.
		const child=spawn(editor, options, {
			stdio: "inherit"
		});
		child.on("exit", code=>{
			if(code===0) {
				resolve(path);
			} else {
				reject(new XRayError({
					code: constant.error.code.ABORT
				}));
			}
		});
	});
}

module.exports={
	getScript
};

