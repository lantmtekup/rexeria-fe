# FE UI Plan — AI Template & Content Generation

**Spec:** `Rexer_Cap_nhat_tinh_nang_va_logic.pdf` v1.0
**BE:** Swagger 9 endpoints `/ai/templates/*` + `/admin/ai/templates/*`
**BE questions doc:** `docs/be-ai-template-questions.md`

---

## Hiểu đúng scope

**Không đổi UI hiện tại:**
- ❌ Không rewrite canvas/block editor
- ❌ Không làm lại trang list template ở user
- ❌ Không build module song song

**Chỉ thêm 3 thứ mới:**
1. **[User]** Form nhập input động sau khi chọn template (render từ `input_schema`)
2. **[User]** Trang **Review** sau khi AI gen — preview 10 block, edit inline, regenerate per block, version history/rollback
3. **[Admin]** UI quản lý `input_schema` + `ai_prompt_context` per block trong admin builder hiện có

**Sau khi user confirm ở Review → lưu theo flow template cũ** (không phá vỡ entity hiện có).

---

## User flow

```
[Library template hiện tại]
       ↓ pick template
       
   Template có input_schema?
   ┌─ KHÔNG → flow cũ (vào canvas editor, user tự nhập)
   └─ CÓ ↓
       
[1. Input Form modal/page]   ← NEW, render động theo input_schema
       ↓ submit
       
   POST /ai/templates/{id}/generate
       ↓
       
[2. Review page]   ← NEW
   - 10 block preview
   - Badge "AI-generated" per block (theo source)
   - Edit inline
   - Nút "Regenerate" per block (có hint optional)
   - Drawer "Version history" + rollback
   - Inferred context viewer (optional, P1)
       ↓ user "Confirm & Save"
       
[Canvas editor cũ]   ← reuse, blocks đã được lưu thành template instance
```

## Admin flow

```
[Admin template builder hiện tại]
       ↓
       Thêm 2 panel mới:
       
[Panel "Input Schema"]   ← template-level
   - CRUD field: field_key, label, data_type, is_required,
     ai_can_infer, placeholder, mapped_blocks, options
     
[Panel "AI Prompt Context"]   ← per-block (gắn trong ElementToolbar)
   - prompt_instruction, tone, length_constraint, 
     required_fields (chọn từ schema), examples (few-shot)
```

---

## Phase plan

### Phase 0 — Foundation (1 ngày, không cần BE confirm)

| Hạng mục | File |
|---|---|
| Types | `src/services/rexer/types.ts` — bổ sung `AITemplate`, `AITemplateField`, `AITemplateBlock`, `AIGenerateRequest/Response`, `AIGenerationSession`, `AIGenerationVersion`, `AIImageSuggestion` |
| Endpoints | `src/services/rexer/endpoints.ts` — thêm group `aiTemplates` (5 user method) + extend admin (4 method) |
| Mock fixtures | `src/services/rexer/__mocks__/aiTemplates.ts` — 1-2 template mẫu để dev không bị block |
| Feature flag | `NEXT_PUBLIC_AI_TEMPLATE_MOCK=1` để toggle |
| i18n namespace | `src/i18n/messages/ai_templates/{vi,en}.json` |

### Phase 1 — User: Input Form (1.5–2 ngày)

| Component | Path |
|---|---|
| `AIInputFormDialog` | `src/components/dialogs/AIInputFormDialog.tsx` — modal sau khi pick template, fetch detail → render form |
| `DynamicSchemaForm` | `src/components/modules/CanvasTemplate/ai/DynamicSchemaForm.tsx` — core component render field theo `data_type` (text/number/textarea/select/image), build zod schema runtime từ `is_required` |
| Trigger detection | Sửa chỗ pick template trong `CanvasTemplateList.tsx` (hoặc tương đương): nếu template có `input_schema` → mở `AIInputFormDialog` thay vì vào editor ngay |
| Submit handler | Call `rexerApi.aiTemplates.generate(id, payload)` → nhận `session_id` → điều hướng sang Review page |

### Phase 2 — User: Review page (3–4 ngày)

| Component | Path |
|---|---|
| Route | `src/app/(app)/ai-templates/[id]/review/page.tsx` (client component) |
| `BlockReviewList` | `src/components/modules/CanvasTemplate/ai/BlockReviewList.tsx` — render 10 block, drag-handle disabled (giữ position cố định) |
| `BlockReviewCard` | `src/components/modules/CanvasTemplate/ai/BlockReviewCard.tsx` — 1 block: nội dung + badge `source` + 3 nút (Edit / Regenerate / Image picker nếu role=image) |
| `RegenerateBlockDialog` | `src/components/dialogs/RegenerateBlockDialog.tsx` — modal nhập hint optional, call `/generate` với `regenerate.block_id` |
| `ImageSuggestionDialog` | `src/components/dialogs/ImageSuggestionDialog.tsx` — grid 3-5 ảnh từ `image_suggestions`, tab fallback "Browse media library" |
| `VersionHistoryDrawer` | `src/components/modules/CanvasTemplate/ai/VersionHistoryDrawer.tsx` — slide-in right, list versions, click → preview snapshot, nút "Restore" |
| Regenerate counter | Badge "x/10 lần regenerate" trên toolbar review page |
| Confirm & Save | Nút bottom — chuyển sang canvas editor cũ với blocks đã chốt (lưu theo template entity cũ — confirm với BE shape payload) |

### Phase 3 — Admin: Input Schema + Prompt Context builder (3–4 ngày)

| Component | Path |
|---|---|
| `InputSchemaPanel` | `src/components/modules/CanvasTemplate/admin/InputSchemaPanel.tsx` — tab/panel trong builder hiện có, list field + AddFieldDialog |
| `FieldEditorDialog` | `src/components/dialogs/AIFieldEditorDialog.tsx` — form: field_key, label, data_type select, is_required toggle, ai_can_infer toggle, placeholder, options (nếu data_type=select), mapped_blocks multi-select |
| `BlockPromptSection` | Thêm vào `ElementToolbar.tsx` hoặc properties panel hiện có — accordion "AI Prompt": prompt_instruction (textarea), tone (select), length_constraint, required_fields (multi-select từ schema đã có), examples (textarea array) |
| Admin endpoint integration | Wire CRUD qua `rexerApi.admin.aiTemplates.*` |

### Phase 4 — Polish (1–1.5 ngày)

- Empty state, loading skeleton
- Error UI cho 400 `ERR_AI_TEMPLATE_MISSING_REQUIRED` (highlight field) và 429 `ERR_AI_TEMPLATE_REGEN_LIMIT`
- Progress UI khi gen (≤15s theo spec §9)
- Mobile responsive form
- i18n keys hoàn chỉnh
- Toast success/error

---

## Tổng effort: ~10–13 ngày (1 dev FE)

| Phase | Effort | Block bởi BE? |
|---|---|---|
| 0 — Foundation | 1d | Không |
| 1 — Input Form | 1.5–2d | Không (mock được) |
| 2 — Review page | 3–4d | Cần BE confirm error code, block.source, regenerate body, version response |
| 3 — Admin builder | 3–4d | Không (mock được) |
| 4 — Polish | 1–1.5d | Cần BE live |

---

## Phụ thuộc BE clarifications (`docs/be-ai-template-questions.md`)

**P0 — block Phase 2:**
- #1–4 error format
- #5–6 `block.source` enum + granularity
- #11 generate request shape
- #14–16 session/version response + rollback

**P1 — nice to have:**
- #7–10 regenerate limit semantics
- #17–19 image suggestions shape
- #22 admin test prompt endpoint

---

## Đề xuất bước kế tiếp

1. **Ship ngay Phase 0** — không đợi BE, types + endpoints + mock + i18n skeleton, 1 ngày
2. **Song song:** gửi `be-ai-template-questions.md` cho BE
3. **Start Phase 1** — input form, có thể chạy hoàn toàn với mock
4. **Khi BE confirm P0 questions →** Phase 2 (Review)
5. **Có thể parallel** Phase 3 (Admin builder) ngay từ tuần 1 nếu có 2 dev
