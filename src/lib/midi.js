/**
 * User: curtis
 * Date: 2019-02-10
 * Time: 00:21
 * Copyright @2019 by Xraymen Inc.
 */

const fs=require("fs-extra");
const midi=require("midi-file-io");
const path=require("path");
const {ModuleIO}=require("./_io");
const {assertType}=require("./_data");

/**
 * read and write support for midi files.
 * @typedef {ModuleIO} ModuleMidi
 */
class ModuleMidi extends ModuleIO {
	/**
	 * Parses input and returns a parsed midi structure.
	 * @param {Buffer|string} data
	 * @returns {Promise<MidiIoSong>}
	 */
	async parse(data) {
		if(Buffer.isBuffer(data)) {
			data=data.toString("utf8");
		}
		return midi.parseMidiBuffer(data);
	}

	/**
	 * Reads and parses specified midi file. The path may either be specified as input data or param data:
	 * @resolves path:string in data|this.params[0]
	 * @param {string|undefined} data
	 * @returns {Promise<MidiIoSong>}
	 * @throws {Error}
	 */
	async read(data) {
		const path=await this._getReadPath(data);
		return midi.parseMidiFile(path);
	}

	/**
	 * Writes data to path that should be in <code>this.params[0]</code>
	 * @param {MidiIoSong} data
	 * @returns {Promise<MidiIoSong>}
	 * @throws {Error}
	 */
	async write(data) {
		const uri=await this._getWritePath(data);
		assertType(data, "Object");
		return fs.ensureDir(path.parse(uri).dir)
			.then(()=>{
				midi.writeMidiToFile(data, uri);
				return data;
			});
	}
}

module.exports={
	ModuleMidi
};
