#!/usr/bin/env bash
# Đẩy toàn bộ .env (sản xuất) lên Vercel cho 3 env: production, preview, development.
# Yêu cầu: đã `vercel login` và `vercel link` trong project trước.
#
# Sử dụng:
#   ./scripts/vercel-env-import.sh [path-to-.env]
#
# Mặc định đọc từ ./.env. Bỏ qua dòng trống và comment.
# Mỗi biến sẽ được upload với scope `production preview development`.

set -euo pipefail

ENV_FILE="${1:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERR: $ENV_FILE không tồn tại" >&2
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "ERR: cần cài Vercel CLI (npm i -g vercel)" >&2
  exit 1
fi

echo "Đọc env từ $ENV_FILE"

while IFS= read -r line || [[ -n "$line" ]]; do
  # Bỏ qua trống/comment
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  # Trim whitespace
  key="${key// /}"
  # Strip quoting bao quanh value
  if [[ "$value" =~ ^\".*\"$ ]] || [[ "$value" =~ ^\'.*\'$ ]]; then
    value="${value:1:${#value}-2}"
  fi

  if [[ -z "$key" || -z "$value" ]]; then
    echo "  SKIP: $key (empty value)"
    continue
  fi

  echo "  → $key"
  # Đẩy cùng giá trị vào cả 3 env
  for target in production preview development; do
    printf '%s' "$value" | vercel env add "$key" "$target" --force >/dev/null 2>&1 || true
  done
done < "$ENV_FILE"

echo "Done. Kiểm tra: vercel env ls"
