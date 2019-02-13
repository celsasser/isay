/**
 * mouse.js run script. Follows are the domains and actions at your disposal:
 * array:
 *  - each(predicate:function) <= data:Array<*>
 *  - filter(predicate:function) <= data:Array<*>
 *  - find(predicate:function) <= data:Array<*>
 *  - map(predicate:function) <= data:Array<*>
 *  - reduce(predicate:function) <= data:Array<*>
 *  - reverse(predicate:function) <= data:Array<*>
 *  - sort(predicate:function) <= data:Array<*>
 *  - uniq() <= Array<*>
 * csv:
 *  - read(pathOrOpts:(string|Object|undefined), opts:(Object|undefined}) <= path:(string|undefined)
 *  - write(data:Array<Array<*>>) <= path:string
 * file:
 *  - copy(sourceOrTarget:string, target:(string|undefined)) <= source:(string|undefined)
 *  - create(path:(string|undefined)) <= path:(string|undefined)
 *  - delete(path:(string|undefined)) <= path:(string|undefined)
 *  - read(pathOrOpts:(string|Object|undefined), opts:(Object|undefined)) <= path:(string|undefined)
 *  - write(path:string, opts:(Object|undefined)) <= data:*
 *  - zip(archive:string, opts:(Object|undefined)) <= files:Array<string>
 * is:
 *  - empty() <= data:(string,Array,Buffer)
 *  - equal(comparedTo:*) <= comparedFrom:*
 * json:
 *  - get(propertyPath:string) <= json:Object
 *  - merge(json:(Object|string)) <= json:Object
 *  - parse() <= data:(string|Buffer|Object)
 *  - set(propertyPath:string, value:*) <= json:Object
 *  - read(path:(string|undefined)) <= path:(string|undefined)
 *  - write(path:string) <= json:Object
 * midi:
 *  - read(path:(string|undefined)) <= path:(string|undefined)
 *  - write(path:string) <= data:MidiIoSong
 * not:
 *  - empty() <= data:(string,Array,Buffer)
 *  - equal(comparedTo:*) <= comparedFrom:*
 * os:
 *  - <command>(params:(string|...)) <= stdin:(string|Buffer|Object|undefined)
 * std:
 *  - error() <= data:*
 *  - out() <= data:*
 * string:
 *  - split(search:(string|RegExp), replace:string) <= text:string
 *  - split(method:("delimiter"|"newline"|"shell"|"white"), delimiter:(string|undefined)) <= text:string
 */

