/**
 * Date: 3/9/18
 * Time: 8:23 PM
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");
const assert=require("../../test/support/assert");
const util=require("./util");
const {XRayError}=require("./error");

module.exports.mutable={
	array: {
		/**
		 * @param {Array} array
		 * @param {*} element
		 * @param {number} index
		 * @returns {T[]}
		 */
		add(array, element, index=undefined) {
			if(!array) {
				array=[];
			}
			if(index===undefined) {
				array.push(element);
			} else {
				return array.splice(index, 0, element);
			}
			return array;
		},

		/**
		 * @param {Array} array
		 * @param {Array} elements
		 * @param {number} index
		 * @returns {T[]}
		 */
		concat(array, elements, index=undefined) {
			if(!array) {
				array=[];
			}
			if(index===undefined) {
				_.each(elements, function(element) {
					array.push(element);
				});
			} else {
				_.each(elements, function(element, offset) {
					return array.splice(index+offset, 0, element);
				});
			}
			return array;
		},

		/**
		 * @param {Array} array
		 * @param {*} element
		 * @param {number} index
		 * @param {Object|Function} predicate that will be used by lodash to find our man
		 * @returns {T[]}
		 */
		remove(array, {element=undefined, index=undefined, predicate=undefined}) {
			index=_searchCriteriaToIndex(array, {element, index, predicate});
			if(index>-1) {
				array.splice(index, 1);
			}
			return array;
		},

		/**
		 * @param {Array} array
		 * @param {*} newElement
		 * @param {*} element - element to replace
		 * @param {number} index - element index to replace
		 * @param {Object|Function} predicate that will be used by lodash to find our man
		 * @returns {T[]}
		 * @throws {XRayError} if existing element cannot be found
		 */
		replace(array, newElement, {element=undefined, index=undefined, predicate=undefined}) {
			index=_searchCriteriaToIndex(array, {element, index, predicate});
			if(index>-1) {
				array[index]=newElement;
			} else {
				throw new XRayError({
					instance: this.constructor.name,
					message: "replace(): Could not find existing element to replace"
				});
			}
			return array;
		},

		/**
		 * @param {Array} array
		 * @param {string} property
		 * @param {function(v1:*, v2:*):number} comparer
		 * @param {boolean} reverse
		 */
		sort(array, property, {
			comparer=util.compare,
			reverse=false
		}={}) {
			if(array) {
				array.sort((o1, o2)=>comparer(_.get(o1, property), _.get(o2, property)));
				if(reverse) {
					array.reverse();
				}
			}
		}
	}
};

module.exports.immutable={
	array: {
		/**
		 * @param {Array} array
		 * @param {*} element
		 * @param {number} index
		 * @returns {T[]}
		 */
		add(array, element, index=undefined) {
			if(index===undefined) {
				return (array || []).concat(element);
			} else {
				return array.slice(0, index)
					.concat(element)
					.concat(array.slice(index));
			}
		},

		/**
		 * @param {Array} array
		 * @param {Array} elements
		 * @param {number} index
		 * @returns {T[]}
		 */
		concat(array, elements, index=undefined) {
			if(index===undefined) {
				return (array || []).concat(elements);
			} else {
				return array.slice(0, index)
					.concat(elements)
					.concat(array.slice(index));
			}
		},

		/**
		 * @param {Array} array
		 * @param {*} element
		 * @param {number} index
		 * @param {Object|Function} predicate that will be used by lodash to find our man
		 * @returns {T[]}
		 */
		remove(array, {element=undefined, index=undefined, predicate=undefined}) {
			index=_searchCriteriaToIndex(array, {element, index, predicate});
			return (index> -1)
				? array.slice(0, index).concat(array.slice(index+1))
				: array;
		},

		/**
		 * @param {Array} array
		 * @param {*} newElement
		 * @param {*} element - element to replace
		 * @param {number} index - element index to replace
		 * @param {Object|Function} predicate that will be used by lodash to find our man
		 * @returns {T[]}
		 * @throws {XRayError} if existing element cannot be found
		 */
		replace(array, newElement, {element=undefined, index=undefined, predicate=undefined}) {
			index=_searchCriteriaToIndex(array, {element, index, predicate});
			if(index>-1) {
				array=array.slice();
				array[index]=newElement;
			} else {
				throw new XRayError({
					instance: this.constructor.name,
					message: "replace(): Could not find existing element to replace"
				});
			}
			return array;
		},

		/**
		 * @param {Array} array
		 * @param {string} property
		 * @param {boolean} reverse
		 * @param {function(v1:*, v2:*):number} comparer
		 * @returns {[*]}
		 */
		sort(array, property, {
			comparer=util.compare,
			reverse=false
		}={}) {
			if(array) {
				array=array.slice();
				array.sort((o1, o2)=>comparer(_.get(o1, property), _.get(o2, property)));
				if(reverse) {
					array.reverse();
				}
				return array;
			}
		}
	},

	object: {
		/**
		 * Clones an object or object path
		 * @param {*} object
		 * @param {string} path
		 * @param {boolean} deep
		 * @returns {*}
		 */
		clone(object, {path=undefined, deep=false}={}) {
			if(_.isEmpty(path)) {
				return (deep)
					? _.cloneDeep(object)
					: Object.assign({}, object);
			} else {
				let parts=path.split(".");
				object=_.clone(object);
				object[parts[0]]=this.clone(object[parts[0]], parts.slice(1).join(), deep);
				return object;
			}
		}
	}
};

/**
 * Find index with given criteria
 * @param {Array} array
 * @param {*} element
 * @param {number} index
 * @param {Object|Function} predicate that will be used by lodash to find our man
 * @returns {number}
 * @private
 */
function _searchCriteriaToIndex(array, {element=undefined, index=undefined, predicate=undefined}) {
	if(element!==undefined) {
		index=array.indexOf(element);
	} else if(predicate!==undefined) {
		index=_.findIndex(array, predicate);
	} else {
		assert.ok(index!==undefined);
	}
	assert.toLog(index>-1);
	return index;
}
