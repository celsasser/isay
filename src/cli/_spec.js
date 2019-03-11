/**
 * User: curtis
 * Date: 05/27/18
 * Time: 1:22 PM
 * Copyright @2019 by Xraymen Inc.
 */


exports.ACTIONS={
	"run": {
		args: "[script]",
		desc: "run a script",
		/**
		 * @param {Array<string>} position
		 * @param {Object<string, string>} options
		 * @throws {Error} - if you want to fail validation
		 */
		validate: function(position, options) {
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
		desc: "print general help or help for a specific action",
		keys: {
			short: "h",
			long: "help"
		}
	},
	{
		args: {
			count: 1,
			name: "level"
		},
		desc: '"verbose", "debug", "info", "warn", "error" or "fatal"',
		keys: {
			short: "l",
			long: "log.level"
		}
	},
	{
		actions: ["run"],
		args: {
			count: 0
		},
		desc: "full logging of input and params",
		keys: {
			short: "d",
			long: "debug"
		}
	},
	{
		actions: ["run"],
		args: {
			count: 1
		},
		desc: "optional input to the first function in the chain",
		keys: {
			short: "i",
			long: "input"
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
