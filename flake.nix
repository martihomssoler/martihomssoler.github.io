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
      # Others
      watchexec
    ];
    
    in {
      devShells.default = pkgs.mkShell {
        nativeBuildInputs = nativeBuildInputs ++ devInputs;
        buildInputs = buildInputs ++ devInputs;

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

