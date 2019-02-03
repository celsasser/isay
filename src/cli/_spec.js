/**
 * User: curtis
 * Date: 05/27/18
 * Time: 1:22 PM
 * Copyright @2018 by Xraymen Inc.
 */


exports.ACTIONS={
	"run": {
		args: "[script]",
		desc: "runs a script",
		/**
		 * @param {Array<string>} position
		 * @param {Object<string, string>} options
		 * @throws {Error} - if you want to fail validation
		 */
		validate: function(position, options) {
			if(position.length===0 && !options.hasOwnProperty("script")) {
				throw new Error("no script specified");
			}
		}
	}
};

/**
 * These are supported options. They have keys. These keys should match our <link>./res/defaults.json</link> schema.
 * @type {[Object]}
 */
exports.OPTIONS=[
	{
		args: {
			count: 0
		},
		desc: "print general help or help for a specific command",
		keys: {
			short: "h",
			long: "help"
		}
	},
	{
		args: {
			count: 0
		},
		desc: "log level",
		keys: {
			short: "l",
			long: "log.level"
		}
	},
	{
		actions: ["run"],
		args: {
			count: 1,
			name: "script"
		},
		desc: "script path",
		keys: {
			short: "s",
			long: "script"
		}
	}
];
