/**
 * mouse.js example of finding a select set of files and copying them to another directory
 * 1-3. Populate "./tmp" with miscellaneous files
 * 4. Here we are interfering with the flow of data. We want the input to <code>file.delete</code> to
 *    be "./tmp" (). If we don't do this then the input to <code>file.delete</code> will be the
 *    array of source files. This would be fine for deleting one by one, but here we want to demonstrate
 *    deleting a directory (and that a non-empty directory may be deleted - warning).
 * 5. delete the directory.
 */

os.find("./examples")
	.string.split({method: "newline"})
	.array.each(file.copy("./tmp"))
	.std.in("./tmp")
	.file.delete()
