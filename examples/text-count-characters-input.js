/**
 * mouse.js example of using input and reading from the path specified by it. It asserts the input and then
 * reads and reduces reducing text into a sorted frequency analysis list.
 *
 * -i option example:
 * ./mouse.js run -i "./readme.md" -s "./examples/text-count-characters-input.js"
 *
 * stdin example:
 * printf "./readme.md" | ./mouse.js run -s "./examples/text-count-characters-input.js"
*/

app.assert(is.type("String"), "input file is missing")
	.file.read()
	.string.lower()
	.string.replace(/(\s|[^a-zA-Z])+/g, "")
	.string.split("")
	.array.reduce(function(result, character) {
		result[character]=result[character]
			? result[character]+1
			: 1;
		return result;
	}, {})
	.object.toArray(function(count, character) {
		return {
			count,
			character
		}
	})
	.array.sort(["-count", "character"])
	.std.outln()
