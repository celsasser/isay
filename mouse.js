#!/usr/bin/env node

/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:09
 * Copyright @2019 by Xraymen Inc.
 */

const constant=require("./src/common/constant");
const format=require("./src/common/format");
const log=require("./src/common/log");
const cli=require("./src/cli");


const configuration=cli.parse();
log.verbose(`loading "${configuration.action}" module`);
const command=require(`./src/command/${configuration.action}`);
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
