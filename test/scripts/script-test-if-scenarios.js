/**
 * User: curtis
 * Date: 2019-04-10
 * Time: 20:35
 * Copyright @2019 by Xraymen Inc.
 */


/****** step ******/
step.if(true, function(){})

step.if(true, function(){})
step.else(function(){})

step.if(true, function(){})
step.elif(false, function(){})
step.elif(false, function(){})
step.else(function(){})


/****** loop ******/
loop.while(true, function(){})

loop.if(true, function(){})

loop.if(true, function(){})
loop.else(function(){})

loop.if(true, function(){})
loop.elif(false, function(){})
loop.elif(false, function(){})
loop.else(function(){})


/******* 2 param problem *******/
step.if(true)
	.step.then(function(){})
.step.elif(false)
	.step.then(function(){})
.step.else(function(){})

loop.while(true)
	.loop.then(function(){})


/****** preferred ******/
step.if(true)
	.then(function(){})
	.elif(true)
	.then(function(){})
	.else(function(){})

// note: the problem here is that we need to loop back to the test. But the test will contain the then. So that should not be a problem.
loop.if(true)
	.then(function(){})

// let's just get rid of while
loop.while(true)
	.do(function(){})
