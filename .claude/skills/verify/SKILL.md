---
name: verify
description: Recipe verify runtime block/animation của rexerai — dev server + /dev/blocks + Playwright headless. Dùng khi cần quan sát block chạy thật (animation, motion, layout) thay vì chỉ tsc/lint.
---

# Verify runtime rexerai

## Handle

- Dev server: `npm run dev` (next dev --turbopack, port 3000). Thường ĐÃ chạy sẵn — check `lsof -iTCP:3000 -sTCP:LISTEN` trước khi tự khởi động.
- Surface block đơn lẻ (production-like, có LandingMotionRoot + scroller element như /p): `http://localhost:3000/dev/blocks?type=<blockType>` (default content qua `createBlock`) hoặc `?id=<uuid>` (block thật từ BE).
- Surface effect library (Motion Attribute System): `http://localhost:3000/dev/motion` — mỗi section demo 1 effect với id `fx-<effect>`, đo trực tiếp bằng getComputedStyle, không cần block.
- Playwright có sẵn trong `node_modules`. Script ngoài repo phải import bằng đường dẫn tuyệt đối: `import { chromium } from '<repo>/node_modules/playwright/index.mjs'`.
- Trang cần auth (editor thật, /portal, /canvas-templates): sign JWT HS256 từ `JWT_SECRET` trong `.env`, set cookie `_access_token` domain localhost — xem mẫu `scripts/visual-tests/capture.mjs`.

## Drive

- Scroller của /dev/blocks là 1 div (không phải window): tìm ancestor của block có `scrollHeight > clientHeight` rồi set `scrollTop` từng bước nhỏ (ScrollTrigger nghe scroll event); chờ ≥1s sau scroll cho scrub smoothing.
- Đo animation qua `getComputedStyle`: scaleY = tham số thứ 4 của `matrix(...)`; SplitText đã split khi heading có nhiều element con.
- Probe guard edit-canvas không cần editor thật: gắn `data-testid="active-block-preview"` lên scroller div rồi remount block bằng dropdown đổi type qua lại — motion phải skip (không split, không transform).
- Probe reduced-motion: `page.emulateMedia({ reducedMotion: 'reduce' })` + reload.

## Gotchas

- ScrollTrigger refresh theo nhịp 0/250/800ms sau mount — chờ ~1.5s trước khi đo trạng thái đầu.
- Trên /dev/blocks, scrub có `end` neo vào element cuối section có thể không đạt progress 1 (trang kết thúc ngay sau section) — không phải bug; trên /p có block phía dưới sẽ đạt.
