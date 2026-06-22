#!/usr/bin/env bash
#
# Scaffold a clone project from the gsap-clone starter template.
#
# Usage:  bash 03-scaffold-project.sh [output_dir]
#
# Default output: ./output

set -euo pipefail

OUT="${1:-./output}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$SKILL_DIR/assets/starter-template"

if [[ -d "$OUT" ]] && [[ -n "$(ls -A "$OUT" 2>/dev/null)" ]]; then
  echo "⚠️  $OUT exists and is not empty." >&2
  echo "    Refusing to overwrite. Pick a fresh dir or delete first." >&2
  exit 1
fi

mkdir -p "$OUT"
cp -R "$TEMPLATE/." "$OUT/"

cd "$OUT"

# Pick package manager — prefer pnpm, fall back to npm
if command -v pnpm >/dev/null 2>&1; then
  PM=pnpm
elif command -v yarn >/dev/null 2>&1; then
  PM=yarn
else
  PM=npm
fi

echo "→ scaffolded at $OUT (using $PM)"
echo "→ installing deps (this can take 1–2 min)…"
$PM install

cat <<EOF

✅ Scaffold complete.

Next steps:
  1. cd $OUT
  2. Translate animations.json into src/scripts/animations.ts
     (gsap.to / gsap.from / ScrollTrigger.create — keep eases verbatim)
  3. Build sections in src/components/ matching the original HTML
  4. $PM dev   → opens at http://localhost:4321
  5. node \$SKILL_DIR/scripts/04-visual-diff.js <ORIGINAL_URL> http://localhost:4321
EOF
