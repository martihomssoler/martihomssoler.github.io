{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell rec {

  buildInputs = with pkgs; [
    rustc
    cargo
    rustfmt
    rust-analyzer
    clippy
    zola
  ];
}
