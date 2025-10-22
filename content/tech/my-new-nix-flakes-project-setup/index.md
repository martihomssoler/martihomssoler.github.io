+++
date = "2025-10-22"
updated = "2025-10-22"
categories = ["NixOS"]
tags = ["nix", "nix-flakes", "direnv", "nix-direnv"]
title = "My new Flakes + Just setup"
+++

It has been a hot while since I wrote an entry in this blog., but I've been quite busy with some very interesting side-projects. And today I wanted to revise my `nix` project setup, and show what I'm using to develop [Goburin](https://github.com/martihomssoler/goburin), my hobby programming language. I'll explain more in a future article and explain why I'm starting by bootstrapping it in assembly and then in Forth... But **now on the actual topic** of this entry: My `flakes.nix` + `just` setup.   

As I was saying, some months ago I wrote about using `nix-shell` and aliases to define per-project commands via `writeShellScriptBin`. That worked... mostly. Aliases were a bit tricky to get them working right, hence the aforementioned write-up, and it always felt a bit fragile: they depended on shell quirks, and I found myself re-evaluating my `shell.nix` file **waaaay too often**. The whole workflow was very squeaky and, after stomaching it for a while, I decided I needed something different. That's why I decided on finally taking a look at `just`.

As stated in their [github repo](https://github.com/casey/just), `just` is **just a command runner**, nothing else. It does come with some goodies and cool party tricks, but at the end of the day it just runs commands and let's you define them in a very easy-to-understand manner. For me, it removed the need to re-evaluate my `.nix` files, allowing me to monkey around with the command until I found exactly what I wanted.

To give you an idea of the minimal setup I use in [Goburin](https://github.com/martihomssoler/goburin) here are my `flake.nix` and `justfile`:

```nix
{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
  flake-utils.lib.eachDefaultSystem (
    system:
    let
       pkgs = (import nixpkgs { inherit system; });
       nativeBuildInputs = with pkgs; [  ];
       buildInputs       = with pkgs; [  ];
       devInputs         = with pkgs; [  ];
    in
    {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = nativeBuildInputs ++ devInputs;
        buildInputs = buildInputs ++ devInputs;

        shellHook = ''
          export WORKSPACE_DIR=$(pwd)
        '';
        
        ...
      };
    }
  );
}
```

```just
set export
set shell := ["fish", "-c"]

@build: setup
    ...

@run: build
    ...

@verify: run
    ...

# ---------------------------------------------

wbuild:
    watchexec -c -e asm -r -- just build 

wrun:
    watchexec -c -e asm -r -- just run

wverify:
    watchexec -c -e asm -e forth -r -- just verify   

# ---------------------------------------------

[private]
@setup:
    ...

```

### About the `flake.nix`

The `flake.nix` file is **intentionally thin**, just enough for the current project (bootstrapping a compiler in assembly), but you can imagine it growing with dependencies as needed. Currently, I'm using `flake-utils`... I know I know, I should do better, but in my defense I will state that I do it mostly out of habit; it's the first tool I learned to make multi-system flakes manageable and for the simple system in hand it is comfortable enough.  That said, I'm aware that [`flake-parts`](https://github.com/hercules-ci/flake-parts) has become the preferred way to organize more complex flakes and some day I should take a deeper look into. For now, the setup works. And that's what I care at the moment. 
### About the `justfile` 

This is **not intended to be a `just` tutorial/deep-dive**, but I'll do my best to quickly explain what it does, although I can assume you already have a good idea.

Each recipe, this is how the call the commands, is given an appropriate name (want to bet what `test` does?). For convenience I also define some "watch" variants using `watchexec` to get the "cargo watch" experience at home. (I seriously spent too much time trying to make a suitable [meme](https://knowyourmeme.com/memes/we-have-food-at-home) about this but I guess all the creative juices have been taken by Itreas...). But now for real, `watchexec` is a hell of a tool, I really recommend it. 

Recipes can have dependencies. Look at the `build` recipe, which depends on `setup`. It's a simple, readable way to define a dependency graph of sorts that makes the project's workflow almost self-documenting as long as you know how to read justfiles. Of course, `just` allows you to define if the dependencies should run on every execution of the recipe or not, but I'll leave that as homework for the reader, since I did not do them myself.

Overall, `just` is a quite simple and elegant way to define commands, and it does exactly what I want and it does not force me to jump any hoops, which I appreciate.
### About the `.envrc`

The glue that I almost forgot to tell you about: the `.envrc` file, or `direnv`. Here it is in its entirety:
```
use flake . --impure
```

I know... **quite underwhelming**, but it gets the job done. I'll also leave the details of how this works to the reader, [here](https://github.com/nix-community/nix-direnv) you can find the github repo, but I will explain that with this setup the `flake.nix` file gets **automatically loaded** when navigating into the directory **and unloaded** when we navigate out of it.

I will not discuss the use of `--impure`, which I will be the first one to agree that it is ugly, but as I said it does work and for now it is not more than what I need. Nonetheless, it is not an insurmountable issue, and I believe it could be fixed with some work. 
# Conclusions

After spending time juggling aliases and scripts, `just` turned out to be the missing piece. It’s declarative, consistent, and fits perfectly inside my Nix-based setup. 

Like most good tools, it fades into the background. I just run `just wbuild` and move on.

There's a couple of thing that I need to iron out, like including local files into the `flake.nix` file, hence the horrible `--impure` flag. But this just gives me the perfect excuse to write another entry in the future, so I'm not complaining too much. 

**Links**
 - [Just - just a command runner - Github](https://github.com/casey/just)
 - [Watchexec - Executes commands in response to file modifications - Github](https://github.com/watchexec/watchexec)
 - [Nix-Direnv - A fast, persistent use_nix/use_flake implementation for direnv - Github](https://github.com/nix-community/nix-direnv)
 - [Goburin - My personal hobby "goblin" programming language - Github](https://github.com/martihomssoler/goburin)
 