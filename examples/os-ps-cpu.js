/**
 * mouse.js example that continually get all active processes and sort by total cpu time and 
 * presents the top 25 consumers. 
 * 
 * It demonstrates looping, os integration, splitting text using the "format" method
 * and string formatting.
 */

loop.forever(
	os.ps(["-A", "-c", "-o", "user=,pid=,pri=,vsz=,%cpu=,utime=,command="])
	.string.split({method: "newline"})
	.array.map(string.split({
		format: "${l} ${ri} ${ri} ${ri} ${rf} ${r} ${l+}"
	}))
	.array.sort(-4)
	.array.first(math.subtract(tty.height(), 2))
	.array.insert(["USER", "PID", "PRIORITY", "SIZE KB", "CPU%", "UTIME", "COMMAND"])
	.tty.clear()
	.array.each(
		string.format("${16l} ${8r} ${10c} ${10r} ${8r} ${10r}  ${l}")
			.std.outln()
	)
	.app.sleep({seconds:1})
);
