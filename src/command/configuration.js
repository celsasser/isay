/**
 * User: curtis
 * Date: 2019-03-05
 * Time: 23:47
 * Copyright @2019 by Xraymen Inc.
 *
 * A place where we stash the application settings and run configuration
 */


const storage={
	/**
	 * We establish a default configuration for testing. At runtime this will reflect the runtime options and params.
	 * @type {CliParsed}
	 */
	configuration: {
		options: {},
		params: []
	}
};


/**
 * @returns {CliParsed}
 */
function getApplicationConfiguration() {
	return storage.configuration;
}

/**
 * @param {CliParsed} value
 * @returns {CliParsed}
 */
function setApplicationConfiguration(value) {
	return (storage.configuration=value);
}

module.exports={
	getApplicationConfiguration,
	setApplicationConfiguration
};
