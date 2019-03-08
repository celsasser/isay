/**
 * Example of running "ls", filtering, altering the order and writing to stdout
 */
os.ls(".")
	.string.split("newline")
	.array.filter(not.empty())
	.array.sort()
	.std.out()
