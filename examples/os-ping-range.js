/**
 * mouse.js example of interacting with os. Here we are going to ping a range of IPs and see what we can find.
 */

// todo: for some reason this is not compiling properly. ip4 is lost but is in the context.

array.range(1, 255)
	.array.each(function(ip4) {
		array.range(1, 255)
			.array.each(
				object.map(function(ip3) {
					return `220.168.${ip3}.${ip4}`
				})
				.object.map(function(ip) {
					os.ping(`-c 1 -t 1 ${ip}`)
						.std.out(`ping ${ip} succeeded`)
						.error.catch(std.error(`ping ${ip} failed`))
				})
		)
	})
