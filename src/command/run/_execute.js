/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:28
 * Copyright @2019 by Xraymen Inc.
 *
 * This is where the run script is parsed and converted into an array of ModuleDescriptor.
 * Parsing: we cheat. We let the V8 vm do most of the work. We create an object with our
 * mappings for our entire (library) dictionary.
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
	let callSequence=[];

	/**
	 * Creates and adds a ModuleDescriptor to our call-sequence
	 * @param {LibraryNode} node
	 * @param {Array<string>} args
	 * @returns {Proxy}
	 */
	function _addCall(node, ...args) {
		if(_.get(args, "0._type")==="urn:graph:proxy") {
			// The call's first argument is a graph proxy so that means the user has created an embedded chain
			// as an an argument. This means that the "piped" chain will take the calling functions output as input.
			// We build the chain and remove him from the call sequence.
			// todo: 2/23/2019 - this is broken. For the time being all we are doing is taking the last node. It's wrong but
			// todo: am leaving around thinking that a solution is near at hand.
			// What is the problem? Ss things are, I haven't figured out a way to tell how long this chain is
			// - what is it's head node? I tried some solutions but without introducing parsing could not see
			// a reliable solution. If we take back up the challenge, go back to a commit prior to 2019-02-23T19:34:15
			// and you may see what we experimented with.

			// For now, we assume it's a single function call.
			const index=callSequence.length-1,
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
				// todo: we will want to make sure that the input args are made available to the chain otherwise
				// his attempts to reference those args will result in "undefined"
				if(sequence.length>0) {
					const chain=_buildChain(sequence);
					return chain.process.apply(chain, input);
				} else {
					return result;
				}
			};
		}

		// todo: last call processing is flawed when the chain we are processing is a "piped" chain
		// serving as an argument to an existing chain - as we just processed up there ^.
		const lastCallDescriptor=_.last(callSequence);
		if(node.domain===undefined && lastCallDescriptor==null) {
			throw new Error(`cannot resolve a function domain for action=${node.action}`);
		}
		callSequence.push({
			action: node.action,
			class: node.class || lastCallDescriptor.class,
			domain: node.domain || lastCallDescriptor.domain,
			method: node.method || node.action,
			params: args
		});
		return runContext;
	}

	/**
	 * Proxies all attempts to get properties on "os". We open up the floodgates and assume at this level that all
	 * is valid. If the command doesn't exist of the commands params are screwy then the caller will be told at runtime.
	 */
	const proxyOSHandler={
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
		},
		proxyOS=new Proxy({}, proxyOSHandler);

	/**
	 * And here we build everything that we want in the run context. Which is support for our own lexicon.
	 * Note that all <code>os.</code> dereferences are handled by proxyOSHandler.
	 */
	const runContext=library.reduce((result, node)=>{
		// and all domain.action combinations
		_.set(result, `${node.domain}.${node.action}`, _addCall.bind(null, node));
		return result;
	}, {
		os: proxyOS,
		_type: "urn:graph:proxy"
	});

	// this is the crank that gets everything up above rolling. We use our graph-proxy as the context in
	// which our scripts is run so that we may intercept all calls. What does this buy us? Everything:
	// 1. parsed the code
	// 2. we can steal his parsing of arguments
	// 3. it puts javascript at our disposal to a limited extent.
	const result=vm.runInContext(script, vm.createContext(runContext));
	return {
		sequence: callSequence,
		result
	};
}

