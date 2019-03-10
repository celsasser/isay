/**
 * mouse.js example of reading, replacing and writing text
 * To summarize we are:
 * - loading "The Raven"
 * - Changing all cases of "raven" to "monkey"
 * - saving in our tmp directory
*/

file.read("./examples/data/the-raven.txt")
	.string.replace("RAVEN", "MONKEY")
	.string.replace(/raven/gi, "Monkey")
	.file.write("./tmp/the-monkey.txt")
