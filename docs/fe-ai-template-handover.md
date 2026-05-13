# FE Handover — AI Template & Content Generation

**Spec:** `Rexer_Cap_nhat_tinh_nang_va_logic.pdf` v1.0 (13/05/2026)
**BE swagger:** https://prayers-recommendation-recent-cave.trycloudflare.com/swagger/index.html
**BE Q&A:** `docs/be-ai-template-questions.md`
**Status:** FE phase 1 done — chờ BE ship patch Q2 + Q3 (P0) trước khi gỡ workaround.

---

## 1. Tóm tắt

Module thêm lớp AI vào hệ Template: user nhập tối thiểu → BE suy luận field thiếu → sinh 10 block + gợi ý ảnh; user preview/edit/regenerate per block, mỗi lần gen lưu thành version.

FE chia 2 nhóm: **user flow** (list/form/review) và **admin builder** (CRUD template + input schema + prompt context).

---

## 2. Routes

| Path | Loại | Component |
|---|---|---|
| `/ai-templates` | user | `AITemplateList` (`CanvasTemplate/ai/`) |
| `/ai-templates/[id]/review?session={sid}` | user | `app/(app)/ai-templates/[id]/review/page.tsx` |
| `/admin/ai-templates` | admin (CMS) | `AdminAITemplateList` |
| `/admin/ai-templates/new` | admin | `AdminAITemplateForm` (create) |
| `/admin/ai-templates/[id]/edit` | admin | `AdminAITemplateForm` (edit) |

Admin route gated bởi `AdminGuard` (redirect `/sign-in` nếu chưa login admin).

---

## 3. Component map

```
src/services/rexer/
  types.ts                       ← AITemplate, AITemplateField, AITemplateBlock,
                                   AITemplateBlockPrompt, AIGeneratedBlock,
                                   AIGenerationVersion, AIGenerationSession,
                                   Create/UpdateAITemplateRequest, error codes
  endpoints.ts                   ← rexerApi.aiTemplates.{list,get,generate,session}
                                   rexerApi.adminAiTemplates.{list,get,create,update,remove}
  __mocks__/aiTemplates.ts       ← Fixture "Giới thiệu sản phẩm mới"
                                   (id f2f2f2f2-0000-…0001 match BE seed)

src/components/modules/CanvasTemplate/ai/
  DynamicSchemaForm.tsx          ← Build zod schema runtime từ AITemplateField[]
  AITemplateList.tsx             ← User-side card grid + open input form dialog
  BlockReviewCard.tsx            ← Render 1 block + edit inline + regenerate button
  VersionHistoryDrawer.tsx       ← Slide-in right, list versions + restore
  errors.ts                      ← parseAITemplateError() — forward-compat
                                   reader cho details.missing_fields / used / limit

src/components/dialogs/
  AIInputFormDialog.tsx          ← Modal sau pick template — render DynamicSchemaForm
                                   → POST /generate → cache result vào sessionStorage
                                   → route sang /review?session=
  RegenerateBlockDialog.tsx      ← Hint optional → POST /generate kèm
                                   { session_id, regenerate.{block_id, hint} }
  ImageSuggestionDialog.tsx      ← Grid ảnh AI suggest; fetch metadata bằng
                                   rexerApi.media.get(id) cho từng id

src/components/modules/Admin/AdminAITemplates/
  AdminAITemplateList.tsx        ← Table + filter is_active + CRUD entry
  AdminAITemplateForm.tsx        ← 3 section: Basic / Input Schema / Blocks+Prompts
                                   submit gửi 3 array (fields, blocks, block_prompts)

src/app/(app)/ai-templates/
  page.tsx                       ← User list
  [id]/review/page.tsx           ← Review page (client component)

src/app/(cms)/admin/ai-templates/
  page.tsx                       ← Admin list
  new/page.tsx                   ← Admin create
  [id]/edit/page.tsx             ← Admin edit (load detail → AdminAITemplateForm)

src/i18n/messages/ai_templates/
  vi.json | en.json              ← Namespace ai_templates (registered in request.ts)
```

---

## 4. Data flow

### User flow

```
[/ai-templates]
   ↓ click card
AIInputFormDialog
   - rexerApi.aiTemplates.get(id)
   - render DynamicSchemaForm (zod runtime from fields[])
   ↓ submit
   - coerceUserInput() → { string | number | boolean }
   - rexerApi.aiTemplates.generate(id, { user_input, lang: 'vi' })
   - sessionStorage.setItem('aitpl:gen:{sid}', { template_id, user_input, result })
   ↓ router.push
[/ai-templates/[id]/review?session={sid}]
   - loadCache(sid) → render ngay
   - fallback rexerApi.aiTemplates.session(sid) khi user F5
   - 10 BlockReviewCard
     - badge theo source: ai / stub / kept / skipped
     - Edit inline → local state
     - Regenerate → RegenerateBlockDialog
       - POST /generate { session_id, regenerate.{block_id, hint?} }
       - 429 → onLimitReached(used, limit) → counter snap
     - Pick image (role=image hoặc layout_type=mixed)
       - ImageSuggestionDialog fetch metadata
       - On pick → block.image_media_ids = [media_id]
   - Version history drawer
     - rexerApi.aiTemplates.session(sid) → versions[]
     - Restore = client-side state swap (BE Q15: append-only, không có rollback endpoint)
   - Confirm & Save (stub) → BE/PO TBD
```

### Admin flow

```
[/admin/ai-templates]
   - rexerApi.adminAiTemplates.list({ is_active?, q?, page, limit })
   ↓ click "Tạo mới" / pencil
[/admin/ai-templates/new | [id]/edit]
   - AdminAITemplateForm
     - state: { name, description, topic, is_active,
                fields[], blocks[], block_prompts[], version }
     - 3 section:
       Basic        → name/description/topic/is_active
       Input Schema → CRUD AITemplateField[] (key, label, data_type,
                      is_required, ai_can_infer, placeholder,
                      mapped_blocks[], options[] cho select)
       Blocks       → 10 block fixed-role; mỗi block 1 BlockPromptRow
                      (prompt_instruction, tone, length_constraint,
                       required_fields[], examples[])
   ↓ submit
   - Create: POST /admin/ai/templates { fields, blocks, block_prompts, ... }
              (BE Q20: cần đủ 10 block + 10 prompt + ≥1 field)
   - Update: PATCH /admin/ai/templates/{id}
              { version, fields, blocks, block_prompts, ... }
              (BE Q21: optimistic lock; children replace-all)
   - 409 ERR_CANVAS_VERSION_CONFLICT → toast yêu cầu refresh
```

---

## 5. BE contract quick reference

Đầy đủ trong `docs/be-ai-template-questions.md`. Tóm tắt:

- **Error envelope:** `{ code, message, request_id, details? }` (chuẩn `RxApiError`).
- **Block.source enum:** `ai | stub | skipped | kept`.
- **user_input:** `Record<field_key, string | number | boolean>`. Key lạ → 400.
- **lang:** `"vi" | "en"`, default `vi`.
- **regenerate:** `{ block_id?, hint?, reinfer? }`. `reinfer: true` ưu tiên hơn `block_id`.
- **Session:** append-only versions; mỗi version có `kind: initial | regenerate_block | reinfer`, `target_block_id?`, full `blocks[]`, `image_suggestions: Record<block_id, media_id[]>`.
- **Regen limit:** 10/session (hằng số BE, không có TTL reset).
- **Admin POST/PATCH:** 3 array bắt buộc (`fields[]`, `blocks[]`, `block_prompts[]`); PATCH cần `version`.
- **Options của select:** `string[]` (BE accept cả `{value,label}` nhưng FE dùng string flat).

---

## 6. Mock fixture (dev/QC)

Bật/tắt qua env var:

```
# .env.local
NEXT_PUBLIC_AI_TEMPLATE_MOCK=1   # dùng fixture in-memory
NEXT_PUBLIC_AI_TEMPLATE_MOCK=0   # gọi BE thật
```

Fixture (`src/services/rexer/__mocks__/aiTemplates.ts`):
- 1 template "Giới thiệu sản phẩm mới", id `f2f2f2f2-0000-0000-0000-000000000001` (trùng BE QC seed).
- Generate giả lập 1s latency, lưu session in-memory để Version drawer hoạt động cross-render.
- `image_suggestions` trỏ tới `mock-media-*` id (sẽ fail khi ImageSuggestionDialog fetch metadata — đây là behavior đúng vì mock không có media store; bật BE thật để xem ảnh).

Sau khi BE QC env ổn, đổi flag → `0` và restart `npm run dev`. Không cần đổi gì khác trong code.

---

## 7. Trạng thái BE patches

BE đã ship **P0 + P1** (Q2, Q3, Q17, Q22). FE đã wire — không còn workaround:

| BE patch | Status | FE đã wire |
|---|---|---|
| Q2 `details.missing_fields[]` | ✅ shipped | `parseAITemplateError()` đọc `'missing_fields' in parsed`; `AIInputFormDialog` resolve label theo `field_key` và hiển thị trong toast |
| Q3 `details.{used, limit}` | ✅ shipped | `RegenerateBlockDialog.onLimitReached` snap về Review page state; fallback client count vẫn dùng cho UI giữa các lần gen thành công |
| Q17 batch `GET /media?ids=…` | ✅ shipped | `rexerApi.media.list({ ids })` builds repeated `?ids=` params; `ImageSuggestionDialog` đổi từ loop N calls sang 1 call và preserve BE relevance order |
| Q22 admin test-generate | ✅ shipped | `rexerApi.adminAiTemplates.testGenerate(id, body)`; nút "Test prompt" trong `AdminAITemplateForm` BlocksSection mở `AdminTestPromptDialog` (chỉ hiện ở edit mode, vì cần template id) |

### Defer / skip
- **Q5** rename source enum — bỏ. FE đã wire enum BE.
- **Q14** `inferred_context` per-version — defer (chỉ cần khi build admin debug panel).
- **Q23** restore sau soft-delete — defer (UX phase 1 không có nút restore).

### TODO ngoài BE
Đây là việc cần product/PO chốt, không phải BE:

- **Final save endpoint** trong `review/page.tsx` `handleConfirmSave` — chưa biết lưu vào template entity nào, payload shape ra sao. Hiện toast stub. Cần spec.

---

## 8. Testing

### Playwright E2E
- `tests/e2e/ai-templates.spec.ts` (3 tests) — user flow
  - list → form → submit → review (assert 10 blocks + counter)
  - regenerate dialog opens
  - version history drawer opens
- `tests/e2e/admin-ai-templates.spec.ts` (3 tests) — admin
  - list page renders
  - builder shows 3 sections + 10 block skeleton
  - add field row
- `tests/e2e/admin-section.spec.ts` — updated count 6 → 7 sau khi thêm tab

Run: `npx playwright test ai-templates.spec.ts admin-ai-templates.spec.ts admin-section.spec.ts`

Test mặc định chạy với `NEXT_PUBLIC_AI_TEMPLATE_MOCK=1` để deterministic.

### Manual test checklist (khi BE QC env stable)
1. `MOCK=0`, login admin, vào `/admin/ai-templates` — thấy seed template
2. Click pencil → form load 3 section đầy đủ
3. Bấm Lưu (không đổi gì) → 200 OK, version +1
4. Logout admin, login user, vào `/ai-templates` — thấy template
5. Click card → form 10 field, badge required/AI có thể suy luận
6. Điền 5 required → submit → ~5-15s loading → vào review page
7. 10 block hiện, badge "AI" trên mỗi block
8. Edit inline 1 field, regenerate 1 block với hint
9. Mở Version drawer → thấy v1, v2 → Khôi phục v1 → blocks revert
10. Submit lại form nhưng để trống 1 required → toast hiện tên field thiếu (sau khi BE ship Q2)
11. Regen 10 lần → lần 11 toast "đã đạt limit" với counter chính xác (sau khi BE ship Q3)

---

## 9. Files thay đổi (tổng kết)

**New:**
- `src/services/rexer/__mocks__/aiTemplates.ts`
- `src/components/modules/CanvasTemplate/ai/{DynamicSchemaForm,AITemplateList,BlockReviewCard,VersionHistoryDrawer,errors}.tsx,.ts`
- `src/components/dialogs/{AIInputFormDialog,RegenerateBlockDialog,ImageSuggestionDialog}.tsx`
- `src/components/modules/Admin/AdminAITemplates/{AdminAITemplateList,AdminAITemplateForm}.tsx`
- `src/app/(app)/ai-templates/page.tsx`, `[id]/review/page.tsx`
- `src/app/(cms)/admin/ai-templates/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`
- `src/i18n/messages/ai_templates/{vi,en}.json`
- `tests/e2e/{ai-templates,admin-ai-templates}.spec.ts`
- `docs/{be-ai-template-questions,fe-ai-template-ui-plan,fe-ai-template-handover}.md`

**Modified:**
- `src/services/rexer/types.ts` — bổ sung 20+ type AI Template
- `src/services/rexer/endpoints.ts` — thêm 2 group endpoints
- `src/components/modules/Admin/AdminNav.tsx` — thêm tab "AI Template"
- `src/i18n/{request.ts,messages/admin/{vi,en}.json}` — register namespace + nav label
- `tests/e2e/admin-section.spec.ts` — nav count 6 → 7
- `.env.local` — `NEXT_PUBLIC_AI_TEMPLATE_MOCK`

---

## 10. Liên hệ

- FE: @Lantm
- BE: xem `docs/be-ai-template-questions.md` (chat thread chứa câu trả lời chi tiết)
- PO: cần chốt "final save" sau review (TODO §7)
