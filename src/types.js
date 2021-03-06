/**
 * Date: 10/31/18
 * Time: 1:48 AM
 *
 * Library of locally defined types
 */


/********************* API Types *********************/
/**
 * @typedef {Array<*>} CsvRow
 */

/**
 * @typedef {Array<CsvRow>} CsvDoc
 */

/**
 * @typedef {*} DataBlob
 */

/**
 * @typedef {{millis:Number, seconds:Number, minutes:Number, hours:Number, days:Number}} DurationObject
 */

/**
 * @typedef {"ascii", "binary", "utf8", "unicode"} Encoding
 */

/**
 * @typedef {function(data:DataBlob):DataBlob} ActionPredicate
 */

/**
 * @typedef {function(data:DataBlob, error:Error):DataBlob} CatchPredicate
 */

/**
 * @typedef {function(value:DataBlob, index:(number|string)):boolean} FilterPredicate
 */

/**
 * @typedef {function(value:DataBlob, index:(number|string)):void} IteratePredicate
 */

/**
 * @typedef {function(value:DataBlob, index:(number|string)):DataBlob} MapPredicate
 */

/**
 * @typedef {function(result:DataBlob, data:DataBlob, index:(number|string)):*} ReducePredicate
 */

/**
 * @typedef {function(value:DataBlob):boolean} TestPredicate
 */


/********************* Internal Types *********************/
/**
 * @typedef {"debug"|"verbose"|"info"|"warn"|"error"|"crit"} LogLevel
 */

/**
 * @typedef {Object} CliAction
 * @property {string} args - text description of expected args
 * @property {string} desc - text description of the action
 * @property {function(position:Array<string>, options:Object<string, CliOption>)} validate
 */

/**
 * @typedef {Object} CliOption
 * @property {Object} args
 * @property {number} args.count
 * @property {string|undefined} args.name - description of arg if there is one
 * @property {Object} keys
 * @property {string} keys.short - the single hyphen command line option name
 * @property {string} keys.long - the double hyphen command line option name
 * @property {boolean} required - whether argument is required or not
 */

/**
 * @typedef {{action:string, params:Array<string>, ...}} CliParsed
 * @property {string} action
 * @property {Array<string>} params
 * @property {Object} options
 */

/**
 * @typedef {Object} CompilerFunction
 * @property {string} body
 * @property {Function} compiled
 * @property {string} compilable
 * @property {Object} context
 * @property {boolean} es6
 * @property {Array<string>} params
 */

/**
 * @typedef {Object} LibraryNode
 * @property {string} action
 * @property {class} class
 * @property {string} domain
 */

/**
 * @typedef {Object} ModuleDescriptor
 * @property {string} action
 * @property {class} class
 * @property {string} domain
 * @property {string} method
 * @property {Array<string>} params
 */

/**
 * @typedef {function(module:ModuleDescriptor):void} ModuleDescriptorValidator
 * @throws {Error}
 */
