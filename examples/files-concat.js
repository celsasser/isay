/**
 * mouse.js example of finding a select set of files and concatenating them together and saving results.
 * 1. create our target file such that if it exists it is reset to 0 bytes in length
 * 2. find all *.js files in our examples directory
 * 3. all os results are text, but we know that the result will be newline separated list of files. Here we split the result into paths
 * 4. reverse the sort
 * 5. write to stdout
 */

file.create("./tmp/samples.txt")
	.os.find("./examples -name \"*.js\"")
	.string.split({method: "newline"})
	.array.each(file.read()
		.file.write("./tmp/samples.txt", { append: true })
	)
