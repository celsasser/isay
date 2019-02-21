# Mouse

## Overview
`mouse` is a shell command that supports and runs a JavaScript like scripting language. `mouse` offers an alternate means of interacting with your environment within your shell. A sort of shell in a shell, extending it and (hopefully) allowing one to easily accomplish tasks that some may consider cumbersome via the shell.  The language itself takes a _functional_ approach which may appeal to those who are fond of a more functional approach to programming.

 In addition to being a simple language, `mouse` also benefits from built-in support for popular file formats such as JSON, YAML, CVS (and midi). Not only does it support loading, parsing and saving but also manipulation. But it's not limited to working with any single file type and is perfectly comfortable with loading, manipulating and saving any portal that my be treated as a file.

## Running
`mouse` is the top level command. To make it do anything one must specify a [_action_](#actions).  Each _action_ takes its own set of arguments and options.  

To get more information about `mouse.js` - at command prompt:

```
mouse.js --help
```

And to get more information about an _action_:
```
mouse.js --help <action>
```

<a id="actions"></a>
## Action `run` 
---

`run` is the rubber and your OS is the road. It supports and runs a simple [JavaScript like language](#language) entirely designed with the flow of data in mind. The language itself can be broken down into  _functions_, _domains_ and _chains_.

### The chain
The _chain_ is a list of synchronous _functions_ that are executed sequentially. The language used to define _chains_ (and _scripts_ which will follow) is a both a subset and non-compliant variation of _JavaScript_.  

The syntax of a _chain_ is as follows:
```
<domain>.<function>(params)
	.[domain].<function>(params)
	.[domain].<function>(params)
	...
```

The `.` is used as both a dereference operator and a pipe operator. When placed after a _domain_ specifier it acts as a dereference operator. When placed between _functions_ it acts as a pipe.

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

Note: it may be helpful to think of a function - `<domain>.<function>(params)` - as a function that returns a hybrid object that acts both as an instance of the _domain_ as well as result data that acts as input for the subsequent _function_.

<a id="language"></a>
### The Language
A _domain_ is a conceptual and physical grouping of one or more _functions_. What is the function of a _domain_? It forces a modular breakdown of related functionality that allows and encourages _function_ names to be reused encouraging a smaller, consistent and more terse _function_ lexicon. It also allows for _domain_ omission provided the _domain_ of a previous _function_ is in the same as a subsequent _function_.


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

`run` takes a script. A `script` at the very least is a _chain_. It may contain globally (outside of the _chain_) defined variables and functions but should assume nothing about the environment. These variables and functions may be referenced by the script's _chain_.  

How to input a script? It may be input in one of the following ways:

1. file: `mouse.js run --script=run-os-ls.js`
2. inline: `mouse.js run "os.ls().std.out()"`
3. editor: `mouse.js run`

## Run Examples
