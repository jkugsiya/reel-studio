#!/usr/bin/env bash
# Makes fast, uniform copies of source clips for Remotion: 30 fps, H.264, standard (tv) colour range, stereo AAC.
# usage: prep_clips.sh <project_dir> <input> <name> [--full] [--ss SECONDS --t SECONDS] [--noaudio]
#   default: short side scaled to 1080 px. --full keeps the original resolution (use it for clips you punch into).
# Why: headset and screen recordings are often full-range (yuvj420p) while phone clips are tv-range. Mixing them
# without converting shifts brightness and makes ffmpeg and Remotion misbehave at cuts.
set -euo pipefail
[ $# -ge 3 ] || { sed -n 2,6p "$0"; exit 1; }
PROJECT=$1; IN=$2; NAME=$3; shift 3
FULL=0; SS=(); T=(); AUDIO=1
while [ $# -gt 0 ]; do
  case $1 in
    --full) FULL=1 ;;
    --ss) SS=(-ss "$2"); shift ;;
    --t) T=(-t "$2"); shift ;;
    --noaudio) AUDIO=0 ;;
    *) echo "unknown option $1"; exit 1 ;;
  esac
  shift
done
OUT="$PROJECT/public/clips/$NAME.mp4"; mkdir -p "$(dirname "$OUT")"
RANGE=$(ffprobe -v error -select_streams v:0 -show_entries stream=color_range,pix_fmt -of csv=p=0 "$IN")
IN_RANGE=tv; [[ "$RANGE" == *pc* || "$RANGE" == *yuvj* ]] && IN_RANGE=pc
SCALE="scale=w='if(lt(iw,ih),min(1080,iw),-2)':h='if(lt(iw,ih),-2,min(1080,ih))'"
[ $FULL = 1 ] && SCALE="scale=iw:ih"
VF="$SCALE:in_range=$IN_RANGE:out_range=tv,fps=30,format=yuv420p"
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | head -1)
A=(-an); [ $AUDIO = 1 ] && [ -n "$HAS_AUDIO" ] && A=(-map 0:a:0 -c:a aac -b:a 192k -ar 48000 -ac 2)
ffmpeg -v error -y ${SS[@]+"${SS[@]}"} ${T[@]+"${T[@]}"} -i "$IN" -map 0:v:0 "${A[@]}" -vf "$VF" -c:v libx264 -preset fast -crf 15 -g 15 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 "$OUT"
echo "$OUT $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$OUT") $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s"
