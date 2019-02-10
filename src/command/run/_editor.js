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


/**
 * Launches editor and returns the results
 * @param {string} template - data to prep editor with
 * @return {Promise<void>}
 */
async function getScript({
	template=""
}={}) {
	const filePath=await _createTmpFile(template);
	await _edit(filePath);
	return fs.readFileSync(path, {
		encoding: "utf8"
	});
}

/**
 * Creates a temporary file with <param>data</param> in it
 * @param {string} data
 * @return {Promise<string>}
 * @private
 */
async function _createTmpFile(data) {
	const uri=path.join(os.tmpdir(), shortid.generate()+".js");
	return fs.writeFile(uri, data, {
		encoding: "utf8"
	}).then(()=>uri);
}

/**
 * Edit file at <param>path</param>
 * @param {string} path
 * @return {Promise<void>}
 * @private
 */
async function _edit(path) {
	const editor=process.env.EDIT
		|| process.env.VISUAL
		|| "vim";
	return new Promise((resolve, reject)=>{
		// vim, nano, emacs all write directly to the tty.  If we are being run from
		// a terminal (which we should be) then our stdin and stdout should be tty versions
		// of streams.  We want our child to inherit these guys.
		const child=spawn(editor, [path], {
			stdio: "inherit"
		});
		child.on("exit", code=>{
			if(code===0) {
				resolve();
			} else {
				reject(new Error("aborted editor"));
			}
		});
	});
}

module.exports={
	getScript
};

