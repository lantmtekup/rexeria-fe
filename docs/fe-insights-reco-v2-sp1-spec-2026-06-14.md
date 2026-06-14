# FE spec — AI-Insights Recommendation Core v2 (SP1) — wiring hybrid template

> Ngày: 2026-06-14. Phạm vi: **FE-only**, ráp UI cho hợp đồng SP1 mà BE đã ship.
> Đối chiếu: `be-ReXeR.ai/docs/be-insights-reco-v2-sp1-spec-2026-06-13.md` (spec gốc) và
> `be-ReXeR.ai/docs/openapi.yaml` (hợp đồng — nguồn chân lý). **Không** redesign UI.

## 0. Bối cảnh

BE đã hoàn tất SP1: `recommend_templates` nay trả thêm `source` (`library|composed`),
`template_id` (id template thật khi `library`, rỗng khi `composed`) và `thumbnail_url`.
Handoff nhận `template.source_template_id` → clone `canvas_blueprint` của template thật
và tự điền nội dung nháp cho từng block (G3a).

Vấn đề FE hiện tại: màn Blueprint render template gợi ý dưới dạng card **chỉ-đọc**
(`TemplatesSection` → `TemplateCard`), và nút handoff global gọi
`insights.handoff(report.id)` **không kèm body** → BE luôn đi nhánh compose. Vì vậy phần
"template thật" của BE **vô hình** với người dùng. SP1-FE nối lại mạch này.

## 1. Quyết định đã chốt

| Mục | Quyết định |
|---|---|
| Scope | Wiring chức năng, tái dùng component hiện có, **không** redesign |
| Chọn template | **Nút trên từng card** ("Dùng template này") → handoff ngay template đó |
| Nút global | Giữ nguyên làm lối "tự dựng từ blueprint" (compose) |
| Badge nguồn | `library` → "Template thật"; `composed` → "AI tạo mới" |
| Thumbnail | `thumbnail_url` thật qua `Thumb imageUrl=...` (đã có fallback gradient) |
| Verify | `yarn type-check` + `yarn lint` (FE không có unit runner) |

## 2. Đồng bộ hợp đồng (`src/services/rexer/`)

### 2.1 `types.ts` — `InsightRecommendedTemplate`
Thêm 3 field **optional** (optional để report tạo trước SP1 vẫn hợp lệ):

```ts
source?: 'library' | 'composed';
template_id?: string;        // id thật khi source==='library', '' / thiếu khi composed
thumbnail_url?: string | null;
```

### 2.2 `endpoints.ts` — `insights.handoff`
Nới body khớp `HandoffRequest.template` của openapi:

```ts
body?: { template?: { name?: string; block_codes?: string[]; source_template_id?: string } }
```

Không đổi hành vi ở lớp client (`body ?? {}`).

## 3. Logic handoff (`steps/BlueprintStep.tsx`)

- Thay `handingOff: boolean` bằng `pending: string | null` = key đang handoff
  (key = `tpl.name` cho card; sentinel `'__compose__'` cho nút global) → spinner đúng nút,
  khoá các nút còn lại khi đang chạy (chống double-create).
- `handoff(choice?: InsightRecommendedTemplate)`:
  - **không `choice`** (nút global) → `handoff(report.id)` **không body** → BE compose từ
    blocks của blueprint. *Giữ nguyên hành vi cũ.*
  - **`choice.source === 'library'` và có `choice.template_id`** →
    `{ template: { name, source_template_id: choice.template_id } }` → BE clone template thật.
  - **còn lại (composed / report cũ)** →
    `{ template: { name, block_codes: choice.block_codes } }` → BE compose theo codes.
  - Thành công: như cũ — `toast` + `router.push(r.edit_url)`.
- Truyền `onUse={handoff}` và `pending` xuống `<TemplatesSection>`.

## 4. Card template (`steps/BlueprintBlocks.tsx`)

- `TemplatesSection` nhận thêm `onUse` + `pending`, forward xuống mỗi `TemplateCard`.
- `TemplateCard`:
  - **Thumbnail thật**: `<Thumb imageUrl={tpl.thumbnail_url ?? undefined} … />` (fallback gradient sẵn có).
  - **Badge nguồn**: cạnh category — `library` → `t('blueprint.sourceLibrary')`,
    `composed` → `t('blueprint.sourceComposed')`. Thiếu `source` (report cũ) → không badge.
  - **Nút "Dùng template này"**: footer card → `onUse(tpl)`; spinner khi `pending === tpl.name`;
    disabled khi `pending !== null && pending !== tpl.name`. Dialog "Xem chi tiết" giữ nguyên.

## 5. i18n (`src/i18n/messages/insights/{vi,en}.json`)

Thêm dưới `blueprint.*`: `useTemplate`, `sourceLibrary`, `sourceComposed` (vi mặc định, en mirror).

## 6. Edge cases

- **Report trước SP1** (không có `source`/`template_id`/`thumbnail_url`): card như cũ
  (không badge, thumb gradient); "Dùng template này" rơi vào nhánh composed (gửi `block_codes`) — an toàn.
- **`library` nhưng `template_id` rỗng** (đáng lẽ không xảy ra sau sanitize BE): rơi nhánh composed, không vỡ.
- **Khoá 1 handoff tại một thời điểm** (`pending` global) → tránh tạo trùng.

## 7. Ngoài phạm vi

- Redesign UI blueprint; SP2 (A/B variants), SP3 (conversational refine), SP4 (learning).
- Preview render canvas_blueprint trong card (chỉ thumbnail ảnh, chưa render block thật).
