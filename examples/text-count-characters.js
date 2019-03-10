/**
 * mouse.js example of reading and reducing text into a
*/

file.read("./examples/data/the-raven.txt")
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
