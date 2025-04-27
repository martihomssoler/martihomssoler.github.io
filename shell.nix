{ pkgs ? import <nixpkgs> {} }:
let
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

      cp -r $sync_path/tech/* ./content/tech/
      cp -r $sync_path/blog/* ./content/blog/
    '')
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
