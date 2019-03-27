/**
 * mouse.js example of interacting with os. Here we are going to ping a range of IPs and see what we can find.
 */

array.range(1, 255)
	.array.each(function(ip4) {
		array.range(1, 255)
			.array.each(
				object.mutate(function(ip3) {
					return `220.168.${ip3}.${ip4}`;
				})
				.object.mutate(function(ip) {
					os.ping(`-c 1 -t 1 ${ip}`)
						.std.outln(`ping ${ip} succeeded`)
						.error.catch(std.errorln(`ping ${ip} failed`))
				})
			)
	})
