# BE TODO — Master List

**Date**: 2026-05-22
**Audience**: BE squad — đây là source of truth duy nhất cho mọi gap còn lại
**Replaces**:
- ~~`be-missing-apis-phase1.md`~~ (wave 1 đã đóng ✅)
- ~~`be-missing-apis-phase1-wave2.md`~~
- ~~`be-missing-apis-portal.md`~~
- ~~`be-portal-status-2026-05-22.md`~~
- ~~`be-portal-templates-fix.md`~~
- ~~`be-saved-blocks-spec.md` §10~~

Các file gốc giữ trong repo để tham khảo context, nhưng **chỉ làm theo file này**.

---

## 🔴 P0 — Chặn portal hoạt động data thật

### P0.1 — Backfill `canvas_templates.workspace_id` + `client_id`

**Pain**: 15 seed templates có `workspace_id = ''` và `client_id` rỗng/admin → brand user `lantm@tekup.vn` query `/portal/templates` → trả 0 items → page hiển thị empty.

**Migration SQL**:

```sql
-- Step 1: đảm bảo mọi client có 1 workspace 'default'
INSERT INTO workspaces (id, client_id, name, slug, is_default, created_at, updated_at)
SELECT gen_random_uuid(), c.id, 'Default', 'default', TRUE, now(), now()
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM workspaces w WHERE w.client_id = c.id AND w.is_default = TRUE
);

-- Step 2: backfill canvas_templates rỗng workspace_id
UPDATE canvas_templates ct
SET workspace_id = w.id
FROM workspaces w
WHERE w.client_id = ct.client_id
  AND w.is_default = TRUE
  AND (ct.workspace_id IS NULL OR ct.workspace_id = '');

-- Step 3: confirm semantic của filter
-- BE confirm: query GET /portal/templates không có ?workspace_id= → trả templates của TẤT CẢ workspaces thuộc client (cross-workspace)
-- với ?workspace_id=<id> → filter chính xác workspace đó
```

**Test verify**: brand login → `GET /portal/templates` trả ≥ 1 row, mọi item có `workspace_id != ''`.

**Effort**: ~1h. **FE**: ✅ wired sẵn, không cần thay đổi.

---

### P0.2 — `POST /v1/portal/templates`

**Pain**: Brand portal chưa có nút "Tạo landing page" hoạt động vì BE không có endpoint brand-scoped tạo canvas template.

**Endpoint mới**:

```
POST /v1/portal/templates
```

- **Auth**: CookieAuth, role `client_user` (brand_owner / brand_member)
- **Body**:
  ```ts
  {
    name: string;                    // required, ≤ 200
    width?: number;                  // default 800
    height?: number;                 // default 600
    workspace_id?: string;           // default = ctx.active_workspace_id
    source_template_id?: string;     // optional, clone existing
  }
  ```
- **Auto-scope**: BE inject `client_id` từ session, validate `workspace_id` thuộc client (ngược lại 403)
- **Response 201**: `PortalTemplate` (cùng shape GET list)

**Effort**: ~2-3h. **FE**: cần wire nút "Tạo landing page" (~1h sau khi BE ship).

---

### P0.3 — `/portal/me/*` family (profile + members)

**Pain**: `/portal/profile` page 100% fake. Brand không edit được profile, không quản lý members.

**Endpoints cần thêm**:

```
GET    /v1/portal/me/client                 # brand profile (name, logo, contact_*)
PATCH  /v1/portal/me/client                 # update brand info (chỉ brand_owner)
GET    /v1/portal/me/members?role=          # list members trong brand
POST   /v1/portal/me/members                # invite via email
PATCH  /v1/portal/me/members/{userId}/role  # đổi role
DELETE /v1/portal/me/members/{userId}       # remove khỏi brand
PATCH  /v1/portal/me                        # update display_name / avatar
POST   /v1/portal/me/avatar                 # upload binary
```

**Shapes**:

```ts
type PortalClient = {
  id: string; name: string; legal_name?: string;
  contact_email?: string; contact_phone?: string;
  country_code?: string; plan?: string; status: string;
  member_count?: number; storage_used_gb?: number; storage_quota_gb?: number;
  logo_url?: string;
};

type PortalMember = {
  user_id: string; email: string; display_name: string;
  avatar_url?: string;
  role: 'brand_owner' | 'brand_member' | 'staff';
  joined_at: string; last_seen_at?: string;
};
```

**Status hiện tại**:
- `GET /portal/me/client` → 403 (endpoint exists, brand chưa test)
- `GET /portal/me/members` → 404
- Còn lại → 404 / chưa có

**Effort**: ~1 ngày (MVP read-only profile + member list; invite/role/remove là Phase 3).

---

### P0.4 — Brand-side workspace create (đã wire FE, BE check)

**Pain**: `POST /v1/portal/workspaces` đã sẵn nhưng admin gọi → 403 ("portal endpoint requires a client scope"). FE đã wire dialog (`_CreateWorkspaceDialog.tsx`), chỉ chờ BE test với brand_user.

**Cần BE test**:

```bash
curl --cookie "<brand cookie>" -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test WS","slug":"test-ws-$(date +%s)"}' \
  https://rexerai.tekupsoftware.com/v1/portal/workspaces
```

Expected:
- 201 Created + Workspace shape
- Auto-membership `brand_owner` cho creator
- 400 nếu slug đã tồn tại trong cùng client

**Effort**: ~30 phút test + fix nếu fail.

---

### P0.5 — `/auth/register` trả role sai

**Pain**: Self-registered user (qua `/auth/register`) được set `role = 'staff'` thay vì `client_user`. Brand owner đăng ký mới → smart-redirect đẩy sang `/admin` (sai).

**Reproduce**:
```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"email":"x@y.com","password":"...","full_name":"X","company_name":"Y"}' \
  https://rexerai.tekupsoftware.com/v1/auth/register
# → res.user.role === 'staff'  ← phải là 'client_user'
```

**Fix**: handler `/auth/register` set `role = 'client_user'` cho self-signup, không phải `staff`.

**Effort**: ~30 phút.

---

## 🟡 P1 — Polish portal data thật

### P1.1 — Admin user creation với role

**Pain**: Modal `/admin/users` chọn role `admin | staff | client_user` — hiện chỉ tạo được `client_user` (qua `/auth/register` hoặc `/clients/{id}/users`). Admin/staff fallback dùng `/auth/register` → ra `client_user` + toast warning.

**Endpoint mới**:
```
POST /v1/admin/users
PATCH /v1/admin/users/{userId}/role   # bonus: promote/demote
```

- **Auth**: role `admin` (không cho staff promote)
- **Body**: `{ email, display_name, role: 'admin'|'staff', password? }`
- **Response 201**: `{ user, generated_password? }`
- **Audit log** + rate limit 10/giờ/admin + không cho admin tự downgrade

**Effort**: ~3h.

---

### P1.2 — Brand cross-template comments feed shape

**Pain**: `GET /portal/comments?status=open` trả `items: null` thay vì `[]` khi rỗng. Items có thiếu metadata cho UI digest (template_name, last_activity_at).

**Cần BE confirm**:
- Trả `items: []` thay vì `null` khi rỗng (convention chuẩn)
- Populate trong mỗi item:
  ```ts
  template_name: string;
  template_thumbnail_url?: string;
  reply_count: number;
  last_activity_at: string;
  ```

**Effort**: ~2h join + format.

---

### P1.3 — `/portal/ads/campaigns` confirm shape

**Pain**: List trả `{items: []}` khi rỗng — FE đã wire fallback FAKE_CAMPAIGNS. Khi BE có data thật, cần confirm các field aggregate có embed sẵn không:

```ts
type PortalAdCampaign = {
  // ... metadata fields ...
  // ⚠️ AGGREGATE: embed trong list hay phải gọi /metrics riêng?
  impressions?: number;
  clicks?: number;
  spent_amount?: number;
  conversions?: number;
};
```

**FE hiện assume embed**, fallback 0. BE confirm semantic.

**Effort**: ~30 phút doc.

---

### P1.4 — Element-level analytics naming

**Pain**: Stats overlay right-gutter cần `element_id` matching giữa DOM (FE) và analytics events (BE). FE auto-tag `[data-element-id]` = `<block-prefix>__<element-key>`.

**Cần BE**:
- Schema event accept `element_id` + `element_role` (đã có trong `AnalyticsEventInput`)
- `BlockBreakdownRow.actions[].targets[].target` trả về cùng convention `element_id`
- Reject `event_type` không trong whitelist:
  ```
  page_view | block_view | block_dwell | element_view | click | form_submit
  | scroll_depth | slide_change | slide_dwell
  ```

**Effort**: ~3h.

---

### P1.5 — Saved blocks server-backed

**Pain**: `/admin/blocks` đang localStorage Phase 1. Mất khi đổi browser/device, không share team.

**Endpoints**:
```
GET    /v1/saved-blocks?scope=&tag=&q=&page=&limit=
POST   /v1/saved-blocks
GET    /v1/saved-blocks/{id}
PATCH  /v1/saved-blocks/{id}        # rename, tags, block_json overwrite
DELETE /v1/saved-blocks/{id}
POST   /v1/saved-blocks/{id}/clone
POST   /v1/saved-blocks/{id}/use    # increment usage_count
```

**Schema**:
```sql
CREATE TABLE saved_blocks (
  id            uuid PK,
  client_id     uuid NOT NULL,
  workspace_id  uuid,
  created_by    uuid NOT NULL,
  name          text NOT NULL,
  block_json    jsonb NOT NULL,
  tags          text[] DEFAULT '{}',
  scope         text DEFAULT 'private',  -- private | team | public
  source_template_id uuid,
  thumbnail_url text,
  usage_count   int DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE INDEX idx_saved_blocks_client ON saved_blocks(client_id, scope);
CREATE INDEX idx_saved_blocks_tags ON saved_blocks USING GIN(tags);
```

**Effort**: ~2-3 ngày BE (table + 7 handlers + tests).
**FE migration**: ~1 ngày sau khi BE ship (swap layer trong `savedBlocks.ts`).

---

### P1.6 — Curate doc + example payload

**Pain**: BE có `/portal/curate/events` + `/portal/curate/interaction-types` nhưng FE chưa wire vì chưa biết response shape thực tế.

**Cần BE**: doc + example JSON response cho 1 event item.

**Effort**: ~1h.

---

## 🟢 P2 — Minor / housekeeping

### P2.1 — Regenerate Swagger doc

Swagger `https://rexerai.tekupsoftware.com/swagger/doc.json` **chưa update** sau khi BE ship `/portal/*` phase 2. 13 endpoints mới (`/portal/dashboard/summary`, `/portal/templates`, `/portal/ads/*`, `/portal/me/*`, ...) chưa xuất hiện trong swagger.

```bash
# BE chạy:
swag init -g cmd/server/main.go --output internal/api/docs
# rồi rebuild + redeploy
```

---

### P2.2 — `/portal/activity` filter + mark-seen

- `GET /portal/activity?kind=<kind>` filter theo loại — chưa confirm
- `POST /portal/activity/mark-seen` → endpoint live, FE chưa wire (nice-to-have)

---

### P2.3 — Empty array convention

Các endpoint hiện đôi khi trả `items: null` khi rỗng:
- `/portal/comments` → `items: null`
- (có thể) `/portal/activity`, `/portal/templates` khi rỗng — confirm

Đề nghị: chuẩn hoá tất cả về `items: []`.

---

### P2.4 — Avatar storage

Confirm: avatar upload (`POST /portal/me/avatar`) dùng chung `media_assets` table hay column `avatar_url` riêng trên `users`?

---

## ✅ Done (closed — không cần làm gì)

| Mục | Doc gốc |
|---|---|
| Wave 1: workspaces, media folders, comments, notifications, activity, staff inbox | `be-missing-apis-phase1.md` |
| `/portal/dashboard/summary`, `/portal/templates`, `/portal/templates/{id}/breakdown` | `be-missing-apis-portal.md` P0 |
| `/portal/ads/campaigns`, `/portal/ads/channels` | wave 2 |
| `/portal/comments` cross-template feed (live) | wave 2 |
| `POST /portal/workspaces` (brand-scoped) | wave 2 |
| `POST /analytics/events` ingest + aggregation | analytics-tracking spec |

---

## Effort summary

| Priority | Items | BE work |
|---|---|---|
| **P0** (5) | Templates backfill · POST templates · me/* · workspace create test · auth/register role fix | ~2 ngày |
| **P1** (6) | Admin users · comments shape · ads aggregate · element_id naming · saved-blocks · curate doc | ~5 ngày |
| **P2** (4) | Swagger regen · activity filter · empty[] convention · avatar storage | ~2h |

**Total**: **~1 tuần BE** để portal + admin + saved-blocks chạy production-ready không fake data.

---

## Order of attack

1. **P0.1 (1h)** — SQL migration backfill → mở khoá `/portal/landing-pages`
2. **P0.5 (30m)** — fix `/auth/register` role → brand signup redirect đúng
3. **P0.4 (30m test)** — verify workspace create với brand_user
4. **P0.2 (3h)** — POST `/portal/templates` → brand tạo landing mới
5. **P0.3 (1d)** — `/portal/me/*` profile + members
6. **P1.x** parallel sau khi P0 đóng

---

## Liên hệ

- **FE owner**: @Lantm — toàn bộ FE wire sẵn theo spec này (xem section "FE files" mỗi item gốc)
- **BE**: ack từng P0 + assign priority — comment thẳng vào file này
- **PM**: align P1 priority — saved-blocks vs admin/users tuỳ roadmap

---

## Test command tổng hợp (BE QA chạy với brand cookie)

```bash
BASE="https://rexerai.tekupsoftware.com/v1"
CK="<brand_user cookie>"

# P0.1 verify
curl -s --cookie "$CK" "$BASE/portal/templates" | jq '.items[] | {id, workspace_id}'

# P0.2 verify
curl -s --cookie "$CK" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test landing"}' "$BASE/portal/templates"

# P0.3 verify
curl -s --cookie "$CK" "$BASE/portal/me/client"
curl -s --cookie "$CK" "$BASE/portal/me/members"

# P0.4 verify
curl -s --cookie "$CK" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test WS","slug":"test-ws"}' "$BASE/portal/workspaces"

# P0.5 verify (admin probe)
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"email":"new@x.com","password":"Strong1234!","full_name":"X","company_name":"Y"}' \
  "$BASE/auth/register" | jq '.user.role'
```

Expected: tất cả 200/201 + role/shape đúng spec ở mỗi item.
