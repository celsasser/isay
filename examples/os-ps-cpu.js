
os.ps(["-A", "-c", "-o", "user=,pid=,pri=,vsz=,time=,utime=,command="])
	.string.split({method: "newline"})
	.array.map(string.split({
		format: "${l} ${r} ${r} ${r} ${r} ${r} ${l}"
	}))
	.std.outln()
