/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:52
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleIO}=require("./_io");
const {assertPredicate, assertProperties, assertType}=require("./_data");

/**
 * @typedef {ModuleIO} ModuleObject
 */
class ModuleObject extends ModuleIO {
	/**
	 * Gets value at property path
	 * @resolves path:(string|undefined) in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async get(blob) {
		// why do we allow arrays? Because a user may describe a path in terms of indexes: _.get("0.name", [{name: "George"}]
		assertType(blob, ["Array", "Object"], {
			allowNull: true,
			allowUndefined: true
		});
		return (this.params.length>0)
			? _.get(blob, this.params[0])
			: blob;
	}

	/**
	 * Allows one to transform the object in <param>blob</param> via:
	 * - predicate function: blob may be of any type
	 * - or array of directions indicating what to take or how to map properties: blob must be object or array
	 * @resolves (predicate:ActionPredicate|(Array<string>|{from:string,to:string}>)) in this.params[0]
	 * @resolves options:{flatten:false} in this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async map(blob) {
		assertType(this.params[0], ["Array", "Function"]);
		if(typeof(this.params[0])==="function") {
			const predicate=assertPredicate(this.params[0]);
			return predicate(blob);
		} else {
			assertType(blob, ["Array", "Object"], {
				allowNull: true,
				allowUndefined: true
			});
			const flatten=_.get(this.params[1], "flatten", false);
			// The following is standard but also supports some non-standard "pick" functionality.
			// It includes support for remapping paths. And it also allows one to flatten arrays.
			return this.params[0].reduce((result, path)=>{
				assertType(path, ["String", "Object"]);
				if(typeof(path)==="string") {
					const value=_.get(blob, path);
					if(value!==undefined) {
						if(flatten) {
							// take the array indexes out of the path causing the path to be "flat"
							path=path.replace(/^\d+\.(\d+\.?)*|\.\d+$/g, "")
								.replace(/\.\d+\.(\d+\.?)*/g, ".");
						}
						_.set(result, path, value);
					}
				} else {
					assertProperties(path, ["from", "to"]);
					const value=_.get(blob, path.from);
					if(value!==undefined) {
						_.set(result, path.to, value);
					}
				}
				return result;
			}, {});
		}
	}

	/**
	 * Merges param data in <code>params[0]</code> into <param>blob</param>
	 * @param {Array|Object} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async merge(blob) {
		assertType(blob, ["Array", "Object"]);
		return _.merge(blob, this.params[0]);
	}


	/**
	 * Sets the path stored in <code>params[0]</code> on <param>blob</param> with <code>params[1]</code>
	 * @param {DataBlob} blob
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
			predicate=assertPredicate(_.get(this.params, 0, object=>object));
		assertType(blob, "Object", {
			allowNull: true,
			allowUndefined: true
		});
		for(let key in blob) {
			result.push(await predicate(blob[key], key));
		}
		return result;
	}
}

module.exports={
	ModuleObject
};
