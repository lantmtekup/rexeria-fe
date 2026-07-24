#!/usr/bin/env bash
#
# Verify a rexerai native block is wired into every touchpoint.
# rexerai BE is Go+Postgres — there is NO Supabase RPC / DB call here.
# The BE `type_code` seed (scope=system) is runnable from THIS repo via
# `node scripts/seed-block-surfaces.mjs <type_code>` — do it now, don't defer.
#
# Usage (run from repo root):
#   bash .claude/skills/framer-clone-host/scripts/verify-block-wiring.sh <type_code> <ComponentName>
# Example:
#   bash .claude/skills/framer-clone-host/scripts/verify-block-wiring.sh framer_yume_hero FramerYumeHero

set -uo pipefail

TYPE="${1:-}"
NAME="${2:-}"
if [[ -z "$TYPE" || -z "$NAME" ]]; then
  echo "usage: verify-block-wiring.sh <type_code_snake> <ComponentName>" >&2
  exit 2
fi

BE="src/components/modules/block-editor"
if [[ ! -d "$BE" ]]; then
  echo "ERROR: run from repo root (missing $BE)" >&2
  exit 2
fi

pass=0; fail=0
chk() { # <label> <file> <grep-pattern>
  if grep -q "$3" "$2" 2>/dev/null; then
    printf "  \033[32m✓\033[0m %s\n" "$1"; pass=$((pass+1))
  else
    printf "  \033[31m✗\033[0m %s  (expected in %s)\n" "$1" "$2"; fail=$((fail+1))
  fi
}

echo "Verifying block: type=$TYPE component=$NAME"

echo "[component]"
chk "blocks/$NAME.tsx exists"        "$BE/blocks/$NAME.tsx" "."
chk "uses BlockRenderProps shape"    "$BE/blocks/$NAME.tsx" "activeKey"
chk "marks editable elements"        "$BE/blocks/$NAME.tsx" "data-element-key"
chk "uses selectableClass"           "$BE/blocks/$NAME.tsx" "selectableClass"
chk "container query (@container)"    "$BE/blocks/$NAME.tsx" "@container"
chk "GSAP motion (useBlockMotion/useLandingMotion)" "$BE/blocks/$NAME.tsx" "useBlockMotion\|useLandingMotion"
if grep -q "scrollTrigger" "$BE/blocks/$NAME.tsx" 2>/dev/null; then
  chk "scrollTrigger passes scroller (R3)" "$BE/blocks/$NAME.tsx" "scroller"
fi
# strip comment lines (JSDoc/`//`/`*`) so prose like "thay md:/lg:" doesn't false-flag
code() { grep -vE '^[[:space:]]*(\*|//|/\*)' "$BE/blocks/$NAME.tsx" 2>/dev/null; }
if code | grep -Eq "(^| )(md|lg|sm|xl):|@media|[0-9]vw"; then
  printf "  \033[33m!\033[0m found viewport breakpoints/units (md:/lg:/@media/vw) — R2 wants @container + cqi\n"
fi
if code | grep -Eq "fontSize: *['\"]?[0-9]+(px)?['\"]?[,}]"; then
  printf "  \033[33m!\033[0m hardcoded px fontSize in inline style — prefer clamp(min, N·cqi, max) (tuyền inline)\n"
fi

echo "[types.ts]"
chk "BlockType union has '$TYPE'"    "$BE/types.ts" "'$TYPE'"
chk "BLOCK_TYPE_META has $TYPE"      "$BE/types.ts" "$TYPE:"

echo "[registration]"
REG="$BE/blocks/_registry/registry.ts"
if grep -q "$TYPE" "$REG" 2>/dev/null; then
  echo "  → Path A (registry) detected"
  chk "registered in BLOCK_REGISTRY"  "$REG" "$TYPE"
  chk "def file blocks/_registry/defs exists" "$BE/blocks/_registry/registry.ts" "defs/"
else
  echo "  → Path B (legacy switch) assumed"
  chk "renderBlock case"             "$BE/blocks/renderBlock.tsx" "$NAME\|'$TYPE'"
  chk "factory default content"      "$BE/factory.ts" "$TYPE"
  chk "LayersPanel ELEMENTS_BY_TYPE" "$BE/LayersPanel.tsx" "$TYPE"
fi
chk "AddBlockDialog ORDERED_TYPES"   "$BE/AddBlockDialog.tsx" "$TYPE"

echo
echo "pass=$pass fail=$fail"
echo "⚠️  RUN NOW (not later): node scripts/seed-block-surfaces.mjs $TYPE"
echo "    Skipping this = 'Save Version' 400s the first time anyone uses '$TYPE' on a page."
echo "    Then mirror '$TYPE' into scripts/prod-block-catalog.sql's INSERT array."
echo "Next: npx tsc --noEmit  → open editor canvas  → check /p/[id] scroll entrance."
[[ $fail -eq 0 ]]
