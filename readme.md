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

#### Domains
- array
- json
- os
- std
- string

### A _script_
You may optionally place a _chain_ in a containing _script_. The script may contain globally (outside of the _chain_) defined variables and functions but should assume nothing about the environment.  These variables and functions may be referenced by the script's _chain_.  
