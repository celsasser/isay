/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:32
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
const {createChain}=require("./_chain");
const editor=require("./_editor");
const {parseScript}=require("./_parse");
const {XRayError}=require("../../common/error");
const {toLocalPath}=require("../../common/file");
const log=require("../../common/log");

/**
 * @param {CliParsed} configuration
 * @returns {Promise<DataBlob>}
 */
exports.run=async function(configuration) {
	try {
		log.verbose("- parsing script");
		const script=await _loadScript(configuration),
			descriptors=parseScript(script);
		log.verbose("- building pipeline");
		const chain=createChain(descriptors),
			stdin=await _readStdin();
		log.verbose("- processing pipeline");
		return chain.process(stdin);
	} catch(error) {
		return Promise.reject(new XRayError({
			error,
			message: "run failed"
		}));
	}
};

/**
 * Finds the "run" script and returns it if it's in our configuration otherwise launches
 * the users preferred terminal editor to get it.
 * @param {CliParsed} configuration
 * @returns {string}
 * @private
 */
async function _loadScript(configuration) {
	if(configuration.options.script) {
		return fs.readFile(configuration.options.script, {encoding: "utf8"});
	} else if(_.isEmpty(configuration.params[0])===false) {
		return configuration.params[0];
	} else {
		return fs.readFile(toLocalPath("./res/template-run.js"), {encoding: "utf8"})
			.then(template=>editor.getScript({
				template
			}));
	}
}

/**
 * Looks to see if there is any data redirected to our stdin
 * @returns {Promise<string>}
 * @private
 */
async function _readStdin() {
	return new Promise((resolve, reject)=>{
		if(process.stdin.isTTY) {
			// We are looking for redirected input. We don't treat tty input as stdin.
			resolve();
		} if(process.stdin.constructor.name==="Socket") {
			// I am looking for a way to know whether we are in webstorm (which is not a TTY which also is not going to give us any goodies)
			resolve();
		} else {
			let buffer="",
				_cleanup=function() {
					process.stdin.removeAllListeners("data");
					process.stdin.removeAllListeners("error");
					process.stdin.removeAllListeners("end");
				};
			process.stdin.setEncoding("utf8");
			process.stdin.on("data", data=>{
				buffer+=data.toString("utf8");
			});
			process.stdin.on("error", error=>{
				_cleanup();
				reject(error);
			});
			process.stdin.on("end", ()=>{
				_cleanup();
				resolve(buffer);
			});
		}
	});
};
