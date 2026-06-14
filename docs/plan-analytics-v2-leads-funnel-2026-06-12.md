# Kế hoạch — Analytics v2: phễu Marketing/Sales + Leads (2026-06-12)

> Triển khai tài liệu "Rexer — Tài liệu Phân tích (Analytics) v1.0" trên nền
> analytics hiện có. Doc này = gap analysis + kế hoạch 4 giai đoạn + spec cần
> gửi BE. FE repo: `rexerai`. BE (Go+Postgres) do team BE giữ — mọi thay đổi
> BE đi qua spec, FE không tự sửa.

---

## 0. Hiện trạng vs spec (gap analysis)

### Đã có sẵn (tận dụng, không xây lại)

| Spec yêu cầu | Hiện trạng |
|---|---|
| `page_view`, `scroll_depth` (25/50/75/100), `block_view` | ✅ `src/lib/analytics/tracker.ts` — singleton, batch, fire-and-forget, đã có `visitor_id`/`session_id` (localStorage/sessionStorage) + `utm_source/medium/campaign` + referrer/viewport |
| `cta_click` | 🟡 Có event `click` kèm `element_id`/`element_role` (button/link) — thiếu ngữ nghĩa `cta_id` riêng |
| Engaged (scroll ≥50% ∨ dwell ≥15s) | 🟡 Suy ra được từ `scroll_depth` + `block_dwell` đang bắn — chỉ cần BE định nghĩa derived metric |
| Ingest endpoint | ✅ `POST /v1/analytics/events` (đang dùng); `/v1/track` canonical đã mount openapi — FE còn nợ migrate (audit §9.3) |
| Stats block/CTA + overlay | ✅ `StatsAnnotationOverlay`/`PageOverlayView`/`BlockAnalyticsGrid` — Marketing view mức page đã có khung |
| Nhập tay số liệu | ✅ Pattern "manual metrics" từ `be-spec-micro-site-pages-stats-2026-06-05.md` — tái dùng cho `ad_spend` |

### Chưa có (phải xây mới)

| Spec yêu cầu | Ghi chú |
|---|---|
| `lead_submit` (form/ví/whitelist) → tạo Lead | Sự kiện + bảng `leads` + dedup |
| `lead_status_change`, `deal_won` | Vòng đời lead + pipeline Sales |
| Lead scoring (base nguồn + hành vi, clamp 0–100, ngưỡng SQL configurable) | BE compute |
| Bảng `sessions` (returning_count, first_utm) | BE; FE đã gửi đủ nguyên liệu |
| Attribution last non-direct + lưu đủ touch | BE |
| View Sales (pipeline, tier, ưu tiên) | FE module mới ở portal |
| Phễu 6 bậc chung 2 view + role gating | FE |

### Lệch thuật ngữ cần chốt trước khi code

1. **`client_id`** trong spec ↔ hệ hiện tại là `brand → workspace → page`.
   Đề xuất map: `client` ≡ **workspace**, `landing_id` ≡ **page_id** (UUID canvas).
2. **Connect ví / whitelist**: block hiện tại chưa có loại CTA này — coi là
   `method` của `lead_submit`, FE bắn từ block form trước, ví/whitelist khi có block.
3. Spec event `cta_click` ↔ tracker đang bắn `click` + `element_role` — đề xuất
   GIỮ event `click`, thêm field `cta_id` (id element trong canvas), BE alias.

---

## GĐ1 — FE tracker v2 (làm ngay, không chờ BE)

- [ ] Chuẩn hoá CTA: block button/link có flag "CTA chuyển đổi" trong editor →
      render `data-cta-id` → tracker đính `cta_id` vào event `click`.
- [ ] `lead_submit`: hook vào block form submit (method `form`), payload
      `{lead: {contact, method}, utm_* (của session), session_id, page_id}`.
      Bắn cả khi BE chưa có endpooint lead (BE drop êm — như pattern hiện tại).
- [ ] Returning visitor: tracker đếm `visit_count` trong localStorage, gửi kèm
      `page_view` (nguyên liệu cho điểm hành vi "quay lại ≥2").
- [ ] Migrate ingest `analytics/events` → `/v1/track` (đợi BE chốt shape — đã
      treo ở audit §9.3; nếu BE chưa chốt, giữ endpoint cũ, đổi sau 1 dòng).
- Phạm vi file: `src/lib/analytics/tracker.ts`, `use-tracker.ts`, block form
  renderer, types. **Không đụng** overlay hiện có.

## GĐ2 — Spec gửi BE (FE viết, BE build)

Viết `docs/be-spec-analytics-leads-2026-06-XX.md` gồm:

- [ ] **DB**: `leads` (lead_id, session_id, workspace_id, page_id, method,
      contact, utm_*, score, tier, status, timestamps), `deals` (deal_id,
      lead_id, value, currency, won_at), `sessions` materialize từ events
      (returning_count, first_utm_*). `events` đã có — thêm cột `cta_id`,
      `lead_id` nếu thiếu.
- [ ] **Scoring** (spec §6): base theo `utm_source` (Referral 30 → Direct 10)
      + hành vi (ví/whitelist +25, CTA +15, returning +15, block Tokenomics +10,
      scroll≥75 +10), clamp 0–100; tier Hot≥80/Warm 50–79/Cold<50; ngưỡng SQL
      default 65 **configurable per workspace**. Tính tại `lead_submit`,
      re-compute khi có hành vi mới của cùng session/visitor.
- [ ] **Endpoints**:
      `POST /v1/track` nhận `lead_submit` → tạo lead (idempotent theo
      contact+page+ngày?); `PATCH /v1/leads/{id}` đổi status (auth, ghi
      `lead_status_change`); `POST /v1/leads/{id}/deal` (deal_won);
      `GET /v1/analytics/funnel|marketing|sales?workspace_id&page_id&from&to`.
- [ ] **Attribution**: last non-direct touch, lưu touches đủ để đổi model.
- [ ] **Câu hỏi cho BE**: dedup lead theo gì? scoring chạy sync hay worker?
      `/v1/track` shape chốt chưa (§9.3)?

## GĐ3 — Dashboard 2 view + phễu (FE, sau khi BE ship API)

- [ ] **Funnel component chung** (6 bậc, spec §2) — dùng ở cả 2 view, nhận
      cùng bộ filter `{workspace, page, dateRange}` (context chung — nguyên
      tắc "cùng filter cùng kết quả").
- [ ] **View Marketing** (`/portal/analytics/marketing`): mở rộng từ overlay +
      BlockAnalyticsGrid hiện có — thêm nguồn traffic (group utm_source), tỷ lệ
      chuyển đổi, A/B so sánh 2 page, CPL (`ad_spend` nhập tay — tái dùng UI
      manual metrics).
- [ ] **View Sales** (`/portal/analytics/sales`): bảng lead sort score desc,
      badge tier, đổi status inline (Mới→Đã liên hệ→Đàm phán→Chốt/Mất),
      pipeline theo status, doanh thu chốt.
- [ ] **Role gating** (spec §10): Marketing/Sales/Admin/Khách-readonly — dựa
      trên brand role hiện có; phần không thuộc role thì làm mờ (không ẩn phễu).
- Tuân `rexer-component-style` (atoms/molecules, list view default).

## GĐ4 — QA nhất quán (spec §9)

- [ ] Spec e2e: bắn chuỗi event giả lập (visit → scroll → cta → lead_submit →
      status → deal) qua `/v1/track`, rồi assert: leads(Marketing) ==
      leads(Sales); deal trace về lead_submit thật; đổi filter cả 2 view cùng đổi.
- [ ] Probe BE theo pattern throwaway (memory `be-probe-pattern`), log vào
      `docs/be-audit-2026-05-26.md` nếu lệch.

## Thứ tự & phụ thuộc

```
GĐ1 (FE, độc lập) ──┐
                    ├──► GĐ3 (cần API GĐ2) ──► GĐ4
GĐ2 (spec → BE ship)┘
```

GĐ1 + GĐ2 làm song song ngay. GĐ3 chỉ chặn bởi BE ship; có thể làm trước UI
với demo-data fallback (pattern overlay hiện có đã hỗ trợ demo/live badge).
