/**
 * Date: 2019-02-01
 * Time: 00:52
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {assertPredicate, assertProperties, assertType, resolveType}=require("./_data");

/**
 * @typedef {ModuleBase} ModuleObject
 */
class ModuleObject extends ModuleBase {
	/**
	 * Calls predicate for each key/value pair in the object. By default it does not recurse into objects but you may
	 * override this behavior with the <code>recurse</code> option.
	 * @resolves predicate:IteratePredicate in this.params[0]
	 * @resolves options:{recurse:boolean=false} in this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async each(blob) {
		assertType(blob, ["Array", "Object"], {allowNullish: true});
		const predicate=assertPredicate(this.params[0]),
			options=await resolveType(blob, this.params[1], "Object", {defaultUndefined: {}}),
			pairs=ModuleObject._objectToKeyValuePairs(blob, _.get(options, "recurse", false));
		for(let index=0; index<pairs.length; index++) {
			let [key, value]=pairs[index];
			await predicate(value, key);
		}
		return blob;
	}

	/**
	 * Gets value at property path
	 * @resolves path:string in this.params[0]|blob
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async get(blob) {
		// why do we allow arrays? Because a user may describe a path in terms of indexes: _.get("0.name", [{name: "George"}]
		assertType(blob, ["Array", "Object"], {allowNullish: true});
		if(this.params.length===0) {
			return blob;
		} else {
			const path=await resolveType(blob, this.params[0], "String");
			return _.get(blob, path);
		}
	}

	/**
	 * Allows one to transform the object in <param>blob</param> via:
	 * - predicate function: blob may be of any type
	 * - or array of directions indicating what to take or how to map properties: blob must be object or array
	 * @resolves (predicate:MapPredicate|Array<string>|Array<{from:string,to:string}>) in this.params[0]
	 * @resolves options:{flatten:false,recurse:false} in this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async map(blob) {
		assertType(blob, ["Array", "Object"], {allowNullish: true});
		const param0=assertType(this.params[0], ["Array", "Function"]);
		const {
			flatten=false,
			recurse=false
		}=await resolveType(blob, this.params[1], "Object", {defaultUndefined: {}});

		if(typeof(param0)==="function") {
			return this._mapByPredicate(blob, assertPredicate(param0), recurse);
		} else {
			return this._mapByPaths(blob, param0, flatten);
		}
	}

	/**
	 * Allows one to transform the object in any way they want to via a predicate: function(*):*
	 * - or array of directions indicating what to take or how to map properties: blob must be object or array
	 * @resolves predicate:ActionPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async mutate(blob) {
		const predicate=assertPredicate(this.params[0]);
		return predicate(blob);
	}

	/**
	 * Merges param data in <code>params[0]</code> into <param>blob</param>
	 * @resolves mergeData:(Array|Object) in this.params[0]
	 * @param {Array|Object} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async merge(blob) {
		assertType(blob, ["Array", "Object"]);
		const mergeData=await resolveType(blob, this.params[0], ["Array", "Object"], {allowNull: true});
		return _.merge(blob, mergeData);
	}


	/**
	 * Sets the path stored in <code>params[0]</code> on <param>blob</param> with <code>params[1]</code>
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 */
	async set(blob) {
		const path=await resolveType(blob, this.params[0], "String"),
			value=await resolveType(blob, this.params[1], "*", {allowNullish: true});
		return _.set(blob, path, value);
	}

	/**
	 * It transforms the top level of properties into an array. One may alter the default results by specifying a
	 * a predicate function that returns the per array element value.
	 * @resolves predicate:function(object:Object, key:string):Object in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<void>}
	 */
	async toArray(blob) {
		const result=[],
			predicate=assertPredicate(_.get(this.params, 0, object=>object));
		assertType(blob, "Object", {allowNullish: true});
		for(let property in blob) {
			result.push(await predicate(blob[property], property));
		}
		return result;
	}

	/********************* Private Interface *********************/
	/**
	 * Finds and returns all "own" properties in object. If <param>recurse</param> is true then will go from deep to shallow
	 * @param {*} object
	 * @param {boolean} recurse
	 * @param {string} prefix
	 * @returns {Array<[string,*]>}
	 * @private
	 */
	static _objectToKeyValuePairs(object, recurse=false, prefix="") {
		let keys=_.keys(object),
			result=[];
		for(let index=0; index<keys.length; index++) {
			let key=keys[index];
			if(recurse) {
				result=result.concat(ModuleObject._objectToKeyValuePairs(object[key], recurse, `${prefix}${key}.`));
			}
			result.push([`${prefix}${key}`, object[key]]);
		}
		return result;
	}

	/**
	 * Maps properties by predicate
	 * @param {DataBlob} blob
	 * @param {MapPredicate} predicate
	 * @param {boolean} recurse
	 * @returns {Promise<DataBlob>}
	 */
	async _mapByPredicate(blob, predicate, recurse) {
		let result;
		const pairs=ModuleObject._objectToKeyValuePairs(blob, recurse);
		if(recurse===false) {
			result=new blob.constructor;
			for(let index=0; index<pairs.length; index++) {
				let [key, value]=pairs[index];
				value= await predicate(value, key);
				_.set(result, key, value);
			}
		} else {
			// he's a special needs child (and not likely to be used much). We cannot assume the same things we
			// did for shallow cause the deeper properties will be modified before the less shallow properties.
			result=_.clone(blob);
			for(let index=0; index<pairs.length; index++) {
				let [key]=pairs[index],
					value=await predicate(_.get(result, key), key);
				_.set(result, key, value);
			}
		}
		return result;
	}

	/**
	 * Restructures an object by from and to mapping rules
	 * @resolves (Array<string>|Array<{from:string,to:string}>) in this.params[0]
	 * @resolves options:{flatten:false,recurse:false} in this.params[1]
	 * @param {DataBlob} blob
	 * @param {(Array<string>|Array<{from:string,to:string}>)} paths
	 * @param {boolean} flatten
	 * @returns {Promise<DataBlob>}
	 */
	async _mapByPaths(blob, paths, flatten) {
		// The following is standard but also supports some non-standard "pick" functionality.
		// It includes support for remapping paths. And it also allows one to flatten arrays.
		return this.params[0].reduce((result, path)=>{
			assertType(path, ["String", "Object"]);
			if(path.constructor.name==="String") {
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

module.exports={
	ModuleObject
};
