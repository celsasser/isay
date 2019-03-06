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
 * Parse the command line and create a command instance.
 * Note: we don't handle exceptions here as everything should be handled by <code>cli</code> and unknown actions
 * should not make it out of <code>cli</code> alive. Also, <code>cli</code> has the right to exit the process.
 */
const configuration=setApplicationConfiguration(cli.parse());
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
		if(error.code!==constant.error.code.ABORT) {
			// todo: we should think about what is written to error here. By default we don't want the
			//  stack.  But it is handy for debugging. Probably want it to only log stack on debug.verbose
			log.error(format.errorToString(error, {
				details: true,
				stack: true
			}));
		}
		process.exit(1);
	});
