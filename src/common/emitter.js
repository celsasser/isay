/**
 * User: curtis
 * Date: 05/27/18
 * Time: 10:10 PM
 * Copyright @2019 by Xraymen Inc.
 *
 * @module common/emitter
 */


const {EventEmitter}=require("events");

class Emitter {
	constructor() {
		this._emitter=new EventEmitter();
	}

	/**
	 * @param {EmitterEventName} event
	 * @param {function(name:String, param:(Object|undefined)):void} handler
	 */
	addListener(event, handler) {
		this._emitter.addListener(event, handler);
	}

	/**
	 *
	 * @param {EmitterEventName} event
	 * @returns {number}
	 */
	getListenerCount(event) {
		return this._emitter.listenerCount(event);
	}

	/**
	 * @param {EmitterEventName} event
	 * @param {function(name:String, param:(Object|undefined)):void} handler
	 */
	removeListener(event, handler) {
		this._emitter.removeListener(event, handler);
	}

	/**
	 * @param {EmitterEventName} event
	 * @param {*} param
	 */
	emit(event, param=undefined) {
		this._emitter.emit(event, param);
	}
}

module.exports={
	Emitter
};

