/**
 * User: curtis
 * Date: 2019-02-03
 * Time: 9:58
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {spawn}=require("child_process");
const {ModuleBase}=require("./base");
const parse=require("../common/parse");
const log=require("../common/log");

/**
 * @typedef {ModuleBase} ModuleStd
 */
class ModuleOs extends ModuleBase {
	/**
	 * This is the single point through which we send all command requests.
	 * @param {Object} blob
	 * @returns {Promise<DataBlob>}
	 */
	async executionHandler(blob) {
		const args=this._parseParams(),
			input=_.isEmpty(blob)
				? ""
				: _.isObject(blob)
					? JSON.stringify(blob)
					: blob.toString();

		return new Promise((resolve, reject)=>{
			const output={
				err: "",
				out: ""
			};
			const process=spawn(this.action, args, {
				shell: true
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
			["disconnect", "message"].forEach(event=>{
				process.on(event, (...args)=>{
					log.warn(`${this.domain}.${this.action}: received unhandled event=${event}, args=${JSON.stringify(args)}`);
				});
			});
			// if there is input data then we assume that it is to be piped as input
			if(input.length>0) {
				process.stdin.write(input, "utf8");
			}
		});
	}

	/********************* Private Interface *********************/
	/**
	 * Parse the <code>this.params</code>. If there is a single param then we assume that the
	 * client has specified all of the params as a single argument. If there are more than 1
	 * then we assume that we are to parse the input by shell delimiter rules.
	 * @return {Array<string>}
	 * @private
	 */
	_parseParams() {
		return (this.params.length<=1)
			? this.params
			: parse.shell(this.params[0]);
	}
}

module.exports={
	ModuleOs
};
