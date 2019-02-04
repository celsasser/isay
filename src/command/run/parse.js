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
const {toLocalPath}=require("../../common/file");
const lib_os=require("../../lib/os");


/********************* Local Types *********************/
/**
 * @typedef {Object} LibraryNode
 * @property {string} action
 * @property {class} class
 * @property {string} domain
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
 * And at each one of of the terminal nodes lies functionality that will allow us to track function call sequence.
 * Which in our world is a sequence of ModuleDescriptor. See <code>_buildModuleDescriptorSequence</code> to see how that works.
 * @param {Array<LibraryNode>} library
 * @returns {Object}
 * @throws {Error}
 * @private
 */
function _buildLibraryGraph(library) {
	let graphProxy,
		graphObject={
			/**
			 * Creates and adds a ModuleDescriptor to our call-sequence
			 * @param {LibraryNode} node
			 * @param {Array<string>} args
			 * @returns {graphProxy}
			 */
			_addCall(node, ...args) {
				if(node.domain) {
					this._lastDomainNode=node;
				} else if(this._lastDomain===null) {
					throw new Error(`cannot resolve a domain for action=${node.action}`);
				}
				this._callSequence.push({
					action: node.action,
					class: node.class || this._lastDomainNode.class,
					domain: node.domain || this._lastDomainNode.domain,
					method: node.method || node.action,
					params: args
				});
				return graphProxy;
			},
			/**
			 * This stack will be built when the graph is "run"
			 * @type {Array<ModuleDescriptor>}
			 */
			_callSequence: [],
			/**
			 * Used a runtime to track the last fully described domain and action
			 * @type {LibraryNode}
			 */
			_lastDomainNode: null
		};

	/**
	 * Proxies all attempts to get properties on "os". We open up the floodgates.
	 */
	const proxyOS={
		get(target, property) {
			// console.log(`proxyOS.get: property=${property}`);
			if(!(property in target)) {
				target[property]=graphObject._addCall.bind(graphObject, {
					action: property,
					class: lib_os.ModuleOs,
					domain: "os",
					method: "executionHandler"
				});
			}
			return target[property];
		}
	};
	/**
	 * Proxies all "gets" at the root of the graph so that we may deal with os requests that omit their domain
	 */
	const proxyTop={
		get(target, property, receiver) {
			// console.log(`proxyTop.get: property=${property}`);
			if(!(property in target)) {
				if(_.get(target._lastDomainNode, "domain")==="os") {
					target[property]=graphObject._addCall.bind(graphObject, {
						action: property,
						method: "executionHandler"
					});
				}
			}
			return target[property];
		}
	};

	graphObject=library.reduce((result, node)=>{
		// top level to cover those that are hijacking the last domain
		// note: this will be a problem if any of our domains and actions collide
		if(result.hasOwnProperty(node.action)===false) {
			result[node.action]=graphObject._addCall.bind(graphObject, node);
		}
		_.set(result, `${node.domain}.${node.action}`, graphObject._addCall.bind(graphObject, node));
		return result;
	}, graphObject);

	graphObject.os=new Proxy({}, proxyOS);
	return graphProxy=new Proxy(graphObject, proxyTop);
}

/**
 * Builds a list of all possible calls supported by our library. It includes all:
 * 	1. [domain].<action> possibilities
 * 	2. <action> possibilities where the domain is inherited from a previous call (with a domain)
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
							domain: path.parse(filename).name
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
 * Finds the "run" script and returns it
 * @param {CliParsed} configuration
 * @returns {string}
 * @private
 */
function _loadScript(configuration) {
	return (configuration.options.script)
		? fs.readFileSync(configuration.options.script, {encoding: "utf8"})
		: configuration.params[0] || "";
}
