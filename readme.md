# Mouse

## Overview

`mouse` is the top level command. To make it do anything one must specify and _action_ which are defined below.  Each _action_ takes arguments and options.  

To get more information about `mouse.js` - at command prompt:

```
mouse.js --help
```

And to get more information about an _action_:
```
mouse.js --help <action>
```

## Action `run` 
---

`run` is the rubber and your OS is the road. It runs a chained sequence of functions that we call a _chain_. The _chain_ is specified by you. It may be inline or read from a file. 

### The _chain_
The _chain_ is a list synchronous (in terms of each function waiting for the previous one to return) functions that are executed sequentially. The language used to define _chains_ (and _scripts_ which will follow) is a subset of `javascript`.  

The syntax of a chain is as follows:
```
<domain>.<action>(params)
	.[domain].<action>(params)
	.[domain].<action>(params)
	...
```

The `"."` is used as both a dereference operator and a pipe operator. When placed after a `domain` specifier it acts as a dereference operator. When placed between commands it acts as a pipe.

Follows is an example:

```
os.ls(".")
   .string.split("newline")
   .array.filter(item=>item.length>0)
   .map(item=>`./${item}`)
   .sort()
   .reverse()
   .std.out();
```

Note: it may be helpful to think of a function - `<domain>.<action>(params)` as a function that returns a hybrid object that acts both as an instance of the _domain_ as well as a function that takes, as input, the results of the previous function.

### Domains

#### array
- each: `Array<*> -> each(predicate:function) -> Array<*>`
- filter: `Array<*> -> filter(predicate:function) -> Array<*>`
- find: `Array<*> -> find(predicate:function) -> Array<*>`
- map: `Array<*> -> map(predicate:function) -> Array<*>`
- reduce: `Array<*> -> reduce(predicate:function) -> Array<*>`
- reverse: `Array<*> -> reverse(predicate:function) -> Array<*>`
- sort: `Array<*> -> sort(predicate:function) -> Array<*>`
- unique: `Array<*> -> uniq() -> Array<*>`

#### csv
- read: `read(path:string, opts:(undefined|{delimiter:","}}) -> Array<Array<*>>`
- read: `path:string -> read(opts:(undefined|{delimiter:","}}) -> Array<Array<*>>`
- write: `data:Array<Array<*>> -> write(path:string, opts:(undefined|{delimiter:","}}) -> Array<Array<*>>`

#### file
- copy: `copy(source:string, target:string) -> undefined`
- copy: `source:string -> copy(target:string) -> string`
- create: `create(path:string) -> undefined`
- create: `path:string -> create() -> string`
- delete: `delete(path:string) -> undefined`
- delete: `path:string -> delete() -> string`
- read: `read(path:string, opts:(undefined|Object)) -> (string|Buffer)`
- read: `path:string -> read(opts:(undefined|Object)) -> (string|Buffer)`
- write: `data:* -> write(path:string, opts:(undefined|{encoding="utf8",append=false})) -> *`
- zip: `files:Array<string> -> zip(archive:string, opts:(undefined|Object)) -> Array<string>`

#### is
- empty: `(string|Array|Buffer) -> empty() -> boolean`
- equal: `comparedFrom:* -> equal(comparedTo:*) -> boolean`

#### json
- parse: `data:(string|Buffer) -> parse() -> Object`
- read: `read(path:string) -> Object`
- read: `path:string -> read() -> Object`
- stringify: `Object -> stringify(options:{compact:true}) -> string`
- write: `json:Object -> write(path:string) -> Object`

#### midi:
- read: `read(path:string) -> MidiIoSong`
- read: `path:string -> read() -> MidiIoSong`
- write: `data:MidiIoSong -> write(path:string) -> MidiIoSong`

#### not:
- empty: `(string|Array|Buffer) -> empty()`
- equal: `comparedFrom:* -> equal(comparedTo:*) -> boolean`

#### object:
- get: `Object -> get(propertyPath:string) -> *`
- merge: `Object -> merge(json:Object) -> Object`
- set: `Object -> set(propertyPath:string, value:*) -> Object`
- read: `path:(string|undefined) -> read(path:(string|undefined))`
- toArray: `Object -> toString(predicate:function(Object, key:string):Object) -> Array<*>`

#### os:
- <command>: `stdin:(string|Buffer|undefined) -> <command>(params:string) -> *`
- <command>: `stdin:(string|Buffer|undefined) -> <command>(param1:string, param2:string, ...) -> *`

#### path:
- absolute: `string -> absolute:(from:string=".") -> string` 
- relative: `string -> relative:(from:string=".") -> string` 

#### std:
- error: `(string|Buffer|Object) -> error() -> (string|Buffer|Object)`
- in: `in(data:*) -> *`
- out: `(string|Buffer|Object) -> out() -> (string|Buffer|Object)`

#### string:
- replace: `string -> replace(search:(string|RegExp), replace:string) -> string`
- split: `string -> split(method:("newline"|"shell"|"white"))`
- split: `string -> split(method:"delimiter", delimiter:string="\s*,\s*")`

### A _script_
You may optionally place a _chain_ in a containing _script_. The script may contain globally (outside of the _chain_) defined variables and functions but should assume nothing about the environment.  These variables and functions may be referenced by the script's _chain_.  
