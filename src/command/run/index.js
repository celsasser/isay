/**
 * Date: 2019-02-01
 * Time: 00:32
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const fs=require("fs-extra");
const {toLocalPath}=require("../../common/file");
const log=require("../../common/log");
const editor=require("../../editor");
const {runScript}=require("../../interpret/execute");
const {loadLibrary}=require("../../lib");

/**
 * @param {CliParsed} configuration
 * @returns {Promise<DataBlob>}
 * @throws {Error}
 */
exports.run=async function(configuration) {
	log.verbose("- loading library");
	const library=loadLibrary();
	log.verbose("- loading script");
	const script=await _loadScript(configuration);
	log.verbose("- loading stdin");
	const input=configuration.options.hasOwnProperty("input")
		? configuration.options.input
		: await _readStdin();
	log.verbose("- running script");
	return await runScript({input, library, script});
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
	/**
	 * Whether there is potentially usable stdin
	 * @return {boolean}
	 */
	function _canReadStdin() {
		if(process.stdin.isTTY) {
			// We are looking for redirected input. We don't treat tty input as stdin.
			return false;
		}
		if(/webstorm/i.test(_.get(process.env, "XPC_SERVICE_NAME", ""))) {
			// looks like we are being run from within webstorm
			return false;
		}
		return true;
	}

	return new Promise((resolve, reject)=>{
		if(_canReadStdin()===false) {
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
}
