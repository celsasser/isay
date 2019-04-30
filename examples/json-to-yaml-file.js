/**
 * isay.js example of converting JSON to YAML and writing it to a file.
 * 1. loading our sample JSON formatted, pets database
 * 2. sort elements by name
 * 3. write to stdout
 */

json.read("./examples/data/pets.json")
	.array.sort("name")
	.yaml.write("./tmp/pets.yaml")
