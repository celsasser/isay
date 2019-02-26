/**
 * mouse.js run script. Follows are the domains and actions at your disposal:
 * array:
 *  - Array<*> -> each(predicate:function) -> Array<*>
 *  - Array<*> -> filter(predicate:function) -> Array<*>
 *  - Array<*> -> find(predicate:function) -> Array<*>
 *  - Array<*> -> map(predicate:function) -> Array<*>
 *  - Array<*> -> reduce(predicate:function) -> Array<*>
 *  - Array<*> -> reverse(predicate:function) -> Array<*>
 *  - Array<*> -> sort(predicate:function) -> Array<*>
 *  - Array<*> -> unique() -> Array<*>
 * csv:
 *  - read(path:string, opts:(undefined|{delimiter:","}}) -> Array<Array<*>>
 *  - path:string -> read(opts:(undefined|{delimiter:","}}) -> Array<Array<*>>
 *  - data:Array<Array<*>> -> write(path:string, opts:(undefined|{delimiter:string=","}}) -> Array<Array<*>>
 * file:
 *  - copy(source:string, target:string, {rebuild:boolean=false}) -> undefined
 *  - source:string -> copy(target:string, {rebuild:boolean=false}) -> string
 *  - create(path:string, {type:string="file"}) -> undefined
 *  - path:string -> create({type:string="file"}) -> string
 *  - delete(path:string) -> undefined
 *  - path:string -> delete() -> string
 *  - move(source:string, target:string, {rebuild:boolean=false}) -> undefined
 *  - source:string -> move(target:string, {rebuild:boolean=false}) -> string
 *  - read(path:string, opts:(undefined|Object)) -> (string|Buffer)
 *  - path:string -> read(opts:(undefined|Object)) -> (string|Buffer)
 *  - data:* -> write(path:string, opts:(undefined|{encoding:string="utf8",append:boolean=false})) -> *
 *  - files:Array<string> -> zip(archive:string, opts:(undefined|Object)) -> Array<string>
 * is:
 *  - (string|Array|Buffer) -> empty() -> boolean
 *  - string -> endsWith(value:(string|Array<string>)) -> boolean
 *  - comparedFrom:* -> equal(comparedTo:*) -> boolean
 *  - value:* -> oneOf(values:Array<*>) -> boolean
 *  - string -> startsWith(value:(string|Array<string>)) -> boolean
 * json:
 *  - data:(string|Buffer) -> parse() -> Object
 *  - read(path:string) -> Object
 *  - path:string -> read() -> Object
 *  - Object -> stringify(options:{compact:true}) -> string
 *  - json:Object -> write(path:string) -> Object
 * midi:
 *  - read(path:string) -> MidiIoSong
 *  - path:string -> read() -> MidiIoSong
 *  - data:MidiIoSong -> write(path:string) -> MidiIoSong
 * not:
 *  - (string|Array|Buffer) -> empty()
 *  - string -> endsWith(value:(string|Array<string>)) -> boolean
 *  - comparedFrom:* -> equal(comparedTo:*) -> boolean
 *  - value:* -> oneOf(values:Array<*>) -> boolean
 *  - string -> startsWith(value:(string|Array<string>)) -> boolean
 * object:
 *  - Object -> get(path:string) -> *
 *  - Object -> map(predicate:function) -> *
 *  - Object -> map(paths:Array<string|{from:string,to:string}>, {flatten:boolean=false}) -> Object
 *  - Object -> merge(json:Object) -> Object
 *  - Object -> set(path:string, value:*) -> Object
 *  - path:(string|undefined) -> read(path:(string|undefined))
 *  - Object -> toString(predicate:function(Object, key:string):Object) -> Array<*>
 * os:
 *  - stdin:(string|Buffer|undefined) -> <command>(params:string) -> *
 *  - stdin:(string|Buffer|undefined) -> <command>(param1:string, param2:string, ...) -> *
 * path:
 *  - string -> absolute:(from:string=".") -> string
 *  - string -> relative:(from:string=".") -> string
 * std:
 *  - (string|Buffer|Object) -> error() -> (string|Buffer|Object)
 *  - in(data:*) -> *
 *  - (string|Buffer|Object) -> out() -> (string|Buffer|Object)
 * string:
 *  - string -> replace(search:(string|RegExp), replace:string) -> string
 *  - string -> split(method:("newline"|"shell"|"white"))
 *  - string -> split(method:"delimiter", delimiter:string="\s*,\s*")
 * yaml:
 *  - data:(string|Buffer) -> parse() -> Object
 *  - read(path:string) -> Object
 *  - path:string -> read() -> Object
 *  - Object -> stringify(options:{compact:true}) -> string
 *  - json:Object -> write(path:string) -> Object
 */

