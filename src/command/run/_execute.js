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
const vm=require("vm");
const lib_os=require("../../lib/os");


/**************** Public Interface  ****************/
/**
 * Parses the script and returns a description of the sequence
 * @param {string|Buffer} input
 * @param {Array<LibraryNode>} Library
 * @param {string} script
 * @returns {Promise<DataBlob>}
 * @throws {Error}
 */
exports.runScript=async function({input=undefined, library, script}) {
	const {sequence}=_parseChain({library, script}),
		chain=_buildChain(sequence);
	return chain.process(input);
};

/**
 * Translates parsed script into a sequence of modules
 * @param {Array<ModuleDescriptor>} descriptors
 * @returns {ModuleBase}
 */
function _buildChain(descriptors) {
	/**
	 * Builds chain of modules. Works it's way forward
	 * @param {number} index
	 * @param {ModuleBase} next
	 * @returns {ModuleBase}
	 */
	function _build(index, next=undefined) {
		if(index<0) {
			return next;
		} else {
			const descriptor=descriptors[index];
			const instance=new descriptor.class({
				action: descriptor.action,
				domain: descriptor.domain,
				method: descriptor.method,
				output: next,
				params: descriptor.params
			});
			return _build(index-1, instance);
		}
	}

	return _build(descriptors.length-1);
}


/**
 * Builds a "library graph". It graphs the various routes that a single function call may make into our library.
 * And at each one of of the terminal nodes lies functionality that will allow us to track function call sequence.
 * Which in our world is a sequence of ModuleDescriptor. See <code>_parseChain</code> to see how that works.
 * And then uses vm.runInContext to steal the sequence
 * @param {Array<LibraryNode>} library
 * @param {string} script
 * @returns {{result:*, sequence:Array<ModuleDescriptor>}}
 * @throws {Error}
 * @private
 */
function _parseChain({library, script}) {
	/**
	 * This array will be populated when the graph is "run"
	 * @type {Array<ModuleDescriptor>}
	 */
	let callSequence=[],
		graphProxy;

	/**
	 * Creates and adds a ModuleDescriptor to our call-sequence
	 * @param {LibraryNode} node
	 * @param {Array<string>} args
	 * @returns {Proxy}
	 */
	function _addCall(node, ...args) {
		if(_.get(args, "0._id")==="urn:graph:proxy") {
			// The call's first argument is a graph proxy so that means the user is creating a "piped" chain
			// as an an argument. This means that the "piped" chain will take the calling functions output as input.
			// We build the chain and remove him from the call sequence.
			const index=callSequence.indexOf(args[0]._descriptor),
				chain=_buildChain(callSequence.slice(index));
			args[0]=chain.process.bind(chain);
			callSequence=callSequence.slice(0, index);
		} else if(_.isFunction(args[0])) {
			// the call's first argument is a function (predicate). Our only concern here is whether it includes a chain (which is
			// not real javascript). We parse him as we did the top level chain and then inspect the results and act accordingly:
			// First, capture the function script so that we may run it later
			const script=args[0].toString();
			// intercept the call so that we may steal and describe the function with params, parse and run it ourselves
			args[0]=function(...input) {
				const params=input
					.map(JSON.stringify)
					.join(",");
				const {sequence, result}=_parseChain({
					library,
					script: `(${script})(${params})`
				});
				// now we either have found a chain or we have run a chain free function and have what we need.
				if(sequence.length>0) {
					const chain=_buildChain(sequence);
					return chain.process.call(chain, input);
				} else {
					return result;
				}
			};
		}

		// todo: last call processing is flawed when the chain we are processing is a "piped" chain
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
		// a module (and it's chain) should it be used as an argument. To do so we are creating a new
		// proxy object so that we may accomplish this.
		graphProxy._descriptor=_.last(callSequence);
		graphProxy=new Proxy(graphObject, proxyTop);
		return graphProxy;
	}

	/**
	 * Proxies all attempts to dereference properties at the tippy-top. The only reason we need this is for
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
	graphProxy=new Proxy(graphObject, proxyTop);

	// this is the crank that gets everything up above rolling. We use our graph-proxy as the context in
	// which our scripts is run so that we may intercept all calls. What does this buy us? Everything:
	// 1. parsed the code
	// 2. we can steal his parsing of arguments
	// 3. it puts javascript at our disposal to a limited extent.
	const result=vm.runInContext(script, vm.createContext(graphProxy));
	return {
		sequence: callSequence,
		result
	};
}

