/**
 * isay.js example of live streaming stdout.
 * live-streaming = stream command output to stdout as it is received.
 */

os.npm("run", "test", {
	stdout: "live"
})
