/**
 * Date: 2019-02-01
 * Time: 23:49
 * @license MIT (see project's LICENSE file)
 */

const {Writable}=require("stream");

class DevNull extends Writable {
	constructor(options=undefined) {
		super(options);
	}

	_write(chunk, encoding, callback) {
		process.nextTick(callback);
	}
}

module.exports={
	DevNull
};
