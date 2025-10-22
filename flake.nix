{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem ( system:
    let
    pkgs = (import nixpkgs { inherit system; });

    nativeBuildInputs = with pkgs; [ pkg-config ];

    buildInputs = with pkgs; [
      # Zola package
      zola
    ];

    devInputs = with pkgs; [
      # Rust
      rustup vscode-langservers-extracted
      # Language server for html + css (and others)
      vscode-langservers-extracted
      # Tailwind css
      tailwindcss_3
      # Opencode
      opencode
    ];
    
    scripts = with pkgs; [
      # serve the final static web a.k.a in release mode
      (writeShellScriptBin "sr" ''
        trap 'kill 0' SIGINT; zola serve & tailwindcss -i static/input.css -o public/output.css --watch
      '')
      # serve the static web with draft posts 
      (writeShellScriptBin "sd" ''
        trap 'kill 0' SIGINT; zola serve --drafts & tailwindcss -i static/input.css -o public/output.css --watch
      '')
      # reload the blog content, synching it with my local obsidian vault
      (writeShellScriptBin "rl" ''
        sync_path=${builtins.readFile ./.sync-path}

        # finds and removes everything except '_index.md'
        find ./content/tech/* -type d -not -name '_index.md' | xargs rm -r &>/dev/null
        cp -r $sync_path/tech/* ./content/tech/

        # finds and removes everything except '_index.md'
        find ./content/blog/* -type d -not -name '_index.md' | xargs rm -r &>/dev/null
        cp -r $sync_path/blog/* ./content/blog/
      '')
    ];

    in {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = nativeBuildInputs ++ devInputs;
        buildInputs = buildInputs ++ devInputs ++ scripts;

        # https://github.com/rust-lang/rust-bindgen#environment-variables
        LIBCLANG_PATH = pkgs.lib.makeLibraryPath [ pkgs.llvmPackages_latest.libclang.lib ];
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath ( buildInputs ++ nativeBuildInputs );
    
        shellHook = ''
          # Use binaries installed with `cargo install`
          export PATH=$PATH:$CARGO_HOME/bin
          export PROJECT_DIR=$(pwd)
        '';
      };
  });
}

