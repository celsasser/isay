/**
 * User: curt
 * Date: 3/5/2018
 * Time: 9:10 PM
 *
 * @module common/constant
 */

const http=require("http");

/**
 * MIDI constants and defaults
 * @enum {number}
 */
exports.midi={
	default: {
		CHANNEL: 0,
		VELOCITY: 80
	}
};

/**
 * All notification types that may be dispatched
 * @enum {string}
 */
exports.notification={
	/***************************************
	 * "callback" processing notifications
	 ***************************************/
	CALLBACK_BAR: "callback-bar",
	CALLBACK_CLUSTER: "callback-cluster",
	CALLBACK_TICK: "callback-tick",

	/***************************************
	 * general edit notifications
	 ***************************************/
	CHORD_ADDED: "chord-added",
	CHORD_DELETED: "chord-deleted",
	NOTE_ADDED: "note-added",
	NOTE_DELETED: "note-deleted",
	SEQUENCE_ADDED: "sequence-added",
	SEQUENCE_DELETED: "sequence-deleted",
	STORAGE_ADDED: "storage-added",
	STORAGE_REMOVED: "storage-removed",
	TEMPO_ADDED: "tempo-added",
	TEMPO_DELETED: "tempo-deleted",
	TRACK_ADDED: "track-added",
	TRACK_DELETED: "track-deleted"
};

/**
 * Error severities.
 * Should by in parity with <code>LogLevel</code>
 * @enum {string}
 */
exports.severity={
	VERBOSE: "verbose",
	DEBUG: "debug",
	INFO: "info",
	WARN: "warn",
	ERROR: "error",
	FATAL: "fatal",
	/**
	 * Is the specified <param>severity</param> greater than or equal to the threshold value which is "warn" by default
	 * @param {LogLevel} value
	 * @param {LogLevel} threshold
	 * @returns {boolean}
	 */
	trips: (value, threshold=exports.severity.WARN)=>{
		return exports.severity._ORDER.indexOf(value)>=exports.severity._ORDER.indexOf(threshold);
	},

	/**
	 * The order of severity for measurement
	 * @private
	 */
	_ORDER: ["verbose", "debug", "info", "warn", "error", "fatal"]
};

/**
 * An extension of the http status codes that we use for internal purposes
 * @enum {number}
 */
exports.status={
	code: {
		ABORT: -1
	},
	text: (code)=>{
		switch(code) {
			case exports.status.code.ABORT: return "Abort";
			default: {
				return http.STATUS_CODES[code];
			}
		}
	}
};

/**
 * Determines whether the value is valid
 * @param {Object} enumObject
 * @param {string} value
 * @returns {boolean}
 */
exports.isValidValue=function(enumObject, value) {
	return Object.values(enumObject)
		.indexOf(value)> -1;
};

/**
 * @type {function(value:string):Boolean}
 */
exports.isValidSeverity=exports.isValidValue.bind(null, exports.severity);

