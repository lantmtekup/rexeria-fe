# BE spec — Analytics v2: phễu + leads cho landing (2026-06-12)

> Gửi team BE. FE đã dựng xong UI tại `/portal/landing-pages/[id]/analytics`
> (tab "Phễu & Lead", hiện chạy demo data seeded). Doc này liệt kê **đúng dữ
> liệu UI cần** để thay demo bằng số thật. Plan tổng:
> `docs/plan-analytics-v2-leads-funnel-2026-06-12.md`. Spec nghiệp vụ gốc:
> "Rexer — Tài liệu Phân tích v1.0" (phễu Marketing/Sales).

## 0. UI cần gì — map từng widget → dữ liệu

Mọi query đều theo bộ lọc chung: `page_id` + `range (7d|30d|90d)`.

| Widget trên UI | Dữ liệu cần | Có sẵn từ event hiện tại? |
|---|---|---|
| Tile "Lượt truy cập" + delta so kỳ trước | `visits`, `visits_prev_period` | ✅ `page_view` |
| Tile "Tỷ lệ chuyển đổi" (visit → lead) | `leads / visits` | ❌ thiếu lead |
| Tile "Lead tạo ra" + tách A/B | `leads`, `leads_by_variant` | ❌ thiếu lead (+variant sau) |
| Tile "Thời gian TB / phiên" + tổng | `avg_session_sec`, `total_dwell_sec` | ✅ suy từ `block_dwell`/heartbeat |
| Chart "Lượt truy cập theo ngày" | `visits_by_day[]` | ✅ (breakdown đã có `views_by_day` cho block — cần bản page-level) |
| "Nguồn traffic" | `visits + leads group by utm_source` | ✅ visits / ❌ leads |
| "CTR theo block" + dwell | `block: views, clicks, dwell_total_sec` | ✅ `block_view`/`click`/`block_dwell` |
| Phễu 6 bậc | `visits, engaged, cta_clicks, leads, sql, deals` | ✅ 3 bậc đầu / ❌ 3 bậc sau |
| View Sales: pipeline + bảng lead | bảng `leads` đầy đủ (score/tier/status) + `deals` | ❌ toàn bộ |

**Định nghĩa derived:**
- `engaged` = session có (`scroll_depth ≥ 50`) **hoặc** (tổng dwell ≥ 15s).
- `avg_session_sec` = tổng dwell của page / số session.
- `sql` = lead có `score ≥ ngưỡng` (ngưỡng configurable, default **65**).

## 1. Event ingest — FE bắn gì (hiện tại + bổ sung)

Đang bắn vào `POST /v1/analytics/events` (sẽ migrate `/v1/track` khi BE chốt
shape — câu hỏi cũ §9.3 audit): `page_view`, `scroll_depth` (25/50/75/100),
`block_view`, `block_dwell`, `click` (kèm `element_id`, `element_role`).
Mọi event có `session_id`, `visitor_id`, `utm_source/medium/campaign`, referrer.

**FE sẽ bổ sung (GĐ1, không cần BE đổi ingest nếu schema nhận field mới):**
1. `click` thêm `cta_id` (element được đánh dấu "CTA chuyển đổi" trong editor).
2. **`lead_submit`** — event mới, bắn khi submit form (sau này: connect ví /
   whitelist): `{page_id, session_id, visitor_id, method: form|wallet|whitelist,
   contact, utm_*, ts}` → **BE tạo bản ghi Lead** (mục 2).
3. `page_view` thêm `visit_count` (số lần quay lại của visitor, từ localStorage)
   — nguyên liệu điểm hành vi "returning ≥ 2".

## 2. DB mới

```
leads  (id uuid, brand_id, workspace_id, page_id, session_id, visitor_id,
        method text, contact text, utm_source, utm_medium, utm_campaign,
        score int, tier text,            -- denormalized cho view Sales
        status text default 'new',       -- new|contacted|negotiating|won|lost
        created_at, updated_at)
deals  (id uuid, lead_id fk, value numeric, currency text, won_at)
lead_status_log (lead_id, from, to, by_user, ts)   -- audit vòng đời
```

- Dedup lead: đề xuất unique theo `(page_id, contact)` trong 24h — BE quyết.
- `sessions` không cần bảng riêng nếu aggregate được từ events (returning,
  first_utm theo `visitor_id`); BE chọn materialized view hay bảng.

## 3. Lead scoring (tính ở BE, spec nghiệp vụ §6)

```
score = base(utm_source) + Σ hành_vi   (clamp 0..100)
base:  Referral 30 · Organic 25 · Social 20 · Paid 15 · Direct 10
hành vi: ví/whitelist +25 · cta_click +15 · returning ≥2 +15
         · block_view Tokenomics +10 · scroll ≥75 +10
tier:  hot ≥80 · warm 50–79 · cold <50
```
- Tính lúc `lead_submit` (lookup hành vi của `session_id`/`visitor_id` đó);
  re-compute nếu visitor đó có thêm hành vi sau khi đã thành lead.
- Ngưỡng SQL (default 65) **config per brand/workspace** — cho FE đọc + admin sửa.

## 4. Endpoints UI cần

Tất cả `cookieAuth`, tenant-scoped trên brand, filter `page_id + from/to`
(hoặc `range`). Shape đề xuất, BE chỉnh tên field theo convention:

1. `GET /v1/analytics/funnel?page_id&range` →
   `{visits, engaged, cta_clicks, leads, sql, deals, visits_prev_period,
     avg_session_sec, total_dwell_sec}`
2. `GET /v1/analytics/timeseries?page_id&range&metric=visits` →
   `{points: [{date, value}]}`
3. `GET /v1/analytics/sources?page_id&range` →
   `{items: [{utm_source, visits, leads}]}`
4. Block stats: **mở rộng breakdown hiện có** (BlockAnalyticsGrid đang dùng)
   thêm `dwell_total_sec` per block — không cần endpoint mới.
5. `GET /v1/leads?page_id&range&status&sort=score` → list + pagination
   (shape bảng Sales: name/contact/method/utm_source/score/tier/status/deal).
6. `PATCH /v1/leads/{id}` body `{status}` → ghi `lead_status_log`.
7. `POST /v1/leads/{id}/deal` body `{value, currency}` → tạo `deals`,
   set status `won`.

## 5. Quy tắc nhất quán (QA — spec nghiệp vụ §9)

- `leads` ở funnel (§4.1) == `count` ở list (§4.5) cùng filter.
- `deals.lead_id` luôn trace về 1 lead có thật (FK).
- Mọi số (trừ ad_spend) suy từ event log, không nhập tay.

## 6. Ngoài scope đợt này (đừng build vội)

- **CPL / ad_spend**: UI đã bỏ tile CPL (thay bằng "Thời gian TB / phiên").
  Khi cần lại sẽ đi đường nhập tay theo pattern manual-metrics, spec sau.
- A/B variant thật (hiện UI mock A/B từ tổng lead): cần cơ chế variant ở
  publish — đợt sau.
- Attribution multi-touch: đợt này chỉ cần **last non-direct** lưu trên lead;
  log đủ touch để sau đổi model.

## 7. Câu hỏi cho BE

1. `/v1/track` shape chốt chưa (audit §9.3)? FE migrate ingest cùng đợt này luôn được.
2. Dedup lead theo `(page_id, contact)/24h` ổn không, hay theo visitor_id?
3. Scoring re-compute: sync trong ingest hay worker định kỳ?
4. Ngưỡng SQL để ở config brand hay workspace?
