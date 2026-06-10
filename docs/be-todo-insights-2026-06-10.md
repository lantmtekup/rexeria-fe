# BE spec — AI-Insights blueprint: mở / lưu / generate (gửi team BE + AI)

> FE branch `feat/insights-wizard-v2` (MR !13). Bổ sung cho
> `be-spec-insights-wizard-v2-2026-06-10.md` (3 endpoint sync + selections — đã ship).
> Viết theo **kịch bản thao tác**: FE đang làm gì → thiếu gì → BE cần build gì.

---

## 0. Vấn đề cốt lõi (đọc trước)

Blueprint hiện trả về **gợi ý dạng chữ** do AI sinh. **Block và template KHÔNG có `id`,
KHÔNG có `url`** — nên FE *không có gì để "mở" hay "lưu"*. Cụ thể shape hiện tại:

```jsonc
// recommended_blocks.blocks_by_stage[].blocks[]
{ "block_type_code": "framer_yume_hero", "block_name": "Hero - Yume", "reason": "…" }
// recommended_templates.templates[]
{ "name": "The Visionary Legacy Flow", "category": "…", "block_codes": ["framer_…"],
  "description": "…", "why_fit": "…" }
```
→ Không có id/url → "Xem chi tiết" chỉ hiện lại mấy dòng chữ này; không mở được trang nào.
→ `framer_*` **không thuộc** catalog block insert được (`/v1/block-types` dùng mã `hero_split`,
`feature_grid`…) → không preview, không chèn vào editor được.

## 1. Trạng thái đã probe live (2026-06-10)

| Endpoint | Prod | Dev | |
|---|---|---|---|
| suggest / classify-goal / suggest-journey + selections | ✅ | ✅ | đã ship |
| `PATCH` / `DELETE /v1/insights/reports/{id}` | ✅ (401) | ❌ (404) | deploy xuống dev |
| AI job worker (sinh blueprint) | ✅ | ❌ | dev report kẹt `queued` |
| `/v1/block-types` (catalog) | ✅ | ✅ | FE "tìm thủ công" dùng cái này |

---

## 2. Kịch bản & việc BE cần

### KB1 — [CAO] Block AI gợi ý phải dùng đúng catalog (để preview + insert + "tìm thủ công")

**FE hiện:** block `framer_*` → không có trong `/v1/block-types` → FE chỉ vẽ tile gradient +
tên (không preview, không chèn editor được).
**BE cần:** engine `recommend_blocks`/`recommend_templates` trả `block_type_code` **thuộc
`/v1/block-types`** (canonical, vd `hero_split`). Giữ tên hiển thị + (tuỳ) mã framer cũ:
```jsonc
{ "block_type_code": "hero_split",          // BẮT BUỘC ∈ /v1/block-types
  "block_name": "Hero - Yume",
  "reason": "…",
  "legacy_framer_code": "framer_yume_hero", // optional
  "preview_image_url": "https://…" }        // optional (xem KB5)
```
→ FE render preview thật + cho phép insert/handoff. **Đây là chặn lớn nhất.**

### KB2 — [CAO] "Xem chi tiết / Mở" template → cần template THẬT có id + url

**FE hiện:** click "Xem chi tiết" template chỉ mở dialog hiện name/category/codes/why_fit
(chữ). **Không mở được trang vì template chưa tồn tại trong DB.**
**BE cần:** endpoint **dựng template thật từ blueprint** (handoff), trả id + url để FE mở:
```
POST /v1/insights/reports/{id}/handoff
body (optional): { "template": { "name", "block_codes": ["hero_split", …] } }
→ 201 { "template_id": "uuid", "edit_url": "/admin/templates/{id}",
        "preview_url": "/p/{slug}" }
```
→ Sau handoff, "mở template" = điều hướng `edit_url`/`preview_url`. (Block không có trang
riêng — chỉ mở/preview trong template/editor.)

### KB3 — [CAO] "Tìm thủ công" add block + Xoá/Di chuyển → cần LƯU blueprint đã chỉnh

**FE hiện:** "Tìm thủ công" mở modal editor (catalog BE thật) → chọn block → **append vào
state local**. Xoá/di chuyển cũng chỉ local. **F5 là mất, không lưu đâu cả.**
**BE cần:** lưu blueprint đã user chỉnh (block list theo stage, thứ tự, journey):
```
PATCH /v1/insights/reports/{id}/blueprint
body: { "recommended_blocks": { "blocks_by_stage": [ … đã chỉnh … ] },
        "customer_journey": { … } }
→ 200 { "report": { … blueprint đã cập nhật … } }
```
(hoặc tạo version con qua `parent_report_id`.) → Lúc đó add/xoá/move mới persist + chảy
được sang handoff (KB2).

### KB4 — [CAO] "AI tạo nội dung" cho 1 block

**FE hiện:** nút "AI tạo nội dung" → toast placeholder.
**BE cần:**
```
POST /v1/insights/blocks/generate-content
body: { "report_id": "uuid", "block_type_code": "hero_split",
        "stage_key": "vision_immersion" }
→ 200 { "content": { … } }   // payload khớp content_schema của block type
```
→ Content nạp thẳng vào block khi handoff.

### KB5 — [TRUNG] Ảnh preview cho block & template

`/v1/block-types` thêm `preview_image_url` mỗi block; template đề xuất thêm
`preview_image_url`. Không bắt buộc nếu KB1 xong (FE preview bằng renderer), nhưng ảnh thật
đẹp hơn.

### KB6 — [TRUNG] Deploy report PATCH/DELETE xuống dev + bật AI worker dev

- `PATCH`/`DELETE /v1/insights/reports/{id}` có ở prod, **dev 404** → đổi tên/xoá report
  trên dev đang lỗi. Deploy xuống dev.
- AI worker không chạy dev → report kẹt `queued`, không QA trọn vòng được. Bật worker
  dev (hoặc staging).

### KB7 — [THẤP] Create brand-only (workspace optional)

Portal user tạo report không cần `workspace_id` (BE resolve brand từ session). Hiện FE
auto-pick workspace mặc định để né.

---

## 3. Checklist BE
- [ ] **KB1** — recommend_blocks/templates trả `block_type_code` ∈ `/v1/block-types` (+legacy/preview optional).
- [ ] **KB2** — `POST /v1/insights/reports/{id}/handoff` → tạo template thật, trả id + edit_url/preview_url.
- [ ] **KB3** — `PATCH /v1/insights/reports/{id}/blueprint` → lưu blocks/journey đã chỉnh.
- [ ] **KB4** — `POST /v1/insights/blocks/generate-content`.
- [ ] **KB5** — `preview_image_url` cho block-types + template (optional).
- [ ] **KB6** — deploy PATCH/DELETE report xuống dev; bật AI worker dev/staging.
- [ ] **KB7** — create brand-only.

> FE đã dựng sẵn UI + chỗ ráp cho tất cả mục trên (fallback hiện tại: preview→tile,
> generate/handoff→toast, edit blueprint→state local). BE lên mục nào, FE gắn mục đó,
> không phải sửa lại UI.
