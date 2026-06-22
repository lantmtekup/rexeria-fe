#!/usr/bin/env bash
#
# Download HTML + every JS chunk of a GSAP/Lenis site so we can parse the
# bundle offline. Resolves relative URLs against the page origin and pulls
# inline <script> blocks too.
#
# Usage:  bash 01-fetch-bundle.sh <URL> [output_dir]
#
# Output:
#   <out>/page.html
#   <out>/<chunk>.js              # external scripts
#   <out>/inline-scripts/NNN.js   # inline <script> bodies

set -euo pipefail

URL="${1:-}"
OUT="${2:-./bundle}"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

if [[ -z "$URL" ]]; then
  echo "usage: 01-fetch-bundle.sh <URL> [output_dir]" >&2
  exit 1
fi

mkdir -p "$OUT/inline-scripts"
cd "$OUT"

echo "→ stack probe"
PROBE=$(curl -sL -A "$UA" "$URL" | grep -oE '(gsap|ScrollTrigger|lenis|framerusercontent)[A-Za-z0-9._-]*' | sort -u || true)
echo "$PROBE" | sed 's/^/    /'
if echo "$PROBE" | grep -q framerusercontent; then
  echo
  echo "⚠️  Detected framerusercontent.com — this is a Framer site." >&2
  echo "    Use /framer-clone skill instead." >&2
  exit 2
fi
if ! echo "$PROBE" | grep -qiE 'gsap|scrolltrigger'; then
  echo
  echo "⚠️  No GSAP/ScrollTrigger reference found in HTML." >&2
  echo "    Site might be Webflow/custom. Continue anyway? (Ctrl-C to abort, Enter to continue)" >&2
  read -r _ < /dev/tty || true
fi

echo "→ downloading $URL"
curl -sL -A "$UA" -e "$URL" "$URL" -o page.html

ORIGIN="$(echo "$URL" | sed -E 's#^(https?://[^/]+).*#\1#')"

echo "→ extracting external script srcs"
# Extract src= attributes from <script> tags
grep -oE '<script[^>]+src="[^"]+"' page.html | \
  sed -E 's/.*src="([^"]+)".*/\1/' | sort -u > js-urls.txt || true
echo "    $(wc -l < js-urls.txt | tr -d ' ') urls"

while IFS= read -r src; do
  [[ -z "$src" ]] && continue
  # Resolve URL
  if [[ "$src" =~ ^// ]]; then
    url="https:$src"
  elif [[ "$src" =~ ^/ ]]; then
    url="${ORIGIN}${src}"
  elif [[ "$src" =~ ^https?: ]]; then
    url="$src"
  else
    url="${URL%/}/$src"
  fi
  fn="$(basename "$url" | cut -d'?' -f1)"
  [[ -z "$fn" || "$fn" == "/" ]] && continue
  if [[ -f "$fn" ]]; then
    fn="$(echo "$url" | shasum | cut -c1-8)-$fn"
  fi
  echo "    $url → $fn"
  curl -sL -A "$UA" -e "$URL" "$url" -o "$fn" 2>/dev/null || echo "      (failed)"
done < js-urls.txt

echo "→ extracting inline <script> blocks"
awk '
  /<script[^>]*>/ && !/src=/ {
    capture=1; buf=""
    sub(/.*<script[^>]*>/, "")
    if ($0 ~ /<\/script>/) {
      sub(/<\/script>.*/, "")
      n++
      if (length($0) > 0) print $0 > ("inline-scripts/" sprintf("%03d.js", n))
      capture=0; next
    }
    buf=$0
    next
  }
  capture && /<\/script>/ {
    sub(/<\/script>.*/, "")
    buf = buf "\n" $0
    n++
    print buf > ("inline-scripts/" sprintf("%03d.js", n))
    capture=0; next
  }
  capture { buf = buf "\n" $0 }
' page.html || true

N_JS=$(find . -maxdepth 1 -name '*.js' -o -name '*.mjs' 2>/dev/null | wc -l | tr -d ' ')
N_INLINE=$(find inline-scripts -name '*.js' 2>/dev/null | wc -l | tr -d ' ')

echo
echo "Bundle saved: $OUT"
echo "  $N_JS external · $N_INLINE inline"

echo
echo "→ JS files by size (most likely animation file = largest non-vendor):"
ls -laS *.js 2>/dev/null | awk 'NR>1 {print "    " $5 " " $9}'
echo
echo "→ Suggested animation file (excluding common vendors):"
ls *.js 2>/dev/null | grep -vEi 'jquery|gsap|scrolltrigger|scrolltoplugin|swiper|bootstrap|lenis|imagesloaded|splitting|splittype|alpine|three' | head -3 | sed 's/^/    /' || echo "    (none — check inline-scripts/)"

echo
echo "Next: node \$SKILL_DIR/scripts/02-extract-animations.js $OUT > animations.json"
