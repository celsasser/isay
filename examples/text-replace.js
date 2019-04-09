/**
 * mouse.js example of reading, replacing and writing text:
 * - loading "The Raven"
 * - Changing all cases of "raven" to "monkey"
 * - write to stdout
*/

file.read("./examples/data/the-raven.txt")
	.string.replace("RAVEN", "MONKEY")
	.string.replace(/raven/gi, "Monkey")
	.std.out()