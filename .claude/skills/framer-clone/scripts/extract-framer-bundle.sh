#!/usr/bin/env bash
#
# Download HTML + every JS/MJS chunk of a Framer (or any static) site into a
# local folder so we can grep + AST-walk the bundle offline. Also pulls
# inlined JSON-like <script type="application/json"> payloads that Framer
# uses for scene/animation configs.
#
# Usage:
#   bash extract-framer-bundle.sh <URL> [output_dir]
#
# Output layout:
#   <output_dir>/
#     page.html          # the page source
#     js-urls.txt        # list of every JS chunk URL
#     <chunk>.js         # each chunk downloaded (query string stripped)
#     inline-json/*.json # every <script type="application/json"> payload

set -euo pipefail

URL="${1:-}"
OUT="${2:-./framer-bundle}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

if [[ -z "$URL" ]]; then
  echo "usage: extract-framer-bundle.sh <URL> [output_dir]" >&2
  exit 1
fi

# Validate URL — reject shell metacharacters + non-http(s). Prevents command
# injection when URL passes through `cd`, `basename`, etc.
if [[ ! "$URL" =~ ^https?://[A-Za-z0-9.\-]+(:[0-9]+)?(/[A-Za-z0-9._~%/\?\#\=\&\+\-]*)?$ ]]; then
  echo "ERROR: URL must be http(s) and contain only URL-safe characters" >&2
  echo "       got: $URL" >&2
  exit 1
fi

mkdir -p "$OUT/inline-json"
cd "$OUT"

echo "→ downloading $URL"
curl -sL -A "$UA" "$URL" -o page.html

echo "→ extracting JS/MJS URLs"
grep -oE 'https?://[^"'"'"'<>()]+\.(js|mjs)(\?[^"'"'"'<>()]*)?' page.html | sort -u > js-urls.txt
grep -oE 'src="/_framer[^"]+\.(js|mjs)[^"]*"' page.html | \
  sed 's/src="//; s/"$//' >> js-urls.txt || true
sort -u -o js-urls.txt js-urls.txt
echo "  found $(wc -l < js-urls.txt) URLs"

# Resolve relative URLs against the page origin.
ORIGIN="$(echo "$URL" | sed -E 's#^(https?://[^/]+).*#\1#')"

while IFS= read -r u; do
  [[ -z "$u" ]] && continue
  if [[ "$u" != http* ]]; then u="$ORIGIN$u"; fi
  fn="$(basename "$u" | cut -d'?' -f1)"
  if [[ -f "$fn" ]]; then
    # Avoid overwriting when two chunks share a basename.
    fn="$(echo "$u" | shasum | cut -c1-8)-$fn"
  fi
  echo "    $u → $fn"
  curl -sL -A "$UA" "$u" -o "$fn" || echo "      (failed)"
done < js-urls.txt

echo "→ extracting inline JSON payloads"
# Extract <script type="application/json">…</script> blocks. Each becomes a
# numbered file under inline-json/.
awk '
  /<script[^>]*type="application\/json"[^>]*>/ { capture=1; buf=""; next }
  capture && /<\/script>/ {
    n++; print buf > ("inline-json/" sprintf("%03d.json", n)); capture=0; next
  }
  capture { buf = buf $0 "\n" }
' page.html || true

N_JS=$(find . -maxdepth 1 -name '*.js' -o -name '*.mjs' | wc -l | tr -d ' ')
N_JSON=$(find inline-json -name '*.json' | wc -l | tr -d ' ')
echo
echo "Bundle saved to: $OUT"
echo "  $N_JS JS chunk(s) · $N_JSON inline JSON blob(s)"
echo
echo "Next: node scripts/extract-animations.js $OUT > animations.json"
