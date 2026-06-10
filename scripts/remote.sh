#!/usr/bin/env bash
# remote.sh — bật phiên Claude Code điều khiển từ điện thoại, máy KHÔNG ngủ.
# Dùng: ./scripts/remote.sh   (Ctrl-C để dừng; tự tắt caffeinate khi thoát)
#
# Sau khi chạy: terminal hiện QR code → mở app Claude trên đt quét QR
# (hoặc vào claude.ai/code chọn session "rexerai"). Trong phiên gõ /config
# để bật "Push when Claude decides".
set -euo pipefail

NAME="rexerai"
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Cảnh báo nếu chưa đăng nhập claude.ai (remote-control cần login claude.ai,
# không dùng API key được).
if ! command -v claude >/dev/null 2>&1; then
  echo "❌ Chưa có 'claude' CLI trên PATH." >&2
  exit 1
fi

echo "📡  Bật remote-control '$NAME' — máy sẽ KHÔNG ngủ tới khi bạn Ctrl-C."
echo "    Đt: mở app Claude → quét QR bên dưới (hoặc claude.ai/code → '$NAME')."
echo "    Trong phiên gõ /config → bật 'Push when Claude decides'."
echo

# caffeinate giữ máy thức (-d display, -i idle, -m disk, -s khi cắm sạc).
# Chạy claude làm tiến trình con của caffeinate: caffeinate sống đúng bằng
# tuổi đời phiên claude, Ctrl-C tắt cả hai, không để caffeinate mồ côi.
exec caffeinate -dims claude remote-control --name "$NAME"
