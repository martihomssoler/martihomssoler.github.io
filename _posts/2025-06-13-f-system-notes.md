---
title: Some notes on System F
date: 2025-06-13 7:00 +200
categories: [Programming, Language Design]
tags: [type-systems, system-f, lambda-calculus]
---

# Trying to understand System F

I've been toying around with implementing a programming language. For the moment I do not have a type system, 
hence why I'm here trying to understand Lambda Calculus and System F.

This blog is an attempt to explain (probably to my future self) what Lambda Calculus is and what System F accomplishes
and, if possible, give a short implementation. You know what they say: 
"If you can't explain it, you do not understand it.". Do not ask me who "*they*" are...

## A Short Introduction 

* [PDF](https://web.archive.org/web/20210704051919if_/https://babel.ls.fi.upm.es/~pablo/Papers/Notes/f-fw.pdf)
* [Rust Implementation](https://github.com/PoorlyDefinedBehaviour/a_short_introduction_to_system_f_and_system_f_omega/tree/main)


**Concepts**

* terms -> calculations that produce a "value".
* types -> define "values" but, in polymorphism, can be values by themselves. E.g. a value is 5 or the type Integer.
* Lambda Calculus -> tiny programming language of unnamed, first-class functions.
* Definitions vs Equality -> definitions are used to "instatiate" a new variable, while equality is a relationship
between values.
* EBNF notation -> same notation as with context-free grammars
* Quantification "dot" -> in the expression "Vx.P", where V means for-all, the lifetime of x starts at the dot
and ends after expression P. 
* function signature -> describes the function's arity, order and type of its arguments.
* function arity -> the number of arguments a function takes
* function order -> what it returns?
* manifests as nullary functions -> order 0
* functions as proper functions -> order ?
* kind -> inaccurately described as the "type" of type-terms, but they actually describe arity and order 
of type opertors.

**Other Concepts**

* dependent function -> The return type of a dependent function may depend on the value (not just type) of one of 
its arguments. E.g. a function takes an integer n and, if n > 0 then returns an array of size n, otherwise returns
an array of size 0. For arrays, the size is part of their type.

## LangDev Ideas

I have some ideas about how the System Fw could be used in my toy language. This are some random thoughts, which I 
will try to explain as best as I can.

```cpp

// TODO(mhs): Simply typed lambda calculus

// --- Static "Duck-Typing" ---
point_tuple :: (int, int)          // tuples are records with unnamed fields
point_struct :: (x, y : int)       // structs are records (which by definition already have nammed fields)
point_struct_rev :: (y, x : int)   // note that the `y` member comes first
vec :: (x, y: float)

// this is how you could declare a function
vec_from_point :: (x, y: int) -> vec = ( ... )  // the code is irrelevant for the example

// it would be nice to be able to call the function as
let p1 := point_tuple(1,2)
let v1 := p1.vec()                       // empty `()` could be optional, but the point stands

let p2 := point_struct(1,2)              // understands that the first argument is `x`, and the second is `y`
let _p := point_struct(y = 2, x = 1)     // can also be assigned by name
let v2 := p2.vec()

// the cool stuff comes here, with the following call
let p3 := point_struct_rev(1,2)          // note that this is y = 1, and x = 2
let v3 := p3.vec()
//          ^-- this will be accepted, since the function signature expects an `x` and `y` of type `int`
//              and the object has them. This is my "idea" of duck-typing for my language. It could be even 
//              cooler if there was some "auto-complete" feature, like Koka has with its "dot" notation. 
// --- ---

// --- Lazy/Unsized vs Sized Collections ---
// in Rust, and other programming languages, structs are Sized which means that the size of the struct needs to
// be known at compile time. A common solution is to "box" the recursive type.
// other languages, like Haskell, are lazy which means that the size of a structure is computed ONLY when is needed
// this makes sense because Rust wants to have higher control on the memory and lower level abstractions, while
// Haskell does not want that and prefers other niceties.

// my idea would be to provide some kind of keyword, like "comptime" which forces a struct size to be computed at 
// compile time vs the "lazy" keyword which allows for easy definitions.

#[lazy]
node :: (left: node, right: node)            // this would create a node structure like Haskell

#[comptime]
node :: (left: ptr node, right: ptr node)   // this would function as the "boxed" version in Rust

// the idea is to provide an ergonomic interface but could arise confusion when a "lazy" data structure is used
// alongside a "comptime" data structure. 
// The solution might to annotate the types of the nodes with some "kind". E.g. the "lazy" node would have 
// "kind = ?Sized" and the "comptime" node would have "kind = Sized" to communicate that the size is known, or not, 
// at compile time and that the recursive structures will be swapped by pointers to the structure once compiled.


// So in other words, it allows for the user to "restrict" the types. Both nodes will translate to the same
// pointer structure after compilation, but the definition is left "clearer" iff it is not confusing, which I 
// still do not know 
// --- ---
```

# Further Readings

* [Lambda Cube](https://en.wikipedia.org/wiki/Lambda_cube)
* [Extensional vs Intensional Type Theory](https://en.wikipedia.org/wiki/Intuitionistic_type_theory#Extensional_versus_intensional)
	* [Setoids](https://en.wikipedia.org/wiki/Setoid)
	* [Homotopy type theory](https://en.wikipedia.org/wiki/Homotopy_type_theory)
