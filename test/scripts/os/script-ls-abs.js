/**
 * Another os test with ls with a little more functionality
 */
os.ls(".")
	.string.split({method: "newline"})
	.array.filter(not.empty())
	.array.map(path.absolute())
	.array.sort(path=>path.length)
	.std.outln()
