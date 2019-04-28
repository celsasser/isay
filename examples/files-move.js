/**
 * mouse.js example of finding a select set of files and copying them to another directory.
 * This example behaves like "cp" and does rebuild to source directory hierarchy which <link>./files-copy-rebuild.js</link> does
 * 
 * 1. use the os's cp to recursively copy the contents of ./examples to ./tmp
 * 2. use the os's find to find all files within ./tmp (that we just copied)
 * 3. all os results are text, but we know that the result will be newline separated list of files. Here we split the result into paths
 * 4. filter on ".js" and ".json" and ".yaml" files
 * 5. move filtered results to "./tmp/moved"
 */

os.cp("-R ./examples ./tmp")
	.os.find("./tmp")
	.string.split({method: "newline"})
	.array.filter(is.endsWith([".js", ".json", "*.yaml"]))
	.array.each(file.move("./tmp/moved/."))
