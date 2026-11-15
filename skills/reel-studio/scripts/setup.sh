#!/usr/bin/env bash
# reel-studio setup.
#   setup.sh --check     report what is installed and what is missing (installs nothing)
#   setup.sh --install   install what is missing (run only after the user approves)
# Prints READY on the last line when everything needed is present.
set -uo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CACHE="${REEL_STUDIO_CACHE:-$HOME/.cache/reel-studio}"
VENV="$CACHE/venv"
WHISPER_MODEL="${WHISPER_MODEL:-$HOME/.cache/whisper/ggml-large-v3-turbo-q5_0.bin}"
WHISPER_URL="https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin"
MODE="${1:---check}"

missing=()
ok() { printf '  ok       %s\n' "$1"; }
miss() { printf '  MISSING  %s (%s)\n' "$1" "$2"; missing+=("$1"); }

check() {
  echo "reel-studio requirements:"
  command -v ffmpeg >/dev/null && command -v ffprobe >/dev/null && ok "ffmpeg" || miss "ffmpeg" "cutting, audio, loudness"
  if command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ]; then ok "node $(node -v)"; else miss "node" "Node.js 18+ for Remotion"; fi
  if command -v python3 >/dev/null && python3 -c 'import sys; sys.exit(0 if sys.version_info[:2] >= (3, 10) else 1)'; then ok "python $(python3 -V | cut -d' ' -f2)"; else miss "python" "Python 3.10+"; fi
  command -v magick >/dev/null && ok "imagemagick" || miss "imagemagick" "contact sheets, logo recolouring"
  command -v whisper-cli >/dev/null && ok "whisper-cli" || miss "whisper-cli" "whisper.cpp for word-timed captions"
  [ -s "$WHISPER_MODEL" ] && ok "whisper model" || miss "whisper-model" "~550 MB speech model at $WHISPER_MODEL"
  if [ -x "$VENV/bin/python" ] && "$VENV/bin/python" -c 'import numpy, cv2, PIL, mediapipe' 2>/dev/null; then ok "python packages (effects, beat detection)"; else miss "python-packages" "numpy, opencv, pillow, mediapipe in $VENV"; fi
  command -v yt-dlp >/dev/null && ok "yt-dlp (optional: download reference reels)" || echo "  optional yt-dlp not found: reference reels must be downloaded by hand"
}

install() {
  local brew_pkgs=()
  for m in "${missing[@]}"; do
    case "$m" in
      ffmpeg) brew_pkgs+=(ffmpeg) ;;
      imagemagick) brew_pkgs+=(imagemagick) ;;
      whisper-cli) brew_pkgs+=(whisper-cpp) ;;
      node) brew_pkgs+=(node) ;;
      python) brew_pkgs+=(python@3.12) ;;
    esac
  done
  if [ ${#brew_pkgs[@]} -gt 0 ]; then
    if command -v brew >/dev/null; then
      brew install "${brew_pkgs[@]}" || { echo "brew install failed for: ${brew_pkgs[*]}"; exit 1; }
    else
      echo "Homebrew is missing, so these need a manual install: ${brew_pkgs[*]} (Linux: apt install ffmpeg imagemagick nodejs; build whisper.cpp from github.com/ggml-org/whisper.cpp)"
      exit 1
    fi
  fi
  if [[ " ${missing[*]} " == *" whisper-model "* ]]; then
    mkdir -p "$(dirname "$WHISPER_MODEL")"
    echo "Downloading the Whisper model (~550 MB)..."
    curl -fL --progress-bar -o "$WHISPER_MODEL.part" "$WHISPER_URL" && mv "$WHISPER_MODEL.part" "$WHISPER_MODEL" || { echo "Whisper model download failed"; exit 1; }
  fi
  if [[ " ${missing[*]} " == *" python-packages "* ]]; then
    mkdir -p "$CACHE"
    python3 -m venv "$VENV" && "$VENV/bin/python" -m pip install -q --upgrade pip && "$VENV/bin/python" -m pip install -q -r "$SKILL_DIR/effects/requirements.txt" || { echo "Python package install failed"; exit 1; }
  fi
}

check
if [ "$MODE" = "--install" ] && [ ${#missing[@]} -gt 0 ]; then
  install
  missing=()
  echo
  check
fi
echo
echo "PYTHON=$VENV/bin/python"
echo "WHISPER_MODEL=$WHISPER_MODEL"
if [ ${#missing[@]} -eq 0 ]; then echo READY; else echo "NOT READY: ${missing[*]}"; fi
