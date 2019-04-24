/**
 * Date: 2019-02-03
 * Time: 9:58
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {resolveType}=require("./_data");
const parse=require("../common/parse");
const spawn=require("../common/spawn");

/**
 * @typedef {ModuleBase} ModuleOs
 */
class ModuleOs extends ModuleBase {
	/**
	 * This is the single point through which we send all OS command requests.
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async executionHandler(blob) {
		const {
				options={},
				params
			}=ModuleOs._preprocessParams(this.params),
			args=await ModuleOs._paramsToArguments(blob, params),
			input=_.isEmpty(blob)
				? ""
				: _.isObject(blob)
					? JSON.stringify(blob)
					: blob;
		return spawn.command({
			args: args,
			command: this.action,
			input: input,
			output: (options.stdout==="live")
				? process.stdout
				: undefined
		});
	}

	/********************* Private Interface *********************/
	/**
	 * Parse the <param>params</param>. If there is a single param then we assume that the
	 * client has specified all of the params as a single argument. If there are more than 1
	 * then we assume that we are to parse the input by shell delimiter rules.
	 * @param {DataBlob} blob
	 * @param {Array<*>} params
	 * @return {Array<string>}
	 * @private
	 */
	static async _paramsToArguments(blob, params) {
		async function _parse(param) {
			if(_.isFunction(param)) {
				return _parse(await resolveType(blob, param, "*", {allowNullish: true}));
			} else if(typeof(param)==="string") {
				return parse.shell(param);
			} else {
				return param;
			}
		}
		return (params.length===1)
			? _parse(params[0])
			: params;
	}

	/**
	 * Here we look for options to us vs. the command. If we find them we return them and remove
	 * that param from the response's <code>params</code>
	 * @param {Array<*>} params
	 * @returns {options:Object=undefined, params:Array<*>}
	 * @private
	 */
	static _preprocessParams(params) {
		const lastParam=_.last(params);
		if(_.isObject(lastParam)) {
			const keys=Object.keys(lastParam);
			// let's make sure it looks like it is meant for us and we do so by making sure
			// we support all specified properties. Bugs will be able to fake us out.
			if(_.intersection(Object.keys(lastParam), ["stdout"]).length===keys.length) {
				return {
					options: lastParam,
					params: params.slice(0, params.length-1)
				};
			}
		}
		return {
			params
		};
	}
}

module.exports={
	ModuleOs
};
