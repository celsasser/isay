/**
 * isay.js example of using input and reading from the path specified by it. It asserts the input and then
 * reads, parses, reduces and sorts the resulting array of {count:number, word:string} objects.
 *
 * -i option example:
 * ./isay.js run -i "./readme.md" -s "./examples/text-count-words-input.js"
 *
 * stdin example:
 * printf "./readme.md" | ./isay.js run -s "./examples/text-count-words-input.js"
*/

app.assert(is.type("String"), "input file is missing")
	.file.read()
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
	.std.outln()
