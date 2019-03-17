#!/usr/bin/env node

/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:09
 * Copyright @2019 by Xraymen Inc.
 */

const {setApplicationConfiguration}=require("./src/command/configuration");
const constant=require("./src/common/constant");
const format=require("./src/common/format");
const log=require("./src/common/log");
const cli=require("./src/cli");

/**
 * Makes sure the environment can support the app. Makes recommendations if improvements can be gained.
 * @param {CliParsed} configuration
 * @private
 */
function _assertEnvironment(configuration) {
	const version=process.versions.node.split(".")
		.map(version=>Number(version));
	if(configuration.options.debug) {
		if(version[0]<10) {
			log.warn(`NodeJS version=${process.version}. May get performance gains by upgrading to v10.x.x or greater`);
		}
	}
}

/**
 * Parse the command line and create a command instance.
 * Note: we don't handle exceptions here as everything should be handled by <code>cli</code> and unknown actions
 * should not make it out of <code>cli</code> alive. Also, <code>cli</code> has the right to exit the process.
 */
const configuration=setApplicationConfiguration(cli.parse());
_assertEnvironment(configuration);
log.verbose(`loading "${configuration.action}" module`);
const command=require(`./src/command/${configuration.action}`);

/**
 * Run the command
 */
command.run(configuration)
	.then(()=>{
		process.exit(0);
	})
	.catch(error=>{
		if(error.code===constant.error.code.ABORT) {
			process.exit(1);
		} else {
			// I don't get it. We are using async completion synchronization when logging to the console (in ModuleBase)
			// nonetheless this error message can still get interleaved in stdout's output.
			log.error(format.errorToString(error, {
				details: true,
				stack: configuration.options.debug
			}));
			process.exit((error.code!==undefined) ? error.code : 1);
		}
	});
