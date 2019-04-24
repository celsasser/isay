/**
 * Date: 2019-02-13
 * Time: 20:49
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const child=require("child_process");
const log=require("../common/log");

/**
 * Executes command and, by default, waits for it to finish if in async mode
 * @param {Array<string>} args
 * @param {string} command
 * @param {boolean} detached
 * @param {string|Buffer|undefined} input
 * @param {Stream} stderr - optional outlet to which spawned process's stderr will be piped
 * @param {Stream} stdout - optional outlet to which spawned process's stdout will be piped
 * @param {boolean} shell - whether to run command in a shell
 * @returns {Promise<*>}
 */
async function command({
	args=[],
	command,
	detached=false,
	input=undefined,
	stderr=undefined,
	stdout=undefined,
	shell=true
}) {
	return new Promise((resolve, reject)=>{
		const bufferedOutput={
			err: "",
			out: ""
		};
		const spawed=child.spawn(command, args, {
			detached,
			shell
		});

		resolve=_.once(resolve);
		reject=_.once(reject);
		if(stdout) {
			spawed.stdout.pipe(stdout);
		}
		if(stderr) {
			spawed.stderr.pipe(stderr);
		}
		// standard error: we track it and use it if our exit code is error
		spawed.stderr.on("data", data=>{
			data=data.toString("utf8");
			bufferedOutput.err=`${bufferedOutput.err}${data}`;
		});
		// standard out: we track it and use it if our exit code is not in error
		spawed.stdout.on("data", data=>{
			data=data.toString("utf8");
			bufferedOutput.out=`${bufferedOutput.out}${data.toString("utf8")}`;
		});
		spawed.on("close", code=>{
			if(code>0) {
				const text=(bufferedOutput.err || bufferedOutput.out || "").trim();
				reject(new Error(text));
			} else {
				resolve(bufferedOutput.out);
			}
		});
		spawed.on("error", error=>{
			reject(error);
		});
		// keep our eyes peeled for events we are not actively monitoring
		[
			"disconnect",
			"message"
		].forEach(event=>{
			spawed.on(event, (...args)=>{
				log.warn(`spawn.command: received unhandled event=${event}, args=${JSON.stringify(args)}`);
			});
		});
		// if there is input data then we assume that it is to be written as input
		if(_.isEmpty(input)===false) {
			spawed.stdin.write(input, "utf8");
		}
	});
}

module.exports={
	command
};
