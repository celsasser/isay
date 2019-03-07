/**
 * User: curtis
 * Date: 2019-02-17
 * Time: 8:47 PM
 * Copyright @2019 by Xraymen Inc.
 */

/**
 * Example of embedding multiple layers of predicate functions. Making sure we don't loose variables on the way down.
 * Note: allows one to save state in variables.
 */
array.range(2, 5)
	.array.map(value=>{
	array.range(1, value)
		.math.multiply()
		.object.map(result=>`${value}! = ${result}`)
		.std.out()
})
