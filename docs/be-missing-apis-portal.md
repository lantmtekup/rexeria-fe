# BE Missing APIs — `/portal/*` (brand-side)

**Date**: 2026-05-22
**Audience**: BE squad
**Status**: 🔴 Cần để toàn bộ portal brand-facing không còn dùng fake data
**Related**:
- `docs/be-missing-apis-phase1.md` (wave 1 — đã ship ✅)
- `docs/be-missing-apis-phase1-wave2.md` (wave 2 — đang chờ BE)
- `docs/be-client-portal-spec.md` (legacy `/client-portal/*`)

Sau khi audit từng route trong `src/app/(client-portal)/portal/*`, đây là **danh sách endpoint thiếu** mà BE cần bổ sung để brand-portal hoạt động end-to-end với data thật. Đã cross-reference với swagger `https://rexerai.tekupsoftware.com/swagger/doc.json`.

> Format: mỗi mục có **Pain**, **Endpoint(s) đề xuất**, **Auth**, **Effort BE**, **FE files đang chạm**.

---

## 🔴 P0 — Analytics event tracking (nguồn data cho TẤT CẢ stats)

**Pain cốt lõi**: Mọi số views / clicks / CTR / dwell / sparkline trên dashboard + stats-overlay đều **lấy từ aggregation của events do public render fire ra**. Hiện tại:

- **BE endpoint đã có**: `POST /v1/analytics/events` (public ingest, không cần auth, rate-limit 100/min/visitor) ✅
- **BE aggregation**: cũng đã có — `/admin/analytics/templates/{id}/breakdown` đọc từ events đã ingest ✅
- **FE chưa wire**: trang `/p/[id]/[token]` (public landing) **chưa gọi** `rexerApi.templateAnalytics.ingestEvent()` ở bất kỳ chỗ nào → BE không nhận event nào → breakdown trả `[]` → overlay phải dùng mock data 🔴

→ Đây là lý do `npx playwright test` thấy "0 blocks" và FE phải sinh demo data từ DOM.

### Schema event (đã có trong types.ts:751)

```ts
type AnalyticsEventInput = {
  template_id: string;
  block_id?: string;
  element_id?: string;       // CTA / button id (per wave 2 W2.3 alignment)
  element_role?: string;     // 'button' | 'link' | 'slide' | 'image' | 'form'
  visitor_id: string;        // FE-generated UUID, persisted in localStorage
  session_id: string;        // FE-generated UUID, expires after 30min idle
  event_type: string;        // see enum below
  action?: string;           // 'click' | 'submit' | 'swipe' | ...
  target?: string;           // optional — element_id alias for legacy
  dwell_ms?: number;
  scroll_depth?: number;     // 0-100
  viewport_w?: number;
  viewport_h?: number;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  meta?: Record<string, unknown>;
};
```

### Event types FE sẽ fire (đề xuất chuẩn — BE confirm enum)

| `event_type` | Fire khi | Required fields |
|---|---|---|
| `page_view` | Public page mount (1 lần / session / template) | `template_id`, `visitor_id`, `session_id`, `viewport_w/h`, `referrer`, `utm_*` |
| `block_view` | Block scroll vào viewport ≥ 50% (1 lần / session / block) | `+ block_id` |
| `block_dwell` | Khi block rời viewport — gửi total `dwell_ms` | `+ block_id`, `dwell_ms` |
| `element_view` | Element scroll vào viewport ≥ 50% | `+ block_id, element_id, element_role` |
| `click` | Click vào button/link tracked | `+ block_id, element_id, element_role, action='click'` |
| `form_submit` | Form submit thành công | `+ block_id, element_id` |
| `scroll_depth` | Đạt 25 / 50 / 75 / 100% | `+ scroll_depth` |
| `slide_change` | Carousel/Stories đổi slide | `+ block_id, meta={from, to}` |
| `slide_dwell` | Khi rời slide — `dwell_ms` cho slide đó | `+ block_id, meta={slide_index}, dwell_ms` |

### Chi tiết FE wire (phase 2 task)

Tạo `src/lib/analytics/tracker.ts`:

```ts
// Singleton tracker — lazy init khi public page mount
class Tracker {
  templateId: string;
  visitor: string;   // localStorage 'rexer.tracker.visitor_id', UUID
  session: string;   // sessionStorage 'rexer.tracker.session_id', UUID, refresh 30min idle
  queue: AnalyticsEventInput[];

  emit(partial: Partial<AnalyticsEventInput> & { event_type: string }): void
  // → push vào queue, flush batch khi:
  //   - queue.length >= 10
  //   - 5s sau last emit (debounce)
  //   - beforeunload (sendBeacon fallback)
  // → POST /api/rexer/analytics/events
}
```

**Wiring points**:
1. `src/app/p/[id]/[token]/page.tsx` — mount tracker, fire `page_view`
2. `block-editor/blocks/renderBlock.tsx` — IntersectionObserver fire `block_view` + `block_dwell`
3. Tag clickables (đã có `data-element-id` từ StatsAnnotationOverlay) — attach `onClick` capture fire `click`
4. `ImageCarousel.tsx` / `Stories.tsx` / `Carousel3d.tsx` — fire `slide_change`, `slide_dwell`
5. `BookingForm.tsx` / `Quiz.tsx` / `Poll.tsx` — fire `form_submit`
6. Global scroll listener (throttled) — fire `scroll_depth` thresholds

### BE confirms cần trước khi FE wire

1. **`event_type` enum**: BE có whitelist không, hay accept arbitrary string? Đề xuất whitelist + reject 400 nếu unknown.
2. **Visitor ID source**: FE generate client-side (UUID lưu localStorage) — BE OK không, hay BE cấp `set-cookie` lúc visit page?
3. **Session expiry**: 30 phút idle reset session_id — BE confirm có dùng để dedupe / count "unique" không?
4. **Batch size**: Endpoint accept "single event OR array (max 50)" — BE confirm max 50 vẫn đúng?
5. **`element_id` naming**: wave 2 W2.3 đang chờ — confirm convention `<block_prefix>__<element_key>` (FE đang dùng) match BE expect?
6. **Rate limit response**: 429 returns nhanh hay block? FE cần biết để retry strategy.
7. **Dwell aggregation**: BE tính `avg_dwell_ms = sum(dwell_ms) / count(unique_session)` đúng không?
8. **Aggregation schedule**: real-time vs cron (5min/1h)? Ảnh hưởng đến UX brand expecting fresh numbers.
9. **Retention policy**: raw events giữ bao lâu? Daily aggregates giữ bao lâu?
10. **PII**: `meta` field có whitelist không? Brand fire arbitrary data có bị reject hay BE strip?

### Effort

- **BE**: ~0 endpoint mới — chỉ doc + confirm 10 câu hỏi (~2 giờ)
- **FE**: ~2 ngày — tracker + 6 wiring points + Playwright test

### Files

| File mới (FE) | Mục đích |
|---|---|
| `src/lib/analytics/tracker.ts` | Singleton tracker, queue, batch flush, sendBeacon |
| `src/lib/analytics/use-tracker.ts` | React hook mount + provide context |
| `src/lib/analytics/intersection.ts` | IntersectionObserver helper cho block_view/element_view |

| File chỉnh (FE) | Thay đổi |
|---|---|
| `src/app/p/[id]/[token]/page.tsx` | Mount tracker + fire page_view |
| Mỗi `block-editor/blocks/*.tsx` (~14 file) | Wrap với block-view observer |
| `block-editor/blocks/renderBlock.tsx` | Click capture handler bubble lên tracker |

→ Wave này sẽ là **Phase 2.A** — block lớn nhất, unblock toàn bộ stats overlay live data.

---

## 🔴 P0 — `/portal` (dashboard tổng quan)

**Pain**: Trang dashboard hiện đang map từ `/dashboard/summary` (admin-style aggregates: `active_clients`, `projects_total`, ...) — không match shape brand cần (`templates_count`, `total_views_30d`, `total_visitors_30d`, `total_leads_30d`, `assets_count`, `open_comments`, ...). Hoạt động qua `_remote.tsx:loadDashboardStats` fallback fake.

### Endpoint cần thêm

```
GET /v1/portal/dashboard/summary?from=&to=
```

- **Auth**: CookieAuth, role `client_user` / `brand_owner`. Auto-scope theo `ctx.client_id`.
- **Query**: `from`, `to` (ISO), default last 30 days.
- **Response**:
```ts
type PortalDashboardSummary = {
  templates_count: number;          // tổng landing pages của brand
  templates_published: number;
  total_views_30d: number;
  total_visitors_30d: number;       // unique
  total_clicks_30d: number;
  total_leads_30d: number;           // conversions (form submit, signup, ...)
  assets_count: number;              // media folders + files
  open_comments: number;             // unresolved comments
  unread_notifications: number;
  trend_7d: number[];                // 7 points (views/day) for header bar chart
};
```

**Lý do P0**: Trang `/portal` là landing đầu tiên brand mở sau login — fake data ở đây làm mất uy tín ngay từ ấn tượng đầu.

**Effort BE**: ~3-4 giờ (re-aggregate sẵn có từ analytics-events + template/media counts).

**FE file**: `src/app/(client-portal)/portal/page.tsx`, `_remote.tsx:loadDashboardStats`

---

## 🔴 P0 — `/portal/landing-pages` (list landings của brand)

**Pain**: Đang dùng `rexerApi.clientPortal.myProjects()` trả `ClientPortalProject[]` (project-shape cũ). Brand portal cần list **canvas templates** trực tiếp (đó là cái brand cấu hình + publish), không phải projects.

### Endpoint cần thêm

```
GET /v1/portal/templates?status=&workspace_id=&page=&limit=
```

- **Auth**: `client_user`, scope theo `client_id` + optional `workspace_id` filter
- **Status enum**: `draft | published | archived`
- **Response**:
```ts
type PortalTemplate = {
  id: string;
  workspace_id: string;
  name: string;
  thumbnail_url?: string;
  status: 'draft' | 'published' | 'archived';
  views_30d: number;
  clicks_30d: number;
  leads_30d: number;
  open_comments: number;
  last_publish_at?: string;
  last_updated_by: {
    user_id: string;
    name: string;
    role: 'staff' | 'brand_owner' | 'brand_member';
  };
};

type PortalTemplateListResponse = {
  items: PortalTemplate[];
  page: number;
  limit: number;
  total: number;
};
```

**Effort BE**: ~4 giờ (join canvas_templates + workspace + analytics aggregates).

**FE file**: `src/app/(client-portal)/portal/landing-pages/page.tsx`

---

## 🔴 P0 — Brand-accessible analytics breakdown (đã liệt kê wave 2 W2.1)

Reuse spec `be-missing-apis-phase1-wave2.md` §1: `GET /v1/portal/templates/{templateId}/breakdown`. Vẫn cần để Stats Overlay trên `/p/[id]/[token]` hoạt động cho brand. Không lặp lại spec ở đây.

---

## 🟡 P1 — `/portal/ads` (quản lý quảng cáo / campaign)

**Pain**: Trang hoàn toàn fake — `FAKE_CAMPAIGNS` hardcoded với fields `name`, `objective`, `status`, `channels`, `budget`, `spent`, `impressions`, `clicks`, `ctr`, `cpc`, `conversions`. BE chưa có endpoint nào cho ads.

### Endpoints cần thêm

```
GET    /v1/portal/ads/campaigns?status=&channel=&workspace_id=&page=&limit=
POST   /v1/portal/ads/campaigns
GET    /v1/portal/ads/campaigns/{id}
PATCH  /v1/portal/ads/campaigns/{id}
DELETE /v1/portal/ads/campaigns/{id}
GET    /v1/portal/ads/campaigns/{id}/metrics?from=&to=
GET    /v1/portal/ads/channels                       # Meta, Google, TikTok, ...
```

### Schema (đề xuất)

```sql
CREATE TABLE ad_campaigns (
  id            uuid PK,
  client_id     uuid NOT NULL,
  workspace_id  uuid,
  name          text NOT NULL,
  objective     text,                    -- awareness/traffic/conversion/retention
  status        text DEFAULT 'draft',    -- draft/active/paused/completed
  channels      text[] DEFAULT '{}',     -- ['meta','google',...]
  budget_amount numeric(12,2),
  budget_currency text DEFAULT 'VND',
  start_date    date,
  end_date      date,
  landing_template_id uuid,              -- link sang canvas template
  utm_campaign  text,
  notes         text,
  created_by    uuid,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE ad_campaign_metrics_daily (
  campaign_id   uuid NOT NULL,
  date          date NOT NULL,
  impressions   bigint DEFAULT 0,
  clicks        bigint DEFAULT 0,
  spent_amount  numeric(12,2) DEFAULT 0,
  conversions   bigint DEFAULT 0,
  PRIMARY KEY (campaign_id, date)
);
```

### Lưu ý

- **Phase 2.x**: chưa cần wire vào Meta/Google API thật — đợt đầu là manual entry, brand tự nhập budget + spent. Ingest auto đẩy sau.
- **Differs from existing `/v1/campaigns`** (which is product-scoped — see `Campaign` type) — `ads_campaigns` ở đây là channel-level cho portal.

**Effort BE**: ~1.5 ngày (table + CRUD + manual metrics input form).

**FE file**: `src/app/(client-portal)/portal/ads/page.tsx`

---

## 🟡 P1 — `/portal/curate` (interaction events feed)

**Pain**: Trang đang fake `FAKE_EVENTS` (giveaway, quiz answer, vote, ...). BE đã có `/portal/curate/events` + `/portal/curate/interaction-types` (xem swagger) — **FE chưa wire**.

### Action cần làm

1. **BE**: confirm schema cuối + provide example payload.
2. **FE**: wire qua `rexerApi.portalCurate.list({...})` — endpoint group chưa tồn tại trong `endpoints.ts`.

### Endpoint cần FE wire

```
GET    /v1/portal/curate/events?type=&template_id=&from=&to=&page=&limit=
GET    /v1/portal/curate/interaction-types
GET    /v1/portal/curate/interaction-types/{kind}
```

**BE part**: confirmed exists in swagger. FE cần shape response để map sang UI.

**Effort BE**: ~1 giờ doc + example response.
**Effort FE**: ~3 giờ wire + types.

**FE file**: `src/app/(client-portal)/portal/curate/page.tsx`

---

## 🟡 P1 — `/portal/media` (folder + file management Google-Drive style)

**Pain**: BE đã có wave 1 `/media/folders/*` + `/media/*`. **FE đang dùng `FAKE_FOLDERS` + `FAKE_MEDIA_FILES`** — chưa wire.

### Status BE

✅ Có sẵn (wave 1):
- `GET /v1/media/folders?parent_id=`
- `POST /v1/media/folders`
- `PATCH /v1/media/folders/{id}` (rename / move)
- `DELETE /v1/media/folders/{id}`
- `GET /v1/media?folder_id=&page=&limit=`
- `PATCH /v1/media/{id}` (move file giữa folder)
- `POST /v1/media/bulk-move`, `POST /v1/media/bulk-delete`
- `POST /v1/media/uploads/init` + `/complete`

### Còn thiếu trên BE

```
GET /v1/media/folders/{id}/breadcrumb       # full path từ root → folder
GET /v1/media/{id}/preview                  # ảnh thumbnail / video poster
```

(BE có thể bao gồm `breadcrumb` trong existing `MediaFolderListResponse` — confirm hiện đang trả `breadcrumb[]` ở root-level không.)

**Effort BE**: 0 (đã đủ) hoặc ~2 giờ nếu thêm breadcrumb endpoint.
**Effort FE**: ~1 ngày — rewrite media page Google-Drive style với folder tree navigation.

**FE file**: `src/app/(client-portal)/portal/media/page.tsx`

---

## 🟡 P1 — `/portal/products` (brand product catalog)

**Pain**: BE đã có `/products` (admin + brand scope). **FE đang dùng `FAKE_PRODUCTS`**.

### Status BE

✅ Có sẵn — `rexerApi.products.list({client_id})` works for brand scope.

### Còn thiếu

- **Brand-scoped filter** confirm: BE auto-scope `client_id = ctx.client_id` khi role là `client_user` không, hay phải pass `client_id` explicit query param?
- **Field check**: portal hiển thị `template_count`, `cover_gradient`, `sku`, ... — confirm shape match.

**Effort BE**: ~30 phút (confirm scoping behaviour + doc).
**Effort FE**: ~2 giờ wire.

**FE file**: `src/app/(client-portal)/portal/products/page.tsx`

---

## 🟡 P1 — `/portal/comments` (thread comments per template)

**Pain**: BE có wave 1 `/portal/templates/{templateId}/comments`. **FE đang dùng `FAKE_THREADS`**.

### Status BE

✅ Có sẵn:
- `GET /v1/portal/templates/{templateId}/comments`
- `POST /v1/portal/templates/{templateId}/comments`
- `PATCH /v1/portal/comments/{commentId}`
- `DELETE /v1/portal/comments/{commentId}`
- `POST /v1/portal/comments/{commentId}/resolve`

### Còn thiếu

- **Cross-template feed endpoint**: `GET /v1/portal/comments?status=open&workspace_id=` — list comments across all templates that brand owns. FE hiện cần list này để hiển thị tab "Đang chờ phản hồi".

```
GET /v1/portal/comments?status=&workspace_id=&page=&limit=
```

**Response**:
```ts
type PortalCommentDigestItem = TemplateComment & {
  template_name: string;
  template_thumbnail_url?: string;
  reply_count: number;
  last_activity_at: string;
};
```

**Effort BE**: ~3 giờ (aggregation query across templates).
**Effort FE**: ~4 giờ rewrite comments page (per-template threads + drop-pin trên canvas — defer phase 3).

**FE file**: `src/app/(client-portal)/portal/comments/page.tsx`

---

## 🟡 P1 — `/portal/profile` (brand profile + member management)

**Pain**: Trang đang fake — không có endpoint update profile, change password, list members, manage roles.

### Endpoints cần thêm

```
GET    /v1/portal/me                                  # already exists as /auth/me
PATCH  /v1/portal/me                                  # update display_name, avatar
POST   /v1/portal/me/avatar                           # upload avatar binary
POST   /v1/portal/me/change-password                  # already exists as /auth/change-password ✅
GET    /v1/portal/me/client                           # brand profile (name, logo, contact)
PATCH  /v1/portal/me/client                           # update brand profile (only brand_owner)
GET    /v1/portal/me/client/members?role=             # list workspace members
POST   /v1/portal/me/client/members                   # invite via email
PATCH  /v1/portal/me/client/members/{userId}/role     # change role (admin/staff/member)
DELETE /v1/portal/me/client/members/{userId}          # remove from brand
```

### Schema

`brand_members` view aggregates from `users` + `client_users` + `workspace_memberships`. Probably already exists conceptually but no API surface.

### Phase 1 scope

- **MVP**: profile update + member list (read-only). Invite/role/remove là Phase 3.
- Avatar có thể defer — dùng Gravatar / initial pill phase 1.

**Effort BE**: ~1 ngày cho MVP (update + list members).
**Effort FE**: ~4 giờ wire profile + member list.

**FE file**: `src/app/(client-portal)/portal/profile/page.tsx`

---

## 🔴 P0 — Brand-side workspace create (đang dùng admin endpoint)

**Pain**: `CreateWorkspaceDialog` (vừa ship) đang gọi `POST /admin/clients/{id}/workspaces` — admin-only. Brand user (`client_user`/`brand_owner`) bị 403, hiện banner "wave 2 mở quyền".

### Endpoint cần thêm

```
POST /v1/portal/workspaces
```

- **Auth**: `client_user` với role workspace = `brand_owner`
- **Body**: `{ name, slug, description? }` (cùng `CreateWorkspaceRequest`)
- **Server**: auto-scope `client_id = ctx.client_id`, role membership `brand_owner` cho creator
- **Response**: `Workspace`

**Effort BE**: ~2 giờ (copy admin handler + auth gate change + auto-membership).

**FE file**: `src/app/(client-portal)/portal/_CreateWorkspaceDialog.tsx`

---

## 🟢 P2 — Activity feed enhancement

**Pain**: `/portal/activity` đã có (wave 1) — FE đã wire. Tuy nhiên thiếu:
- **Mark all activity as seen** (giống notifications mark-read)
- **Activity filter by kind** (`?kind=template_published`)

### Endpoint cần thêm

```
POST /v1/portal/activity/mark-seen
GET  /v1/portal/activity?kind=&workspace_id=&from=&to=
```

**Effort BE**: ~1 giờ.

---

## 🟢 P2 — Notifications page (chi tiết)

**Pain**: `/portal/notifications/*` đã có wave 1 (unread-count + list + mark-read). FE đã wire badge ở header bell, nhưng **chưa có trang detail** để brand vào xem full history.

### Cần FE

Không thiếu BE — chỉ cần FE tạo `/portal/notifications/page.tsx`. Defer phase 2.

---

## Migration plan đề xuất

| Wave | Endpoint / Work | Effort BE | Effort FE | FE blocker? |
|---|---|---|---|---|
| **P0.A** | Analytics event tracking pipeline (BE confirm 10 Qs + FE wire 6 points) | ~2h doc | **~2d** | ✅ Yes — không có data thật cho mọi stats |
| **P0.B** | `GET /portal/dashboard/summary` | ~4h | ~3h wire | ✅ Yes |
| **P0.C** | `GET /portal/templates` brand-scope | ~4h | ~3h wire | ✅ Yes |
| **P0.D** | `GET /portal/templates/{id}/breakdown` (wave 2 W2.1) | ~2h | 1 dòng đổi URL | ✅ Yes (stats overlay) |
| **P0.E** | `POST /portal/workspaces` brand-side | ~2h | 1 dòng đổi URL | ✅ Yes — brand đang bị 403 |
| **P1.A** | Comments cross-template feed | ~3h | ~4h | No |
| **P1.B** | Profile + members | ~1d | ~4h | No |
| **P1.C** | Ads campaigns CRUD | ~1.5d | ~1d | No |
| **P1.D** | Products brand-scope confirm | ~30m | ~2h | No |
| **P1.E** | Curate doc + example payload | ~1h | ~3h | No |
| **P2** | Activity mark-seen, notification page detail | ~1h | ~3h | No |

**Tổng**:
- **BE**: ~3 ngày (chủ yếu ads + profile + members + dashboard aggregate)
- **FE**: ~5 ngày (analytics tracker là phần lớn nhất)

→ **P0 là ~1 tuần work parallel BE + FE** để portal có data thật end-to-end.

---

## Test checklist sau khi BE ship (mỗi endpoint)

Lặp lại pattern cho mỗi endpoint:

- [ ] Brand login → mở route portal → hết banner amber "fake data"
- [ ] Admin gọi cùng endpoint → 200 OK (admin scope rộng hơn brand)
- [ ] Brand thử gọi endpoint của brand khác (sniff request) → 403
- [ ] Date range filter hoạt động đúng
- [ ] Pagination + sort hoạt động (where applicable)
- [ ] Empty state (brand mới chưa có data) render đẹp

---

## Câu hỏi BE cần confirm trước khi schedule

1. **`/portal/dashboard/summary`**: cache layer (Redis) hay query trực tiếp materialized view? Brand load page nhiều lần — cache 60s OK?
2. **`/portal/templates` shape**: alias `template_count` từ canvas_templates count, có cần thêm `share_url` không hay FE tự build?
3. **`ads_campaigns`**: gộp vào table `campaigns` hiện có hay table riêng? (Khuyến nghị table riêng vì scope khác — product-campaign vs ad-campaign).
4. **Workspace member management**: phase 1 chỉ cho `brand_owner` invite + manage role, hay mọi member?
5. **Profile avatar storage**: dùng chung `media_assets` table hay column `avatar_url` trên `users`?
6. **Curate events ingest**: BE đã có endpoint chưa, hay FE phải tự push events từ public render?

---

## Liên hệ

- **FE owner**: @Lantm
- **BE**: ack 6 câu hỏi trước khi schedule + assign per-wave
- **PM**: xác nhận P0 vs P1 priority — P0 là minimum để portal demo cho brand thật, P1 polish
