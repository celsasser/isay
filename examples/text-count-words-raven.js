/**
 * mouse.js example of reading, parsing and reducing text and sorting the resulting array of {count:number, word:string} objects.
*/

file.read("./examples/data/the-raven.txt")
	.string.lower()
	.string.split(/\W+/)
	.array.reduce(function(result, word) {
		result[word]=result[word]
			? result[word]+1
			: 1;
		return result;
	}, {})
	.object.toArray(function(count, word) {
		return {
			count,
			word
		}
	})
	.array.sort(["-count", "word"])
	.std.out()
