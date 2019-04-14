/**
 * Test catch of thrown error and make sure the actions in the middle are skipped
 */

std.in("blob")
	.error.throw("throw1")
	.error.throw("throw2")
	.error.catch(error=>{
		return `error=${error.message}`;
	})
