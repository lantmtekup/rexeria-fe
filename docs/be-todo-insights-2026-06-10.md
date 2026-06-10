# BE TODO — AI-Insights (sau phiên FE 2026-06-10)

> Gửi team BE + AI. FE branch `feat/insights-wizard-v2` (MR !13). Doc này tổng hợp
> **những gì BE còn cần** sau khi FE hoàn thiện: wizard v2, trang list báo cáo, và
> nâng cấp UI blueprint (blocks/templates editable). Bổ sung cho
> `be-spec-insights-wizard-v2-2026-06-10.md` (3 endpoint sync + selections — đã ship).

## 0. Trạng thái (đã probe live 2026-06-10)

| Hạng mục | Prod | Dev local | Ghi chú |
|---|---|---|---|
| `suggest` / `classify-goal` / `suggest-journey` | ✅ | ✅ | FE đã ráp, shape khớp |
| `create` + `selections` + `inputs.custom_goals` | ✅ | ✅ | job skip classify/journey khi có selections |
| `PATCH /insights/reports/{id}` (đổi tên) | ✅ (401) | ❌ (404) | **deploy xuống dev** |
| `DELETE /insights/reports/{id}` (xoá) | ✅ (401) | ❌ (404) | **deploy xuống dev** |
| AI job worker (tạo blueprint) | ✅ | ❌ | **dev report kẹt `queued`** |
| `/block-types` (catalog cho "tìm thủ công") | ✅ | ? | FE tái dùng modal editor — ok |

Các mục dưới là **việc BE còn phải làm**, xếp theo ưu tiên.

---

## 1. [CAO] Đồng bộ catalog block AI đề xuất với catalog editor thật

**Vấn đề (quan trọng nhất):** blueprint trả block `block_type_code` dạng `framer_yume_hero`,
`framer_studio_manifesto`, `framer_large_quote`… Nhưng catalog block **insert được** ở
editor (`/v1/block-types`, dùng cho "Tìm thủ công") lại là `hero_split`, `feature_grid`,
`pricing_table`… → **2 namespace khác nhau**. Hệ quả:
- Block AI gợi ý **không preview được** (không có trong catalog) → FE phải fallback tile gradient.
- Không thể "insert thẳng" block AI gợi ý vào editor (code không hợp lệ với validate catalog).

**Đề nghị:** engine `recommend_blocks`/`recommend_templates` map về **đúng `type` trong
`/v1/block-types`** (catalog canonical). Nếu vẫn muốn giữ tên framer cho hiển thị, trả thêm:
```jsonc
{ "block_type_code": "hero_split",        // PHẢI thuộc catalog /v1/block-types
  "block_name": "Hero - Yume",            // tên hiển thị (giữ nguyên)
  "reason": "…",
  "preview_image_url": "https://…",       // optional — xem §2
  "legacy_framer_code": "framer_yume_hero" // optional — tham chiếu cũ
}
```
→ FE render preview thật + cho phép insert/handoff sang editor.

## 2. [CAO] Thumbnail / preview cho block & template trong blueprint

FE hiện: block là **editor type** → render `BlockMiniPreview` (seed mặc định); còn lại →
tile gradient + tên. Để đẹp & giúp user quyết định, đề nghị BE cung cấp **ảnh preview**:
- Mỗi block trong `/v1/block-types`: thêm field `preview_image_url` (ảnh thumbnail).
- Template đề xuất: thêm `preview_image_url` (hoặc danh sách `block_codes` đã canonical
  để FE tự ghép preview).

Không bắt buộc nếu §1 xong (FE preview được bằng renderer), nhưng ảnh thật sẽ tốt hơn.

## 3. [CAO] Endpoint "AI tạo nội dung" cho 1 block

Nút **"AI tạo nội dung"** trên mỗi block (hiện placeholder). Cần endpoint sinh nội dung
mẫu cho 1 block theo brief + ngữ cảnh stage:
```
POST /v1/insights/blocks/generate-content
{
  "report_id": "uuid",            // hoặc gửi brief trực tiếp
  "block_type_code": "hero_split",
  "stage_key": "vision_immersion",
  "brief": { … }                  // optional nếu đã có report_id
}
→ 200 { "content": { … } }        // payload khớp content_schema của block type
```
Trả về content có thể nạp thẳng vào block khi handoff sang editor.

## 4. [TRUNG] Lưu blueprint đã chỉnh (customize) + handoff dựng landing

FE cho user **thêm/xoá/di chuyển block** trong blueprint (hiện chỉ state local, mất khi
reload). Nút "Tùy chỉnh trải nghiệm" (handoff) chưa có đích. Cần:
- **Lưu blueprint đã sửa:** `PATCH /v1/insights/reports/{id}/blueprint` (hoặc tạo version
  con qua `parent_report_id`) nhận `recommended_blocks` / `customer_journey` đã chỉnh.
- **Handoff → tạo landing/template** từ blueprint: endpoint dựng template draft từ danh
  sách block đã chốt (map sang `/v1/templates` + block_types canonical ở §1).
```
POST /v1/insights/reports/{id}/handoff   // hoặc /v1/templates from-blueprint
→ 201 { "template_id": "uuid", "edit_url": "/admin/templates/{id}" }
```

## 5. [TRUNG] Deploy report PATCH/DELETE xuống dev + AI worker dev

- `PATCH`/`DELETE /v1/insights/reports/{id}` đã có trên **prod** (probe 401) nhưng **dev
  404** → FE đổi tên/xoá báo cáo trên dev sẽ lỗi. Deploy xuống dev.
- **AI job worker không chạy ở dev** → report giữ `queued`, không ra blueprint, không test
  được trọn vòng trên dev. Bật worker dev (hoặc 1 staging có worker) để QA.

## 6. [THẤP] Cho phép create brand-only (workspace optional)

Như spec §6.1: portal user nên tạo report **không cần `workspace_id`** (BE resolve brand
từ session). Hiện FE auto-pick workspace mặc định để né — chạy được nhưng nên nới.

---

## 7. Checklist BE
- [ ] §1 — `recommend_blocks/templates` trả `block_type_code` thuộc `/v1/block-types` canonical (+ legacy code optional).
- [ ] §2 — `preview_image_url` cho block-types (+ template) — optional.
- [ ] §3 — `POST /v1/insights/blocks/generate-content`.
- [ ] §4 — lưu blueprint đã chỉnh + handoff dựng landing từ blueprint.
- [ ] §5 — deploy PATCH/DELETE report xuống dev; bật AI worker dev/staging.
- [ ] §6 — create brand-only (workspace optional).

> FE đã sẵn sàng ráp ngay khi từng mục lên (graceful fallback hiện tại: preview→tile,
> AI tạo nội dung / handoff → toast placeholder, edit blueprint → local state).
