
os.ps(["-A", "-o", "user=,pid=,pri=,vsz=,time=,utime=,command="])
	.string.split({method: "newline"})
	.array.map(string.split({
		format: "${l} ${r} ${r} ${r} ${r} ${r} ${l+}"
	}))
	.array.sort(-3)
	.std.outln()
