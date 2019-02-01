#!/usr/bin/env node

/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:09
 * Copyright @2019 by Xraymen Inc.
 */

const format=require("./src/common/format");
const log=require("./src/common/log");
const cli=require("./src/cli");


const configuration=cli.parse(),
	command=require(`./src/command/${configuration.action}`);
command.run(configuration)
	.then(()=>{
		process.exit(0);
	})
	.catch(error=>{
		log.error(format.errorToString(error, {
			details: true,
			stack: true
		}));
		process.exit(1);
	});
