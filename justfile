set export

sync_path:= read(".sync-path")

# release serve
serve args='':
      trap 'kill 0' SIGINT; \
            just wsync-all & \
            tailwindcss -i static/input.css -o public/output.css --watch & \
            zola serve {{args}} --fast 


# copy content from `synch_path`
wsync-all:
      trap 'kill 0' SIGINT; \
            watchexec -c -w {{sync_path}}/blog/ -r -- just sync "blog" & \
            watchexec -c -w {{sync_path}}/tech/ -r -- just sync "tech" & \
            watchexec -c -w {{sync_path}}/rpg/ -r -- just sync "rpg"

# copy content from `synch_path`
sync-all:
      just sync "blog"
      just sync "tech"
      just sync "rpg"
      
# finds and removes everything except '_index.md'
sync folder:
      find ./content/{{folder}}/* -type d -not -name '_index.md' | xargs --no-run-if-empty rm -r &>/dev/null
      cp -r {{sync_path}}/{{folder}}/* ./content/{{folder}}/
