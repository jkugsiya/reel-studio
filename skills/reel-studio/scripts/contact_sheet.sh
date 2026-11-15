#!/usr/bin/env bash
# Timestamped contact sheet of a clip, for picking moments without watching it.
# usage: contact_sheet.sh <clip> <frames> <out.jpg> [start_s] [end_s]
# Each tile is labelled with its time in the clip. Needs ffmpeg and ImageMagick.
set -euo pipefail
FONT="$(cd "$(dirname "$0")/.." && pwd)/effects/fonts/Inter.ttf"
[ $# -ge 3 ] || { sed -n 2,4p "$0"; exit 1; }
CLIP=$1; N=$2; OUT=$3
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CLIP")
START=${4:-0}; END=${5:-$DUR}
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
STEP=$(python3 -c "print(($END-$START)/$N)")
ARGS=()
for i in $(seq 0 $((N-1))); do
  T=$(python3 -c "print(round($START+$STEP*($i+0.5),2))")
  ffmpeg -v error -y -ss "$T" -i "$CLIP" -frames:v 1 -vf "scale=360:-2" "$TMP/$(printf %04d $i).jpg"
  ARGS+=(-label "${T}s" "$TMP/$(printf %04d $i).jpg")
done
COLS=$(( N < 8 ? N : 8 ))
magick montage "${ARGS[@]}" -tile "${COLS}x" -geometry +4+4 -font "$FONT" -pointsize 22 -fill white -background '#111' "$OUT"
echo "$OUT ($N frames, every ${STEP}s from ${START}s)"
