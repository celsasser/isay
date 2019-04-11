/**
 * mouse.js example zipping a set of filtered files:
 * 1. get a list of all files in the current directory
 * 2. split the text list into an array of paths
 * 3. filter the paths by those that are in "res", "src" and "test"
 * 4. log the list
 * 5. zip up the list
 */

os.find(".")
	.string.split({method: "newline"})
	.array.filter(is.startsWith(["./res", "./src", "./test"]))
	.std.outln()
	.file.zip("./tmp/build")
