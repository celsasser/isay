
os.ps(["-A", "-c", "-o", "user=,pid=,pri=,vsz=,time=,utime=,command="])
	.string.split({method: "newline"})
	.std.outln()
