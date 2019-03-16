/**
 * User: curtis
 * Date: 2019-02-01
 * Time: 00:48
 * Copyright @2019 by Xraymen Inc.
 *
 * We reserve this space for utils
 */

const fs=require("fs-extra");
const path=require("path");
const {toLocalPath}=require("../common/file");
const {ModuleBase}=require("./_base");

/********************* Types *********************/

/**
 * Builds a list of all possible calls supported by our library. It includes all:
 * 	1. [domain].<action> possibilities
 * 	2. <action> possibilities where the domain is inherited from a previous call (with a domain). This guy
 * 	   is vulnerable to overlapping action names.
 * @returns {Array<LibraryNode>}
 * @private
 */
function loadLibrary() {
	/**
	 * Recursively iterates through the class and picks up all descriptors up to ModuleBase
	 * @param {class} clss
	 * @return {Object<string, PropertyDescriptor>}
	 */
	function _getModuleDescriptors(clss) {
		let result={};
		while(clss!==ModuleBase) {
			result=Object.assign(Object.getOwnPropertyDescriptors(clss.prototype), result);
			clss=Object.getPrototypeOf(clss);
		}
		return result;
	}

	const libraryPath=toLocalPath("./src/lib");
	return fs.readdirSync(toLocalPath("./src/lib"))
		.filter(filename=>{
			const parsed=path.parse(filename);
			return parsed.ext===".js"
				&& parsed.name.startsWith("_")===false
				&& parsed.name!=="index"
				// we don't include os because of his exceptional nature
				&& parsed.name!=="os";
		})
		.reduce((result, filename)=>{
			const module=require(path.join(libraryPath, filename));
			const _processClassName=(name)=>{
				const clss=module[name],
					descriptors=_getModuleDescriptors(clss);
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

module.exports={
	loadLibrary
};
