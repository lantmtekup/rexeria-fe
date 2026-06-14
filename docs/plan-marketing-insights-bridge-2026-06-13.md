# Plan — Nối Marketing ↔ AI-Insights (2026-06-13)

> Mục tiêu: user KHÔNG nhập brief từ đầu trong AI-Insights nữa — dữ liệu lấy
> từ phần **Marketing** (đã quản lý sẵn brief Discovery/Concept/Assets +
> campaign). Kết quả insight (blueprint) **copy ngược về setup cuối cùng**
> của Marketing (section Campaign: gắn landing/template + goal/journey).

## 0. Hiện trạng (đã verify trong code)

| Phía | Có gì |
|---|---|
| Marketing (portal, mới build) | Brief `{discovery: 4 mục, concept: 3 mục, assets: image/video/3d, extras, files}` + campaign (objective/kênh/budget/ngày) + `product_id` + `landing_page_id`. Tất cả trong `campaign.notes` JSON. Nút **AI-Assistant đang disabled** — chính là chỗ gắn entry point. |
| AI-Insights (đã ship) | Wizard nhập `InsightBrief {brand, product, objective, audience, market, assets, challenges}` → `create` report (kèm `selections`) → worker 5 bước → blueprint (goal/journey/blocks/templates) → **handoff KB2** tạo template draft + `edit_url`. Intake đang prefill seed "Happy City" — thay được bằng data thật. |

**Điểm khớp then chốt:** `inputs` của insights là `additionalProperties` (free-form)
→ map text-to-text từ Marketing brief là hợp lệ, `understand_context` sẽ tự digest.

## 1. Bảng map Marketing brief → InsightBrief

| Marketing | InsightBrief |
|---|---|
| `product_id` | BE tự resolve context qua `/insights/prefill` (đã có) |
| discovery.marketingConcept | `brand.positioning` |
| discovery.messageDevelopment | `brand.tone` + messaging (text) |
| discovery.creativeDirection | `brand.visual_identity` |
| discovery.contentMap | `audience.behaviours` / journey hint |
| concept.aboutConcept | `product.benefits` |
| concept.targetAudience | `audience.persona` (+ `pain_points` nếu tách được câu) |
| concept.plan | `challenges` / ghi chú objective |
| campaign.objective | `objective.campaign_objectives` (awareness→Nhận biết, traffic→Thu lead, conversion→Chuyển đổi, retention→Giữ chân) |
| assets (tên file + url) | `assets.items` |
| extras + file đính kèm field | nhồi thêm free-text vào mục tương ứng |

## 2. GĐ1 — Adapter + entry point (FE, ~1 ngày)

- [ ] `_insights-bridge.ts`: `marketingBriefToInsightBrief(brief, campaign, productId)`
      theo bảng §1 + hàm `briefCoverage()` báo mục còn trống.
- [ ] Bật nút **AI-Assistant** trong marketing editor → dialog
      "Chạy AI-Insights từ dữ liệu Marketing": preview brief đã map, cảnh báo
      mục thiếu (vd chưa điền Target audience), confirm mới chạy (tốn credits).
- [ ] Confirm → `insights.create({workspace_id, inputs: brief})` →
      lưu `insight_report_id` vào `notes` của campaign.

## 3. GĐ2 — Kết quả đổ về "setup cuối" (FE, ~1-1.5 ngày)

- [ ] Section **Campaign** thêm panel "AI-Insights": poll
      `insights.get(report_id)` → hiện trạng thái (queued/running/succeeded);
      succeeded → tóm tắt **goal + journey + blocks đề xuất** (read-only,
      link sang `/portal/insights/[id]` xem full).
- [ ] Nút **"Dùng kết quả này"** = copy về setup cuối:
      1. Gọi handoff KB2 `POST /insights/reports/{id}/handoff` → template
         draft + `edit_url`;
      2. Set `landing_page_id` của campaign theo landing sinh ra (hoặc lưu
         `template_id` chờ publish);
      3. Ghi goal/journey đã chốt vào `notes.marketing_brief.insight_summary`.
- [ ] Chiều ngược ở Insights wizard: nút "Lấy dữ liệu từ Marketing" — chọn
      campaign → prefill intake (thay seed Happy City).

## 4. GĐ3 — Sau khi BE ship entity Marketing (defer)

- Brief chuyển từ `notes` sang bảng riêng; insights đọc trực tiếp, bỏ adapter.
- AI-Assistant per-field: `/insights/suggest` gợi ý từng ô Discovery/Concept
  ngay trong editor (đã có endpoint, p95<4s).

## 5. Phụ thuộc & rủi ro

1. **Chặn bởi audit §20**: prod chưa deploy wizard-v2 endpoints + worker
   (404); dev thì worker gated (report kẹt `queued`). → BE redeploy xong mới
   test e2e được GĐ1-2. FE cứ build trước, fallback heuristic có sẵn.
2. **Cost**: mỗi report 5-8 LLM call tính credits → nút chạy bắt buộc confirm.
3. Chất lượng map free-text phụ thuộc prompt `understand_context` — AI-team
   checklist tuning (doc 2026-06-10) vẫn chưa làm, càng cần làm sớm.
