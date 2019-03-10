/**
 * mouse.js example of interacting with os. Here we are going to ping a range of IPs and see what we can find.
 */

array.range(1, 255)
	.array.each(ip4=>{
		array.range(1, 255)
			.array.each(
				object.map(ip3=>`220.168.${ip3}.${ip4}`)
				.object.map(ip=>{
					os.ping(`-c 1 -t 1 ${ip}`)
						.std.out(`ping ${ip} succeeded`)
						.error.catch(std.error(`ping ${ip} failed`))
				})
		)
	})
