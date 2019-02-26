/**
 * mouse.js example of reading and filtering text and integrating with remote APIs
 * To summarize we are:
 * - loading "The Raven"
 * - isolate "big" words and reduce to a unique set
 * - lookup words using an online dictionary API
 * - parse the results which we know are JSON
 * - reduce the results to one definition. Note: the particular API we are using is
 *   pretty crumby and common words are missing.
 * - present
*/

file.read("./examples/data/the-raven.txt")
	.string.split(/\W+/)
	.array.filter(word=>word.length>9)
	.array.map(word=>word.toLowerCase())
	.array.unique()
	.array.sort()
	.debug.dump()
	.array.map(word=>{
		os.curl("--get", `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=58001a89-66f9-4249-8d04-8464711ce694`)
			.json.parse()
			.object.map([
				{from: "0.meta.id", to: "word"},
				{from: "0.shortdef.0", to: "definition"}
			])
	})
	.std.out()
