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
	 *  - if <code>this.param[0]</code> is not empty then it will be used as the path
	 *  - if <code>this.param[0]</data> is empty then <param>data</param> will be used as the path
	 * @param {string|undefined} data
	 * @returns {Promise<MidiIoSong>}
	 */
	async read(data) {
		const path=this._getReadPath(data);
		return midi.parseMidiFile(path);
	}

	/**
	 * Writes data to path that should be in <code>this.param[0]</code>
	 * @param {MidiIoSong} data
	 * @returns {Promise<MidiIoSong>}
	 */
	async write(data) {
		const uri=this._getWritePath();
		this._assertJson(data, {allowNull: false});
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
