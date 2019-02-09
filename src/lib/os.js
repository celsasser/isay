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
			process.stderr.on("data", data=>{
				data=data.toString("utf8");
				output.err=`${output.err}${data}`;
				// log.verbose(`- os.${this.action}.stderr: ${data}`);
			});
			process.stdout.on("data", data=>{
				data=data.toString("utf8");
				output.out=`${output.out}${data.toString("utf8")}`;
				// log.debug(`- os.${this.action}.stdout: ${data}`);
			});
			process.on("close", code=>{
				if(code>0) {
					reject(new Error(output.err || output.out));
				} else {
					resolve(output.out);
				}
			});
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
