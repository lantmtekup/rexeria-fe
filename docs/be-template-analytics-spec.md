# BE Spec — Template Analytics (Alpha)

**Mục tiêu**: Cho phép Admin theo dõi hiệu suất từng **Canvas Template** đã publish:
1. Views / unique visitors / clicks tổng theo template.
2. Drilldown từng **block** trong template — view, click, dwell, top action / target.
3. Drilldown từng **action** trên block — đếm theo `action × target`.
4. Funnel cho `BookingForm`, slide-level cho `ImageCarousel`, image-level cho `PhotoGallery`.

**Trạng thái**: 🆕 Chưa có. Cần bảng mới + endpoint ingest event + 2 endpoint admin query.

**Base**: `/v1`
**Auth**:
- Ingest (`POST /analytics/events`) → public, rate-limit theo `visitor_id` + IP.
- Query (`GET /admin/analytics/...`) → CookieAuth, role `admin` / `staff`.

**Convention**: `snake_case` JSON, UUID cho `template_id` / `block_id` / event id, ISO-8601 timestamps.
**Error body**: reuse `pkg_http.ErrorBody`.

**FE đối chiếu**: `src/app/overview/analytics/templates/` (đang chạy bằng `_fake-data.ts` — sẽ swap khi BE sẵn sàng).

---

## 0. Phạm vi Alpha

**Bao gồm**:
- Bảng mới `analytics_events` lưu mọi event (view / click / form action / motion).
- 1 endpoint ingest (FE bắn).
- 2 endpoint admin query (summary list + breakdown chi tiết).
- Aggregation tính theo phép-toán SQL (không cache pre-aggregate ở Alpha).
- Retention 90 ngày — cron xoá row cũ.

**Loại trừ Alpha** (làm sau):
- Materialized view / cube pre-aggregate (chỉ khi `analytics_events > 50M rows`).
- User-facing analytics (Creator xem analytics của template mình) — Alpha chỉ Admin.
- Real-time WebSocket update.
- Bot detection / fraud detection.
- Export CSV (Beta).

---

## 1. Resource: `AnalyticsEvent`

### 1.1. Schema

| field           | type                          | required | ghi chú                                                                |
|-----------------|-------------------------------|:--------:|------------------------------------------------------------------------|
| `id`            | uuid                          |    ✓     | server gen                                                             |
| `template_id`   | uuid                          |    ✓     | FK → `canvas_templates.id`                                             |
| `block_id`      | text (≤64)                    |    —     | id block trong canvas JSON; **không** uuid (canvas-defined string)     |
| `element_id`    | text (≤64)                    |    —     | id element bị tương tác (button / image / field)                       |
| `element_role`  | enum                          |    —     | xem §1.3                                                               |
| `visitor_id`    | text (≤64)                    |    ✓     | client cookie `rxr_v` (uuid v4 do FE sinh)                             |
| `session_id`    | text (≤64)                    |    ✓     | client cookie `rxr_s` (rotate sau 30 phút idle)                        |
| `event_type`    | enum                          |    ✓     | xem §1.2                                                               |
| `action`        | text (≤48)                    |    —     | taxonomy theo `block_type`, xem §1.4                                   |
| `target`        | text (≤128)                   |    —     | id element / slide-index / field-name…                                 |
| `dwell_ms`      | int                           |    —     | thời gian element trong viewport — chỉ với `block_view` + `field_blur` |
| `scroll_depth`  | smallint                      |    —     | % scroll viewport khi event fire (0–100)                               |
| `viewport_w`    | smallint                      |    —     | viewport width khi event fire (device detect)                          |
| `viewport_h`    | smallint                      |    —     | viewport height                                                        |
| `referrer`      | text (≤512)                   |    —     | `document.referrer`                                                    |
| `utm_source`    | text (≤64)                    |    —     | URL param                                                              |
| `utm_medium`    | text (≤64)                    |    —     |                                                                        |
| `utm_campaign`  | text (≤64)                    |    —     |                                                                        |
| `meta`          | jsonb (≤2 KB)                 |    —     | free-form: `{slide_index, field_name, error_code, …}`                  |
| `ip_address`    | inet                          |    —     | server-set (X-Forwarded-For nếu có); dùng cho rate-limit               |
| `user_agent`    | text (≤512)                   |    —     | server-set; opt-in store                                               |
| `created_at`    | timestamptz                   |    ✓     | server-set `now()`                                                     |

### 1.2. Enum `event_type`

| event_type        | khi nào                                                                                  |
|-------------------|------------------------------------------------------------------------------------------|
| `template_view`   | Visitor land vào `/p/{slug}` lần đầu trong session                                       |
| `block_view`      | Block enter viewport ≥ 50% (IntersectionObserver) lần đầu trong session                  |
| `block_click`     | Click element trong block có `data-track`                                                |
| `form_submit`     | Submit form thành công                                                                   |
| `field_focus`     | Form field focus                                                                         |
| `field_blur`      | Form field blur (có `dwell_ms`)                                                          |
| `field_error`     | Validation error trên field                                                              |

### 1.3. Enum `element_role`

| role             | dùng cho                                          |
|------------------|---------------------------------------------------|
| `cta_primary`    | Nút CTA chính (Book now, Sign up…)                |
| `cta_secondary`  | Nút CTA phụ                                       |
| `gallery_img`    | Ảnh trong PhotoGallery                            |
| `carousel_slide` | Slide trong ImageCarousel                         |
| `carousel_dot`   | Pagination dot                                    |
| `form_field`     | Input / textarea / select trong BookingForm       |
| `hotspot`        | Extra element hotspot                             |
| `feature_card`   | Card trong FeatureSection                         |
| `bg_video`       | Video background của Hero                         |

### 1.4. Action taxonomy theo block type

| block_type        | actions cho phép                                                                            |
|-------------------|---------------------------------------------------------------------------------------------|
| `HeroOverlay`     | `cta_click`, `bg_video_play`, `bg_video_pause`, `scroll_past`                                |
| `HeroSplit`       | `cta_click`, `scroll_past`                                                                  |
| `FeatureSection`  | `feature_click`, `feature_hover_long`, `read_more_click`                                    |
| `PhotoGallery`    | `image_click`, `lightbox_open`, `lightbox_close`, `image_zoom`, `swipe_next`, `swipe_prev`  |
| `ImageCarousel`   | `swipe_next`, `swipe_prev`, `dot_click`, `slide_click`, `autoplay_pause`, `autoplay_resume` |
| `CtaSection`      | `cta_primary_click`, `cta_secondary_click`                                                  |
| `BookingForm`     | `field_focus`, `field_blur`, `field_error`, `field_abandon`, `submit_attempt`, `submit_success`, `submit_error` |
| `Hotspot`         | `hotspot_hover`, `hotspot_click`, `hotspot_link_open`                                       |

Khi thêm block type mới: bổ sung row vào bảng taxonomy + enum DB (không cần migration code).

### 1.5. Index

```sql
CREATE INDEX idx_ae_template_time
  ON analytics_events (template_id, created_at DESC);
CREATE INDEX idx_ae_template_block_time
  ON analytics_events (template_id, block_id, created_at DESC)
  WHERE block_id IS NOT NULL;
CREATE INDEX idx_ae_template_event_time
  ON analytics_events (template_id, event_type, created_at DESC);
CREATE INDEX idx_ae_visitor_time
  ON analytics_events (visitor_id, created_at DESC);
CREATE INDEX idx_ae_session
  ON analytics_events (session_id, created_at)
  WHERE session_id IS NOT NULL;
```

**Partition (Beta nếu cần)**: range theo `created_at` mỗi tháng — drop partition cũ nhanh hơn delete row.

### 1.6. Retention

Cron daily xoá row > 90 ngày:
```sql
DELETE FROM analytics_events WHERE created_at < now() - interval '90 days';
```

Trước khi xoá: rollup vào bảng `analytics_daily_summary` (Beta). Alpha cứ delete thẳng — không cần lịch sử > 90 ngày.

---

## 2. Endpoints

### 2.1. `POST /v1/analytics/events`

- **Summary**: FE bắn event từ trang public `/p/{slug}`.
- **Security**: **public** (visitor không login). Rate-limit:
  - 100 req / phút / `visitor_id`
  - 1.000 req / giờ / IP
  - Vượt → `429`, body `{"error":"too_many_requests"}`.
- **Idempotency**: KHÔNG (event là append-only; dup chấp nhận được vì FE retry không phổ biến).
- **Batching**: hỗ trợ array — gửi 1 hoặc nhiều event trong 1 request (FE hay buffer 10 event rồi flush).

**Request body** (single):
```json
{
  "template_id": "5f4a8b40-9c52-4cc4-9d2c-2c6a4b1e9d10",
  "block_id": "blk_hero_01",
  "element_id": "btn-book-now",
  "element_role": "cta_primary",
  "visitor_id": "v_8e4a9c0f",
  "session_id": "s_2025_05_20_12_30",
  "event_type": "block_click",
  "action": "cta_click",
  "target": "btn-book-now",
  "dwell_ms": null,
  "scroll_depth": 42,
  "viewport_w": 1440,
  "viewport_h": 900,
  "referrer": "https://google.com/?q=tour+da+nang",
  "utm_source": "fb_ads",
  "utm_medium": "cpc",
  "utm_campaign": "may_2026",
  "meta": { "ab_test": "variant_b" }
}
```

**Request body (batch)**: array các object trên — tối đa 50 event / request.

**Response**: `204 No Content` (luôn — kể cả khi 1 vài event invalid trong batch, server vẫn nuốt phần valid và log warning cho phần invalid; không trả lỗi để FE đơn giản).

**Validation server**:
- `template_id` phải tồn tại + `is_published = true` → nếu không → drop event, log warn.
- `action` phải thuộc taxonomy của `block_type` (lookup từ `canvas_templates.canvas_data`) → nếu không → drop, log warn.
- `dwell_ms` ∈ [0, 600000] (10 phút) — clamp nếu vượt.
- `meta` payload ≤ 2 KB — reject toàn batch nếu vượt.

**Failure modes**:
- DB chậm → BE phải có **outbox queue** (NATS / Redis Stream); ingest endpoint return 204 ngay, worker async insert. Alpha có thể skip queue, insert đồng bộ với timeout 200ms — nếu DB hỏng thì 429 cho client retry.

---

### 2.2. `GET /v1/admin/analytics/templates/summary`

- **Summary**: Performance tổng hợp các template đã publish.
- **Security**: CookieAuth, role `admin` / `staff`.
- **Query**:
  - `start` — ISO-8601 (default: 30 ngày trước)
  - `end` — ISO-8601 (default: now)
  - `limit` — int 1-100 (default 50)
  - `sort` — `views | clicks | visitors | clicks_pct` (default `views`)
- **Cache**: HTTP `Cache-Control: private, max-age=30` (admin có thể chấp nhận trễ 30s).

**Response 200**:
```json
[
  {
    "template_id": "5f4a8b40-9c52-4cc4-9d2c-2c6a4b1e9d10",
    "template_title": "Tour Đà Nẵng 3N2Đ — luxury",
    "views": 12482,
    "unique_visitors": 8124,
    "blocks_viewed": 48310,
    "total_clicks": 1562
  }
]
```

**SQL aggregation**:
```sql
SELECT
  ct.id                                                                        AS template_id,
  ct.name                                                                      AS template_title,
  COUNT(*) FILTER (WHERE ae.event_type = 'template_view')                      AS views,
  COUNT(DISTINCT ae.visitor_id) FILTER (WHERE ae.event_type = 'template_view') AS unique_visitors,
  COUNT(*) FILTER (WHERE ae.event_type = 'block_view')                         AS blocks_viewed,
  COUNT(*) FILTER (WHERE ae.event_type = 'block_click')                        AS total_clicks
FROM analytics_events ae
JOIN canvas_templates ct ON ct.id = ae.template_id
WHERE ae.created_at BETWEEN $1 AND $2
GROUP BY ct.id, ct.name
ORDER BY views DESC
LIMIT $3;
```

**Performance**: Với index `idx_ae_template_time` + `idx_ae_template_event_time`, query này chạy < 200ms với 10M rows / 30 ngày. Khi vượt → chuyển sang materialized view (Beta).

---

### 2.3. `GET /v1/admin/analytics/templates/{template_id}/breakdown`

- **Summary**: Drilldown chi tiết — performance + actions theo từng block.
- **Security**: CookieAuth, role `admin` / `staff`.
- **Path**:
  - `template_id` — uuid template.
- **Query**:
  - `start`, `end` — như §2.2
- **Cache**: `Cache-Control: private, max-age=30`.

**Response 200**: array `BlockBreakdownRow`.

```json
[
  {
    "block_id": "blk_hero_01",
    "block_type": "HeroOverlay",
    "views": 12482,
    "clicks": 672,
    "unique_viewers": 8124,
    "avg_dwell_ms": 8240,
    "total_dwell_ms": 102852480,
    "top_action": "cta_click",
    "top_target": "btn-book-now",
    "actions": [
      {
        "action": "cta_click",
        "count": 672,
        "unique_visitors": 583,
        "targets": [
          { "target": "btn-book-now", "count": 540 },
          { "target": "btn-watch-video", "count": 132 }
        ]
      }
    ],
    "funnel": null,
    "slides": null,
    "images": null
  },
  {
    "block_id": "blk_book_01",
    "block_type": "BookingForm",
    "views": 5460,
    "clicks": 57,
    "unique_viewers": 4321,
    "avg_dwell_ms": 24120,
    "total_dwell_ms": 131695200,
    "top_action": "field_focus",
    "top_target": "field-name",
    "actions": [ /* ... */ ],
    "funnel": [
      { "name": "view",           "label": "Block xuất hiện",       "count": 5460, "drop_off_pct": 0  },
      { "name": "focus",          "label": "Focus field đầu",       "count": 2840, "drop_off_pct": 48 },
      { "name": "fill",           "label": "Điền ≥ 1 field",        "count": 1820, "drop_off_pct": 36 },
      { "name": "submit_attempt", "label": "Bấm Submit",            "count": 412,  "drop_off_pct": 77 },
      { "name": "submit_success", "label": "Submit thành công",     "count": 287,  "drop_off_pct": 30 }
    ],
    "slides": null,
    "images": null
  }
]
```

**Lấy `block_type` ở đâu**: từ `canvas_templates.canvas_data` JSON. BE đọc 1 lần, build map `block_id → block_type` rồi join với aggregation.

**SQL aggregation cho actions[]**:
```sql
SELECT
  ae.block_id,
  ae.action,
  COUNT(*)                       AS count,
  COUNT(DISTINCT ae.visitor_id)  AS unique_visitors,
  -- top 5 target per action (window function)
  ARRAY_AGG(JSON_BUILD_OBJECT('target', ae.target, 'count', /* nested count */ )
            ORDER BY /* nested count */ DESC)
    FILTER (WHERE ae.target IS NOT NULL) AS targets
FROM analytics_events ae
WHERE ae.template_id = $1
  AND ae.created_at BETWEEN $2 AND $3
  AND ae.block_id IS NOT NULL
  AND ae.action IS NOT NULL
GROUP BY ae.block_id, ae.action
ORDER BY ae.block_id, count DESC;
```

(Pseudo SQL — implementation thật phải dùng CTE 2 tầng để tính `target count` riêng rồi top-5. Xem §4.)

**SQL funnel (BookingForm only)**: dùng `$facet`-style CTE đếm distinct `session_id`:
```sql
WITH form_sessions AS (
  SELECT DISTINCT ae.session_id, ae.event_type, ae.action
  FROM analytics_events ae
  WHERE ae.template_id = $1
    AND ae.block_id = $2
    AND ae.created_at BETWEEN $3 AND $4
)
SELECT
  COUNT(*) FILTER (WHERE event_type = 'block_view')                                AS step_view,
  COUNT(*) FILTER (WHERE event_type = 'field_focus')                               AS step_focus,
  COUNT(*) FILTER (WHERE action = 'field_blur')                                    AS step_fill,
  COUNT(*) FILTER (WHERE action = 'submit_attempt')                                AS step_submit_attempt,
  COUNT(*) FILTER (WHERE action = 'submit_success')                                AS step_submit_success
FROM form_sessions;
```

`drop_off_pct` = 100 - (step_n / step_(n-1) * 100), round 0 chữ số.

**SQL slides (ImageCarousel only)**:
```sql
SELECT
  (meta->>'slide_index')::int AS index,
  meta->>'slide_label'        AS label,
  COUNT(*) FILTER (WHERE event_type = 'block_view')  AS views,
  COUNT(*) FILTER (WHERE action = 'slide_click')     AS clicks,
  AVG(dwell_ms) FILTER (WHERE action = 'slide_view') AS avg_dwell_ms
FROM analytics_events
WHERE template_id = $1 AND block_id = $2
  AND created_at BETWEEN $3 AND $4
  AND meta ? 'slide_index'
GROUP BY index, label
ORDER BY index;
```

**SQL images (PhotoGallery only)**:
```sql
SELECT
  (meta->>'image_index')::int AS index,
  meta->>'image_src'          AS src,
  COUNT(*) FILTER (WHERE action = 'image_click') AS clicks,
  COUNT(*) FILTER (WHERE action = 'image_zoom')  AS zooms
FROM analytics_events
WHERE template_id = $1 AND block_id = $2
  AND created_at BETWEEN $3 AND $4
  AND meta ? 'image_index'
GROUP BY index, src
ORDER BY clicks DESC;
```

**Empty fields**: nếu block_type không có funnel/slides/images, trả `null` (không trả `[]`) — FE dùng `if (row.funnel) ...`.

---

## 3. Visitor & Session ID

FE chịu trách nhiệm sinh:
- `visitor_id` — cookie `rxr_v`, expire 1 năm, uuid v4.
- `session_id` — cookie `rxr_s`, expire 30 phút idle (mỗi event reset TTL).

BE chỉ **lưu lại** chính xác giá trị FE gửi, **không** validate format (để FE đổi schema sau).

**Privacy**: KHÔNG lưu PII trong `visitor_id`. Cookie là opaque random.

---

## 4. Implementation notes (Go)

```go
// Handler skeleton
func PostEvents(w http.ResponseWriter, r *http.Request) {
    var events []AnalyticsEvent
    if err := json.NewDecoder(r.Body).Decode(&events); err != nil {
        // try single object fallback
        var single AnalyticsEvent
        // ...
    }
    if len(events) > 50 {
        pkg_http.WriteError(w, 400, "batch_too_large")
        return
    }

    // 1. Rate limit check (visitor_id + ip)
    if !ratelimit.Allow(events[0].VisitorID, r.RemoteAddr) {
        pkg_http.WriteError(w, 429, "too_many_requests")
        return
    }

    // 2. Validate + enrich (set ip, user_agent, server time)
    valid := make([]AnalyticsEvent, 0, len(events))
    for _, e := range events {
        if !validate(e) { continue }
        e.IPAddress = realIP(r)
        e.UserAgent = r.UserAgent()
        e.CreatedAt = time.Now()
        valid = append(valid, e)
    }

    // 3. Bulk insert (fire-and-forget if queue available)
    if err := analyticsRepo.BulkInsert(r.Context(), valid); err != nil {
        log.Warn("analytics insert failed", "err", err)
    }

    w.WriteHeader(204)
}
```

**Bulk insert** dùng `pq.CopyIn` (Postgres COPY protocol) hoặc multi-row `INSERT VALUES` — 50 row 1 query.

---

## 5. Error codes

| code              | when                                                        |
|-------------------|-------------------------------------------------------------|
| `batch_too_large` | POST body > 50 events                                       |
| `payload_too_big` | meta jsonb > 2KB                                            |
| `invalid_range`   | start > end hoặc range > 365 ngày                           |
| `template_not_found` | GET breakdown với uuid không tồn tại                     |
| `unauthorized`    | admin endpoint thiếu cookie                                 |
| `forbidden`       | đăng nhập nhưng không phải admin/staff                      |
| `too_many_requests` | rate-limit                                                |

---

## 6. Test plan

- **Unit**: validation function (taxonomy lookup, dwell clamp, batch size).
- **Integration** (db fixture):
  - Insert 1000 event mix, query summary → assert count/distinct chính xác.
  - Funnel: insert 100 session với 5 step khác nhau → assert drop_off_pct.
  - Rate-limit: 101 req trong 60s → req 101 trả 429.
- **Load**: k6 script bắn 1000 event/giây trong 5 phút — đo p95 latency < 100ms.
- **E2E**: chạy `_e2e-analytics.mjs` (FE Playwright) với BE thật — xoá `_fake-data.ts`.

---

## 7. FE → BE migration checklist

Khi BE deploy xong, FE thực hiện:

1. Tạo `src/services/analyticsTemplate.remote.ts`:
   ```ts
   export const getSummary    = (start, end)     => fetch('/v1/admin/analytics/templates/summary?start=...&end=...');
   export const getBreakdown  = (id, start, end) => fetch(`/v1/admin/analytics/templates/${id}/breakdown?...`);
   export const sendEvents    = (events)         => navigator.sendBeacon('/v1/analytics/events', JSON.stringify(events));
   ```
2. Xoá `src/app/overview/analytics/templates/_fake-data.ts` (giữ types — move sang `services/`).
3. Thay `applyPreset(...)` bằng `useEffect(() => getSummary(start, end))`.
4. Move route từ `/overview/analytics/templates` sang `/admin/analytics/templates` (protected route).
5. Trên public template (`/p/[slug]`):
   - Mount **TrackingProvider** wrap toàn page.
   - Fire `template_view` on mount.
   - IntersectionObserver fire `block_view` cho mỗi `[data-block-id]` element.
   - Click handler fire `block_click` cho mỗi `[data-track]` element.
   - Form: gắn focus/blur/error/submit listener.
   - Buffer 10 event → flush qua `navigator.sendBeacon`.

---

## 8. Timeline gợi ý

| Tuần | Việc                                                              |
|------|-------------------------------------------------------------------|
| 1    | Migration `analytics_events` + index + retention cron             |
| 1    | Endpoint `POST /analytics/events` + rate-limit + bulk insert      |
| 2    | Endpoint summary + integration test                               |
| 2    | Endpoint breakdown (basic — actions[] only)                       |
| 3    | Funnel / slides / images cho block-specific                       |
| 3    | FE migration + Playwright E2E xanh                                |
| 4    | Load test + monitoring dashboard (DataDog / Grafana)              |

---

## 9. Câu hỏi mở (cần align)

1. **Lưu `user_agent` full string** hay parse sẵn `device_type` (mobile/tablet/desktop)? — Alpha lưu full, parse khi query.
2. **GDPR**: cần consent banner trước khi set cookie `rxr_v`? — Đợi legal trả lời; tạm thời treat `visitor_id` là pseudonymous (không phải PII).
3. **Multi-tenant**: nếu sau này có workspace, có cần `workspace_id` trên row không? — Đề xuất CÓ — thêm column ngay từ Alpha để tránh migration sau.
4. **`session_id` rotation**: 30 phút idle hay 30 phút từ session start? — Đề xuất idle (phổ biến hơn).

---

**Owner**: BE squad
**Reviewer**: FE Lan (`Lantm@tekup.vn`), Eng lead
**Liên quan**:
- FE demo: `src/app/overview/analytics/templates/` (clone UI từ `360-admin-cms/src/containers/admin/analytics/CollectionAnalyticsPage.tsx`)
- Tham khảo: `docs/be-ai-usage-spec.md` (style log fire-and-forget)
