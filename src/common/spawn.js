/**
 * User: curtis
 * Date: 2019-02-13
 * Time: 20:49
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const child=require("child_process");
const log=require("../common/log");

/**
 * Executes command and, by default, waits for it to finish if in async mode
 * @param {Array<string>} args
 * @param {string} command
 * @param {boolean} detached
 * @param {boolean} shell
 * @param {string|Buffer|undefined} stdin
 * @returns {Promise<*>}
 */
async function command({
	args=[],
	command,
	detached=false,
	shell=true,
	stdin=undefined
}) {
	return new Promise((resolve, reject)=>{
		const output={
			err: "",
			out: ""
		};
		const process=child.spawn(command, args, {
			detached,
			shell
		});

		resolve=_.once(resolve);
		reject=_.once(reject);
		// standard error: we track it and use it if our exit code is error
		process.stderr.on("data", data=>{
			data=data.toString("utf8");
			output.err=`${output.err}${data}`;
		});
		// standard out: we track it and use it if our exit code is not in error
		process.stdout.on("data", data=>{
			data=data.toString("utf8");
			output.out=`${output.out}${data.toString("utf8")}`;
		});
		process.on("close", code=>{
			if(code>0) {
				const text=(output.err || output.out || "").trim();
				reject(new Error(text));
			} else {
				resolve(output.out);
			}
		});
		process.on("error", error=>{
			reject(error);
		});
		// keep our eyes peeled for events we are not actively monitoring
		[
			"disconnect",
			"message"
		].forEach(event=>{
			process.on(event, (...args)=>{
				log.warn(`spawn.command: received unhandled event=${event}, args=${JSON.stringify(args)}`);
			});
		});
		// if there is input data then we assume that it is to be piped as input
		if(_.isEmpty(stdin)===false) {
			process.stdin.write(stdin, "utf8");
		}
	});
}

module.exports={
	command
};
