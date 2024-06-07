{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell rec {
  # nativeBuiltInputs = with pkgs; [
  # ];
  buildInputs = with pkgs; [
    gcc
    stdenv.cc
    stdenv.cc.libc stdenv.cc.libc_dev
    ruby_3_3
    rubyPackages_3_3.jekyll
  ];
}
