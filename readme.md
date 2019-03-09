# Mouse

## Overview
`mouse` is a shell command that supports and runs a JavaScript like scripting language. `mouse` offers an alternate means of interacting with your environment within your shell. A sort of shell in a shell, extending it and (hopefully) allowing one to easily accomplish tasks that some may consider cumbersome via the shell.  The language itself takes a _functional_ approach which may appeal to those who are fond of a more functional approach to programming.

 In addition to being a simple, pared down to basics language, `mouse` also benefits from built-in support for popular file formats such as JSON, YAML, CVS (and midi). Not only does it support loading, parsing and saving but also manipulation. But it's not limited to working with any single file type and is perfectly comfortable with loading, manipulating and saving any portal that my be treated as a file.

## Getting started
Pull `mouse` down and stick him somewhere. Being a NodeJS app he will need to live within a folder. This can be any location of your chosing but if you end up liking it you may want to make sure it is in your path.  

Quick start - in a terminal `cd` to someplace you would like for it to live and:
```
git clone https://fishguts@bitbucket.org/fishguts/curt-mouse.git mouse
cd mouse
npm install
```

Should you want to make it a more permanent resource in your toolkit, you may chose to put it in your path - `/usr/local/bin` for example. In this case you may want to install it as follows:
```
cd /usr/local
git clone https://fishguts@bitbucket.org/fishguts/curt-mouse.git mouse
cd mouse
npm install
ln -s ${PWD}/mouse.js ../bin/mouse
```

## Running
`mouse` is the top level command. To make it do anything one must specify a [_action_](#actions).  Each _action_ takes its own set of arguments and options. To start the only action it takes is `run`.

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

`run` is the rubber and your OS is the road. It supports and runs a simple [JavaScript like language](#language) entirely designed with the flow of data in mind. The language itself can be broken down into  _chains_,  _domains_ and _functions_.

### The chain
A _chain_ is a list of sequentially excecuted, synchronous _functions_. A _function's_ output serves as input for the next _function_ in a _chain_.  The the value of a _chain_ is the value returned by the last _function_ in a _chain_. What about the topmost _chain_? Nothing is assumed regarding its result. If you want its results to be sent to `stdout` or `stderr` then you must send it via `std`. Examples are provided below of nested _chains_.

The syntax of a _chain_ is as follows:
```
<domain>.<function>(params)
	.<domain>.<function>(params)
	.<domain>.<function>(params)
	...
```

The `.` is used as both a dereference operator and a pipe operator. When placed after a _domain_ specifier it acts as a dereference operator. When placed between _functions_ it acts as a pipe.

Follows is an example:

```
os.ls(".")
   .string.split("newline")
   .array.filter(item=>item.length>0)
   .array.map(item=>`./${item}`)
   .array.sort()
   .array.reverse()
   .std.out();
```

Note: it may be helpful to think of a function - `<domain>.<function>(params)` - as a function that returns a hybrid object that acts both as an instance of the _domain_ as well as result data that acts as input for the subsequent _function_.

<a id="language"></a>
### The Language
The language used to define _chains_ (and _scripts_ which will follow) is a both a subset and not totally compliant variation of _JavaScript_. At its heart are _domains_ and _functions_.

A _domain_ is a conceptual and physical grouping of one or more _functions_. What is the function of a _domain_? It forces a modular breakdown of related functionality that allows for short (but non-abbreviated) _function_ names that may be reused encouraging a smaller, consistent and more terse _function_ lexicon. 


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
- copy: `copy(source:string, target:string, {rebuild:boolean=false}) -> undefined`
- copy: `source:string -> copy(target:string, {rebuild:boolean=false}) -> string`
- create: `create(path:string, {type:string="file"}) -> undefined`
- create: `path:string -> create({type:string="file"}) -> string`
- delete: `delete(path:string) -> undefined`
- delete: `path:string -> delete() -> string`
- move: `move(source:string, target:string, {rebuild:boolean=false}) -> undefined`
- move: `source:string -> move(target:string, {rebuild:boolean=false}) -> string`
- read: `read(path:string, opts:(undefined|Object)) -> (string|Buffer)`
- read: `path:string -> read(opts:(undefined|Object)) -> (string|Buffer)`
- write: `data:* -> write(path:string, opts:(undefined|{encoding:string="utf8",append:boolean=false})) -> *`
- zip: `files:Array<string> -> zip(archive:string, opts:(undefined|Object)) -> Array<string>`

#### is
- empty: `(string|Array|Buffer) -> empty() -> boolean`
- endsWith: `string -> endsWith(value:(string|Array<string>)) -> boolean`
- equal: `comparedFrom:* -> equal(comparedTo:*) -> boolean`
- oneOf: `value:* -> oneOf(values:Array<*>) -> boolean`
- startsWith: `string -> startsWith(value:(string|Array<string>)) -> boolean`

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
- endsWith: `string -> endsWith(value:(string|Array<string>)) -> boolean`
- equal: `comparedFrom:* -> equal(comparedTo:*) -> boolean`
- oneOf: `value:* -> oneOf(values:Array<*>) -> boolean`
- startsWith: `string -> startsWith(value:(string|Array<string>)) -> boolean`

#### object:
- get: `(Array|Object) -> get(path:string) -> *`
- merge: `(Array|Object) -> merge(json:Object) -> Object`
- map: `(Array|Object) -> map(predicate:function) -> *`
- map: `Object -> map(paths:Array<string|{from:string,to:string}>, {flatten:boolean=false}) -> Object`
- set: `(Array|Object) -> set(path:string, value:*) -> (Array|Object)`
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

#### yaml:
- parse: `data:(string|Buffer) -> parse() -> Object`
- read: `read(path:string) -> Object`
- read: `path:string -> read() -> Object`
- stringify: `Object -> stringify(options:{compact:true}) -> string`
- write: `json:Object -> write(path:string) -> Object`

### A _script_

`run` takes a script. A `script` should include one, and no more than one, top level _chain_. It may include ornamentation such as documentation. But does not support more than that. 

An important note regarding state and variables. The language does support predicate functions and will properly manage the scope of the parameters declared to store their arguments. **But it has no support for properly scoping variable declarations.**  

How to input a script? It may be input in one of the following ways:

1. file: `mouse.js run --script=run-os-ls.js`
2. inline: `mouse.js run "os.ls().std.out()"`
3. editor: `mouse.js run`

## Run Examples
In `./examples` there are several scripts demonstrating basic functionality as well as some more advanced scripts demonstrating `mouse's` power.

The following examples assume that you will be running them from the project's root. To see details about any example follow the link to the associated script.

### Scripts
_Note: the following scripts were created with a `.js` extension. This is not necessary, but handy when using syntax aware editors._

[json-write-compact.js](./examples/json-write-compact.js)
```
./mouse.js run -s ./examples/json-write-compact.js
```

[json-write-spacious.js](./examples/json-write-spacious.js)
```
./mouse.js run -s ./examples/json-write-spacious.js
```

[json-extract.js](./examples/json-extract.js)
```
./mouse.js run -s ./examples/json-extract.js
```

[json-mutate.js](./examples/json-mutate.js)
```
./mouse.js run -s ./examples/json-mutate.js
```

[json-filter-sort.js](./examples/json-filter-sort.js)
```
./mouse.js run -s ./examples/json-filter-sort.js
```

[json-to-yaml.js](./examples/json-to-yaml.js)
```
./mouse.js run -s ./examples/json-to-yaml.js
```

[json-to-yaml-file.js](./examples/json-to-yaml-file.js)
```
./mouse.js run -s ./examples/json-to-yaml-file.js
```

[files-concat.js](examples/files-concat.js)
```
./mouse.js run -s ./examples/files-concat.js
```

[files-copy-flatten.js](examples/files-copy-flatten.js)
```
./mouse.js run -s ./examples/files-copy-flatten.js
```

[files-copy-rebuild.js](examples/files-copy-rebuild.js)
```
./mouse.js run -s ./examples/files-copy-rebuild.js
```

[files-delete.js](examples/files-delete.js)
```
./mouse.js run -s ./examples/files-delete.js
```

[files-zip-select.js](examples/files-zip-select.js)
```
./mouse.js run -s ./examples/files-zip-select.js
```

### Inline
You may also include your script inline. 
```
./mouse.js run "os.ls().string.split('newline').array.sort().std.out()"
```

### Editor
Lastly, you may also use your favorite console editor by not including a script or script path.

_Note: `mouse` will look for env.EDITOR or env.VISUAL and launch the associated editor (should be a tty based editor). If it does not find one then it defaults to `vim`_
```
./mouse.js run
```
