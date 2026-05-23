# BE Hand-off — 2026-05-23

> Tài liệu 1-page gửi BE qua chat. Chi tiết đầy đủ: `docs/be-todo.md`.

## TL;DR

FE đã wire xong toàn bộ portal Phase 1 (managed-service: admin tạo + assign, brand clone-from-library, sửa nội dung). **Chỉ chờ BE merge 7 endpoint P0** để portal chạy data thật, không còn fake.

**~3 ngày BE work là portal live.**

---

## 🔴 P0 — chặn portal hoạt động (7 items, ~3 ngày)

| # | Endpoint / Việc | Effort | FE status |
|---|---|---|---|
| **P0.1** | SQL migration backfill `canvas_templates.workspace_id` + `client_id` cho 15 seed templates rỗng | 1h | ✅ wire sẵn |
| **P0.2** | `POST /v1/portal/templates` — brand tạo landing trắng (auto-scope client_id từ session) | 2-3h | ✅ wire sẵn |
| **P0.3** | `/portal/me/*` family — `GET/PATCH client`, `GET/POST/PATCH/DELETE members`, `PATCH me`, `POST avatar` | 1 ngày | ✅ page sẵn |
| **P0.4** | Test `POST /v1/portal/workspaces` với brand_user cookie (endpoint sẵn, admin gọi 403) | 30m | ✅ wire sẵn |
| **P0.5** | Fix `/auth/register` — return `role: 'client_user'` thay vì `'staff'` (brand self-signup hiện redirect sai về `/admin`) | 30m | ✅ smart-redirect sẵn |
| **P0.6** | `POST /v1/canvas-templates/{id}/assign` — admin/staff assign canvas template sang brand (`client_id` + `workspace_id` + `notes`) | 2-3h | ✅ modal sẵn ở `/admin/canvas-templates` |
| **P0.7** | `GET /v1/portal/templates/library` + `POST /v1/canvas-templates/{id}/clone-to-workspace` — brand chọn template, clone vào workspace | 3-4h | ✅ page sẵn ở `/portal/templates` |

**Order of attack được khuyến nghị**: P0.1 → P0.5 → P0.4 → P0.6 → P0.7 → P0.2 → P0.3 (xếp theo unblock dependency).

---

## 🟡 P1 — polish portal (6 items, ~5 ngày)

| # | Việc | Effort |
|---|---|---|
| P1.1 | `POST /admin/users` + `PATCH role` để admin tạo admin/staff (đang fallback `/auth/register` ra `client_user`) | 3h |
| P1.2 | `/portal/comments?status=open` — trả `items: []` thay vì `null`, populate `template_name`/`reply_count`/`last_activity_at` | 2h |
| P1.3 | `/portal/ads/campaigns` — confirm aggregate fields (`impressions`, `clicks`, `conversions`) embed sẵn trong list, hay phải gọi `/metrics` riêng | 30m doc |
| P1.4 | `/portal/templates/{id}/breakdown` — accept `element_id` matching convention `<block-prefix>__<element-key>` để stats overlay map đúng button | 3h |
| **P1.5** | **Saved blocks server-backed** (7 endpoints + table `saved_blocks`) — FE đang localStorage Phase 1, mất khi đổi browser | 2-3 ngày |
| P1.6 | Curate doc — `/portal/curate/events` + `/portal/curate/interaction-types` example payload | 1h |

---

## 🟢 P2 — housekeeping (4 items, ~2h)

- **P2.1** Regenerate Swagger doc (`swag init -g cmd/server/main.go --output internal/api/docs`) — 13 endpoints phase 2 chưa có trong swagger
- **P2.2** `/portal/activity?kind=` filter + `POST /portal/activity/mark-seen` wire-up
- **P2.3** Empty array convention — `items: []` cho mọi list endpoint khi rỗng (đang có endpoint trả `null`)
- **P2.4** Avatar storage — dùng chung `media_assets` hay column `avatar_url` riêng trên `users`?

---

## 📦 FE shipped tuần này (info-only, không có BE ask mới)

- Block detail page `/portal/blocks/[id]` (editorial layout) + edit wrapper `/portal/blocks/[id]/edit` (URL giữ trong `/portal/*`)
- Kebab 3-dot menu trên mỗi block card (Mở chi tiết / Duplicate / Xoá)
- Catalog dialog 14 block types với **thumbnail thật** + filter category (Hero/Nội dung/Media/Tương tác/Nâng cao)
- Admin sidebar refactor — escape khỏi CmsLayout
- Admin assign-to-brand + brand clone-from-library workflows (đang đợi P0.6 + P0.7)

Tất cả dùng localStorage cho saved-blocks — khi BE ship P1.5, FE swap layer trong `savedBlocks.ts` (~1 ngày FE).

---

## 🧪 Test command (BE QA chạy với brand cookie)

```bash
BASE="https://rexerai.tekupsoftware.com/v1"
CK="<brand_user cookie>"

# P0.1 verify backfill
curl -s --cookie "$CK" "$BASE/portal/templates" | jq '.items[] | {id, workspace_id}'
# Expected: ≥ 1 row, workspace_id != ''

# P0.2 verify brand create
curl -s --cookie "$CK" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test landing"}' "$BASE/portal/templates"
# Expected: 201 + PortalTemplate shape

# P0.3 verify me/*
curl -s --cookie "$CK" "$BASE/portal/me/client"
curl -s --cookie "$CK" "$BASE/portal/me/members"
# Expected: 200 + PortalClient / PortalMember[] shape

# P0.4 verify workspace create
curl -s --cookie "$CK" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test WS","slug":"test-ws-$(date +%s)"}' "$BASE/portal/workspaces"
# Expected: 201 + Workspace + auto-membership brand_owner

# P0.5 verify register role
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"email":"new@x.com","password":"Strong1234!","full_name":"X","company_name":"Y"}' \
  "$BASE/auth/register" | jq '.user.role'
# Expected: "client_user" (KHÔNG phải "staff")

# P0.6 verify admin assign
ADMIN_CK="<admin cookie>"
curl -s --cookie "$ADMIN_CK" -X POST -H 'Content-Type: application/json' \
  -d '{"client_id":"<brand_uuid>","notes":"assigned from admin"}' \
  "$BASE/canvas-templates/<template_id>/assign"
# Expected: 200 + CanvasTemplate với client_id + workspace_id mới

# P0.7 verify clone-to-workspace
curl -s --cookie "$CK" -X POST -H 'Content-Type: application/json' \
  -d '{}' "$BASE/canvas-templates/<library_template_id>/clone-to-workspace"
# Expected: 201 + CanvasTemplate mới với client_id = brand, is_template = false
```

---

## 📞 Contact

- **FE owner**: @Lantm (`lantm.tekup@gmail.com`) — FE wire đầy đủ theo file `docs/be-todo.md` master
- **Repo**: `gitlab.com/lantm.tekup/rexerai` branch `develop`
- **BE assign**: comment thẳng vào từng P0 item trong `be-todo.md` để track owner + ETA

**Khi P0.1 + P0.5 + P0.4 đóng → brand login chạy đúng + thấy data thật.**
**Khi P0.6 + P0.7 đóng → admin có thể hand-off + brand có thể clone-from-library. Phase 1 done.**
