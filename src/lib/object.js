/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleIO}=require("./_io");

/**
 * @typedef {ModuleIO} ModuleObject
 */
class ModuleObject extends ModuleIO {
	/**
	 * Either gets value at a single property path specified in <code>this.params[0]</code>
	 * Or it returns an Object reduced to the paths you have specified in <code>this.params[0]</code>
	 * See notes below regarding how array index references are squashed.
	 * @resolves path:(string|Array<string|{from:string,to:string}>) in this.params[0]
	 * @param {Object} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async get(blob) {
		this._assertType(blob, "Object", {
			allowNull: true
		});
		if(this.params.length===0) {
			return blob;
		} else {
			this._assertType(this.params[0], ["String", "Array"]);
			if(typeof(this.params[0])==="string") {
				return _.get(blob, this.params[0]);
			} else {
				// The following is similar to, what is sometimes called, "pick". But it also
				// includes support for remapping paths. But it also makes assumptions about array indexes.
				// This latter may be going too far, but for the time being I am going to leave it in.
				return this.params[0].reduce((result, path)=>{
					this._assertType(path, ["String", "Object"]);
					if(typeof(path)==="string") {
						const value=_.get(blob, path);
						if(value!==undefined) {
							// This is the big assumption - I am arguing that where array indexes are included that those
							// references should be flattened. Let's see how it feels. Perhaps where we have the ability
							// to explicitly map path this is not needed.
							path=path.replace(/^\d+\.(\d+\.?)*|\.\d+$/g, "")
								.replace(/\.\d+\.(\d+\.?)*/g, ".");
							_.set(result, path, value);
						}
					} else {
						this._assertProperties(path, ["from", "to"]);
						const value=_.get(blob, path.from);
						if(value!==undefined) {
							_.set(result, path.to, value);
						}
					}
					return result;
				}, {});
			}
		}
	}

	/**
	 * Allows one to transform the object in <param>blob</param> into something else...anything else. Most
	 * use cases will probably have to do with manipulating the input object.
	 * @resolves predicate:ObjectPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async map(blob) {
		this._assertType(blob, "Object", {
			allowNull: true
		});
		const predicate=this._assertPredicate(this.params[0]);
		return predicate(blob);
	}

	/**
	 * Merges param data in <code>params[0]</code> into <param>blob</param>
	 * @param {Object} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async merge(blob) {
		let merge=this.params[0];
		this._assertType(blob, "Object", {
			allowNull: true
		});
		return _.merge(blob, merge);
	}

	/**
	 * Sets the path stored in <code>params[0]</code> on <param>blob</param> with <code>params[1]</code>
	 * @param {Object} blob
	 * @returns {Promise<DataBlob>}
	 */
	async set(blob) {
		const path=this.params[0],
			value=this.params[1];
		return _.set(blob, path, value);
	}

	/**
	 * It transforms the top level of properties into an array. One may alter the default results by specifying a
	 * a predicate function that returns the per array element object.
	 * Why is he here? Because occasionally databases are keyed by arrays. But it happens that one wants to to treat as arrays
	 * so that they may iterate over them. Our <code>array</code> domain is rich with iteration functionality. Here, we are
	 * isolating any and all iteration to this one function.
	 * @resolves predicate:function(object:Object, key:string):Object in this.params[0]
	 * @param {Object} blob
	 * @returns {Promise<void>}
	 */
	async toArray(blob) {
		const result=[],
			predicate=this._assertPredicate(_.get(this.params, 0, object=>object));
		this._assertType(blob, "Object", {
			allowNull: true
		});
		for(let key in blob) {
			result.push(await predicate(blob[key], key));
		}
		return result;
	}

	/**************** Private Interface ****************/
	/**
	 * We always want this to be parsed.
	 * todo: I liked this when I started, but am not so crazy about the implied behavior
	 * @param {*} blob
	 * @returns {DataBlob}
	 * @private
	 */
	_preprocessChunk(blob) {
		if(_.isString(blob)) {
			return JSON.parse(blob);
		} else if(Buffer.isBuffer(blob)) {
			return JSON.parse(blob.toString("utf8"));
		}
		return blob;
	}
}

module.exports={
	ModuleObject
};
