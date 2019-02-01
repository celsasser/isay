/**
 * User: curtis
 * Date: 3/5/2018
 * Time: 9:10 PM
 * Copyright @2017 by Xraymen Inc.
 *
 * @module common/log
 */

const _=require("lodash");
const constant=require("./constant");
const format=require("./format");

/**
 * @typedef {Object} Logger
 * @property {string} name
 * @property {string} level
 * @property {Function} verbose
 * @property {Function} debug
 * @property {Function} info
 * @property {Function} warn
 * @property {Function} error
 */

const storage={
	/**
	 * @type {Logger}
	 */
	logger: null
};


/* eslint-disable no-console */

/**** Public Interface ****/
exports.level={
	/**
	 * Get log level threshold
	 * @return {LogLevel}
	 */
	get: ()=>_getLogger().level,
	/**
	 * Set log level threshold
	 * @param {LogLevel} level
	 * @return {LogLevel}
	 */
	set: (level)=>_getLogger().level=level,
	/**
	 * @param {LogLevel} level
	 * @return {boolean}
	 */
	isLog: (level)=>constant.severity.trips(level, _getLogger().level)
};

/**
 * Configures the logger. You should perform configuration early in the startup of your application.
 * Note: The default configuration routes output to the console with localized metadata.
 * @param {string} applicationName
 * @param {LogLevel} logLevel
 */
exports.configure=function({applicationName, logLevel}) {
	storage.logger=_buildLogger({applicationName, logLevel});
};

/**
 * For compatibility with our <code>log</code> interface
 * @param {Error|string|Function} text
 * @param {Object} meta
 * @param {boolean} stack
 * @param {Function} stream
 * @return {Promise}
 */
exports.console=function(text, {
	meta=undefined,
	stack=false,
	stream=console.error
}={}) {
	text=format.messageToString(text, {stack});
	if(meta) {
		text=`${text}\n${JSON.stringify(text, null, "\t")}`;
	}
	stream(text);
	return Promise.resolve();
};

/**
 * @param {Error|string|Function} text
 * @param {Object} meta
 * @param {boolean} stack
 */
exports.debug=function(text, {
	meta=undefined,
	stack=false
}={}) {
	if(exports.level.isLog("debug")) {
		text=format.messageToString(text, {stack});
		_getLogger().debug(text, meta);
	}
};

/**
 * @param {Error|string|Function} text
 * @param {Object} meta
 * @param {boolean} stack
 */
exports.diag=function(text, {
	meta=undefined,
	stack=false
}={}) {
	if(exports.level.isLog("debug")) {
		text=format.messageToString(text, {stack});
		_getLogger().debug(text, Object.assign({diagnostic: true}, meta));
	}
};

/**
 * @param {Error|string|Function} text
 * @param {Object} meta
 * @param {boolean} stack
 */
exports.verbose=function(text, {
	meta=undefined,
	stack=false
}={}) {
	if(exports.level.isLog("verbose")) {
		text=format.messageToString(text, {stack});
		if(meta!==undefined) {
			_getLogger().verbose(text, meta);
		} else {
			_getLogger().verbose(text);
		}
	}
};

/**
 * @param {Error|string|Function} text
 * @param {Object} meta
 * @param {boolean} stack
 */
exports.info=function(text, {
	meta=undefined,
	stack=false
}={}) {
	if(exports.level.isLog("info")) {
		text=format.messageToString(text, {stack});
		if(meta!==undefined) {
			_getLogger().info(text, meta);
		} else {
			_getLogger().info(text);
		}
	}
};

/**
 * Logs text or error. If <code>text</code> is an error by the time it gets here then we will apply
 * <code>errorToString</code> to it before writing it to the log (and will add it as metadata?)
 * @param {Error|string|Function} text
 * @param {Object} meta
 * @param {boolean} stack
 */
exports.warn=function(text, {
	meta=undefined,
	stack=false
}={}) {
	if(exports.level.isLog("warn")) {
		text=format.messageToString(text, {stack});
		if(meta!==undefined) {
			_getLogger().warn(text, meta);
		} else {
			_getLogger().warn(text);
		}
	}
};

/**
 * Logs text or error. If <code>text</code> is an error by the time it gets here then we will apply
 * <code>errorToString</code> to it before writing it to the log (and will add it as metadata?)
 * @param {Error|string|Function} text
 * @param {Object} meta
 * @param {boolean} stack
 */
exports.error=function(text, {
	meta=undefined,
	stack=false
}={}) {
	if(exports.level.isLog("error")) {
		text=format.messageToString(text, {stack});
		if(meta!==undefined) {
			_getLogger().error(text, meta);
		} else {
			_getLogger().error(text);
		}
	}
};

/**** Private Interface and action****/
/**
 * Makes sure logger is created and then returns it
 * @returns {{verbose: Function, debug: Function, info: Function, warn: Function, error: Function}}
 * @private
 */
function _getLogger() {
	if(!storage.logger) {
		storage.logger=_buildLogger({
			applicationName: "mouse",
			logLevel: constant.severity.DEBUG
		});
	}
	return storage.logger;
}

/**
 * Builds/rebuilds the logger as per current application configuration
 * @param {string} applicationName
 * @param {LogLevel} logLevel
 * @returns {Logger}
 * @private
 */
function _buildLogger({applicationName, logLevel}) {
	const _levelToHandler=(level, handler)=>constant.severity.trips(level, logLevel) ? handler : _.noop;
	return {
		name: applicationName,
		level: logLevel,
		verbose: _levelToHandler(constant.severity.VERBOSE, console.debug),
		debug: _levelToHandler(constant.severity.DEBUG, console.debug),
		info: _levelToHandler(constant.severity.INFO, console.info),
		warn: _levelToHandler(constant.severity.WARN, console.warn),
		error: _levelToHandler(constant.severity.ERROR, console.error)
	};
}
