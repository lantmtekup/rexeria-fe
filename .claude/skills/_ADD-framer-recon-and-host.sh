#!/usr/bin/env bash
# framer-recon and framer-clone-host live in the SOURCE project's protected
# .claude/skills dir, which the Claude Code harness blocks from agent access.
# Run THIS script in your own native Terminal (not inside Claude) to pull them
# into this pack, then re-run ../install.sh.
set -euo pipefail

SRC="${1:-$HOME/Documents/360-admin-cms/.claude/skills}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for s in framer-recon framer-clone-host; do
  if [[ -d "$SRC/$s" ]]; then
    rm -rf "$HERE/$s"
    cp -RX "$SRC/$s" "$HERE/$s"
    echo "Added $s ($(find "$HERE/$s" -type f | wc -l | tr -d ' ') files)"
  else
    echo "MISSING: $SRC/$s"
  fi
done
echo "Done. Now framer-recon/host will be included by install.sh."
