# BE Spec — AI Block Content Generation

**Mục tiêu**: thêm endpoint `POST /v1/ai/block-content` cho phép FE block-editor (`/canvas-templates/[id]`) sinh nội dung tự động cho từng loại block bằng LLM, tập trung quản lý API key + billing + audit ở BE thay vì gọi trực tiếp từ FE/Next.

**Base**: `/v1`
**Auth**: `CookieAuth` (giống các `/ai/*` hiện có)
**Convention**: `snake_case` JSON, response envelope chuẩn REXER.
**Error body**: reuse `pkg_http.ErrorBody`.

> **Vì sao cần endpoint mới (không reuse `ai.landingDraft` / `ai.productEnrich`):**
> - `landingDraft` yêu cầu `product_id + template_version_id` — block editor mới của Canvas Template không có 2 trường đó.
> - `productEnrich` xoay quanh enrich product profile, không sinh content theo schema block cụ thể.
> - Block editor cần response có shape **đúng theo từng `block_type`** (hero_split, hero_overlay, feature_section, photo_gallery, booking_form, cta_section). Mỗi block có schema khác nhau và FE phải parse được ngay.
> - Tập trung 1 endpoint chuẩn → FE cache prompt, BE cache LLM call (prompt caching), DevOps theo dõi 1 metric duy nhất.

---

## 0. Mục lục

1. [Scope](#1-scope)
2. [Endpoint](#2-endpoint)
3. [Request body](#3-request-body)
4. [Response body](#4-response-body)
5. [Block content schemas (6 loại)](#5-block-content-schemas-6-loại)
6. [LLM mapping (gợi ý implementation)](#6-llm-mapping-gợi-ý-implementation)
7. [Validation & error codes](#7-validation--error-codes)
8. [Rate limit & quota](#8-rate-limit--quota)
9. [Logging & audit](#9-logging--audit)
10. [Acceptance criteria](#10-acceptance-criteria)
11. [FE integration](#11-fe-integration)
12. [Open questions](#12-open-questions)

---

## 1. Scope

| Phase | Phạm vi |
|---|---|
| **MVP** | 1 endpoint sinh content cho 6 block types (hero_split, hero_overlay, feature_section, photo_gallery, booking_form, cta_section), LLM call + prompt caching, return JSON đúng schema. |
| **Phase 2** | Streaming response (SSE), cache trong DB / Redis theo `(block_type, prompt_hash, lang)` để hit lại không phải call LLM. |
| **Phase 3** | Multi-block batch (`POST /v1/ai/block-content/batch` sinh nhiều block 1 lần cho 1 page). |

---

## 2. Endpoint

```
POST /v1/ai/block-content
```

**Headers**:
- `Cookie`: session (CookieAuth) — required.
- `Content-Type: application/json`

**Status codes**:
- `200 OK` — content sinh thành công.
- `400 BAD_REQUEST` — payload không hợp lệ (xem §7).
- `401 UNAUTHORIZED` — chưa đăng nhập.
- `429 TOO_MANY_REQUESTS` — vượt rate limit (xem §8).
- `502 BAD_GATEWAY` — LLM upstream lỗi.
- `504 GATEWAY_TIMEOUT` — LLM phản hồi quá chậm (>15s).

---

## 3. Request body

```json
{
  "block_type": "feature_section",
  "prompt": "viết lại ngắn gọn hơn, giữ icon hiện tại",
  "lang": "vi",
  "current_content": {
    "eyebrow": "TIỆN ÍCH ĐỒNG BỘ",
    "title": "Không Gian Sống Hiện Đại Và Tiện Nghi",
    "description": "Thiết kế tối ưu tiện ích nội khu...",
    "features": [
      { "icon": "Building2", "label": "Thiết Kế Thông Minh", "body": "Diện tích sàn 85m² tối ưu công năng." },
      { "icon": "Leaf", "label": "Không Gian Xanh", "body": "30% diện tích cây xanh và công viên." },
      { "icon": "ShieldCheck", "label": "An Toàn Vượt Trội", "body": "Hệ thống camera và bảo vệ 24/7." },
      { "icon": "Compass", "label": "Giao Thông Thuận Lợi", "body": "Cách trung tâm 5km, gần cao tốc." }
    ]
  },
  "selected_field": "description",
  "block_name": "Tiện ích nổi bật"
}
```

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `block_type` | enum string | ✅ | Một trong 6 giá trị (xem §5). |
| `prompt` | string | ✅ | Mô tả tự nhiên do user nhập. Trim → ≥ 3 ký tự sau trim. Giới hạn 2000 ký tự. |
| `lang` | enum string | ❌ | `'vi'` (mặc định) hoặc `'en'`. |
| `current_content` | object | ❌ | Full content hiện tại của block (theo schema §5 cho `block_type`). Cho phép AI **rewrite trong context** thay vì sinh từ đầu. Khi user bảo "viết lại ngắn gọn hơn" / "đổi giọng văn nghiêm túc hơn" → AI cần bản gốc để giữ cấu trúc. |
| `selected_field` | string | ❌ | Field key user đang focus (`title`, `description`, `eyebrow`, `ctaText`, `features`, …). Khi có, AI ưu tiên rewrite trường này, các trường khác giữ nguyên semantics. |
| `block_name` | string | ❌ | Tên hiển thị của block (do user đặt). Hint phụ cho prompt. |

**Backward compatibility**: Nếu `current_content` / `selected_field` / `block_name` không có (request cũ), BE rơi về behavior cũ — sinh content từ đầu chỉ với `prompt`. Không phá request shape v1.

---

## 4. Response body

**Success** (`200 OK`):

```json
{
  "content": { /* shape khớp block_type — xem §5 */ },
  "source": "ai",
  "model": "claude-opus-4-7",
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 156,
    "cache_read_input_tokens": 1100
  },
  "request_id": "req_011CSHoEeqs5C35K2UUqR7Fy"
}
```

| Field | Mô tả |
|---|---|
| `content` | JSON object đúng schema theo `block_type`. Bắt buộc valid với schema FE expect — BE chịu trách nhiệm validate trước khi trả. |
| `source` | `'ai'` khi LLM trả về thành công. `'stub'` (optional) nếu BE bật chế độ fallback dev mode khi LLM down. |
| `model` | Model ID LLM đã dùng (cho audit). |
| `usage` | Token usage của lần call (cho billing/quota). |
| `request_id` | ID upstream request (LLM provider request ID) cho support/debug. |

**Error** (chuẩn `pkg_http.ErrorBody`):

```json
{
  "code": "ERR_VALIDATION",
  "message": "block_type must be one of [hero_split, hero_overlay, ...]",
  "request_id": "req_..."
}
```

---

## 5. Block content schemas (6 loại)

Tất cả schema tuân theo:
- Object phẳng, `additionalProperties: false`.
- Mọi field có kiểu rõ ràng, không nullable trừ khi note.
- Field rỗng → trả `""` cho string, `[]` cho array (không trả `null`).

### 5.1 `hero_split`

Layout: panel đen trái (eyebrow + tiêu đề + mô tả + 3 stats) | ảnh phải.

```json
{
  "eyebrow": "FAMILY COLLECTION • 2025",
  "title": "Mang cả gia đình đến cùng",
  "description": "Không gian riêng tư, an toàn cho trẻ và gần trường học, bệnh viện.",
  "imageUrl": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
  "stats": [
    { "value": "60–120m²", "label": "diện tích" },
    { "value": "2–4 PN", "label": "phòng ngủ" },
    { "value": "Từ 4.5 tỷ", "label": "giá khởi điểm" }
  ],
  "ctaText": "Đăng ký xem mẫu",
  "ctaLink": "#"
}
```

| Field | Constraint |
|---|---|
| `eyebrow` | string, viết hoa, 5–40 ký tự. |
| `title` | string, 5–80 ký tự, 5–10 từ. |
| `description` | string, 1–2 câu, ≤ 200 ký tự. |
| `imageUrl` | URL https hợp lệ. Nếu không có ảnh → trả URL placeholder Unsplash (BE có pool). |
| `stats` | **đúng 3 phần tử**. `value` 3–12 ký tự. `label` chữ thường, 1–3 từ. |
| `ctaText` | string, có thể rỗng. |
| `ctaLink` | string URL hoặc `#`, có thể rỗng. |

### 5.2 `hero_overlay`

Layout: full-bleed ảnh + gradient + tag + tiêu đề + subtitle + CTA.

```json
{
  "tag": "Mới ra mắt",
  "title": "Tận hưởng cuộc sống đẳng cấp",
  "subtitle": "Không gian xanh, tiện ích tích hợp, vị trí trung tâm.",
  "ctaText": "Đăng ký xem mẫu",
  "ctaLink": "#",
  "backgroundUrl": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80"
}
```

| Field | Constraint |
|---|---|
| `tag` | string, 1–3 từ, ≤ 30 ký tự. |
| `title` | string, 5–80 ký tự. |
| `subtitle` | string, 1 câu, ≤ 160 ký tự. |
| `ctaText` | string, bắt buộc có giá trị (không rỗng). |
| `ctaLink` | string URL hoặc `#`. |
| `backgroundUrl` | URL https hợp lệ. |

### 5.3 `feature_section`

Layout: title + intro + grid 4 feature card (icon + label + body).

```json
{
  "eyebrow": "TIỆN ÍCH NỔI BẬT",
  "title": "Sống xanh, sống đẳng cấp mỗi ngày",
  "description": "Hệ tiện ích tích hợp ngay trong dự án.",
  "features": [
    { "icon": "TreePine", "label": "Công viên 2 ha", "body": "Mảng xanh trung tâm." },
    { "icon": "Waves", "label": "Hồ bơi vô cực", "body": "View toàn cảnh." },
    { "icon": "ShieldCheck", "label": "An ninh 24/7", "body": "Camera AI + bảo vệ." },
    { "icon": "Sparkles", "label": "Tiện ích cao cấp", "body": "Gym, spa, lounge." }
  ]
}
```

| Field | Constraint |
|---|---|
| `eyebrow` | string. |
| `title` | string. |
| `description` | string. |
| `features` | **đúng 4 phần tử**. |
| `features[].icon` | enum: `Home` \| `Building2` \| `Compass` \| `Leaf` \| `TreePine` \| `Waves` \| `ShieldCheck` \| `Sparkles`. BE chọn icon phù hợp ngữ nghĩa. |
| `features[].label` | string, 2–4 từ. |
| `features[].body` | string, 1 câu ngắn. |

### 5.4 `photo_gallery`

Layout: title + grid ảnh 5 phần tử (1 lớn + 4 nhỏ) hoặc 4 đều.

```json
{
  "eyebrow": "THƯ VIỆN ẢNH",
  "title": "Không gian sống thực tế",
  "description": "Hình ảnh thực tế từ căn hộ mẫu.",
  "photos": [
    { "url": "https://...", "caption": "Mặt ngoài" },
    { "url": "https://...", "caption": "Phòng khách" },
    { "url": "https://...", "caption": "Bếp & bàn ăn" },
    { "url": "https://...", "caption": "Hồ bơi vô cực" },
    { "url": "https://...", "caption": "Vườn cảnh" }
  ]
}
```

| Field | Constraint |
|---|---|
| `photos` | 4 hoặc 5 phần tử. Mặc định 5. |
| `photos[].url` | URL https. |
| `photos[].caption` | string, 1–3 từ, có thể rỗng. |

### 5.5 `booking_form`

Layout: panel đen trái (title + intro + 4 reasons) | form trắng phải (name/phone/email/note + nút submit).

```json
{
  "eyebrow": "ĐẶT CHỖ ƯU TIÊN",
  "title": "Giữ chỗ căn hộ trước người khác",
  "description": "Để lại thông tin, chuyên viên sẽ gọi lại trong 15 phút.",
  "reasons": [
    { "value": "15’", "label": "phản hồi nhanh" },
    { "value": "0%", "label": "phí giữ chỗ" },
    { "value": "Q4/2026", "label": "bàn giao" },
    { "value": "Từ 4.5 tỷ", "label": "giá khởi điểm" }
  ],
  "submitText": "Đăng ký giữ chỗ",
  "noteText": "Bằng cách gửi form bạn đồng ý chính sách bảo mật."
}
```

| Field | Constraint |
|---|---|
| `reasons` | **đúng 4 phần tử**. |
| `reasons[].value` | string, 3–12 ký tự (số, đơn vị, mốc thời gian). |
| `reasons[].label` | string chữ thường, 1–3 từ. |
| `submitText` | string CTA. |
| `noteText` | string privacy/policy note. |

### 5.6 `cta_section`

Layout: card nền ảnh + gradient đen + tiêu đề lớn + subtitle + 2 nút (chính + phụ).

```json
{
  "eyebrow": "SẴN SÀNG?",
  "title": "Đến tham quan căn hộ mẫu cuối tuần này",
  "subtitle": "Có shuttle đưa đón từ trung tâm.",
  "primaryText": "Đặt lịch tham quan",
  "primaryLink": "#booking",
  "secondaryText": "Tải brochure PDF",
  "secondaryLink": "#",
  "backgroundUrl": "https://..."
}
```

| Field | Constraint |
|---|---|
| `primaryText` | string CTA chính, không rỗng. |
| `primaryLink` | string URL hoặc anchor `#booking`. |
| `secondaryText` | string CTA phụ, có thể rỗng. |
| `secondaryLink` | string URL hoặc `#`, có thể rỗng. |
| `backgroundUrl` | URL https. |

---

## 6. LLM mapping (gợi ý implementation)

**Provider**: Anthropic Claude — sử dụng SDK chính thức (`anthropic-sdk-go` cho BE Go, hoặc raw HTTP).

**Model**: `claude-opus-4-7` (hoặc `claude-sonnet-4-6` cho cost-sensitive — quyết định ở BE).

**Approach**:
1. **System prompt cố định** (một version duy nhất, mô tả tất cả 6 block schema + style guide). Đặt `cache_control: {"type": "ephemeral"}` lên system block để hit prompt cache (TTL 5 phút mặc định, trả phí 0.1× cho subsequent calls).
2. **User message**: dynamic (`block_type + lang + prompt`).
3. **Output**: dùng `output_config.format: {type: "json_schema", schema: <schema theo block_type>}` để LLM trả về JSON đúng shape.
4. **Adaptive thinking**: bật `thinking: {type: "adaptive"}` để Claude tự quyết độ sâu suy luận.
5. **Validate response**: parse JSON, validate lại với schema (tránh edge case LLM trả thiếu field).

**Reference implementation đã có ở FE Next** (sẽ xoá khi BE xong):
- `/Users/tranminhlan/Documents/rexerai/src/app/api/ai/block-content/route.ts`
- Có sẵn 6 Zod schema, system prompt tiếng Việt, fallback stub generator.
- BE port system prompt sang Go template + Anthropic SDK Go.

**Sample system prompt** (lấy từ FE, bản tiếng Việt):

> Bạn là copywriter chuyên viết landing page bất động sản cao cấp tại Việt Nam (cũng có thể viết tiếng Anh). Đầu vào: blockType, lang ('vi' / 'en'), prompt. Đầu ra: JSON đúng schema cho blockType đó. Phong cách:
> - Concrete, có số liệu (diện tích m², số phòng ngủ, năm bàn giao, giá khởi điểm).
> - Không sáo rỗng.
> - Eyebrow viết hoa toàn bộ.
> - Tiêu đề 5–10 từ.
> - Mô tả 1–2 câu.
> - … (chi tiết per block type)

Full prompt có sẵn trong file FE — BE copy verbatim.

---

## 7. Validation & error codes

| HTTP | Code | Message | Trigger |
|---|---|---|---|
| 400 | `ERR_VALIDATION` | `block_type required` | Thiếu `block_type`. |
| 400 | `ERR_VALIDATION` | `block_type must be one of [...]` | `block_type` không hợp lệ. |
| 400 | `ERR_VALIDATION` | `prompt must be at least 3 characters` | Trim prompt < 3 ký tự. |
| 400 | `ERR_VALIDATION` | `prompt must not exceed 2000 characters` | Prompt quá dài. |
| 400 | `ERR_VALIDATION` | `lang must be 'vi' or 'en'` | Lang không hợp lệ. |
| 401 | `ERR_UNAUTHORIZED` | `unauthorized` | Cookie session invalid. |
| 429 | `ERR_RATE_LIMITED` | `too many requests, retry after Xs` | Vượt quota (xem §8). |
| 502 | `ERR_LLM_UPSTREAM` | `LLM provider error` | Anthropic 5xx hoặc network error. |
| 504 | `ERR_LLM_TIMEOUT` | `LLM response timeout` | LLM > 15s. |
| 500 | `ERR_LLM_INVALID_OUTPUT` | `LLM returned invalid JSON` | LLM trả về JSON không khớp schema (sau khi validate). BE retry 1 lần trước khi trả lỗi. |

---

## 8. Rate limit & quota

| Tier | Limit | Notes |
|---|---|---|
| Per user | 60 req/phút | Soft limit, có thể nâng theo plan. |
| Per workspace | 600 req/phút | |
| Token budget per user | 200k input + 50k output / ngày | Reset 00:00 UTC. |

Header trả về (gợi ý):
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset` (epoch seconds)

---

## 9. Logging & audit

Mỗi request log:
- `user_id`, `workspace_id`
- `block_type`, `lang`
- `prompt` (hash hoặc truncated 200 ký tự)
- `model_used`, `request_id` (Anthropic)
- `usage.input_tokens`, `usage.output_tokens`, `usage.cache_read_input_tokens`
- `latency_ms`
- `success` (bool), `error_code` (nếu failed)

→ Đẩy vào table `ai_block_content_logs` để theo dõi cost per user + debug.

---

## 10. Acceptance criteria

- [ ] `POST /v1/ai/block-content` trả 200 + content đúng schema cho mỗi 6 block type.
- [ ] Response time **p50 ≤ 3s**, **p95 ≤ 8s** (với prompt cache hit).
- [ ] Prompt cache hit rate ≥ 60% sau 1h chạy production (theo `cache_read_input_tokens / input_tokens`).
- [ ] LLM call timeout sau 15s → trả 504, không hang request.
- [ ] Validate request → trả 400 với code đúng theo §7.
- [ ] Rate limit hoạt động → trả 429 với `Retry-After` header.
- [ ] Audit log đủ thông tin theo §9.
- [ ] Có integration test cho cả 6 block type + 3 case lỗi (validation, timeout, invalid output).

---

## 11. FE integration

Sau khi BE xong, FE sẽ:

1. **Xoá** `src/app/api/ai/block-content/route.ts` (đang là local proxy + Anthropic SDK direct).
2. **Xoá** `@anthropic-ai/sdk` khỏi `package.json` (không cần SDK ở FE nữa).
3. **Thêm** vào `src/services/rexer/endpoints.ts`:

   ```ts
   ai: {
     // ... existing
     blockContent: (body: AIBlockContentRequest) =>
       rx<AIBlockContentResponse>('/ai/block-content', {
         method: 'POST',
         body,
       }),
   },
   ```

4. **Thêm** types vào `src/services/rexer/types.ts`:

   ```ts
   export interface AIBlockContentRequest {
     block_type: 'hero_split' | 'hero_overlay' | 'feature_section'
                | 'photo_gallery' | 'booking_form' | 'cta_section';
     prompt: string;
     lang?: 'vi' | 'en';
     current_content?: Record<string, unknown>;  // §3 — rewrite-in-context
     selected_field?: string;                    // §3 — focused field
     block_name?: string;                        // §3 — display hint
   }

   export interface AIBlockContentResponse {
     content: Record<string, unknown>; // shape varies by block_type
     source: 'ai' | 'stub';
     model: string;
     usage?: {
       input_tokens: number;
       output_tokens: number;
       cache_read_input_tokens: number;
     };
     request_id: string;
   }
   ```

5. **Update** `BlockEditorSidebar.tsx` thay vì `fetch('/api/ai/block-content', ...)` → `rexerApi.ai.blockContent({ block_type, prompt, lang })`.

→ FE chỉ thay 1 call site, downstream code không đổi vì `content` shape giữ nguyên.

---

## 12. Open questions

1. **Model selection**: dùng Opus 4.7 cho mọi request hay phân tier theo plan user (Free dùng Haiku 4.5, Pro dùng Sonnet 4.6, Enterprise dùng Opus 4.7)?
2. **Image URL**: BE có service search image (Unsplash API / internal asset) để inject `imageUrl` thật theo prompt không? Hay tạm dùng pool placeholder đã có ở FE spec?
3. **Streaming**: có cần SSE response cho block lớn (gallery 5+ ảnh) không? MVP nên skip để giảm độ phức tạp.
4. **Caching DB**: có nên cache `(block_type, prompt_hash, lang) → content` trong Redis 24h không? Tiết kiệm LLM cost nhưng phải có cache invalidation khi system prompt update.
5. **Multi-block batch**: `POST /v1/ai/block-content/batch` cho phép sinh nhiều block 1 lần (cho flow "Tạo cả landing page bằng AI") — có nằm trong roadmap Phase 3 không?

---

## 13. References

- FE source: `/src/app/api/ai/block-content/route.ts` — implementation tham khảo (Anthropic SDK + Zod schemas + system prompt tiếng Việt).
- FE block types: `/src/components/modules/CanvasTemplate/block-editor/types.ts` — TS interface cho từng block content.
- FE renderers: `/src/components/modules/CanvasTemplate/block-editor/blocks/*.tsx` — để xem layout thật, UX expect ra sao.
- Anthropic SDK Go: https://github.com/anthropics/anthropic-sdk-go
- Prompt caching docs: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- Adaptive thinking: https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking
