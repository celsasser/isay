/**
 * Date: 3/5/2018
 * Time: 9:10 PM
 * @license MIT (see project's LICENSE file)
 */

const _=require("lodash");

const inspect={
	DEFAULT_DEPTH: Infinity,
	DEFAULT_SHALLOW: new Set([
		"Buffer",
		"BufferList",
		"Collection",
		"ConnectionPool",
		"Db",
		"HttpConnector",
		"HTTPParser",
		"IncomingMessage",
		"MongoClient",
		"ReadableState",
		"ReadStream",
		"ServerResponse",
		"Socket",
		"Stats",
		"TCP",
		"Timer",
		"TimersList",
		"Transport",
		"WritableState",
		"WriteStream"
	])
};

/********************** General Purpose **********************/
/**
 * Compares object with handling for undefined objects.
 * @param {Object} object1
 * @param {Object} object2
 * @param {Object} options
 * @returns {int}
 */
exports.compare=function(object1, object2, options=undefined) {
	if(object1===object2) {
		return 0;
	} else if(object1==null) {
		return 1;
	} else if(object2==null) {
		return -1;
	} else if(_.isString(object1) && _.isString(object2)) {
		return exports.compareStrings(object1, object2, options);
	} else if(_.isDate(object1) && _.isDate(object2)) {
		return _.clamp(object1-object2, -1, 1);
	}
	require("../../test/support/assert").toLog(_.isNumber(object1) && _.isNumber(object2));
	return object1-object2;
};


/********************** Array **********************/
/**
 * Performs omit on each element in the specified array
 * @param {Array<Object>|null}array
 * @param {string|Array<string>} path
 * @returns {Array<Object>}
 */
exports.arrayOmit=(array, path)=>(array || []).map(_.partialRight(_.omit, path));

/**
 * Performs pick on each element in the specified array
 * @param {Array<Object>|null}array
 * @param {string|Array<string>} path
 * @returns {Array<Object>}
 */
exports.arrayPick=(array, path)=>(array || []).map(_.partialRight(_.pick, path));

/**
 * Makes sure the value is an array and if not is put into an array.
 * @param {*} value
 * @returns {[*]}
 */
module.exports.ensureArray=function(value) {
	if(_.isArray(value)) {
		return value;
	} else if(value==null) {
		return [];
	}
	return [value];
};


/********************** String **********************/
/**
 * compares two strings
 * @param {string} s1
 * @param {string} s2
 * @param {boolean} ignoreCase
 * @returns {number} -1, 0, 1
 */
module.exports.compareStrings=function(s1, s2, {
	ignoreCase=true
}={}) {
	if(s1!=null) {
		if(s2!=null) {
			if(ignoreCase) {
				s1=s1.toLowerCase();
				s2=s2.toLowerCase();
			}
			return _.clamp(s1.localeCompare(s2), -1, 1);
		} else {
			return -1;
		}
	} else if(s2) {
		return 1;
	}
	return 0;
};

/********************** Object **********************/
/**
 * It minimized the amount of data that needs to be cloned
 * @param {Object} object
 * @param {string} path - optional path of the selective hierarchy of objects you would like to clone
 * @param {number} minus - number of path elements to subtract from tail. Handy for cloning up to a point in a path
 *    without forcing you to do the path math.
 * @returns {Object}
 */
exports.clonePath=function(object, path, {
	minus=0
}={}) {
	object=_.clone(object);
	if(path.length>0) {
		let parts=path.split("."),
			parent=object;
		while(parts.length>minus) {
			parent[parts[0]]=_.clone(parent[parts[0]]);
			parent=parent[parts[0]];
			parts.shift();
		}
	}
	return object;
};

/**
 * Deletes the object at the property path in <code>object</code>
 * @param {Object} object
 * @param {string} path
 * @returns {Object|Array|string}
 */
module.exports.delete=function(object, path) {
	function _delete(_object, property) {
		let index;
		if(_.isArray(_object) && !_.isNaN(index=Number(property))) {
			_object.splice(index, 1);
		} else {
			delete _object[property];
		}
	}

	const index=_.lastIndexOf(path, ".");
	if(index> -1) {
		_delete(_.get(object, path.substr(0, index), {}), path.substr(index+1));
	} else {
		_delete(object, path);
	}
	return object;
};

/**
 * A variation of lodash's set but only sets if the value is not set:
 *    - if object is not set then it defaults to {}
 *    - it returns the value at "path"
 * @param {Object|string} object
 * @param {string|*} path
 * @param {*} value
 * @returns {{root:Object, value:*}}
 */
module.exports.ensure=function(object, path, value) {
	if(arguments.length<3) {
		value=path;
		path=object;
		object={};
	}
	if(!_.has(object, path)) {
		_.set(object, path, value);
	}
	return {
		root: object,
		value: _.get(object, path)
	};
};

/**
 * Gets the object name if possible. If not then the type.
 * @param {*} object
 * @returns {string}
 */
exports.name=function(object) {
	if(object!=null) {
		// I think that all possible values will have constructors.  We are playing it safe.
		if(object.constructor) {
			return object.constructor.name;
		} else {
			return typeof(object);
		}
	}
	return String(object);
};

/**
 * Strips functions out of object and returns an object with a max depth of depth
 * @param {Object} object
 * @param {number} depth
 * @param {Set} shallow optional object constructor types that we don't descend into
 * @param {boolean} sort - whether we sort the object keys
 * @returns {Object}
 */
exports.objectToData=function(object, {
	depth=inspect.DEFAULT_DEPTH,
	shallow=inspect.DEFAULT_SHALLOW,
	sort=false
}={}) {
	const circular=new WeakSet(),
		isSimple=(value)=>_.isEmpty(value) || _.includes(["string", "number", "boolean"], typeof(value));

	function inspect(_object, _depth=0) {
		if(_depth>=depth) {
			return isSimple(_object) ? _object : `<${exports.name(_object)}>`;
		} else {
			const keys=Object.keys(_object);
			if(sort) {
				keys.sort();
			}
			return _.reduce(keys, function(result, key) {
				const value=_object[key];
				if(!_.isFunction(value)) {
					if(_.isError(value)) {
						// we nestle errors in errors so let's make sure we process this guys properties minus the stack
						result[key]=inspect(Object.assign({
							message: value.message
						}, _.omit(value, "stack")), _depth+1);
					} else if(isSimple(value)) {
						result[key]=value;
					} else if(circular.has(value)) {
						result[key]=`<${exports.name(value)}:circular>`;
					} else {
						try {
							const name=exports.name(value);
							if(shallow.has(name)) {
								result[key]=`<${name}>`;
							} else {
								/* eslint-disable no-constant-condition */
								// turn this guy on when trying to catch offenders
								if(false) {
									// noinspection UnreachableCodeJS
									require("../../test/support/assert")
										.toLog(_.includes(["Object",
											"Array"], name), `objectKey=${key}, objectKeys=${Object.keys(value)}, constructor=${name}`);
								}
								circular.add(value);
								result[key]=inspect(value, _depth+1);
								circular.delete(value);
							}
						} catch(error) {
							require("./log").warn(`util.objectToData: name of ${key}=${value} threw exception? Super parent=${object.constructor.name}?`);
						}
					}
				}
				return result;
			}, _.isArray(_object) ? [] : {});
		}
	}

	return _.isEmpty(object)
		? object
		: inspect(object);
};

/**
 * Removes properties of objects with <param>removables</param>values. It does not remove <param>removables</param> from arrays
 * but it does recursively process array elements and should they be objects then it will scrub those objects.
 * Note: must be careful to make sure there are no recursive references inside your object.
 * @param {Object} object will only process object passing isObject test
 * @param {boolean} recursive whether to recurse into children properties
 * @param {*|[*]|Function} removables object or array of objects that qualify as or test for `remove`
 * @returns {Object} shiny clean guy all ready for action
 */
exports.scrubObject=function(object, {
	recursive=true,
	removables=[undefined]
}={}) {
	if(!_.isArray(removables)) {
		removables=[removables];
	}
	removables=removables.map((item)=>_.isFunction(item) ? item : (value)=>_.isEqual(value, item));
	if(_.isPlainObject(object)) {
		_.forEach(object, function(value, key, parent) {
			if(recursive) {
				exports.scrubObject(value, {recursive, removables});
			}
			for(let index=removables.length-1; index> -1; index--) {
				if(removables[index](value, key)) {
					delete parent[key];
					break;
				}
			}
		});
	} else if(_.isArray(object)) {
		for(let index=object.length-1; index> -1; index--) {
			if(recursive) {
				object[index]=exports.scrubObject(object[index], {recursive, removables});
			}
		}
	}
	return object;
};
