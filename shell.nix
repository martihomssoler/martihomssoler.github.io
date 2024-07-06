{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell rec {

  buildInputs = with pkgs; [
    gcc
    stdenv.cc
    stdenv.cc.libc stdenv.cc.libc_dev
    ruby
    rubyPackages.jekyll
    ruby.devEnv
    git
    sqlite
    libpcap
    postgresql
    libxml2
    libxslt
    pkg-config
    bundix
    gnumake
  ];
}
