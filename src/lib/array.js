/**
 * User: curtis
 * Date: 2019-02-05
 * Time: 21:11
 * Copyright @2019 by Xraymen Inc.
 */

const _=require("lodash");
const {ModuleBase}=require("./_base");
const {assertPredicate, assertType}=require("./_data");
const util=require("../common/util");

/**
 * Supports operations on piped arrays. The <code>predicate</code> may either be a function or a chain.
 * The <code>predicate</code> is called as follows: params[0](blob[index], index):*
 * @typedef {ModuleBase} ModuleArray
 */
class ModuleArray extends ModuleBase {
	/**
	 * Appends this.params[0] to blob and returns the results
	 * @resolves data:DataBlob in this.params[0] - appended data
	 * @resolves {index:Number=blob.length, expand:boolean=false} in this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async append(blob) {
		return this._insert(blob, true);
	}

	/**
	 * Calls predicate for every element in blob
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async each(blob) {
		const array=this._assertArray(blob),
			length=array.length,
			predicate=assertPredicate(this.params[0]);
		for(let index=0; index<length; index++) {
			await predicate(array[index], index);
		}
		return blob;
	}

	/**
	 * Calls right through to <code>each</code>
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async forEach(blob) {
		return this.each(blob);
	}

	/**
	 * Filters array selecting truthy returns by predicate
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async filter(blob) {
		const array=this._assertArray(blob),
			length=array.length,
			predicate=assertPredicate(this.params[0]),
			result=[];
		for(let index=0; index<length; index++) {
			if(await predicate(array[index], index)) {
				result.push(array[index]);
			}
		}
		return result;
	}

	/**
	 * Finds first element using predicate
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async find(blob) {
		const array=this._assertArray(blob),
			length=array.length,
			predicate=assertPredicate(this.params[0]);
		for(let index=0; index<length; index++) {
			if(await predicate(array[index], index)) {
				return array[index];
			}
		}
		return null;
	}

	/**
	 * Inserts this.params[0] into blob and returns the results
	 * @resolves data:DataBlob in this.params[0] - inserted data
	 * @resolves {index:Number=0, expand:boolean=false} in this.params[1]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async insert(blob) {
		return this._insert(blob, false);
	}

	/**
	 * Maps each element using predicate's results
	 * @resolves predicate:ArrayPredicate in this.params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async map(blob) {
		const array=this._assertArray(blob),
			length=array.length,
			predicate=assertPredicate(this.params[0]),
			result=[];
		for(let index=0; index<length; index++) {
			result.push(await predicate(array[index], index));
		}
		return result;
	}

	/**
	 * Creates a sequence, within the specified range, of numbers and at a specified interval.
	 * Note: This is our solution to finite looping. See notes in <link>./loop.js</link> for an explanation for
	 * we are supporting iteration via arrays vs. a looping construct.
	 *
	 * If there are parameters then we assume the sequence is defined by them. If not then
	 * the configuration should be in <param>blob</param>
	 * @resolves stopIndex:Number in (this.params[0]|blob)
	 * @resolves startIndex:Number in this.params[0]
	 * @resolves stopIndex:Number in this.params[1]
	 * @resolves increment:Number in this.params[2]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<Number>>}
	 */
	async range(blob) {
		let increment=1,
			startIndex=0,
			stopIndex,
			result=[];
		// If there are parameters then we assume the sequence is defined by them otherwise it should be in <param>blob</param>
		const params=(this.params.length===0)
			? _.isArray(blob) ? blob : [blob]
			: this.params;
		assertType(params[0], "Number");
		if(params.length===1) {
			stopIndex=params[0];
		} else {
			assertType(params[1], "Number");
			startIndex=params[0];
			stopIndex=params[1];
			if(params.length>=3) {
				assertType(params[2], "Number");
				increment=params[2];
			}
		}
		for(startIndex; startIndex<stopIndex; startIndex+=increment) {
			result.push(startIndex);
		}
		return result;
	}

	/**
	 * Reduces array down to the little or big guy you make him.
	 * @resolves predicate:function(result:*, data:*, index:Number):* in this.params[0]
	 * @resolves startingValue: in this.params[1] - defaults to []
	 * @param {DataBlob} blob
	 * @returns {Promise<DataBlob>}
	 * @throws {Error}
	 */
	async reduce(blob) {
		const array=this._assertArray(blob),
			length=array.length,
			predicate=assertPredicate(this.params[0]);
		let result=_.get(this.params, 1, []);
		// todo: hmmm, I think we may be digging a very deep promise.then(promise.then(promise.then...))) hole.
		//  Think we will probably want to work a process.nextTick into our async iterations.
		for(let index=0; index<length; index++) {
			result= await predicate(result, array[index], index);
		}
		return result;
	}

	/**
	 * Reverses elements. No params supported
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error} if <param>blob</param> cannot be treated as an array
	 */
	async reverse(blob) {
		const array=this._assertArray(blob);
		return array.reverse();
	}

	/**
	 * Takes a slice of the input array and returns the result
	 * @resolves startIndex:Number in params[0]
	 * @resolves stopIndex:Number in params[1]
	 * @resolves {start:Number, stop:Number, count:Number} in params[0]
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async slice(blob) {
		const array=this._assertArray(blob);
		let startIndex=0,
			stopIndex=array.length;
		if(this.params.length>0) {
			assertType(this.params[0], ["Number", "Object"]);
			if(this.params[0].constructor.name==="Object") {
				const {count, start, stop}=this.params[0];
				if(start!==undefined) {
					startIndex=ModuleArray._normalizeIndex(blob, start, true);
				}
				if(stop!=undefined) {
					stopIndex=ModuleArray._normalizeIndex(blob, stop, false);
				}
				if(count!==undefined) {
					if(stop!==undefined) {
						if(start!==undefined) {
							throw new Error(`invalid slice configuration - ${JSON.stringify(this.params[0])}`);
						}
						startIndex=stopIndex-count;
					} else {
						stopIndex=startIndex+count;
					}
				}
			} else {
				startIndex=ModuleArray._normalizeIndex(blob, this.params[0], true);
				if(this.params.length>1) {
					stopIndex=ModuleArray._normalizeIndex(blob, this.params[1], false);
				}
			}
		}
		return array.slice(startIndex, stopIndex);
	}

	/**
	 * Sorts array elements. By default it sorts using lodash's default comparison operator.
	 * @resolves sortBy:(string|function) in this.params[0] - defaults to undefined
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async sort(blob) {
		const array=this._assertArray(blob);
		if(this.params.length===0) {
			return array.sort();
		} else {
			const sorts=(this.params.length>1)
				? this.params
				: (this.params[0].constructor.name==="Array")
					? this.params[0]
					: [this.params[0]];
			const {directions, properties}=sorts.reduce((result, sort)=>{
				if(sort.startsWith("-")) {
					result.properties.push(sort.substr(1));
					result.directions.push("desc");
				} else {
					result.properties.push(sort);
					result.directions.push("asc");
				}
				return result;
			}, {
				directions: [],
				properties: []
			});
			return _.orderBy(blob, properties, directions);
		}
	}

	/**
	 * Returns unique elements using a deep comparison of elements.
	 * @param {DataBlob} blob
	 * @returns {Promise<Array<DataBlob>>}
	 * @throws {Error}
	 */
	async unique(blob) {
		const array=this._assertArray(blob);
		return _.uniqWith(array, _.isEqual);
	}

	/********************* Private Interface *********************/
	/**
	 * Works with python style negative indexes. If <param>index</param>=0 then returns index
	 * @param {Array<*>} array
	 * @param {Number} index
	 * @param {boolean} isStart - if the index is negative and out range then we set it to high or
	 * 	low depending on how it is being used as a from-start index or from-end reference.
	 * @returns {number}
	 * @private
	 */
	static _normalizeIndex(array, index, isStart=true) {
		if(index>=0) {
			return index;
		} else {
			index=array.length+index;
			if(index<0) {
				// here we want to return high or low so that its out of bounds nature
				// does not yield results.
				return isStart ? array.length : 0;
			} else {
				return index;
			}
		}
	}

	/**
	 * Validates and applies the function to the blob using all params as input.
	 * @param {DataBlob} blob
	 * @return {Array<DataBlob>}
	 * @throws {Error}
	 * @private
	 */
	_assertArray(blob) {
		if(_.isArray(blob)) {
			return blob;
		} else if(blob==null) {
			return [];
		} else {
			throw new Error(`expecting array but found ${util.name(blob)}`);
		}
	}

	/**
	 * General purpose append/insert function for use by our public append/insert methods.
	 * @resolves data:DataBlob in this.params[0] - inserted data
	 * @resolves {index:Number=blob.length, expand:boolean=false} in this.params[1]
	 * @param {DataBlob} blob
	 * @param {boolean} tail - whether to default to head or tail as index point
	 * @returns {Array<DataBlob>}
	 * @throws {Error}
	 * @private
	 */
	_insert(blob, tail=true) {
		let array=this._assertArray(blob);
		assertType(this.params[1], "Object", {
			allowUndefined: true
		});

		let {
			index=(tail) ? array.length : 0,
			expand=false
		}=(this.params[1] || {});
		index=ModuleArray._normalizeIndex(array, index);
		if(expand) {
			const concat=this._assertArray(this.params[0]);
			return array.slice(0, index)
				.concat(concat)
				.concat(array.slice(index));
		} else {
			assertType(this.params[0], "*", {
				allowNull: true
			});
			array=array.slice();	// honor immutability rules
			array.splice(index, 0, this.params[0]);
			return array;
		}
	}
}

module.exports={
	ModuleArray
};
