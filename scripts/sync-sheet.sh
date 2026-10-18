#!/usr/bin/env bash
# Fetch (sparse, shallow) the official PF2e sheet and regenerate packages/schema-roll20/schema.json.
# Usage: scripts/sync-sheet.sh [checkout-dir]   (default: ../roll20-character-sheets next to the repo)
set -euo pipefail
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
dest="${1:-$repo_root/../roll20-character-sheets}"
sheet="Pathfinder Second Edition by Roll20"

if [ ! -d "$dest/.git" ]; then
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --filter=blob:none --sparse \
    https://github.com/Roll20/roll20-character-sheets "$dest"
else
  git -C "$dest" fetch --depth 1 origin HEAD
  git -C "$dest" reset --hard FETCH_HEAD
fi
git -C "$dest" sparse-checkout set "$sheet"
node "$repo_root/scripts/extract-sheet-schema.mjs" "$dest/$sheet" "$repo_root/packages/schema-roll20/schema.json"
git -C "$repo_root" --no-pager diff --stat -- packages/schema-roll20/schema.json || true
