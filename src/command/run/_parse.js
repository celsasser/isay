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
const vm=require("vm");
const {createChain}=require("./_chain");
const editor=require("./_editor");
const {toLocalPath}=require("../../common/file");
const {loadLibrary}=require("../../lib");
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
exports.parseScript=async function(configuration) {
	const script=await _loadScript(configuration),
		library=loadLibrary();
	return _buildModuleDescriptorSequence({library, script});
};


/********************* Private Interface *********************/
/**
 * Builds a "library graph". It graphs the various routes that a single function call may make into our library.
 * And at each one of of the terminal nodes lies functionality that will allow us to track function call sequence.
 * Which in our world is a sequence of ModuleDescriptor. See <code>_buildModuleDescriptorSequence</code> to see how that works.
 * And then uses vm.runInContext to steal the sequence
 * @param {Array<LibraryNode>} library
 * @param {string} script
 * @returns {Array<ModuleDescriptor>}
 * @throws {Error}
 * @private
 */
function _buildModuleDescriptorSequence({library, script}) {
	/**
	 * This array will be populated when the graph is "run"
	 * @type {Array<ModuleDescriptor>}
	 */
	let callSequence=[];

	/**
	 * Creates and adds a ModuleDescriptor to our call-sequence
	 * @param {LibraryNode} node
	 * @param {Array<string>} args
	 * @returns {graphProxy}
	 */
	function _addCall(node, ...args) {
		// if his argument is a graph proxy then that means the user is creating a chain which will take
		// the calling functions output as input. We build the chain and remove him from the call sequence.
		if(_.get(args, "0._id")==="urn:graph:proxy") {
			const index=callSequence.indexOf(args[0]._descriptor),
				chainHead=createChain(callSequence.slice(index));
			args[0]=chainHead.process.bind(chainHead);
			callSequence=callSequence.slice(0, index);
		}

		// todo: last call processing is flawed when the chain we are processing is a newly defined chain
		// serving as an argument to an existing chain - as we just processed up there ^.
		const lastCall=_.last(callSequence);
		if(node.domain===undefined && lastCall===null) {
			throw new Error(`cannot resolve a function domain for action=${node.action}`);
		}
		callSequence.push({
			action: node.action,
			class: node.class || lastCall.class,
			domain: node.domain || lastCall.domain,
			method: node.method || node.action,
			params: args
		});
		// what are we doing here? We want to stash the descriptor so that we may be able to identify
		// a module (and it's chain) should it be used as an argument.
		graphProxy._descriptor=_.last(callSequence);
		return _.clone(graphProxy);
	}

	/**
	 * Proxies all attempts to dereference properties at the tippy top. The only reason we need this is for
	 * our "os" friend. If an action is requested of us and we don't know about it and the last call was on
	 * domain="os" then we assume that the property is an "os" action. */
	const proxyTop={
		get(target, property) {
			if(!(property in target)) {
				if(_.get(_.last(callSequence), "domain")==="os") {
					target[property]=_addCall.bind(null, {
						action: property,
						method: "executionHandler"
					});
				}
			}
			return target[property];
		}
	};
	/**
	 * Proxies all attempts to get properties on "os". We open up the floodgates and assume at this level that all
	 * is valid. If the command doesn't exist of the commands params are screwy then the caller will be told at runtime.
	 */
	const proxyOS={
		get(target, property) {
			if(!(property in target)) {
				target[property]=_addCall.bind(null, {
					action: property,
					class: lib_os.ModuleOs,
					domain: "os",
					method: "executionHandler"
				});
			}
			return target[property];
		}
	};

	// And finally we get to the graph that we build from our library.
	//
	const graphObject=library.reduce((result, node)=>{
		// The top level to cover those that are hijacking the last domain.
		// note: name collisions don't matter here because we resolve these guys to the last explicit domain
		if(result.hasOwnProperty(node.action)===false) {
			result[node.action]=_addCall.bind(null, node);
		}
		// and all domain.action combinations
		_.set(result, `${node.domain}.${node.action}`, _addCall.bind(null, node));
		return result;
	}, {
		_id: "urn:graph:proxy",
		os: new Proxy({}, proxyOS)
	});
	let graphProxy=new Proxy(graphObject, proxyTop);

	// this is the crank that gets everything up above rolling. We use our graph-proxy as the context in
	// which our scripts is run so that we may intercept all calls. What does this buy us? Everything:
	// 1. parsed the code
	// 2. we can steal his parsing of arguments
	// 3. it puts javascript at our disposal to a limited extent.
	vm.runInContext(script, vm.createContext(graphProxy));
	return callSequence;
}

/**
 * Finds the "run" script and returns it if it is in our configuration otherwise launches
 * the users preferred terminal editor to get it.
 * @param {CliParsed} configuration
 * @returns {string}
 * @private
 */
async function _loadScript(configuration) {
	if(configuration.options.script) {
		return fs.readFile(configuration.options.script, {encoding: "utf8"})
	} else if(_.isEmpty(configuration.params[0])===false) {
		return configuration.params[0];
	} else {
		return fs.readFile(toLocalPath("./res/template-run.js"), {encoding: "utf8"})
			.then(template=>editor.getScript({
				template
			}));
	}
}
