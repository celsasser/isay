/**
 * Test catch of thrown with a catch immediately following
 */

std.in("blob")
	.error.throw("throw")
	.error.catch(error=>{
		return `error=${error.message}`;
	})
