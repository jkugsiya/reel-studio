#!/usr/bin/env bash
# Creates a Remotion reel project from the skill template and installs its pinned packages.
# usage: new_project.sh <project_dir>
# Installs ~200 MB of npm packages (Remotion, React). Get the user's OK before the first run on a machine.
set -euo pipefail
[ $# -eq 1 ] || { sed -n 2,4p "$0"; exit 1; }
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST=$1
if [ -e "$DEST/package.json" ]; then echo "$DEST already has a project; leaving it untouched"; exit 1; fi
mkdir -p "$DEST"
cp -R "$SKILL_DIR/template/." "$DEST/"
cd "$DEST"
npm install --no-fund --no-audit --loglevel=error
./node_modules/.bin/tsc -p . && echo "project ready at $DEST (type check passed)"
