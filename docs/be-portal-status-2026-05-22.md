# BE Portal Endpoint Status — 2026-05-22

**Audience**: BE squad
**Purpose**: Sau khi BE ack ship `be-missing-apis-portal.md`, FE đã probe từng endpoint và wire vào portal. File này liệt kê **cụ thể cái nào đã chạy, cái nào còn 404/403/sai shape**, để BE check + fill in các gap còn lại.

**Test environment**: `https://rexerai.tekupsoftware.com` (admin@rexer.ai session)
**Note**: Swagger doc (`/swagger/doc.json`) **chưa được regenerate** sau khi BE ship — endpoints mới live nhưng không xuất hiện trong swagger. Đề nghị BE chạy lại swagger generator sau khi merge.

---

## ✅ Endpoints đã ship + FE wired

### 1. `GET /v1/portal/dashboard/summary`

**Status**: 200 OK
**FE wired**: `src/app/(client-portal)/portal/page.tsx`

```bash
curl -s --cookie "rexer_session=..." \
  'https://rexerai.tekupsoftware.com/v1/portal/dashboard/summary'
```

**Response** (admin@rexer.ai):
```json
{
  "templates_count": 15,
  "templates_published": 2,
  "total_views_30d": 0,
  "total_visitors_30d": 0,
  "total_clicks_30d": 0,
  "total_leads_30d": 0,
  "assets_count": 15,
  "open_comments": 0,
  "unread_notifications": 0,
  "trend_7d": [0, 0, 0, 0, 0, 0, 0]
}
```

✅ **Shape match 100% với FE expect** (`PortalDashboardSummary` trong `types.ts`).

---

### 2. `GET /v1/portal/templates?limit=N`

**Status**: 200 OK
**FE wired**: `src/app/(client-portal)/portal/landing-pages/page.tsx` qua `_remote.tsx:loadTemplates`

```bash
curl -s --cookie "..." \
  'https://rexerai.tekupsoftware.com/v1/portal/templates?limit=5'
```

**Response shape**:
```json
{
  "items": [
    {
      "id": "e3e3e3e3-2000-0000-0000-000000000001",
      "workspace_id": "",
      "name": "Block-Editor Real Estate Landing",
      "thumbnail_url": "https://picsum.photos/seed/.../640/1200",
      "status": "published",
      "views_30d": 0,
      "clicks_30d": 0,
      "leads_30d": 0,
      "open_comments": 0,
      "last_publish_at": "2026-05-22T00:05:48.764+07:00",
      "last_updated_by": {
        "user_id": "2afcfd5e-...",
        "name": "ReXeR Admin",
        "role": "admin"
      }
    }
  ]
}
```

⚠️ **Note**:
- `workspace_id` đang là chuỗi rỗng `""` cho mọi item — BE auto-join workspace chưa hoạt động? Nếu brand chưa gán template vào workspace cụ thể, suggest trả `null` thay vì `""` để FE filter dễ hơn.
- Response không có `page` / `limit` / `total` envelope — FE expect `PortalTemplateListResponse` có optional pagination. Hiện đang work vì pagination optional, nhưng nên confirm.

---

### 3. `GET /v1/portal/templates/{templateId}/breakdown`

**Status**: 200 OK (brand-accessible mirror của admin endpoint)
**FE wired**: `src/components/modules/Analytics/StatsAnnotationOverlay.tsx` — role-based switch

```bash
curl -s --cookie "..." \
  'https://rexerai.tekupsoftware.com/v1/portal/templates/e3e3e3e3-.../breakdown'
```

**Response** (1 block test data):
```json
[
  {
    "block_id": "blk_hero",
    "block_type": "hero_split",
    "views": 1,
    "clicks": 0,
    "unique_viewers": 1,
    "avg_dwell_ms": 0,
    "total_dwell_ms": 0,
    "top_action": null,
    "top_target": null,
    "actions": [],
    "funnel": null,
    "slides": null,
    "images": null
  }
]
```

✅ **Shape khớp `BlockBreakdownRow[]`** — same as admin endpoint, brand chỉ thấy data của brand mình.

**Cần BE confirm**:
- 403 trả khi nào? (brand thử query template của brand khác → 403?)
- `start` / `end` query param đã hoạt động chưa?

---

### 4. `GET /v1/portal/comments?status=open|resolved`

**Status**: 200 OK
**FE wired**: `src/app/(client-portal)/portal/comments/page.tsx`

**Response** (admin, no data):
```json
{
  "items": null,
  "page": 1,
  "limit": 20,
  "total": 0
}
```

⚠️ **`items: null`** thay vì `items: []` — FE đã handle (`items ?? []`) nhưng convention chuẩn nên là `[]`. Suggest BE fix.

**Cần BE confirm** — fields trên mỗi comment item:
- `template_name` có được join sẵn không?
- `template_thumbnail_url`?
- `reply_count`?
- `last_activity_at`?

→ FE đang treat tất cả như optional + fallback gracefully. Nếu BE muốn FE hiển thị tốt hơn, populate các field này.

---

### 5. `POST /v1/portal/workspaces`

**Status**: 403 cho admin (vì admin không scope client), endpoint exists
**FE wired**: `src/app/(client-portal)/portal/_CreateWorkspaceDialog.tsx`

```bash
curl -s --cookie "<admin>" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test","slug":"test-probe"}' \
  'https://rexerai.tekupsoftware.com/v1/portal/workspaces'
```

**Response** (admin user):
```json
{
  "code": "ERR_FORBIDDEN",
  "message": "portal endpoint requires a client scope",
  "request_id": "..."
}
```

✅ **Đúng behaviour** — endpoint admin không gọi được, brand user phải dùng.

**Cần BE test với brand_user**:
- Brand_user POST `{name, slug, description?}` → 201 + Workspace?
- Auto-membership `brand_owner` cho creator?
- 400 khi slug đã exist trong cùng client?

---

### 6. `GET /v1/portal/ads/channels`

**Status**: 200 OK
**FE wired**: `src/app/(client-portal)/portal/ads/page.tsx`

**Response**:
```json
{
  "items": [
    { "id": "meta", "name": "Meta" },
    { "id": "google", "name": "Google" },
    { "id": "tiktok", "name": "TikTok" },
    { "id": "zalo", "name": "Zalo" },
    { "id": "linkedin", "name": "LinkedIn" },
    { "id": "other", "name": "Other" }
  ]
}
```

✅ **Channel enum confirmed**. FE map `meta → facebook`, `google → google`, `tiktok → tiktok` cho UI icon.

---

### 7. `GET /v1/portal/ads/campaigns`

**Status**: 200 OK (admin thấy empty), `POST` cần brand scope
**FE wired**: `src/app/(client-portal)/portal/ads/page.tsx`

```bash
curl -s --cookie "<admin>" 'https://rexerai.tekupsoftware.com/v1/portal/ads/campaigns'
# → {"items": [], "page": 1, "limit": 20, "total": 0}

curl -s --cookie "<admin>" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"probe","status":"draft","channels":["meta"]}' \
  'https://rexerai.tekupsoftware.com/v1/portal/ads/campaigns'
# → 403 ERR_FORBIDDEN "portal endpoint requires a client scope"
```

✅ List works. **Create endpoint exists** — cần brand_user để test full flow.

**Cần BE confirm shape khi có data**:

```ts
type PortalAdCampaign = {
  id: string;
  client_id: string;
  workspace_id?: string;
  name: string;
  objective?: 'awareness' | 'traffic' | 'conversion' | 'retention';
  status: 'draft' | 'active' | 'paused' | 'completed';
  channels: string[];                  // ['meta', 'google', ...]
  budget_amount?: number;
  budget_currency?: string;              // 'VND' default?
  start_date?: string;                   // ISO
  end_date?: string;
  landing_template_id?: string;
  utm_campaign?: string;
  notes?: string;
  // Aggregate metrics — BE có embed trong list response không, hay phải call /metrics riêng?
  impressions?: number;
  clicks?: number;
  spent_amount?: number;
  conversions?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
};
```

Confirm: shape FE assumption có match không? Đặc biệt **metrics fields có nằm trong list response hay không** (đang treat optional).

---

### 8. `POST /v1/portal/activity/mark-seen`

**Status**: 200 OK
**FE wired**: ❌ chưa wire (FE chỉ wire `listActivity`, mark-seen defer)

**Confirm**: BE đang trả gì? `{message?: string}` hay `{count: N}` (bao nhiêu items vừa mark)?

---

## 🔴 Endpoints còn 404 — chưa ship

### `GET /v1/portal/me/client`

```bash
curl -s --cookie "<admin>" 'https://rexerai.tekupsoftware.com/v1/portal/me/client'
# → 403 ERR_FORBIDDEN "portal endpoint requires a client scope"
```

Endpoint exists nhưng admin không scope client → 403. Brand_user chắc ra 200. **Cần test với brand user + confirm shape**.

```ts
// FE expect:
type PortalClient = {
  id: string;
  name: string;
  legal_name?: string;
  contact_email?: string;
  contact_phone?: string;
  country_code?: string;
  plan?: string;
  status: string;
  member_count?: number;
  storage_used_gb?: number;
  storage_quota_gb?: number;
  logo_url?: string;
};
```

### `GET /v1/portal/me/members` — 404

Chưa implement. **Cần thiết cho `/portal/profile`** để hiển thị danh sách members trong brand.

```ts
// FE expect:
type PortalMember = {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'brand_owner' | 'brand_member' | 'staff';
  joined_at: string;
  last_seen_at?: string;
};

type PortalMemberListResponse = {
  items: PortalMember[];
  total: number;
};
```

### `GET /v1/portal/me/profile` — 404

Chưa implement. Có thể reuse `/v1/auth/me` (đã có) — confirm BE có ý định tách `/portal/me/profile` không, hay merge?

### `PATCH /v1/portal/me` — chưa test
- Update `display_name`, `avatar_url`, ...

### `POST /v1/portal/me/avatar` — chưa test
- Upload file → return new `avatar_url`

### `PATCH /v1/portal/me/client` — chưa test
- Brand_owner update brand profile (name, logo, contact_email, ...)

### `POST /v1/portal/me/members` (invite) — chưa test
### `PATCH /v1/portal/me/members/{userId}/role` — chưa test
### `DELETE /v1/portal/me/members/{userId}` — chưa test

---

## 📋 Câu hỏi cần BE confirm (priority order)

| # | Question | Block FE? |
|---|---|---|
| 1 | `/portal/templates` response có `workspace_id = null` thay vì `""` khi chưa gán? | No (FE handle cả 2) |
| 2 | `/portal/comments` items có populate `template_name` + `last_activity_at` không? | UI thiếu metadata nhưng work |
| 3 | `/portal/comments` trả `items: []` thay vì `null` khi rỗng | No (FE coerce) |
| 4 | `/portal/ads/campaigns` list có embed `impressions/clicks/spent_amount/conversions` không? Hay phải `GET /portal/ads/campaigns/{id}/metrics`? | Yes — FE hiện assume embedded, fallback 0 |
| 5 | `/portal/activity/mark-seen` response shape? | No (FE chưa wire) |
| 6 | `/portal/me/*` endpoint khi nào ship? Phase 2.X? | Yes — profile page vẫn fake |
| 7 | `/portal/workspaces` POST + brand_user behavior (test full flow + slug uniqueness)? | No — dialog đã wire, đợi brand verify |
| 8 | Swagger doc regenerate khi nào? (`/swagger/doc.json` chưa có endpoints mới) | No — FE đã probe trực tiếp |
| 9 | `PortalTemplate.last_updated_by.role` enum: `admin | staff | brand_owner | brand_member`? FE đang coerce | No |
| 10 | Permission scoping confirmed: brand A query template của brand B → 403? | Yes — security check |

---

## 🧪 Test script cho BE QA

Login brand_user + chạy:

```bash
SESS="<brand cookie>"
BASE="https://rexerai.tekupsoftware.com/v1"

# 1. Dashboard
curl -s --cookie "$SESS" "$BASE/portal/dashboard/summary"

# 2. Templates list
curl -s --cookie "$SESS" "$BASE/portal/templates?limit=5"

# 3. Breakdown của 1 template thuộc brand
curl -s --cookie "$SESS" "$BASE/portal/templates/<id>/breakdown"

# 4. Breakdown của template KHÔNG thuộc brand → expect 403/404
curl -s --cookie "$SESS" "$BASE/portal/templates/<id_other_brand>/breakdown"

# 5. Comments open
curl -s --cookie "$SESS" "$BASE/portal/comments?status=open&limit=10"

# 6. Tạo workspace (brand path)
curl -s --cookie "$SESS" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test WS","slug":"test-ws-$(date +%s)"}' \
  "$BASE/portal/workspaces"

# 7. Ads channels
curl -s --cookie "$SESS" "$BASE/portal/ads/channels"

# 8. Ads campaigns CRUD
curl -s --cookie "$SESS" "$BASE/portal/ads/campaigns"
curl -s --cookie "$SESS" -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test Camp","status":"draft","channels":["meta"]}' \
  "$BASE/portal/ads/campaigns"

# 9. me/* family (currently 404 / 403)
curl -s --cookie "$SESS" "$BASE/portal/me/client"
curl -s --cookie "$SESS" "$BASE/portal/me/members"
```

Expected pass: 1, 2, 3, 5, 6, 7, 8.
Expected fail (gated): 4 (cross-brand), 9 (me/* not shipped).

---

## Liên hệ

- **FE**: @Lantm — commit `38bed73` đã wire 7/8 endpoints, e2e 12/12 pass
- **BE**: confirm 10 câu trên + schedule `/portal/me/*` cho phase 2.X
- **PM**: priority `/portal/me/*` (profile + members) — đang là phần fake to nhất còn lại
