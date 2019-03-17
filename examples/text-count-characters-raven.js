/**
 * mouse.js example of reading and reducing text into a sorted frequency analysis list
*/

file.read("./examples/data/the-raven.txt")
	.string.lower()
	.string.replace(/\s+/g, "")
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
	std.out()
