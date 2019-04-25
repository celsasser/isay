# Mouse

## Overview
_Mouse_ is a shell command that supports and runs a JavaScript like scripting language. "So what!", you say. "Do we really need another scripting language!?" No, we probably don't. But _mouse_ is not trying to muscle into the sea full of scripting languages. Rather _mouse_ is designed to offer an alternate means of scripting within your shell. A sort of shell in a shell, extending it and (hopefully) allowing one to easily accomplish tasks that some may consider cumbersome via the shell.  The language itself takes a _functional_ approach to scripting:

* all functions take a single input (with small exceptions for array iteration, mapping and reduction) and return a single output.
* there is no state in its purest sense, but we do not strictly enforce this nor do we want to.
* all functions are lambdas.

 In addition to being a simple, pared down to basics language, _mouse_ also benefits from built-in support for popular file formats such as JSON, YAML, CVS (and MIDI). Not only does it support loading, parsing and saving but also manipulation. But it's not limited to working with any single file type and is perfectly comfortable with loading, manipulating and saving any source that my be treated as a file.

## Requirements
Mouse is a NodeJS application. It is recommended that you use version >= `10.14.2` or greater as we are able to take advantage of support that was introduced for function compilation (version 10). `10.14.2` includes a fix for bugs within function compilation. It will run otherwise and likely be fine for normal tasks. But performance will suffer should you perform a large amount of iteration. One such example is [text-count-characters-raven.js](./examples/text-count-characters-raven.js)

## Getting started
Pull _mouse_ down and stick him somewhere. Being a NodeJS app he will need to live within a folder. This can be any location of your chosing but if you end up liking it you may want to make sure it is in your path.

Quick start - in a terminal `cd` to someplace you would like for it to live and:
```
git clone https://fishguts@bitbucket.org/fishguts/curt-mouse.git mouse
cd mouse
npm install
```

Should you want to make it a more permanent resource in your toolkit, you may chose to put it in your path - `/usr/local/bin` (assuming you are on a unix/linux machine) for example. In this case you may want to install it as follows:
```
cd /usr/local
git clone https://fishguts@bitbucket.org/fishguts/curt-mouse.git mouse
cd mouse
npm install
ln -s ${PWD}/mouse.js ../bin/mouse
```

## Running
`mouse.js` is the top level command. To make it do anything one must specify a [_action_](#actions).  Each _action_ takes its own set of arguments and options. To start the only action it takes is `run`.

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
A _chain_ is a list of sequentially excecuted, synchronous _functions_. A _function's_ output serves as input for the next _function_ in a _chain_.  The the value of a _chain_ is the value returned by the last _function_ in a _chain_. "What about the topmost _chain_? Are its results sent to `stdout`?" Nothing is assumed regarding its result. If you want its results to be sent to `stdout` or `stderr` then you must send it via `std`. Examples are provided below of nested _chains_.

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
os.find(".")
	.string.split({method: "newline"})
	.array.filter(is.startsWith(["./res", "./src", "./test"]))
	.file.zip("./tmp/build")
```

Note: it may be helpful to think of a function - `<domain>.<function>(params)` - as a function that returns a hybrid object that acts both as an instance of the _domain_ as well as the result. And that result acts as input for the subsequent _function_.

<a id="language"></a>
### The Language
The language used to define _chains_ (and _scripts_ which will follow) is a both a subset and not totally compliant variation of JavaScript. At its heart are _domains_ and _functions_.

A _domain_ is a conceptual and physical grouping of one or more _functions_. What is the function of a _domain_? It forces a modular breakdown of related functionality that allows for short (but non-abbreviated) function names that may be reused across domains encouraging a smaller, consistent and more terse function lexicon. 

A _function_ is a function. It takes input and returns output. _Mouse_ has built in support for the API you will see immediately below. But it also allows lamdas to be specified wherever a _mouse_ function takes arguments. These may be _mouse functions_ or they may be Javascript _functions_. JavaScript functions are an excellent way to introduce an named paramater. They are also an excellent means of ammending the _mouse_ API. 

**An important note regarding adding _chains_ to JavaScript functions. You are encouraged to use _chains_ in JavaScript functions but in a very limited way. If you are using JavaScript to do anything aside from naming parameters then don't include _chains_. You will probably not get the result you are expecting.**

### The API
So lets dig into the API. In some cases, you will see variations of the same _function_ below. This is either due to different parameter configurations or is to variations in how a _function_ receives its input. There are three possibilities:

- **input data**: with no arguments we use the input data.
- **arguments**: without input we use a function's _arguments_.
- **both**: there is both _input_ and _arguments_. Some function support multiple arguments. But for those that expect only one source of data? We always use _arguments_ over _input_. The logic being that if a programmer has total control over _arguments_. 

#### _paramater usage below_
- `start`: value or index from
- `stop`: value or index up to but not including

#### array
- append: `Array<*> -> append(element:*, {index:-1}) -> Array<*>`
- append: `Array<*> -> append(elements:Array<*>, {index:-1, expand:true}) -> Array<*>`
- each|forEach: `Array<*> -> each((element)->*) -> Array<*>`
- filter: `Array<*> -> filter((element)->boolean) -> Array<*>`
- filter: `Array<*> -> filter(filter:Object) -> Array<*>`
- find: `Array<*> -> find((element)->boolean) -> (*|null)`
- find: `Array<*> -> find(criteria:Object) -> (*|null)`
- first: `Array<*> -> first() -> *`
- first: `Array<*> -> first(count:number) -> Array<*>`
- insert: `Array<*> -> insert(element:*, {index:0}) -> Array<*>`
- insert: `Array<*> -> insert(elements:Array<*>, {index:0, expand:true}) -> Array<*>`
- last: `Array<*> -> last() -> *`
- last: `Array<*> -> last(count:number) -> Array<*>`
- map: `Array<*> -> map((element)->*) -> Array<*>`
- range: `range(stop:number) -> Array<number>`
- range: `range(start:number, stop:number, increment:number=1) -> Array<number>`
- range: `stop:number => range() -> Array<number>`
- range: `[start:number, stop:number, increment:number=1] => range() -> Array<number>`
- reduce: `Array<*> -> reduce((result, element)->*, initial=[]) -> *`
- reverse: `Array<*> -> reverse() -> Array<*>`
- slice: `Array<*> -> slice(start:number) -> Array<*>`
- slice: `Array<*> -> slice(start:number, stop:Number) -> Array<*>`
- slice: `Array<*> -> slice({start:number, stop:number, count:number=undefined}) -> Array<*>`
- sort: `Array<*> -> sort() -> Array<*>`
- sort: `Array<*> -> sort(property:(number|string)) -> Array<*>`
- sort: `Array<*> -> sort(properties:Array<(number|string)>) -> Array<*>`
- unique: `Array<*> -> unique() -> Array<*>`

#### csv
- parse: `string -> parse({delimiter:string=","}) -> Array<Array<*>>`
- read: `read(path:string, opts:(undefined|{delimiter:","}}) -> Array<Array<*>>`
- read: `path:string -> read(opts:(undefined|{delimiter:","}}) -> Array<Array<*>>`
- write: `data:Array<Array<*>> -> write(path:string, opts:(undefined|{delimiter:","}}) -> Array<Array<*>>`

#### debug
- assert: `* -> assert((*)->boolean) -> *`
- dump: `* -> dump() -> *`

#### env
- delete: `* -> delete(name:string) -> *`
- get: `get() -> Object`
- get: `get(name:string) -> *`
- set: `* -> set(name:string, value:(boolean|number|string)) -> *`

#### error
- catch: `* -> catch() -> *`
- catch: `* -> catch((*)->*) -> *`
- catch: `catch(resut:*) -> result:*`
- throw: `* -> throw(value:(Error|String))`
- throw: `* -> throw(thrower:function)`

#### file
- copy: `* -> copy(source:string, target:string, {rebuild:boolean=false}) -> *`
- copy: `source:string -> copy(target:string, {rebuild:boolean=false}) -> source:string`
- create: `create(path:string, {type:string="file"}) -> undefined`
- create: `path:string -> create({type:string="file"}) -> string`
- delete: `* -> delete(path:string) -> *`
- delete: `path:string -> delete() -> string`
- ensure: `ensure(path:string, {type:string="file"}) -> undefined`
- ensure: `path:string -> ensure({type:string="file"}) -> string`
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
- false: `false(state:*) -> boolean`
- false: `* -> false() -> boolean`
- greaterThan: `(number|string) -> greaterThan(value:(number|string)) -> boolean`
- lessThan: `(number|string) -> lessThan(value:(number|string)) -> boolean`
- oneOf: `value:* -> oneOf(values:Array<*>) -> boolean`
- startsWith: `string -> startsWith(value:(string|Array<string>)) -> boolean`
- true: `true(state:*) -> boolean`
- true: `* -> true() -> boolean`
- type: `* -> type(type:("Array"|"Boolean"|"Number"|"Object")) -> boolean`
- type: `* -> type(oneOf:Array<("Array"|"Boolean"|"Number"|"Object")>) -> boolean`

#### json
- parse: `data:(string|Buffer) -> parse() -> Object`
- read: `read(path:string) -> Object`
- read: `path:string -> read() -> Object`
- stringify: `Object -> stringify(options:{compact:true}) -> string`
- write: `json:Object -> write(path:string) -> Object`

#### loop:
- if: `* -> if() -> boolean(*)`
- if: `if(state:boolean) -> boolean`
- if: `* -> if((*)->boolean) -> boolean`
- elif: `* -> elif() -> boolean(*)`
- elif: `elif(state:boolean) -> boolean`
- elif: `* -> elif((*)->boolean) -> boolean`
- else: `else(forever:function)`
- else: `* -> else(value:*) -> *`
- then: `* -> then((*)->*) -> *`

#### math:
The math operations are grouped together by the API they support. Instead of spelling out all of the different param signatures we support per operation, we are using `op` as a symbol that represents any one of the operations listed on the left. So should you be interested in `add` then substitute `op` with `add`.

- ceiling|floor|round: `op(number) -> number`
- ceiling|floor|round: `op(Array<number>) -> Array<number>`
- ceiling|floor|round: `number -> op() -> number`
- ceiling|floor|round: `Array<number> -> op() -> Array<number>`
- max|min: `op(number, number, ...) -> number`
- max|min: `op(Array<number>) -> number`
- max|min: `Array<number> -> op() -> number`
- add|divide|multiply|subtract: `op(v1:number, v2:number) -> number`
- add|divide|multiply|subtract: `op(v1:number, v2:Array<number>) -> Array<number>`
- add|divide|multiply|subtract: `op(v1:Array<number>, v2:number) -> Array<number>`
- add|divide|multiply|subtract: `op(v1:Array<number>, v2:Array<number>) -> Array<number>`
- add|divide|multiply|subtract: `Array<number> -> op() -> number`
- add|divide|multiply|subtract: `number -> op(number) -> number`
- add|divide|multiply|subtract: `number -> op(Array<number>) -> Array<number>`
- add|divide|multiply|subtract: `Array<number> -> op(number) -> Array<number>`
- add|divide|multiply|subtract: `Array<number> -> op(Array<number>) -> Array<number>`
- divmod: `divmod(v1:number, v2:number) -> [div:number, mod:number]`
- divmod: `divmod(v1:number, v2:Array<number>) -> Array<[div:number, mod:number]>`
- divmod: `divmod(v1:Array<number>, v2:number) -> Array<[div:number, mod:number]>`
- divmod: `divmod(v1:Array<number>, v2:Array<number>) -> Array<[div:number, mod:number]>`
- divmod: `Array<number> -> divmod() -> [div:number, mod:number]`
- divmod: `number -> divmod(number) -> [div:number, mod:number]`
- divmod: `number -> divmod(Array<number>) -> Array<[div:number, mod:number]>`
- divmod: `Array<number> -> divmod(number) -> Array<[div:number, mod:number]>`
- divmod: `Array<number> -> divmod(Array<number>) -> Array<[div:number, mod:number]>`

#### midi:
- read: `read(path:string) -> MidiIoSong`
- read: `path:string -> read() -> MidiIoSong`
- write: `data:MidiIoSong -> write(path:string) -> MidiIoSong`

#### not
- empty: `(string|Array|Buffer) -> empty() -> boolean`
- endsWith: `string -> endsWith(value:(string|Array<string>)) -> boolean`
- equal: `comparedFrom:* -> equal(comparedTo:*) -> boolean`
- false: `false(state:*) -> boolean`
- false: `* -> false() -> boolean`
- greaterThan: `(number|string) -> greaterThan(value:(number|string)) -> boolean`
- lessThan: `(number|string) -> lessThan(value:(number|string)) -> boolean`
- oneOf: `value:* -> oneOf(values:Array<*>) -> boolean`
- startsWith: `string -> startsWith(value:(string|Array<string>)) -> boolean`
- true: `true(state:*) -> boolean`
- true: `* -> true() -> boolean`
- type: `* -> type(type:("Array"|"Boolean"|"Number"|"Object")) -> boolean`
- type: `* -> type(oneOf:Array<("Array"|"Boolean"|"Number"|"Object")>) -> boolean`

#### object:
- each: `Array|Object -> each((value, key), {rescurse:boolean=false}) -> Array|Object`
- get: `(Array|Object) -> get(path:string) -> *`
- map: `(Array|Object) -> map((value, key)->*) -> (Array|Object)`
- map: `(Array|Object) -> map(paths:Array<string|{from:string, to:string}>, {flatten=false, recurse=false}) -> Object`
- mutate: `* -> mutate((*)->*) -> *`
- merge: `into:Object -> merge(data:Object) -> Object`
- merge: `into:Array -> merge(data:Array) -> Array`
- set: `(Array|Object) -> set(path:string, value:*) -> (Array|Object)`
- toArray: `Object -> toString((Object, key:string)->Object) -> Array<*>`

#### os:
- <command>: `stdin:(string|Buffer|undefined) -> <command>(params:string, {stdout:("live")}=undefined) -> *`
- <command>: `stdin:(string|Buffer|undefined) -> <command>(param1:string, param2:string, ..., {stdout:("live")}=undefined) -> *`

#### path:
- absolute: `string -> absolute:(from:string=".") -> string` 
- relative: `string -> relative:(from:string=".") -> string` 

#### step:
- if: `* -> if() -> boolean(*)`
- if: `if(state:boolean) -> boolean`
- if: `* -> if(predicate:(*)->boolean) -> boolean`
- elif: `* -> elif() -> boolean(*)`
- elif: `elif(state:boolean) -> boolean`
- elif: `* -> elif((*)->boolean) -> boolean`
- else: `else(forever:function)`
- else: `* -> else(value:*) -> *`
- then: `* -> then((*)->*) -> *`

#### std:
- error: `* -> error(output:*) -> *`
- error: `(string|Buffer|Object) -> error() -> (string|Buffer|Object)`
- errorln: `* -> errorln(output:*) -> *`
- errorln: `(string|Buffer|Object) -> errorln() -> (string|Buffer|Object)`
- in: `in(data:*) -> *`
- out: `* -> out(output:*) -> *`
- out: `(string|Buffer|Object) -> out() -> (string|Buffer|Object)`
- outln: `* -> outln(output:*) -> *`
- outln: `(string|Buffer|Object) -> outln() -> (string|Buffer|Object)`

#### string:
- format: `(Array|Object) -> format(spec:string) -> string`
- replace: `string -> replace(search:(string|RegExp), replace:string) -> string`
- split: `string -> split(on:(RegExp|string)) -> Array<string>`
- split: `string -> split({method:("newline"|"shell"|"white")}) -> Array<string>`
- split: `string -> split({delimiter:string="\s*,\s*", method:("delimiter"|undefined)}) -> Array<string>`
- split: `string -> split({format:spec, method:("format"|undefined)}) -> Array<string>`

#### tty:
clear: `* -> clear() -> *`
height: `height() -> number`
height: `width() -> number`

#### yaml:
- parse: `data:(string|Buffer) -> parse() -> Object`
- read: `read(path:string) -> Object`
- read: `path:string -> read() -> Object`
- stringify: `Object -> stringify(options:{compact:true}) -> string`
- write: `json:Object -> write(path:string) -> Object`

### A _script_

`run` takes a script. A `script` should include one, and no more than one, top level _chain_. It may include ornamentation such as documentation. But does not support more than that. 

How to input a script? It may be input in one of the following ways:

1. file: `mouse.js run --script=run-os-ls.js`
2. inline: `mouse.js run "os.ls().std.out()"`
3. editor: `mouse.js run`

## Run Examples
In `./examples` there are several scripts demonstrating basic functionality as well as some more advanced scripts demonstrating `mouse's` power.

The following examples assume that you will be running them from the project's root. To see details about any example follow the link to the associated script.

### Scripts
_Note: the following scripts were created with a `.js` extension. This is not necessary, but handy when using syntax aware editors._

[files-concat.js](./examples/files-concat.js)
```
./mouse.js run -s ./examples/files-concat.js
```

[files-copy-flatten.js](./examples/files-copy-flatten.js)
```
./mouse.js run -s ./examples/files-copy-flatten.js
```

[files-copy-rebuild.js](./examples/files-copy-rebuild.js)
```
./mouse.js run -s ./examples/files-copy-rebuild.js
```

[files-delete.js](./examples/files-delete.js)
```
./mouse.js run -s ./examples/files-delete.js
```

[files-move.js](./examples/files-move.js)
```
./mouse.js run -s ./examples/files-move.js
```

[files-zip-select.js](./examples/files-zip-select.js)
```
./mouse.js run -s ./examples/files-zip-select.js
```

[json-extract.js](./examples/json-extract.js)
```
./mouse.js run -s ./examples/json-extract.js
```

[json-filter-sort.js](./examples/json-filter-sort.js)
```
./mouse.js run -s ./examples/json-filter-sort.js
```

[json-mutate.js](./examples/json-mutate.js)
```
./mouse.js run -s ./examples/json-mutate.js
```

[json-to-yaml-file.js](./examples/json-to-yaml-file.js)
```
./mouse.js run -s ./examples/json-to-yaml-file.js
```

[json-to-yaml-spacious.js](./examples/json-to-yaml-spacious.js)
```
./mouse.js run -s ./examples/json-to-yaml-spacious.js
```

[json-to-yaml.js](./examples/json-to-yaml.js)
```
./mouse.js run -s ./examples/json-to-yaml.js
```

[json-write-compact.js](./examples/json-write-compact.js)
```
./mouse.js run -s ./examples/json-write-compact.js
```

[json-write-spacious.js](./examples/json-write-spacious.js)
```
./mouse.js run -s ./examples/json-write-spacious.js
```

[math-factorial.js](./examples/math-factorial.js)
```
./mouse.js run -s ./examples/math-factorial.js
```

[os-npm-run.js](./examples/os-npm-run.js)
```
./mouse.js run -s ./examples/os-npm-run.js
```

[os-ping-range.js](./examples/os-ping-range.js)
```
./mouse.js run -s ./examples/os-ping-range.js
```

[os-ps-cpu.js](./examples/os-ps-cpu.js)
```
./mouse.js run -s ./examples/os-ps-cpu.js
```

[readme.md](./examples/readme.md)
```
./mouse.js run -s ./examples/readme.md
```

[text-count-characters-input.js](./examples/text-count-characters-input.js)
```
./mouse.js run -s ./examples/text-count-characters-input.js
```

[text-count-characters-raven.js](./examples/text-count-characters-raven.js)
```
./mouse.js run -s ./examples/text-count-characters-raven.js
```

[text-count-words-input.js](./examples/text-count-words-input.js)
```
./mouse.js run -s ./examples/text-count-words-input.js
```

[text-count-words-raven.js](./examples/text-count-words-raven.js)
```
./mouse.js run -s ./examples/text-count-words-raven.js
```

[text-define-words-raven.js](./examples/text-define-words-raven.js)
```
./mouse.js run -s ./examples/text-define-words-raven.js
```

[text-replace.js](./examples/text-replace.js)
```
./mouse.js run -s ./examples/text-replace.js
```

### Inline
You may also include your script inline. 
```
./mouse.js run "os.ls().string.split({method: 'newline'}).array.sort().std.out()"
```

### Editor
Lastly, you may also use your favorite console editor by not including a script or script path.

_Note: _mouse_ will look for env.EDITOR or env.VISUAL and launch the associated editor (should be a tty based editor). If it does not find one then it defaults to `vim`_
```
./mouse.js run
```
