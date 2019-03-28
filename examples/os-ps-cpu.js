loop.forever(
	os.ps(["-A", "-c", "-o", "user=,pid=,pri=,vsz=,time=,utime=,command="])
	.string.split({method: "newline"})
	.array.map(string.split({
		format: "${l} ${r} ${r} ${r} ${r} ${r} ${l+}"
	}))
	.array.sort(-3)
	.array.slice({count: 25})
	.array.insert(["USER", "PID", "PRIORITY", "SIZE KB", "U+S TIME", "U TIME", "COMMAND"])
	.tty.clear()
	.array.each(
		string.format("${18l} ${8r} ${10c} ${10r} ${10r} ${10r} ${l}")
			.std.outln()
	)
	.app.sleep({millis:500})
);
