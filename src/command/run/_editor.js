/**
 * User: curtis
 * Date: 2019-02-09
 * Time: 20:38
 * Copyright @2019 by Xraymen Inc.
 */

const {spawn}=require("child_process");
const fs=require("fs-extra");
const os=require("os");
const path=require("path");
const shortid=require("shortid");
const constant=require("../../common/constant");
const {XRayError}=require("../../common/error");


/**
 * Launches editor and returns the results
 * @param {string} template - data to prep editor with
 * @return {Promise<string>}
 */
async function getScript({
	template=""
}={}) {
	const filePath=await _createTmpFile(template);
	await _edit(filePath);
	return fs.readFile(filePath, {
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
	const uri=path.join(os.tmpdir(), shortid.generate()+".js");
	return fs.writeFile(uri, data, {
		encoding: "utf8"
	}).then(Promise.resolve.bind(Promise, uri));
}

/**
 * Edit file at <param>path</param>
 * @param {string} path
 * @return {Promise<string>}
 * @throws {Error}
 * @private
 */
function _edit(path) {
	/**
	 * @param {string} editor
	 * @returns {Array<string>}
	 */
	function _editorToOptions(editor) {
		if(editor.startsWith("vi")) {
			return [
				// move to the end
				"+normal G",
				// open in insert mode
				"+startinsert",
				// and the file we want to open
				path
			];
		}
		// todo: insert your favs.
		return [path];
	}

	const editor=process.env.EDIT
		|| process.env.VISUAL
		|| "vim",
		options=_editorToOptions(editor);
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
					statusCode: constant.status.code.ABORT
				}));
			}
		});
	});
}

module.exports={
	getScript
};

