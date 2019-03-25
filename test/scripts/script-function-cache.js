/**
* forcing functions to be cached for testing. Output is meaningless.
 * Note: in node versions of 10.14.1 and less there is a context bug.
*/

array.range(1, 3)
	.array.each(function(outter) {
		array.range(1, 3)
			.array.each(
				object.mutate(function(inner) {
					return `${outter}.${inner}`;
				})
				.std.out()
			)
	})
