/**
 * User: curtis
 * Date: 05/27/18
 * Time: 1:22 PM
 * Copyright @2018 by Xraymen Inc.
 *
 * @module horse/cli
 */


const _=require("lodash");
const path=require("path");
const {ACTIONS, OPTIONS}=require("./_spec");
const {XRayError}=require("../common/error");
const file=require("../common/file");
const format=require("../common/format");
const log=require("../common/log");


/**
 * See what is on our command line and do what it wants us to do if we can do it.
 * Note: if this guy fields an error or help request he will print usage info to the console and exit the process.
 * @returns {CliParsed}
 */
exports.parse=function() {
	/**
	 * Parses the command line and stores his goodies
	 */
	class CommandLine {
		/**
		 * @throws {Error}
		 */
		constructor() {
			this.action=null;
			this.options={};
			this.positions=[];
			this.runner=null;
		}

		/**
		 * Parses the command line and packs goodies into `this`
		 */
		parse() {
			let index=_.includes(process.argv[0], "node") ? 1 : 0;
			while(index<process.argv.length) {
				if(_.startsWith(process.argv[index], "-")) {
					index=this._processOption(index);
				} else {
					this.positions.push(process.argv[index]);
					index++;
				}
			}
			this.runner=path.parse(this.positions.shift()).base;
			this.action=this.positions.shift();
		}

		/**
		 * Validates the command line's options and arguments
		 * @throw {Error}
		 */
		validate() {
			if(!this.action) {
				throw new Error(`${this.runner}: no command specified`);
			}
			const action=findAction(this.action);
			if(!action) {
				throw new Error(`${this.runner}: unknown command "${this.action}"`);
			}
			const allSupportedOptions=OPTIONS.filter(option=>_.isEmpty(option.actions) || _.includes(option.actions, this.action)),
				allRequiredOptions=_.filter(allSupportedOptions, {required: true}),
				userUnsupportedOptions=_.difference(Object.keys(this.options), _.map(allSupportedOptions, "keys.long")),
				userMissingOptions=_.difference(_.map(allRequiredOptions, "keys.long"), Object.keys(this.options));
			if(userUnsupportedOptions.length>0) {
				throw new XRayError({
					action: this.action,
					message: `${this.runner} ${this.action}: options ${userUnsupportedOptions.map(name=>`--${name}`)
						.join("|")} not supported by "${this.action}" command`
				});
			}
			if(userMissingOptions.length>0) {
				throw new XRayError({
					action: this.action,
					message: `${this.runner} ${this.action}: required options ${userMissingOptions.map(name=>`--${name}`)
						.join("|")} for "${this.action}" are missing`
				});
			}
			try {
				action.validate(this.positions, this.options);
			} catch(error) {
				throw new XRayError({
					action: this.action,
					message: `${this.runner} ${this.action}: ${error.message}`
				});
			}
		}

		/**
		 * Updates our env
		 */
		updateEnvironment() {
			const defaults=file.readToJSONSync("./res/defaults.json", {local: true});
			log.configure({
				applicationName: this.action,
				logLevel: _.get(this.options, "log.level", defaults.log.level)
			});
		}

		/**
		 * Converts options and params into a result object. It also configures our singleton env.
		 * @returns {CliParsed}
		 */
		toResponse() {
			const result=Object.assign({
					options: {}
				},
				file.readToJSONSync("./res/defaults.json", {local: true}).command[this.action],
				{
					action: this.action,
					params: this.positions
				});
			// setup options. We isolate those that apply to the action being taken. We assume that
			// global options apply to the environment.
			OPTIONS.filter(optionCfg=>_.includes(optionCfg.actions, this.action))
				.forEach(optionCfg=>{
					const key=optionCfg.keys.long;
					if(this.options[key]) {
						_.set(result.options, key, this.options[key]);
					}
				});
			return result;
		}

		/**** Private Interface ****/
		/**
		 * Processes the option that should be at <param>index</param>
		 * @param {number} index
		 * @returns {number}
		 * @private
		 */
		_processOption(index) {
			if(_.startsWith(process.argv[index], "--")) {
				const match=process.argv[index].match(/--([^=]+)=?(.*)/),
					key=match[1],
					value=match[2],
					option=findOption(key);
				if(option==null) {
					throw new Error(`unknown option "${key}"`);
				} else if(option.args.count===0 && value.length!==0) {
					throw new Error(`option "${key}" does not take an argument`);
				} else if(option.args.count===1 && value.length===0) {
					throw new Error(`option "${key}" missing required argument`);
				} else {
					this.options[option.keys.long]=_.isEmpty(value)
						? true
						: value;
				}
			} else {
				const match=process.argv[index].match(/-(\S+)/),
					key=match[1],
					option=findOption(key);
				if(!option) {
					throw new Error(`unknown option "${key}"`);
				} else if(process.argv.length<index+option.args.count) {
					throw new Error(`option "${key}" missing required argument`);
				} else {
					this.options[option.keys.long]=(option.args.count===0)
						? true
						: process.argv[++index];
				}
			}
			return index+1;
		}
	}

	/**
	 * Finds the action
	 * @param {string} name
	 * @returns {CliAction|undefined}
	 */
	function findAction(name) {
		return ACTIONS[name];
	}

	/**
	 * Finds the option by key - short or long
	 * @param {string} key
	 * @returns {CliOption|undefined}
	 */
	function findOption(key) {
		return _.find(OPTIONS, option=>_.includes(Object.values(option.keys), key));
	}

	/**
	 * Report usage of all actions or for a specific action
	 * @param {string} actionName - specific action to show usage for
	 */
	function reportUsage(actionName=undefined) {
		/**
		 * @param {Array<CliOption>} options
		 * @returns {string}
		 */
		function _formatOptions(options) {
			if(_.isEmpty(options)) {
				return "";
			} else {
				options=_.sortBy(options, "keys.long");
				return options.map(option=>{
					const brackets=option.required ? ["<", ">"] : ["[", "]"];
					if(option.args.count===0) {
						return `${brackets[0]}-${option.keys.short}|--${option.keys.long}${brackets[1]}`;
					} else {
						return `${brackets[0]}-${option.keys.short} <${option.args.name}>|--${option.keys.long}=<${option.args.name}>${brackets[1]}`;
					}
				}).join(" ");
			}
		}

		if(actionName) {
			const action=findAction(actionName),
				options=_.chain(OPTIONS)
					.filter(option=>_.isEmpty(option.actions) || _.includes(option.actions, actionName))
					.sortBy("keys.long")
					.value();
			log.info(`Description: ${action.desc}`);
			log.info(`Usage: mouse.js ${_formatOptions(OPTIONS)} ${actionName} ${action.args || ""}`);
			options.forEach(option=>{
				log.info(`   -${option.keys.short}|--${option.keys.long}: ${option.desc}`);
			});
		} else {
			log.info(`Usage: mouse.js ${_formatOptions(OPTIONS)} <command> [<args>]`);
			OPTIONS.forEach(option=>{
				log.info(`   -${option.keys.short}|--${option.keys.long}: ${option.desc}`);
			});
			log.info("Commands:");
			Object.keys(ACTIONS).sort().forEach(actionName=>{
				const action=findAction(actionName);
				log.info(`   ${actionName}: ${action.desc}`);
			});
		}
		log.info("");
	}

	try {
		const commandLine=new CommandLine();
		commandLine.parse();
		if("help" in commandLine.options) {
			reportUsage(commandLine.action);
			process.exit(1);
		} else {
			commandLine.validate();
			commandLine.updateEnvironment();
			return commandLine.toResponse();
		}
	} catch(error) {
		log.error(`Error: ${format.errorToString(error)}`);
		reportUsage(error.action);
		process.exit(1);
	}
};
