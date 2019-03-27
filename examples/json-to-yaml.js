/**
 * mouse.js example of converting JSON to YAML and writing to stdout.
 * 1. loading our sample JSON formatted, pets database
 * 2. convert the database into YAML text
 * 3. write to stdout
 */

json.read("./examples/data/pets.json")
	.yaml.stringify({sort: true})
	.std.outln()
