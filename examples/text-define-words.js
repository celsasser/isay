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
	.array.unique()
	.array.filter(word=>word.length>9)
	.array.map(word=>word.toLowerCase())
	.array.sort()
	.array.map(word=>{
		os.curl(`--get 'https://wordsapiv1.p.rapidapi.com/words/${word}/definitions' -H 'X-RapidAPI-Key: a8d145d4d0msha1bc10cde76a188p1d0581jsn0c57c6bc2072'`)
			.json.parse()
			.object.map(result=>({
				word: result.word,
				definition: (result.definitions && result.definitions.length>0)
					? result.definitions[0].definition
					: "[not found]"
			}))
	})
	.std.out()
