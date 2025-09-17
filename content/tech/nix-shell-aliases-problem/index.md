+++
date = "2025-04-30"
updated = "2025-04-30"
categories = ["NixOS"]
tags = ["nix-shell", "direnv", "nix-direnv"]
title = "Aliases problems with `nix-shell`+ `direnv`"
description = "Ran into issues using Bash aliases with `nix-shell` and `direnv`. Solved it by replacing aliases via `writeShellScritpBin`. This article covers the reasons behind why it does not work and explains the workaround I am using."
+++

When working in reproducible development environments, `nix-shell` and `direnv` form a powerful duo — more precisely [nix-direnv](https://github.com/nix-community/nix-direnv). Combined, they allow per-project environments to be automatically loaded when entering a directory — no manual shenanigans needed. Nonetheless, one recurring pain point is the frustrating interaction between `nix-shell`, `direnv`, and Bash aliases.

While developing this personal blog using [Zola](https://www.getzola.org/), I had some scripts that I wanted to run on the background in an easy way — namely `zola serve` and `tailwindcss` with `--watch` option. To make it easier I wanted to have a single Bash alias named `serve` that would handle everything for me, even `Ctrl+C` to stop the processes. 

But... I ran into an annoying issue: my usual Bash aliases weren’t working inside my project’s `nix-shell` environment, even though I was using `direnv` to load everything automatically. After some digging, I realized this is a common pitfall when combining `nix-shell`, `direnv`, and Bash. Here’s what’s going on and how I worked around it using nix's `writeShellScriptBin`.

<img src="image.jpg" width="640">

## Why Bash Aliases Break inside `nix-shell` + `direnv`?

**TLDR: `direnv` doesn't source `.bashrc` or similar files in interactive shells**. 

If you are interested [here](https://github.com/direnv/direnv/issues/73) and [here](https://github.com/nix-community/nix-direnv/issues/245) are `.direnv` Github issues, and [here](https://github.com/NixOS/nix/issues/1598) the `nix-shell` Github issue.

### Understanding the Issue

Bash aliases are typically defined in interactive shell sessions, such as those initiated by `.bashrc`. When you define an alias like:
```bash
λ -> alias gs='git status'
```

That alias exists **only in the interactive shell session**, like when you open a terminal.

If a script or tool spawns a _non-interactive_ Bash shell, your aliases won't be there. This means that, when entering a `nix-shell` environment, especially when managed by `direnv`, these aliases may not be available.​

The root of the problem lies in how `direnv` and `nix-shell` operate.

#### `direnv` Behavior

`direnv` watches for `.envrc` and re-evaluates it when you enter a directory — modifying the environment of the current shell session. This part works great.

However,  `direnv` **does not start a new shell**, and therefore, any aliases defined within `shellHook` in `shell.nix` are not propagated to the current shell and you will find that your previously `gs` command is suddenly undefined.

Even if you define aliases directly inside `.envrc`, they might not propagate into the spawned `nix-shell` depending on the context and timing. So definitively not reproducible.

#### `nix-shell` Behavior

While `nix-shell` does start an interactive shell by default, aliases defined in `shellHook` may not persist in certain scenarios, such as when using `nix-shell --run`. ​

These behaviors lead to inconsistencies in the availability of aliases, causing frustration for users who rely on them for their workflows — that was me.​

## The Workaround: Using `writeShellScriptBin`

To circumvent the limitations with aliases, a practical solution is to convert aliases into executable scripts using Nix's `writeShellScriptBin` function. This approach ensures that the desired commands are available in the environment's `$PATH`, regardless of how the shell is initiated.​

### Setup `nix-direnv`

I'm assuming you already have `nix-direnv` in your system. Otherwise, You can find all the info on how to install it in [here](https://github.com/nix-community/nix-direnv#Installation). 

For completeness sake, this is how I have it setup using `home-manager` and `fish` as my terminal:

```nix
# ... import pgks ...
{
	# ... other config ...
    programs.direnv = {
      enable = true;
      enableFishIntegration = true;
      nix-direnv.enable = true;
    };
}
```

Once you have `nix-direnv` you need to make it available in your system and folder. Just run the following commands: 
```bash
λ -> echo "use nix" >> .envrc
λ -> direnv allow
```

### Define the Script in shell.nix

This is how I have defined the `shell.nix` in my [repo](https://github.com/martihomssoler/martihomssoler.github.io/blob/main/shell.nix). Make sure the name of the file is either `shell.nix` or `default.nix` as per the [Nix documentation](https://nix.dev/manual/nix/2.28/command-ref/nix-shell.html#description)

```nix
{ pkgs ? import <nixpkgs> {} }:
let
  scripts = [
    (pkgs.writeShellScriptBin "serve" ''
      trap 'kill 0' SIGINT; zola serve & tailwindcss -i static/input.css -o public/output.css --watch
    '')
  ];
in
pkgs.mkShell rec {
  buildInputs = with pkgs; [
    # all needed packages -- removed for clarity --
  ] ++ scripts;
}
```

Note that I'm using... 
- `writeShellScriptBin` to create an executable script — in this case named `serve`. I put said script in the `scripts` array that then I make available through the `buildInputs` so I can call it inside the new `nix-shell`.
- `trap 'kill 0' SIGINT;` to create a group and send the `SIGTERM` signal to all processes in the current process group when I press `Ctrl+C`. This ensures that all background processes started by the script are terminated when the script is interrupted.
-  `zola serve` **first** and then `tailwindcss ... --watch`. Otherwise the `.css` file **will not be loaded properly**. I honestly spent too much time on this small issue...

This setup is particularly useful for development workflows where you want to simultaneously watch for CSS changes and serve your site locally. Of course, the script can be easily updated to run multiple background processes — just add another `& ...` inside the `trap` group. 

# Conclusion

Aliases in `nix-shell` with `direnv` don’t work well, especially when defined in `shellHook`. They’re not reliable. Using `writeShellScriptBin` to create real scripts is a simple fix — it’s consistent, works across shells, and avoids alias issues.

I really like this solution. It allows me to stay fully within Nix, keep things reproducible, and still have flexibility. The only downside is needing to reload `nix-shell` if I update a script, but that doesn’t come up often. Usually I discover patterns in my commands while working, then consolidate them later. I don’t try to predict them up front.