/**
 * isay.js example of reading and filtering text and integrating with remote APIs
 * To summarize we are:
 * - loading "The Raven"
 * - isolating "big" words and reducing to a unique set
 * - looking up words using a limited API we are using thanks to Merriam Webster. Incidentally, the key we are using is a
 *   limited use key. Please be considerate and isolate its use to this example. They offer keys to all who register. Highly recommended.
 * - parse the results which we know are JSON
 * - reduce the results to one definition. Note: the particular API we are using is
 *   pretty crumby and common words are missing.
 * - present
*/

file.read("./examples/data/the-raven.txt")
	.string.lower()
	.string.split(/\W+/)
	.array.filter(function(word) {
		return word.length>9
	})
	.array.unique()
	.array.sort()
	.array.map(function(word) {
		os.curl("--get", `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=58001a89-66f9-4249-8d04-8464711ce694`)
			.json.parse()
			.object.map([{from: "0.shortdef.0", to: "definition"}])
			.object.merge({word})
	})
	.std.outln()
