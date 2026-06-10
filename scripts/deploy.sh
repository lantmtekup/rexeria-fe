#!/usr/bin/env bash
# deploy.sh — deploy Vercel kiểu PREBUILT: build ở máy local (miễn phí),
# Vercel chỉ host → Build CPU Minutes = $0 (tránh hoá đơn build on-demand).
#
# Dùng:  ./scripts/deploy.sh          # build local + deploy prod
#        ./scripts/deploy.sh --keep-dev-off   # không tự bật lại next dev
#
# Quy trình: tắt `next dev` (build chung .next sẽ hỏng cache) → kéo env prod
# → `vercel build` local → `vercel deploy --prebuilt` → bật lại dev.
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ Chưa có 'vercel' CLI." >&2
  exit 1
fi

# 1) Tắt dev server nếu đang chạy (next build + next dev dùng chung .next).
DEV_WAS_RUNNING=0
if pgrep -f "next dev" >/dev/null 2>&1; then
  DEV_WAS_RUNNING=1
  echo "⏸  Tắt next dev (tránh hỏng .next khi build)…"
  pkill -f "next dev" || true
  sleep 2
fi

# 2) Kéo env Production về cho build local (ghi vào .vercel/.env.production.local,
#    KHÔNG đụng .env/.env.local của bạn).
echo "⬇️  vercel pull (production env)…"
vercel pull --yes --environment=production

# 3) Build local — phần này chạy trên máy bạn, Vercel không tính phí.
echo "🔨 vercel build --prod (local)…"
vercel build --prod

# 4) Upload kết quả đã build — 0 build minute trên Vercel.
echo "🚀 vercel deploy --prebuilt --prod…"
vercel deploy --prebuilt --prod --yes

# 5) Bật lại dev nếu trước đó đang chạy.
if [ "$DEV_WAS_RUNNING" = "1" ] && [ "${1:-}" != "--keep-dev-off" ]; then
  echo "▶️  Bật lại next dev…"
  nohup npm run dev > /tmp/rexerai-dev.log 2>&1 &
  echo "   (log: /tmp/rexerai-dev.log)"
fi

echo "✅ Deploy xong — build chạy local, không tốn Build CPU Minutes."
