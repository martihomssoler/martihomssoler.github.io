{ pkgs ? import <nixpkgs> {} }:
let
  scripts = [
    # TODO(mhs): fix this, it does not execute tailwindcss
    (pkgs.writeShellScriptBin "serve" ''
      trap 'kill 0' SIGINT; tailwindcss -i static/input.css -o public/output.css --watch & zola serve
    '')
  ];
in
pkgs.mkShell rec {
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
