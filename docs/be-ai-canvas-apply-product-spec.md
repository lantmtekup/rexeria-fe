# BE Spec — AI Canvas Template ✕ Product Apply

**Mục tiêu**: thêm endpoint `POST /v1/ai/canvas-templates/{id}/apply-product` cho phép FE 1-click "lấy 1 sản phẩm áp dụng vào 1 canvas template" — BE dùng LLM rewrite toàn bộ block content + match ảnh từ product media library, trả về `canvas_data` mới sẵn sàng save.

**Base**: `/v1`
**Auth**: `CookieAuth` (giống các `/ai/*` hiện có)
**Convention**: `snake_case` JSON, response envelope chuẩn REXER.
**Error body**: reuse `pkg_http.ErrorBody`.

> **Vì sao cần endpoint mới**:
> - `/ai/block-content` chỉ rewrite **1 block** tại 1 thời điểm + không nhận `product_id` → không match được ảnh, không hiểu cross-block consistency.
> - `/ai/landing/draft` lấy `template_version_id` (landing template legacy schema), không lấy `canvas_template_id` (block_editor schema). 2 schema khác nhau hoàn toàn.
> - `/ai/media/suggest` chỉ trả `media_ids[]`, không sinh text. Phải gọi N+1 (mỗi block 1 lần media/suggest + 1 lần block-content).
> - FE hiện tại đang workaround bằng `applyProductToBlocks()` — deterministic mapping client-side, không AI, không match ảnh, kết quả thô.

---

## 0. Mục lục

1. [Scope](#1-scope)
2. [Endpoint](#2-endpoint)
3. [Request body](#3-request-body)
4. [Response body](#4-response-body)
5. [Per-block apply rules](#5-per-block-apply-rules)
6. [LLM + image matching strategy](#6-llm--image-matching-strategy)
7. [Validation & error codes](#7-validation--error-codes)
8. [Rate limit & quota](#8-rate-limit--quota)
9. [Logging & audit](#9-logging--audit)
10. [Acceptance criteria](#10-acceptance-criteria)
11. [FE integration](#11-fe-integration)
12. [Open questions](#12-open-questions)
13. [References](#13-references)

---

## 1. Scope

| Phase | Phạm vi |
|---|---|
| **MVP** | 1 endpoint `apply-product`. Sinh `canvas_data` mới với 6 block types đã ship: hero_split, hero_overlay, feature_section, photo_gallery, booking_form, cta_section. Match image từ `product.media[]` theo heuristic (image kind + block context). Preserve `elementStyles` + `background` của user. |
| **Phase 2** | Streaming (SSE) progressive — emit từng block khi LLM xong. Cache theo `(canvas_template_id, product_id, brief_hash, lang)` 24h. |
| **Phase 3** | Per-block override: user có thể skip 1 số block không muốn AI đụng (`skip_block_ids[]` param). |

---

## 2. Endpoint

```
POST /v1/ai/canvas-templates/{id}/apply-product
```

**Headers**:
- `Cookie`: session (CookieAuth) — required.
- `Content-Type: application/json`

**Path param**:
- `{id}` — `canvas_template.id` (UUID). User phải có quyền update template này.

**Status codes**:
- `200 OK` — apply thành công, trả `canvas_data` mới.
- `400 BAD_REQUEST` — payload không hợp lệ (xem §7).
- `401 UNAUTHORIZED` — chưa đăng nhập.
- `403 FORBIDDEN` — không có quyền update canvas này.
- `404 NOT_FOUND` — `canvas_template_id` hoặc `product_id` không tồn tại.
- `409 CONFLICT` — `canvas_data.version` không khớp ETag (có người khác vừa save).
- `422 UNPROCESSABLE_ENTITY` — canvas hoặc product có shape lạ (vd canvas dùng schema khác `block_editor`, blocks rỗng).
- `429 TOO_MANY_REQUESTS` — vượt rate limit (xem §8).
- `502 BAD_GATEWAY` — LLM upstream lỗi.
- `504 GATEWAY_TIMEOUT` — LLM phản hồi quá chậm (>30s — endpoint này lâu hơn `block-content` vì chạy nhiều block).

---

## 3. Request body

```json
{
  "product_id": "f67566bf-ab8f-4fde-a74c-4b6d3aef8d15",
  "lang": "vi",
  "brief": "Tập trung vào tính năng vải mềm + in tay; giọng Gen Z thân thiện; nhấn 'free ship đơn 800k+'",
  "preserve_user_overrides": true,
  "expected_canvas_etag": "sha256:abc123..."
}
```

| Field | Type | Required | Mô tả |
|---|---|---|---|
| `product_id` | string (UUID) | ✅ | Product để áp dụng. Phải tồn tại + user có quyền đọc. BE load full detail (`category`, `media`, `features`, `colors`, `sizes`). |
| `lang` | enum string | ❌ | `'vi'` (default) hoặc `'en'`. AI rewrite cho đúng `contentVi` hoặc `contentEn`. **Nếu user muốn rewrite cả 2 ngôn ngữ → gọi 2 lần.** |
| `brief` | string | ❌ | Free-text guidance bổ sung do user nhập (tone, focus point, edge case). Trim → ≤ 1000 ký tự. Optional. |
| `preserve_user_overrides` | bool | ❌ | Default `true`. Nếu `true`, BE **không đụng** vào `elementStyles` (color/font user đã chỉnh) + `background` (màu/ảnh nền user set). Chỉ update `contentVi`/`contentEn` (theo `lang`) + image bindings. |
| `expected_canvas_etag` | string | ❌ | Nếu có, BE check `canvas_template.canvas_etag === expected_canvas_etag`. Mismatch → 409. Tránh ghi đè khi tab khác vừa save. |

---

## 4. Response body

**Success** (`200 OK`):

```json
{
  "canvas_data": {
    "schema": "block_editor",
    "version": 1,
    "blocks": [ /* full block list — content rewritten + images replaced */ ],
    "activeBlockId": "uuid-block-1"
  },
  "canvas_etag": "sha256:def456...",
  "applied": {
    "blocks_total": 7,
    "blocks_rewritten": 7,
    "blocks_skipped": 0,
    "fields_rewritten": 21,
    "image_bindings_replaced": 4,
    "image_bindings_kept": 0
  },
  "source": "ai",
  "model": "claude-opus-4-7",
  "usage": {
    "input_tokens": 12450,
    "output_tokens": 2890,
    "cache_read_input_tokens": 9200
  },
  "request_id": "req_011CSHoEeqs5C35K2UUqR7Fy"
}
```

| Field | Mô tả |
|---|---|
| `canvas_data` | Full new canvas. FE chỉ cần `setBlocks(canvas_data.blocks)` + autosave qua `PATCH /v1/canvas-templates/{id}`. **BE KHÔNG tự save** — return only. FE chủ động save để giữ undo/redo. |
| `canvas_etag` | ETag mới sau apply. FE pass vào `If-Match` khi PATCH. |
| `applied.blocks_total` | Tổng số block trong canvas. |
| `applied.blocks_rewritten` | Số block AI đã rewrite text. |
| `applied.blocks_skipped` | Số block AI bỏ qua (vd block_type không support, hoặc shape không match schema). |
| `applied.fields_rewritten` | Tổng số field text được sửa (eyebrow/title/desc/cta/...). |
| `applied.image_bindings_replaced` | Số ảnh được thay từ product.media. |
| `applied.image_bindings_kept` | Số ảnh giữ nguyên (không có ảnh phù hợp trong product.media). |
| `source` | `'ai'` khi LLM trả về thành công. `'stub'` khi BE fallback (dev mode hoặc product thiếu data — rewrite chỉ dùng deterministic mapping). |
| `model` | LLM model ID đã dùng. |
| `usage` | Token usage tổng (cộng tất cả block calls). |
| `request_id` | ID upstream request — cho debug. |

**Error** (chuẩn `pkg_http.ErrorBody`):

```json
{
  "code": "ERR_VALIDATION",
  "message": "product_id required",
  "request_id": "req_..."
}
```

---

## 5. Per-block apply rules

### Common rules (áp dụng mọi block_type)

1. **Schema**: output `content` MUST khớp schema § 5 của `be-ai-block-content-spec.md` cho từng `block_type`. BE validate trước khi đưa vào `canvas_data`.
2. **Preserve fields**: nếu `preserve_user_overrides: true`:
   - **KHÔNG** đụng `block.elementStyles` (color/fontSize/fontWeight/...).
   - **KHÔNG** đụng `block.background` (color/imageUrl).
   - **KHÔNG** đụng `block.id`, `block.blockType`, `block.name`, `block.isVisible`.
3. **Lang scope**: chỉ rewrite `block.contentVi` HOẶC `block.contentEn` theo `request.lang`. Lang còn lại giữ nguyên (FE muốn cả 2 → gọi 2 lần).
4. **CTA links**: giữ nguyên `ctaLink`/`primaryLink`/`secondaryLink` mà user đã set. BE chỉ rewrite text (`ctaText`/`primaryText`/`secondaryText`).

### 5.1 `hero_split` / `hero_overlay`

Text mapping:
- `eyebrow` (hero_split) hoặc `tag` (hero_overlay) ← `product.sku` hoặc `product.category.name` viết hoa
- `title` ← rewrite từ `product.name + product.description` theo tone "headline 5–10 từ"
- `description` (hero_split) / `subtitle` (hero_overlay) ← rewrite từ `product.description` theo "1–2 câu, ≤ 200 ký tự"
- `ctaText` ← context-aware: nếu `product.status === 'active'` → "Mua ngay" / "Buy now"; nếu draft → "Tìm hiểu thêm" / "Learn more"
- `stats` (hero_split, đúng 3 phần tử) ← derive:
  - 1: `len(product.colors)` + label "màu" / "colors"
  - 2: `len(product.sizes)` + label "kích cỡ" / "sizes"
  - 3: `len(product.features)` + label "tiện ích" / "features"
  - Nếu product thiếu → fallback random concrete number (vd "30 ngày", "12 tháng bảo hành").

Image mapping:
- `imageUrl` (hero_split) / `backgroundUrl` (hero_overlay) ← chọn từ `product.media[]` ảnh có:
  1. `media_type === 'image'`
  2. `width >= 1200` ưu tiên (banner-quality)
  3. Nếu nhiều, score theo aspect ratio gần `16:9` nhất
  4. Nếu không có ảnh đủ tiêu chuẩn → giữ nguyên `block.contentXX.imageUrl`

### 5.2 `feature_section`

Text mapping:
- `eyebrow` ← static "ĐIỂM NỔI BẬT" / "HIGHLIGHTS"
- `title` ← rewrite "Vì sao chọn {product.name}" / "Why pick {product.name}" theo brief
- `description` ← rewrite từ `product.description` cô đọng
- `features` (đúng 4 phần tử):
  - Source: `product.features[]` (từ enrich/manual). Nếu < 4, AI generate thêm từ `product.description + colors + sizes + ingredients + certifications` cho đủ 4.
  - Mapping per item:
    - `icon` ← chọn từ enum [Home, Building2, Compass, Leaf, TreePine, Waves, ShieldCheck, Sparkles] match semantics (vd "vải mềm" → Sparkles, "bảo hành" → ShieldCheck, "vận chuyển" → Compass).
    - `label` ← rewrite từ `feature.label` 2–4 từ.
    - `body` ← rewrite từ `feature.description` thành 1 câu ngắn.

Image mapping: không (feature_section không có image field).

### 5.3 `photo_gallery`

Text mapping:
- `eyebrow` ← "BỘ SƯU TẬP" / "GALLERY"
- `title` ← `product.name`
- `description` ← rewrite ngắn

Image mapping (4–5 phần tử):
- Source: `product.media[]` filter `media_type === 'image'`, sort theo `created_at DESC`, lấy 5 ảnh đầu.
- Nếu < 4 ảnh → giữ nguyên ảnh mặc định block, chỉ thay những ảnh có URL placeholder Unsplash.
- Per photo:
  - `url` ← `asset.public_url`
  - `caption` ← AI generate từ `product.name + asset.original_filename`, 1–3 từ (vd "Mặt trước", "Texture", "Detail").
  - `transform` (rotation/scale) ← giữ nguyên block default.

### 5.4 `booking_form`

Text mapping:
- `eyebrow` ← "ĐẶT MUA" / "ORDER"
- `title` ← rewrite CTA cho `product.name`
- `description` ← shipping/return policy hint
- `reasons` (đúng 4 phần tử) ← derive:
  - `len(product.colors)` colors / `len(product.sizes)` sizes / `len(product.features)` features / `len(product.certifications)` certifications
  - Hoặc generic: free ship / 30-day return / COD / warranty
- `submitText` ← "Đặt mua" / "Place order"
- `noteText` ← privacy note 1 câu

Image mapping: không.

### 5.5 `cta_section`

Text mapping:
- `eyebrow` ← "BẠN SẴN SÀNG?" / "READY?"
- `title` ← rewrite final-pitch headline cho `product.name`
- `subtitle` ← cross-sell hint hoặc urgency line
- `primaryText` ← "Mua ngay" / "Buy now"
- `secondaryText` ← "Xem chi tiết" / "See details"

Image mapping:
- `backgroundUrl` ← chọn 1 ảnh từ `product.media[]` (ưu tiên ảnh khác hero để không lặp lại). Nếu chỉ 1 ảnh → reuse.

---

## 6. LLM + image matching strategy

### 6.1 LLM call pattern

**Provider**: Anthropic Claude — Opus 4.7 cho chất lượng, Sonnet 4.6 cho cost-sensitive (BE quyết).

**Approach 1** (recommended): **1 call duy nhất per request** — gửi cả canvas (6-7 blocks) + product context vào 1 LLM call, nhận về JSON gồm tất cả blocks.

```
System prompt (cached):
  - Mô tả 6 block schemas + style guide.
  - Mapping rules (§5 spec này).
  - Output format: `{ blocks: [{ id, contentVi or contentEn }, ...] }` — chỉ field thay đổi.

User message:
  - canvas_data hiện tại (lang đang edit)
  - product (full detail)
  - brief (optional)
  - lang
```

→ Hit prompt cache cao (system prompt giống nhau cho mọi user). Output 1 lần thay vì 7 round-trip.

**Approach 2** (fallback): **N call song song** — 1 call per block dùng `/ai/block-content` internal. Chậm hơn nhưng dễ implement nếu Approach 1 vượt context limit.

### 6.2 Image matching algorithm

```
function matchImage(block, productMedia):
  candidates = productMedia.filter(m => m.asset.media_type === 'image')

  switch block.blockType:
    case 'hero_split':       // imageUrl, side panel
      target_aspect = 0.75   // 3:4 portrait works for split layout
      min_width = 800
    case 'hero_overlay':     // backgroundUrl, full-bleed
      target_aspect = 1.78   // 16:9 landscape
      min_width = 1200
    case 'cta_section':      // backgroundUrl
      target_aspect = 1.78
      min_width = 1200
    case 'photo_gallery':    // 5 photos
      // Multi-pick: return up to 5 images, prefer landscape
      return candidates.sort(by created_at DESC).slice(0, 5)

  scored = candidates.map(c => ({
    asset: c.asset,
    score: |aspect(c.asset) - target_aspect|
         + (c.asset.width < min_width ? 100 : 0)
         + (binding.field_key === 'gallery' ? 0 : 50)  // prefer 'gallery' bindings
  }))
  scored.sort(by score asc)
  return scored[0]?.asset.public_url ?? block.contentXX.imageUrl  // fallback
```

### 6.3 Caching

- **System prompt** → `cache_control: ephemeral` 5min TTL (Anthropic prompt caching).
- **Result cache** (Phase 2): key = `sha256(canvas_template_id + product_id + brief + lang)`. Value = full response. TTL 24h. Invalidate khi `canvas_template.canvas_etag` thay đổi.

---

## 7. Validation & error codes

| HTTP | Code | Message | Trigger |
|---|---|---|---|
| 400 | `ERR_VALIDATION` | `product_id required` | Thiếu `product_id`. |
| 400 | `ERR_VALIDATION` | `product_id must be a UUID` | Format sai. |
| 400 | `ERR_VALIDATION` | `lang must be 'vi' or 'en'` | Lang không hợp lệ. |
| 400 | `ERR_VALIDATION` | `brief must not exceed 1000 characters` | Brief quá dài. |
| 401 | `ERR_UNAUTHORIZED` | `unauthorized` | Cookie session invalid. |
| 403 | `ERR_FORBIDDEN` | `cannot modify this canvas template` | User không có quyền update. |
| 404 | `ERR_NOT_FOUND` | `canvas_template not found` | Path id không tồn tại. |
| 404 | `ERR_NOT_FOUND` | `product not found` | `product_id` không tồn tại. |
| 409 | `ERR_ETAG_MISMATCH` | `canvas was modified, refresh and retry` | `expected_canvas_etag` mismatch. |
| 422 | `ERR_UNSUPPORTED_SCHEMA` | `canvas schema is not block_editor` | Canvas dùng schema khác (legacy). |
| 422 | `ERR_EMPTY_CANVAS` | `canvas has no blocks` | `blocks: []`. Không có gì để apply. |
| 429 | `ERR_RATE_LIMITED` | `too many requests, retry after Xs` | Vượt quota (xem §8). |
| 502 | `ERR_LLM_UPSTREAM` | `LLM provider error` | Anthropic 5xx hoặc network error. |
| 504 | `ERR_LLM_TIMEOUT` | `LLM response timeout` | LLM > 30s. |
| 500 | `ERR_LLM_INVALID_OUTPUT` | `LLM returned invalid JSON` | Output không khớp schema. BE retry 1 lần trước khi 500. |

---

## 8. Rate limit & quota

Endpoint này nặng hơn `block-content` (chạy nhiều block trong 1 call) → quota chặt hơn:

| Tier | Limit | Notes |
|---|---|---|
| Per user | 10 req/phút | Soft limit. |
| Per workspace | 60 req/phút | |
| Token budget per user | 500k input + 100k output / ngày | Reset 00:00 UTC. |

Header trả về:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset` (epoch seconds)

---

## 9. Logging & audit

Mỗi request log:
- `user_id`, `workspace_id`
- `canvas_template_id`, `product_id`, `lang`
- `brief` (hash hoặc truncated 200 ký tự)
- `blocks_total`, `blocks_rewritten`, `blocks_skipped`
- `image_bindings_replaced`, `image_bindings_kept`
- `model_used`, `request_id` (Anthropic)
- `usage.input_tokens`, `usage.output_tokens`, `usage.cache_read_input_tokens`
- `latency_ms`
- `success` (bool), `error_code` (nếu failed)
- `canvas_etag_before`, `canvas_etag_after`

→ Đẩy vào table `ai_canvas_apply_logs` để theo dõi cost/quality + debug.

---

## 10. Acceptance criteria

- [ ] `POST /v1/ai/canvas-templates/{id}/apply-product` trả 200 + `canvas_data` đúng schema cho mọi 6 block_type.
- [ ] Output `canvas_data.blocks` giữ nguyên `id`/`blockType`/`name`/`isVisible`/`elementStyles`/`background` (khi `preserve_user_overrides: true`).
- [ ] Chỉ 1 trong `contentVi`/`contentEn` bị rewrite (theo `lang`).
- [ ] Image bindings hoạt động:
  - Hero/CTA → 1 ảnh từ `product.media`
  - Photo gallery → 4-5 ảnh
  - Khi `product.media` rỗng → giữ nguyên ảnh block default, `image_bindings_kept` báo đúng số.
- [ ] Response time **p50 ≤ 8s**, **p95 ≤ 20s** (canvas 7 blocks, 1 LLM call).
- [ ] Prompt cache hit rate ≥ 50% sau 1h chạy production.
- [ ] LLM call timeout sau 30s → trả 504, không hang request.
- [ ] Validate request → trả 400 với code đúng theo §7.
- [ ] ETag check hoạt động: stale ETag → 409.
- [ ] Rate limit hoạt động → 429 với `Retry-After` header.
- [ ] Audit log đủ thông tin theo §9.
- [ ] Integration test:
  - Happy path: canvas 6-7 blocks + product có 5 ảnh + features → output đầy đủ
  - Edge: product rỗng (no media, no features) → fallback stub
  - Edge: canvas schema khác `block_editor` → 422
  - Edge: ETag stale → 409

---

## 11. FE integration

### Sau khi BE xong, FE sẽ:

1. **Thêm types** vào `src/services/rexer/types.ts`:

   ```ts
   export interface AICanvasApplyProductRequest {
     product_id: string;
     lang?: 'vi' | 'en';
     brief?: string;
     preserve_user_overrides?: boolean;
     expected_canvas_etag?: string;
   }

   export interface AICanvasApplyProductResponse {
     canvas_data: Record<string, unknown>;
     canvas_etag: string;
     applied: {
       blocks_total: number;
       blocks_rewritten: number;
       blocks_skipped: number;
       fields_rewritten: number;
       image_bindings_replaced: number;
       image_bindings_kept: number;
     };
     source: 'ai' | 'stub';
     model: string;
     usage?: {
       input_tokens: number;
       output_tokens: number;
       cache_read_input_tokens?: number;
     };
     request_id: string;
   }
   ```

2. **Thêm wrapper** vào `src/services/rexer/endpoints.ts`:

   ```ts
   ai: {
     // ... existing
     canvasApplyProduct: (
       canvasTemplateId: string,
       body: AICanvasApplyProductRequest
     ) =>
       rx<AICanvasApplyProductResponse>(
         `/ai/canvas-templates/${canvasTemplateId}/apply-product`,
         { method: 'POST', body }
       ),
   },
   ```

3. **Update `BlockEditor.handleApplyProduct`** ở `src/components/modules/CanvasTemplate/BlockEditor.tsx`:

   ```ts
   const handleApplyProduct = async (product: Product) => {
     if (!templateRef.current) return;
     pushHistory();
     try {
       const res = await rexerApi.ai.canvasApplyProduct(templateId, {
         product_id: product.id,
         lang,
         preserve_user_overrides: true,
         expected_canvas_etag: templateRef.current.canvas_etag,
       });
       const parsed = parseCanvas(res.canvas_data);
       if (parsed?.blocks.length) {
         setBlocks(parsed.blocks);
         setDirty(true);
         toast.success(
           `AI rewrote ${res.applied.blocks_rewritten} blocks · ` +
           `${res.applied.image_bindings_replaced} ảnh đã thay`
         );
       }
     } catch (err) {
       toast.error(`Apply thất bại: ${rxErrorMessage(err)}`);
       handleUndo(); // rollback the pushHistory above
     }
   };
   ```

4. **Xoá** helper FE `src/components/modules/CanvasTemplate/block-editor/applyProduct.ts` — deterministic mapping client-side không còn cần thiết khi BE handle. Hoặc giữ làm fallback khi BE down.

---

## 12. Open questions

1. **Save behavior**: BE return `canvas_data` mới — FE auto-save (PATCH) ngay hay để user xem preview rồi mới save? **Đề xuất**: FE setBlocks + setDirty → autosave 1.5s sau (current behavior). User có thể undo nếu không thích.
2. **Image kind hint**: có nên thêm `media_kind` vào `MediaAsset` (BE) để biết "đây là banner / detail shot / lifestyle"? Hiện chỉ có `media_type` (image/video) → AI phải đoán từ filename.
3. **Multi-language batch**: cho phép `lang: ['vi', 'en']` để 1 call rewrite cả 2 ngôn ngữ? Tiết kiệm 1 round-trip nhưng phức tạp output schema.
4. **Block-level skip**: param `skip_block_ids: string[]` để user chọn block nào không rewrite? Hữu ích khi user đã chỉnh tay 1 block và không muốn AI đụng.
5. **Brief multiplexing**: brief có nên cho phép per-block (`brief: { hero_overlay: "...", feature_section: "..." }`)? Hay chỉ 1 brief chung?
6. **Stub fallback**: khi LLM down hoặc product thiếu data, BE có nên rơi về deterministic mapping (giống FE `applyProductToBlocks` hiện tại) → trả `source: "stub"` thay vì 502? **Đề xuất**: có, để UX không bị break.
7. **Streaming (Phase 2)**: SSE có cần thiết không? Canvas 7 blocks p50 8s — có thể chấp nhận spinner. Streaming chỉ giá trị khi >15s.

---

## 13. References

- **FE source**:
  - `src/components/modules/CanvasTemplate/BlockEditor.tsx` (handler `handleApplyProduct`)
  - `src/components/modules/CanvasTemplate/block-editor/applyProduct.ts` (deterministic mapping hiện tại — sẽ thay bằng API này)
  - `src/components/modules/CanvasTemplate/block-editor/ProductPickerDialog.tsx` (UI pick product)
- **Block schemas**: `docs/be-ai-block-content-spec.md` § 5 (6 block types — schema giữ nguyên cho endpoint này)
- **Canvas schema**: `docs/be-canvas-templates-spec.md` (block_editor schema, ETag handshake)
- **Product detail**: `docs/be-api-products-spec.md` (`ProductResponse` shape — đã có `media: ProductMediaWithAsset[]` và `Product.thumbnail_url`)
- **Anthropic Claude API**: https://platform.claude.com/docs/en/build-with-claude/overview
- **Prompt caching**: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- **Tracking**: thêm GAP-20 vào `docs/be-issues-master.md` khi spec này được agree.
