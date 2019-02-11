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
	const libraryPath=toLocalPath("./src/lib");
	return fs.readdirSync(toLocalPath("./src/lib"))
		.filter(filename=>{
			const parsed=path.parse(filename);
			return parsed.ext===".js"
				&& !parsed.name.startsWith("_")
				&& !parsed.name!=="index";
		})
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

module.exports={
	loadLibrary
};
