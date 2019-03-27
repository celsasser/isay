/**
 * Example of running "ls", filtering, altering the order and writing to stdout
 */

os.ls(".")
	.string.split({method: "newline"})
	.array.filter(not.empty())
	.array.sort()
	.std.outln()
