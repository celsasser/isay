/**
 * isay.js example of interacting with os. Here we are going to ping a range of IPs and see what we can find.
 */

 /**
  * todo: should take an optional ip address in the form of "\d{1,3}.\d{1,3}.000.000"
  * Perhaps we should think about sharing input in some way that may be accessed
  * from anywhere in a script.  Maybe the "app"?
  *
  * is.true(/\d{1,3}\.\d{1,3}/.test(app.args[0]))
  * is.else(app.args[0]="220.168")
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
