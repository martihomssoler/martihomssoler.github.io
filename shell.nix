{ pkgs ? import <nixpkgs> {} }:
let
  scripts = with pkgs; [
    (writeShellScriptBin "serve" ''
      trap 'kill 0' SIGINT; zola serve & tailwindcss -i static/input.css -o public/output.css --watch
    '')
    # (writeShellScriptBin "sync" ''
    #   echo ${./.sync-path}
    # '')
  ];
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    # Rust packages
    rustc cargo rustfmt rust-analyzer clippy
    # Language server for html + css (and others)
    vscode-langservers-extracted
    # Tailwind css
    tailwindcss
    # Zola package
    zola
  ] ++ scripts;
}
