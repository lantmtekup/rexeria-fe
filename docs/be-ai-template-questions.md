# BE Questions — AI Template & Content Generation

**Module:** AI Template & Content Generation
**Spec ref:** `Rexer_Cap_nhat_tinh_nang_va_logic.pdf` v1.0 (13/05/2026)
**Swagger:** https://prayers-recommendation-recent-cave.trycloudflare.com/swagger/index.html
**FE owner:** @Lantm
**Status:** ✅ BE đã ship P0 + P1 patches (Q2, Q3, Q17, Q22) — xem `Downloads/be-ai-template-patches (1).md`. FE đã wire toàn bộ, không còn workaround. P2 (Q5/Q14/Q23) defer theo handover §7.

---

## ✅ FE acknowledgement — final priorities

**P0 — BE ship sớm (FE đã forward-compat sẵn):**
- **Q2** `details.missing_fields[]` trong `ERR_AI_TEMPLATE_MISSING_REQUIRED`
  → FE đã đọc field này qua `parseAITemplateError()`, hiển thị danh sách label trong toast của `AIInputFormDialog`. Khi BE chưa ship, fallback dùng `message`. Không cần rework FE khi BE ship.
- **Q3** `details.{used, limit}` trong `ERR_AI_TEMPLATE_REGEN_LIMIT`
  → FE đã đọc qua `RegenerateBlockDialog.onLimitReached` → snap counter Review page. Khi BE chưa ship, FE count client-side từ `versions.filter(kind !== 'initial').length`.

**P1 — cần để UX hoàn chỉnh:**
- **Q17** batch `GET /v1/media?ids[]=` resolve thumbnail từ `image_suggestions`.
  → FE hiện gọi `rexerApi.media.get(id)` cho từng id trong `ImageSuggestionDialog`. Workable nhưng chậm khi 5+ suggestions/block.
- **Q22** `POST /v1/admin/ai/templates/{id}/test-generate`.
  → FE reserve nút "Test prompt" trong `BlockPromptRow` (TODO comment). Workaround tạm: admin set `is_active=true` để test, sau đó tắt.

**P2 — defer (không block UX phase 1):**
- **Q5** rename source enum → **không cần**. FE đã wire enum BE (`ai/stub/skipped/kept`).
- **Q14** `inferred_context` per-version → chỉ cần khi build debug panel admin.
- **Q23** restore sau soft-delete → UX phase 1 không có nút restore.

**Action BE:**
1. Ship Q2 + Q3 cùng patch (~10 LOC).
2. Schedule Q17 + Q22 patch kế.
3. Skip Q5; Q14/Q23 defer.

FE sẵn sàng test integration ngay khi BE seed template QC env + tunnel ổn.

---

## Mục đích (câu hỏi gốc)

FE đã đối chiếu BE update (9 endpoints `/ai/templates/*` + `/admin/ai/templates/*`) với spec PDF. Câu hỏi gốc giữ lại để truy ngược context — câu trả lời chi tiết của BE lưu trong chat thread; các quyết định chốt đã đưa vào "FE acknowledgement" ở trên.

---

## 1. Error response format

Spec PDF §8 nhắc tới 2 mã lỗi nghiệp vụ:
- `ERR_AI_TEMPLATE_MISSING_REQUIRED` (khi required field bị bỏ trống)
- `ERR_AI_TEMPLATE_REGEN_LIMIT` (khi vượt 10 lần regenerate/session)

Swagger chỉ thấy HTTP status (400, 429) chưa thấy body schema.

**Câu hỏi:**
1. Body của 400 / 429 có shape thế nào? FE cần mẫu cụ thể, ví dụ:
   ```json
   {
     "error": {
       "code": "ERR_AI_TEMPLATE_MISSING_REQUIRED",
       "message": "...",
       "details": { "missing_fields": ["product_name", "price_range"] }
     }
   }
   ```
2. Khi `ERR_AI_TEMPLATE_MISSING_REQUIRED` BE có trả về danh sách `missing_fields` (mảng `field_key`) để FE highlight ô input không? Hay chỉ message chung?
3. `ERR_AI_TEMPLATE_REGEN_LIMIT` có trả về `used`, `limit`, `reset_at` không? FE cần để hiển thị "Bạn đã dùng 10/10 lần regenerate".
4. Có còn mã lỗi nghiệp vụ nào khác (`ERR_AI_TEMPLATE_*`) ngoài 2 mã trên không? Ví dụ `ERR_AI_TEMPLATE_INACTIVE`, `ERR_AI_TEMPLATE_FIELD_LOCKED`?

---

## 2. Block.source — badge "AI-generated"

Spec §8.18 yêu cầu mỗi block trong response có dấu hiệu để FE hiển thị icon "AI-generated" cho phần do AI sinh.

**Câu hỏi:**
5. Mỗi block trong `AITemplateGenerateResponse.blocks[]` có field `source` không? Enum gồm những giá trị nào?
   - Đề xuất: `"user_input" | "ai_inferred" | "ai_generated" | "ai_regenerated"`
6. Granularity ở mức nào — toàn block (1 source/block), hay từng field bên trong block (mỗi field con có source riêng)?

   Ví dụ block `hero` có cả `headline` (AI gen) và `image_id` (user chọn) — FE cần biết riêng từng phần để badge đúng chỗ.

---

## 3. Regenerate limit & session lifecycle

Spec §8.20 đề xuất 10 lần regenerate/session.

**Câu hỏi:**
7. Limit chính xác là bao nhiêu? 10 lần/session hay 10 lần/template/user/ngày?
8. Limit tính theo `regenerate` block riêng lẻ, hay cả full re-`generate`? Ví dụ:
   - User gen lần đầu → version 1
   - Regenerate block hero → version 2 (tính 1)
   - Regenerate block faq → version 3 (tính 2)
   - User submit form lại với input mới → version 4 (có tính không?)
9. Session timeout — sau bao lâu không hoạt động thì `inferred_context` bị clear? (Spec §12 hỏi câu này nhưng chưa quyết.)
10. Khi user "Suy luận lại" (spec §8.17) — FE gọi endpoint nào? Param nào để báo "discard inferred_context cũ"? Đề xuất một flag `reset_context: true` trong request `/generate`.

---

## 4. Generate request schema

**Câu hỏi:**
11. Body của `POST /ai/templates/{id}/generate` cụ thể có những field nào? Đặc biệt:
    - `user_input`: object map `{ field_key: value }` hay array `[{ field_key, value }]`?
    - `regenerate`: optional object `{ block_id, hint, session_id }` — khi có thì BE hiểu là regenerate, khi không thì là gen mới?
    - `session_id` riêng có optional ở root để continue session không?
    - `language`: enum `"vi" | "en"` (spec §2.2 only support 2 languages)?
12. `data_type: "image"` trong Input Schema — user gửi gì? `media_id` từ media library, URL, hay base64?
13. `data_type: "select"` — `options` trong field schema có shape ra sao? `[{ value, label }]` hay `string[]`?

---

## 5. Session/Version response

Spec §8.19 yêu cầu list version để rollback.

**Câu hỏi:**
14. `GET /ai/templates/sessions/{sessionId}` trả về `versions[]` — mỗi version có đủ `blocks` content để FE render preview, hay chỉ metadata (cần gọi thêm endpoint khác để load nội dung)?
15. Có endpoint riêng để **rollback** sang version cũ không? Ví dụ `POST /ai/templates/sessions/{sessionId}/rollback` với body `{ version: 3 }`? Hay rollback là client-side (FE chỉ lấy version cũ rồi render lại)?
16. `inferred_context` lưu ở session-level (1 lần cho cả session) hay per-version (mỗi version có context riêng)?

---

## 6. Image suggestions

Spec §6.5 nói recommend 3–5 ảnh từ media library.

**Câu hỏi:**
17. `image_suggestions[]` trong response generate có shape gì?
    Đề xuất:
    ```json
    {
      "block_id": "block_06",
      "suggestions": [
        { "media_id": "...", "url": "...", "thumbnail_url": "...", "score": 0.92, "tags": ["healthy", "fresh"] }
      ]
    }
    ```
18. Suggestion gắn theo block (mỗi block có image có suggestions riêng) hay theo cả template (1 pool dùng chung)?
19. Khi user pick 1 ảnh từ suggestion — FE chỉ patch trong client, hay gọi BE endpoint nào để "lock" lựa chọn vào version?

---

## 7. Admin template builder

**Câu hỏi:**
20. `POST /admin/ai/templates` — body có cần đủ 10 block ngay từ lúc create không? Hay BE auto-fill skeleton 10 block trống theo role rồi admin edit sau qua PATCH?
21. PATCH endpoint có support partial update field-level (vd chỉ update `prompt_instruction` của 1 block) hay phải gửi toàn bộ template body?
22. Có endpoint để **test prompt** trước khi save template không? Ví dụ admin viết xong prompt cho block hero, bấm "Test gen" để xem AI sinh ra gì với input mẫu? Nếu có là endpoint nào?
23. Soft delete hay hard delete? `DELETE /admin/ai/templates/{id}` xong template còn restore được không?
24. Admin có set được `is_active` qua PATCH, hay phải có endpoint riêng `POST /admin/ai/templates/{id}/activate`?

---

## 8. QC seed

BE update message nhắc "QC seed template với 10 block preview/edit".

**Câu hỏi:**
25. Seed template hiện có `id` cố định không? FE có thể hard-code id này cho dev/QA env không?
26. Seed có sẵn cả prompt instruction + few-shot examples (spec §5.3) chưa, hay chỉ skeleton block?

---

## 9. Streaming / progress

Spec §9 yêu cầu hiển thị progress (10 block trong ≤15s).

**Câu hỏi:**
27. `POST /ai/templates/{id}/generate` là sync (block đến khi đủ 10 block, sau đó trả full response) hay có support streaming (SSE/WebSocket trả từng block khi xong)?
28. Nếu sync và mất ~15s, BE có set timeout cao hơn 15s ở proxy/gateway không? FE cần biết để set `fetch` timeout phù hợp.

---

## 10. Brand Kit & multi-language

Spec §12 nhắc câu hỏi mở:

**Câu hỏi:**
29. Phase này request `/generate` có nhận `language: "vi" | "en"` không? Default là gì?
30. Brand Kit (logo, màu, font) có được pass vào request `/generate` ở phase này không? Hay phase sau? Nếu có, schema thế nào?

---

## Ưu tiên trả lời

FE đề xuất ưu tiên trả lời nhóm câu hỏi này trước để có thể wire-up MVP:

**P0 (block FE):**
- #1, #2, #3 (error format) — để handle UI báo lỗi
- #5, #6 (block.source) — để render badge
- #11 (generate request shape) — để build form submit
- #14, #15 (session/version response + rollback) — để build history panel

**P1 (block UI hoàn chỉnh):**
- #7, #8, #10 (regenerate limit semantics)
- #17, #18, #19 (image suggestions)
- #22 (admin test prompt)

**P2 (có thể defer):**
- #25, #26 (QC seed)
- #27, #28 (streaming)
- #29, #30 (i18n & brand kit)

---

## Phụ lục — refs

- Spec PDF: §4 luồng nghiệp vụ, §5 cấu trúc dữ liệu, §6 logic AI Service, §8 quy tắc nghiệp vụ
- Swagger: 5 user endpoints + 4 admin endpoints đã liệt kê
- FE tracking: `src/services/rexer/endpoints.ts`, `src/services/rexer/types.ts` (chưa có group `aiTemplates`)
