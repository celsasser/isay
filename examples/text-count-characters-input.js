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

app.assert(is.type("String"))
	.file.read()
	.string.lower()
	.string.replace(/\s+/g, "")
	.string.split("")
	.array.reduce((result, character)=>{
		result[character]=result[character]
			? result[character]+1
			: 1;
		return result;
	}, {})
		.object.toArray((count, character)=>({
		count,
		character
	}))
	.array.sort(["-count", "character"])
	std.out()
