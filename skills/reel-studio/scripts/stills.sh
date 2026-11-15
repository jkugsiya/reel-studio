#!/usr/bin/env bash
# Renders still frames of the composition and tiles them into one review sheet. Check this before a full render.
# usage: stills.sh <project_dir> <out.jpg> <second> [second ...]
set -euo pipefail
FONT="$(cd "$(dirname "$0")/.." && pwd)/effects/fonts/Inter.ttf"
[ $# -ge 3 ] || { sed -n 2,3p "$0"; exit 1; }
PROJECT=$1; OUT="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"; shift 2
cd "$PROJECT"; mkdir -p out/stills
ARGS=()
for s in "$@"; do
  F=$(python3 -c "print(round($s*30))")
  ./node_modules/.bin/remotion still src/index.ts Reel "out/stills/$F.png" --frame="$F" --log=error
  ARGS+=(-label "${s}s" "out/stills/$F.png")
done
magick montage "${ARGS[@]}" -tile "$(( $# < 6 ? $# : 6 ))x" -geometry 360x640+4+4 -font "$FONT" -pointsize 22 -fill white -background '#111' "$OUT"
echo "$OUT"
