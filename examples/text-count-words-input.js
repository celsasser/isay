/**
 * mouse.js example of using input and reading from the path specified by it. It asserts the input and then
 * reads, parses, reduces and sorts the resulting array of {count:number, word:string} objects.
 *
 * -i option example:
 * ./mouse.js run -i "./readme.md" -s "./examples/text-count-words-input.js"
 *
 * stdin example:
 * printf "./readme.md" | ./mouse.js run -s "./examples/text-count-words-input.js"
*/

app.assert(is.type("String"))
	.file.read()
	.string.lower()
	.string.split(/\W+/)
	.array.reduce((result, word)=>{
		result[word]=result[word]
			? result[word]+1
			: 1;
		return result;
	}, {})
	.object.toArray((count, word)=>{
		return {
			count,
			word
		}
	})
	.array.sort(["-count", "word"])
	std.out()
