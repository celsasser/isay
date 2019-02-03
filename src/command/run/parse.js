/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:28
 * Copyright @2019 by Xraymen Inc.
 *
 * This is where the run script is parsed and converted into an array of ModuleDescriptor.
 * Parsing: we cheat. We let the V8 vm do most of the work. We create an object with our
 * mappings for our entire command dictionary.
 */

const _=require("lodash");
const fs=require("fs-extra");
const path=require("path");
const vm=require("vm");
const {XRayError}=require("../../common/error");
const {toLocalPath}=require("../../common/file");


/********************* Local Types *********************/
/**
 * @typedef {Object} LibraryNode
 * @property {string} action
 * @property {class} class
 * @property {string} domain
 * @property {NodeModule} module
 */


/**************** Public Interface  ****************/
/**
 * Parses the script and returns a description of the sequence
 * @param {CliParsed} configuration
 * @returns {Array<ModuleDescriptor>}
 * @throws {Error}
 */
exports.parseScript=function(configuration) {
	const script=_loadScript(configuration),
		library=_loadLibrary(),
		graph=_buildLibraryGraph(library);
	return _buildModuleDescriptorSequence(script, graph);
};


/********************* Private Interface *********************/
/**
 * Builds the ModuleDescriptor sequence.
 * @param {string} script
 * @param {Object} graph
 * @returns {Array<ModuleDescriptor>}
 * @throws {Error}
 * @private
 */
function _buildModuleDescriptorSequence(script, graph) {
	const context=vm.createContext(graph);
	vm.runInContext(script, context);
	return context._callSequence;
}

/**
 * Builds a "library graph". It graphs the various routes that a single function call may make into our library.
 * @param {Array<LibraryNode>} library
 * @returns {Object}
 * @private
 */
function _buildLibraryGraph(library) {
	const graph={
		/**
		 * This stack will be built when the graph is "run"
		 */
		_callSequence: [],
		/**
		 * Used a runtime to track the last fully described domain and action
		 * @type {LibraryNode}
		 */
		_lastDomainNode: null
	};
	return library.reduce((result, node)=>{
		// top level to cover those that are hijacking the last domain
		// note: this will be a problem if any of our domains and actions collide
		if(result.hasOwnProperty(node.action)===false) {
			result[node.action]=()=>{
				if(graph._lastDomain===null) {
					throw new Error(`cannot resolve a domain for action=${node.action}`);
				} else {
					graph._callSequence.push({
						action: node.action,
						class: graph._lastDomainNode.class,
						domain: graph._lastDomainNode.domain,
						params: Array.from(arguments)
					});
					return graph;
				}
			};
		}
		// domain specific handler
		_.set(result, `${node.domain}.${node.action}`, ()=>{
			graph._callSequence.push({
				action: node.action,
				class: node.class,
				domain: node.domain,
				params: Array.from(arguments)
			});
			graph._lastDomainNode=node;
			return graph;
		});
		return result;
	}, graph);
}

/**
 * Builds an internal representation of our library
 * @returns {Array<LibraryNode>}
 * @private
 */
function _loadLibrary() {
	const libraryPath=toLocalPath("./src/lib");
	return fs.readdirSync(toLocalPath("./src/lib"))
		.filter(filename=>filename.endsWith(".js") && !_.includes(["base.js", "index.js"], filename))
		.reduce((result, filename)=>{
			const module=require(path.join(libraryPath, filename));
			const _processClassName=(name)=>{
				const clss=module[name],
					descriptors=Object.getOwnPropertyDescriptors(clss.prototype);
				Object.keys(descriptors)
					.filter(name=>{
						return typeof descriptors[name].value==="function"
							&& !name.startsWith("_")
							&& name!=="constructor"
							&& descriptors[name].get===undefined
							&& descriptors[name].set===undefined;
					})
					.forEach(property=>{
						result.push({
							action: property,
							class: clss,
							domain: path.parse(filename).name,
							module
						});
					});
			};

			Object.keys(module)
				.filter(property=>/^[A-Z]/.test(property))
				.forEach(_processClassName);
			return result;
		}, []);
}

/**
 * Finds the script and returns it one way or the other
 * @param {CliParsed} configuration
 * @private
 */
function _loadScript(configuration) {
	return (configuration.options.script)
		? fs.readFileSync(configuration.options.script, {encoding: "utf8"})
		: configuration.params[0] || "";
}
