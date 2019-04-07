/**
 * mouse.js example of converting JSON to YAML and writing to stdout.
 * 1. loading our sample JSON formatted, pets database
 * 2. convert the database into YAML text and increase indentation from 2 spaces to 4 spaces.
 * 3. write to stdout
 */

json.read("./examples/data/pets.json")
	.yaml.stringify({
		indent: 4,
		sort: true
	})
	.std.outln()
