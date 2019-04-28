/**
 * mouse.js example of finding a select set of files and copying them to another directory
 * Contrasted to <link>files-copy-flatten.js</link>, this example does rebuild to source directory hierarchy.
 * 1. find all files under our examples directory
 * 2. all os results are text, but we know that the result will be newline separated list of files. Here we split the result into paths
 * 3. filter on ".js" and ".json" files
 * 4. copy filtered results to "./tmp" while "rebuilding" the directory hierarchy
 */

os.find("./examples")
	.string.split({method: "newline"})
	.array.filter(is.endsWith([".js", ".json", ".txt", ".yaml"]))
	.array.each(file.copy("./tmp", {rebuild: true}))
