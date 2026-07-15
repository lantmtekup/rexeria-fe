#!/usr/bin/env bash
# Extract scroll-scrub frames from public/source/video.mp4
# Desktop: every 2nd frame @ native res, WebP RGB (default)
# Mobile:  32 evenly subsampled @ 480×270 (16:9) WebP
#
# Usage:
#   yarn gen:frames                 # fast RGB export (default)
#   yarn gen:frames -- --bg-remove  # rembg RGBA (slow)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO="$ROOT/public/source/video.mp4"
OUT_DESKTOP="$ROOT/public/frames"
OUT_MOBILE="$ROOT/public/frames-mobile"
TMP="$ROOT/.tmp-frames"

MOBILE_W=480
MOBILE_H=270
MOBILE_TOTAL=32
DESKTOP_STRIDE=2
WEBP_Q=80
BG_REMOVE=0
# Only use the first N seconds of the source video (product spin).
CLIP_SECONDS=5

for arg in "$@"; do
  case "$arg" in
    --bg-remove) BG_REMOVE=1 ;;
    --no-bg-remove) BG_REMOVE=0 ;;
  esac
done

need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing dependency: $1" >&2
    exit 1
  }
}

need ffmpeg
need ffprobe
need python3

python3 -c "from PIL import Image; Image.new('RGBA',(1,1)).save('/tmp/_webp_probe.webp','WEBP')" 2>/dev/null || {
  echo "Pillow with WebP support required" >&2
  exit 1
}

if [[ "$BG_REMOVE" -eq 1 ]]; then
  python3 -c "import rembg" 2>/dev/null || {
    echo "rembg required for background removal. Install with:" >&2
    echo "  pip3 install rembg" >&2
    echo "Or re-run with --no-bg-remove" >&2
    exit 1
  }
fi

[[ -f "$VIDEO" ]] || {
  echo "missing source video: $VIDEO" >&2
  exit 1
}

PROBE="$(ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,nb_frames \
  -of csv=p=0 "$VIDEO")"
IFS=',' read -r SRC_W SRC_H NB_FRAMES <<<"$PROBE"

echo "→ source ${SRC_W}×${SRC_H}, nb_frames=${NB_FRAMES:-unknown}"
echo "→ clip: first ${CLIP_SECONDS}s"
echo "→ bg remove: $([ "$BG_REMOVE" -eq 1 ] && echo on || echo off)"

rm -rf "$TMP"
mkdir -p "$TMP/raw" "$TMP/cut" "$OUT_DESKTOP" "$OUT_MOBILE"

echo "→ extracting PNG frames (0–${CLIP_SECONDS}s)…"
ffmpeg -y -loglevel error -ss 0 -t "$CLIP_SECONDS" -i "$VIDEO" "$TMP/raw/frame-%03d.png"

RAW_COUNT="$(ls -1 "$TMP/raw"/frame-*.png | wc -l | tr -d ' ')"
echo "→ extracted ${RAW_COUNT} frames"

# Subsample desktop (every DESKTOP_STRIDE-th frame), then rembg only those + mobile picks.
python3 - "$TMP/raw" "$TMP/cut" "$DESKTOP_STRIDE" "$MOBILE_TOTAL" <<'PY'
import sys
from pathlib import Path
import shutil

raw_dir = Path(sys.argv[1])
cut_dir = Path(sys.argv[2])
stride = int(sys.argv[3])
mobile_total = int(sys.argv[4])

frames = sorted(raw_dir.glob("frame-*.png"))
total = len(frames)
if total == 0:
    raise SystemExit("no frames extracted")

desk_idxs = list(range(0, total, stride))
# Always include last frame
if desk_idxs[-1] != total - 1:
    desk_idxs.append(total - 1)

mob_idxs = sorted({
    round(i * (total - 1) / (mobile_total - 1))
    for i in range(mobile_total)
})

needed = sorted(set(desk_idxs) | set(mob_idxs))
for i in needed:
    shutil.copy2(frames[i], cut_dir / frames[i].name)

# Write index lists for the encoder stage
(cut_dir / "_desktop_idxs.txt").write_text("\n".join(map(str, desk_idxs)) + "\n")
(cut_dir / "_mobile_idxs.txt").write_text("\n".join(map(str, mob_idxs)) + "\n")
print(f"→ subsampled {len(needed)} unique frames (desktop={len(desk_idxs)} mobile={len(mob_idxs)})")
PY

WORK_DIR="$TMP/cut"
if [[ "$BG_REMOVE" -eq 1 ]]; then
  echo "→ rembg background removal…"
  mkdir -p "$TMP/alpha"
  python3 - "$TMP/cut" "$TMP/alpha" <<'PY'
import sys
from pathlib import Path
from rembg import remove
from PIL import Image

src_dir = Path(sys.argv[1])
dst_dir = Path(sys.argv[2])
files = sorted(src_dir.glob("frame-*.png"))
total = len(files)
for i, src in enumerate(files):
    img = Image.open(src).convert("RGB")
    out = remove(img)
    out.save(dst_dir / src.name, "PNG")
    if (i + 1) % 8 == 0 or i == 0 or i == total - 1:
        print(f"  rembg {i + 1:03d}/{total}")
print("→ rembg done")
PY
  WORK_DIR="$TMP/alpha"
fi

echo "→ encoding WebP…"
python3 - "$TMP/raw" "$WORK_DIR" "$TMP/cut" "$OUT_DESKTOP" "$OUT_MOBILE" "$MOBILE_W" "$MOBILE_H" "$WEBP_Q" "$BG_REMOVE" <<'PY'
import sys
from pathlib import Path
from PIL import Image

raw_dir = Path(sys.argv[1])
work_dir = Path(sys.argv[2])
cut_dir = Path(sys.argv[3])
out_desktop = Path(sys.argv[4])
out_mobile = Path(sys.argv[5])
mobile_w = int(sys.argv[6])
mobile_h = int(sys.argv[7])
webp_q = int(sys.argv[8])
bg_remove = sys.argv[9] == "1"

# Clear old frames so stale high-index files don't linger
for p in out_desktop.glob("frame-*.webp"):
    p.unlink()
for p in out_mobile.glob("frame-*.webp"):
    p.unlink()

raw_frames = sorted(raw_dir.glob("frame-*.png"))
desk_idxs = [int(x) for x in (cut_dir / "_desktop_idxs.txt").read_text().split() if x.strip()]
mob_idxs = [int(x) for x in (cut_dir / "_mobile_idxs.txt").read_text().split() if x.strip()]

def load_work(raw_idx: int) -> Image.Image:
    name = raw_frames[raw_idx].name
    path = work_dir / name
    if not path.exists():
        path = raw_dir / name
    mode = "RGBA" if bg_remove else "RGB"
    return Image.open(path).convert(mode)

desk_total = len(desk_idxs)
for i, raw_idx in enumerate(desk_idxs):
    img = load_work(raw_idx)
    dest = out_desktop / f"frame-{i + 1:03d}.webp"
    img.save(dest, "WEBP", quality=webp_q, method=4)
    if (i + 1) % 24 == 0 or i == 0 or i == desk_total - 1:
        print(f"  desktop {i + 1:03d}/{desk_total} ({img.size[0]}×{img.size[1]})")

mob_total = len(mob_idxs)
for m, raw_idx in enumerate(mob_idxs):
    img = load_work(raw_idx)
    img = img.resize((mobile_w, mobile_h), Image.Resampling.LANCZOS)
    dest = out_mobile / f"frame-{m + 1:03d}.webp"
    img.save(dest, "WEBP", quality=webp_q, method=4)
    if (m + 1) % 8 == 0 or m == 0 or m == mob_total - 1:
        print(f"  mobile  {m + 1:03d}/{mob_total}")

print(f"done: desktop={desk_total} mobile={mob_total}")
# Emit counts for the shell summary
(cut_dir / "_counts.txt").write_text(f"{desk_total} {mob_total}\n")
PY

rm -rf "$TMP/raw" "$TMP/alpha"
# keep cut idxs briefly for counts then wipe tmp
read -r DESK_COUNT MOB_COUNT < "$TMP/cut/_counts.txt" || true
rm -rf "$TMP"

desk_count=$(ls -1 "$OUT_DESKTOP"/frame-*.webp | wc -l | tr -d ' ')
mob_count=$(ls -1 "$OUT_MOBILE"/frame-*.webp | wc -l | tr -d ' ')
echo "✓ desktop: $desk_count × ${SRC_W}×${SRC_H} (stride=${DESKTOP_STRIDE}) → $OUT_DESKTOP"
echo "✓ mobile:  $mob_count × ${MOBILE_W}×${MOBILE_H} → $OUT_MOBILE"
echo "→ update HeroIntroSection FRAMES_DESKTOP.total=${desk_count} FRAMES_MOBILE.total=${mob_count}"
