#!/usr/bin/env bash
# Final render and export: one file with music, one with voice and sound effects only (for a trending audio).
# usage: finish.sh <project_dir> <output_base_path>     e.g. finish.sh ./reel ~/Videos/launch
#   writes <output_base_path>.mp4 and <output_base_path>_no_music.mp4, loudness-normalised for social apps.
# The composition must be called Reel and take a boolean `music` prop (the template does).
set -euo pipefail
[ $# -eq 2 ] || { sed -n 2,5p "$0"; exit 1; }
PROJECT=$1; BASE="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
cd "$PROJECT"; mkdir -p out
./node_modules/.bin/remotion render src/index.ts Reel out/reel_raw.mp4 --crf=16 --log=error
./node_modules/.bin/remotion render src/index.ts Reel out/no_music.wav --codec=wav --props='{"music":false}' --log=error
LN="loudnorm=I=-14:TP=-1.5:LRA=11"
ffmpeg -v error -y -i out/reel_raw.mp4 -af "$LN" -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$BASE.mp4"
ffmpeg -v error -y -i out/reel_raw.mp4 -i out/no_music.wav -map 0:v -map 1:a -af "$LN" -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart "${BASE}_no_music.mp4"
for f in "$BASE.mp4" "${BASE}_no_music.mp4"; do
  echo "$f  $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")s  $(ffmpeg -nostats -i "$f" -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | xargs)"
done
