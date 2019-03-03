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
const assert=require("assert");
const vm=require("vm");
const lib_os=require("../../lib/os");
const util=require("../../common/util");


/**************** Public Interface  ****************/
/**
 * Parses the script and returns a description of the sequence
 * @param {string|Buffer} input
 * @param {Array<LibraryNode>} Library
 * @param {string} script
 * @returns {Promise<DataBlob>}
 * @throws {Error}
 */
async function runScript({input=undefined, library, script}) {
	const transpiled=_transpileScript({library, script}),
		{sequence}=_parseChain({library, transpiled}),
		chain=_buildChain(sequence);
	return chain.process(input);
}

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
	 * @param {ModuleBase} trap - "catch" handler
	 * @returns {ModuleBase}
	 */
	function _build(index, next=undefined, trap=undefined) {
		if(index<0) {
			return next;
		} else {
			const descriptor=descriptors[index];
			const instance=new descriptor.class({
				action: descriptor.action,
				domain: descriptor.domain,
				method: descriptor.method,
				output: next,
				params: descriptor.params,
				trap
			});
			if(descriptor.action==="catch") {
				// This instance is a catch handler. We never want to flow into him. If an error is thrown then
				// we want to flow around him. But from here on he will be installed as the catch handler.
				// At least until another one is installed.
				return _build(index-1, next, instance);
			} else {
				return _build(index-1, instance, trap);
			}
		}
	}

	return _build(descriptors.length-1);
}

/**
 * Encodes a runtime param into a simple object. Most of our runtime objects will already be such objects. But there are exceptions.
 * @param {*} param
 * @returns {Object}
 * @private
 */
function _paramToPOJO(param) {
	if(param instanceof Error) {
		// these are errors that are being passed to predicates. How much info do they need? For example: stack, instance, embedded error?
		// We are making the API. We are going to keep it to bare essentials:
		return util.scrubObject({
			code: param.code,
			details: param.details,
			message: param.message
		});
	}
	return param;
}

/**
 * Builds a "library graph". It graphs the various routes that a single function call may make into our library.
 * And at each one of of the terminal nodes lies functionality that will allow us to track function call sequence.
 * Which in our world is a sequence of ModuleDescriptor. See <code>_parseChain</code> to see how that works.
 * And then uses vm.runInContext to steal the sequence
 * @param {Array<LibraryNode>} library
 * @param {string} transpiled
 * @returns {{result:*, sequence:Array<ModuleDescriptor>}}
 * @throws {Error}
 * @private
 */
function _parseChain({library, transpiled}) {
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
		// see <code>_transpileScript</code> for more information about declarationIndex.
		assert.ok(_.isNumber(args[0]));
		const declarationIndex=args[0];
		args=args.slice(1);
		if(_.get(args, "0._type")==="urn:graph:proxy") {
			// The call's first argument is a graph proxy so that means the user is using a chain as an argument
			// - a predicate. This chain will take the calling functions output as input.
			// Here we build the predicate chain and remove him from the call sequence.
			// How do we know how much to pull of the stack? By the declarationIndex. Everything that remains on
			// the call-stack that is greater this function declaration must be links in the nested chain.
			const predicateHeadIndex=_.findIndex(callSequence, descriptor=>descriptor._declarationIndex>declarationIndex),
				predicateChain=_buildChain(callSequence.slice(predicateHeadIndex));
			args[0]=predicateChain.process.bind(predicateChain);
			callSequence=callSequence.slice(0, predicateHeadIndex);
		} else if(_.isFunction(args[0])) {
			// the call's first argument is a function (predicate). Our only concern here is whether it includes a chain which
			// will not execute properly without our help. Hence, we get involved. We parse him as we did the top level chain
			// and then inspect the results and do chain processing if we find one.
			const script=args[0].toString();
			// intercept the call so that we may steal and describe the function with params, parse and run it ourselves
			args[0]=function(...input) {
				const params=input
					.map(param=>JSON.stringify(_paramToPOJO(param)))
					.join(",");
				const {sequence, result}=_parseChain({
					library,
					transpiled: `(${script})(${params})`
				});
				// now we either have found a chain or we have run a chain free function and have what we need.
				if(sequence.length>0) {
					const chain=_buildChain(sequence);
					return chain.process.apply(chain, input);
				} else {
					return result;
				}
			};
		}
		callSequence.push({
			_declarationIndex: declarationIndex,
			action: node.action,
			class: node.class,
			domain: node.domain,
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
	// 3. it puts javascript at our (script's) disposal.
	const result=vm.runInContext(transpiled, vm.createContext(runContext));
	return {
		sequence: callSequence,
		result
	};
}

/**
 * Modifies the script so that we may execute it properly. See comments inline for info on what and why
 * we are doing what we are doing
 * @param {Array<LibraryNode>} library
 * @param {string} script
 * @returns {string}
 * @private
 */
function _transpileScript({library, script}) {
	// first we are going to insert argument[0] indexes into each <domain>.<function> call so that we may be able
	// to properly manage the stack when processing nested chains
	const regexList=library.reduce((text, node)=>{
			return `${text}|${node.domain}\\.${node.action}`;
		}, ""),
		regexText=`(\\W|^)((os.\\w+${regexList})\\s*\\()`,
		regex=new RegExp(regexText, "g");
	for(let index=0; true; index++) {
		let match=regex.exec(script);
		if(!match) {
			break;
		} else {
			script=`${script.substr(0, regex.lastIndex)}${index},${script.substr(regex.lastIndex)}`;
		}
	}
	return script;
}

module.exports={
	runScript,
	_buildChain,
	_paramToPOJO,
	_parseChain,
	_transpileScript
};

