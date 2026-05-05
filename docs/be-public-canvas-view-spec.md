# BE Spec — Public Canvas View (Share Link)

**Mục tiêu**: thêm endpoint **không yêu cầu auth** để render trang đã xuất bản (`canvas_template.canvas_data.publish.published === true`) qua share link `/p/{id}/{token}`. FE đã có route `/p/[id]/[token]/page.tsx` nhưng hiện đang call endpoint cần auth → viewer không đăng nhập rexer thì không xem được.

**Base**: `/v1`
**Auth**: **NO AUTH** (public)
**Convention**: `snake_case` JSON, response envelope `{ canvas_data }`.
**Error body**: reuse `pkg_http.ErrorBody`.

> **Vì sao cần endpoint riêng (không nới `GET /canvas-templates/{id}/canvas`):**
> - Endpoint hiện tại trả toàn bộ `canvas_data` (kể cả block ẩn, cấu hình `_styles`, `activeBlockId`, `publish.shareToken`…) cho người có cookie. Public link không nên thấy `shareToken` (lộ link nguy hiểm) hoặc bản nháp chưa xuất bản.
> - Cần verify `share_token` server-side. Nếu reuse endpoint cũ, mọi caller có cookie sẽ bypass token → không control được "ngưng xuất bản".
> - Public endpoint nên cache mạnh (CDN-friendly, edge cache 60s) trong khi endpoint editor cần ETag freshness.

---

## 0. Mục lục

1. [Scope](#1-scope)
2. [Endpoint](#2-endpoint)
3. [Request](#3-request)
4. [Response](#4-response)
5. [Validation logic (server-side)](#5-validation-logic-server-side)
6. [Error codes](#6-error-codes)
7. [Caching strategy](#7-caching-strategy)
8. [Rate limiting](#8-rate-limiting)
9. [Security considerations](#9-security-considerations)
10. [Logging](#10-logging)
11. [Acceptance criteria](#11-acceptance-criteria)
12. [FE integration plan](#12-fe-integration-plan)
13. [Open questions](#13-open-questions)
14. [References](#14-references)

---

## 1. Scope

| Phase | Phạm vi |
|---|---|
| **MVP** | 1 endpoint GET trả canvas_data đã filter cho viewer không-auth + verify share_token + cache 60s. |
| **Phase 2** | Custom domain mapping (vd. `landing.client.com → /p/{id}/{token}`), password-protected share, expiry token. |
| **Phase 3** | Analytics: pageview + event tracking gửi về REXER (số visit / thời gian xem). |

---

## 2. Endpoint

```
GET /v1/public/canvas-templates/{id}/canvas
```

**Path params:**
- `id` (required) — canvas_template UUID.

**Query params:**
- `share_token` (required) — token đã được FE generate khi user click "Xuất bản" (24-char alphanumeric).

**Headers:**
- `If-None-Match` (optional) — cho ETag short-circuit (304).

**Status codes:**
- `200 OK` — trả canvas_data đã filter.
- `304 NOT_MODIFIED` — content không thay đổi từ ETag client gửi.
- `400 BAD_REQUEST` — thiếu `share_token`.
- `404 NOT_FOUND` — `id` không tồn tại HOẶC chưa publish HOẶC token không khớp. **Không phân biệt** để tránh leak (xem §9).
- `429 TOO_MANY_REQUESTS` — rate limit (xem §8).
- `503 SERVICE_UNAVAILABLE` — DB/upstream tạm không khả dụng.

> **Note**: KHÔNG dùng 401/403 cho endpoint này. Tất cả failure cases gộp thành 404 để không leak xem template id có tồn tại hay không.

---

## 3. Request

### Example

```
GET /v1/public/canvas-templates/e3e3e3e3-0000-0000-0000-000000000002/canvas?share_token=abc123def456ghi789jkl012
```

### Required validation:

| Field | Rule |
|---|---|
| `share_token` | Required. Length 16–48 chars. Match `[a-zA-Z0-9_-]+`. |

---

## 4. Response

### `200 OK`

```json
{
  "canvas_data": {
    "schema": "block_editor",
    "version": 1,
    "blocks": [
      {
        "id": "b1",
        "blockType": "hero_split",
        "name": "Hero Split",
        "isVisible": true,
        "contentVi": { /* ... */ },
        "contentEn": { /* ... */ },
        "elementStyles": { /* ... */ }
      }
    ]
  },
  "canvas_etag": "W/\"abc123\"",
  "name": "Tên template (cho <title>)",
  "description": "Mô tả ngắn (cho meta og:description)",
  "thumbnail_url": "https://.../thumb.jpg",
  "published_at": "2026-04-29T08:00:00Z"
}
```

### Filtering rules (BE phải áp dụng trước khi trả):

| Field | Action |
|---|---|
| `canvas_data.publish.shareToken` | **Strip** (không bao giờ trả về client). Token chỉ tồn tại server-side. |
| `canvas_data.publish.published` | Có thể strip (FE không cần biết). |
| `canvas_data.activeBlockId` | Strip (editor-only state). |
| `canvas_data.blocks[].isVisible === false` | **Filter out** (block ẩn không gửi). |
| `canvas_data.blocks[]._draft` (nếu có) | Strip — chỉ trả block đã commit. |

### `304 NOT_MODIFIED`

Body trống. Header `ETag` giữ nguyên.

### Error envelope

```json
{
  "code": "ERR_NOT_FOUND",
  "message": "Trang không tồn tại hoặc đã ngưng xuất bản",
  "request_id": "req_..."
}
```

---

## 5. Validation logic (server-side)

Pseudocode Go:

```go
func GetPublicCanvas(ctx context.Context, id string, shareToken string) (*PublicCanvasResponse, error) {
    // 1. Lookup template
    tpl, err := canvasRepo.GetByID(ctx, id)
    if err != nil || tpl == nil {
        return nil, ErrNotFound // ← unified 404
    }

    // 2. Parse canvas_data
    var canvas BlockEditorCanvas
    if err := json.Unmarshal(tpl.CanvasData, &canvas); err != nil {
        return nil, ErrNotFound
    }

    // 3. Verify published + token match (constant-time compare to avoid timing attacks)
    if canvas.Publish == nil || !canvas.Publish.Published {
        return nil, ErrNotFound
    }
    if subtle.ConstantTimeCompare(
        []byte(canvas.Publish.ShareToken),
        []byte(shareToken),
    ) != 1 {
        return nil, ErrNotFound
    }

    // 4. Filter sensitive fields + invisible blocks
    filtered := canvas
    filtered.Publish = nil           // strip publish meta
    filtered.ActiveBlockID = ""      // strip editor state
    filtered.Blocks = filterVisible(canvas.Blocks)

    // 5. Build ETag = sha256(filtered_canvas_data + version)[:12]
    etag := computeETag(filtered, tpl.Version)

    return &PublicCanvasResponse{
        CanvasData:   filtered,
        CanvasETag:   etag,
        Name:         tpl.Name,
        Description:  tpl.Description,
        ThumbnailURL: tpl.ThumbnailURL,
        PublishedAt:  canvas.Publish.PublishedAt,
    }, nil
}
```

**Quan trọng**:
- Bước 3: **constant-time compare** (`subtle.ConstantTimeCompare`) — tránh timing attack đoán token.
- Bước 4: filter ngay tại service layer, không phụ thuộc handler nhớ filter.
- Tất cả failure path → cùng một `ErrNotFound` → response 404 đồng nhất.

---

## 6. Error codes

| HTTP | `code` | `message` (vi) | Trigger |
|---|---|---|---|
| 400 | `ERR_VALIDATION` | `share_token là bắt buộc` | Thiếu hoặc malformed share_token. |
| 404 | `ERR_NOT_FOUND` | `Trang không tồn tại hoặc đã ngưng xuất bản` | Mọi case fail validation (template không tồn tại, chưa publish, token sai). |
| 429 | `ERR_RATE_LIMITED` | `Quá nhiều yêu cầu, thử lại sau {n}s` | Vượt rate limit. |
| 503 | `ERR_SERVICE_UNAVAILABLE` | `Dịch vụ tạm không khả dụng` | DB / upstream lỗi. |

---

## 7. Caching strategy

Public endpoint phải cache mạnh để không đè BE khi share link viral.

### Headers BE phải set:

| Header | Value |
|---|---|
| `ETag` | `W/"<hash 12 ký tự>"` — đã có trong response body, dùng cho conditional GET. |
| `Cache-Control` | `public, max-age=60, s-maxage=300, stale-while-revalidate=600` |
| `Vary` | `Accept-Encoding` |
| `X-Robots-Tag` | `noindex, nofollow` (mặc định — cho phép owner override sau) |

### Layered cache:

| Layer | TTL | Purge |
|---|---|---|
| **CloudFront / Vercel edge** | 5 phút (`s-maxage`) | Tự động purge khi `ETag` đổi (FE cập nhật content → save → ETag đổi → request mới ra origin). |
| **REXER server in-memory** | 60s LRU theo key `(id, share_token)` | Purge ngay khi `update` template — emit event → invalidate cache key. |
| **Browser** | 60s (`max-age`) | Refresh thủ công bypass. |

### Khi user click "Đổi link" (rotate share_token):

- Token cũ ngay lập tức → 404 (vì token check fail).
- Edge cache cũ vẫn có thể serve trong tới 5 phút theo `s-maxage`. Để purge ngay:
  - **Option A**: gọi CDN purge API khi `update` template detect token rotation.
  - **Option B**: chấp nhận grace period 5 phút. Document trong UX.

→ MVP chọn **Option B** (đơn giản). Owner cảnh báo: "link cũ có thể vẫn dùng được trong 5 phút".

---

## 8. Rate limiting

| Tier | Limit | Notes |
|---|---|---|
| Per IP | 120 req/phút | Soft limit cho viewer thông thường. |
| Per `share_token` | 600 req/phút | Tránh 1 link bị spam. |
| Burst | 20 req/giây | Cho phép short burst (page có nhiều asset). |

Headers trả về:
- `X-RateLimit-Limit-IP`
- `X-RateLimit-Remaining-IP`
- `Retry-After` (giây) khi 429.

---

## 9. Security considerations

| Risk | Mitigation |
|---|---|
| **Token enumeration** | Token 24 ký tự alphanumeric → entropy ~143 bit, brute-force không khả thi. Constant-time compare. Rate limit per IP. |
| **Leak template existence** | Tất cả failure trả 404 đồng nhất. Không phân biệt "template không tồn tại" vs "token sai" trong response. |
| **Replay attack** | Token là long-lived (cho đến khi rotate). Không cần expiry MVP. Phase 2 thêm `expires_at` optional. |
| **XSS qua content user-input** | FE đã sanitize (React escape). Nếu BE nhận input `description / title` chứa HTML → escape trước khi đẩy vào response. |
| **CORS** | Allow `*` origin cho public endpoint (cần cho custom domain mapping Phase 2). Không expose credentials. |
| **CSRF** | Endpoint là idempotent GET, không cần CSRF token. |
| **Indexing** | Set `X-Robots-Tag: noindex` mặc định để link share không leak Google. Cho owner override Phase 2. |
| **DDoS amplification** | Response size cap: nếu `canvas_data > 5MB` → trả 413 hoặc trim content (lý thuyết không xảy ra với block-editor schema). |

---

## 10. Logging

Mỗi request log:

| Field | Mô tả |
|---|---|
| `template_id` | UUID template được view. |
| `share_token_hash` | `sha256(share_token)[:8]` — không log token raw. |
| `ip` (hash hoặc anonymized) | Cho rate limit + analytics, GDPR-compliant. |
| `user_agent` | Phân tích bot vs human. |
| `referrer` | Track nguồn traffic (Facebook / Zalo / direct…). |
| `cache_hit` | `bool` — biết tỷ lệ hit cache. |
| `latency_ms` | Performance monitoring. |
| `result` | `ok | not_found | rate_limited`. |

→ Đẩy vào table `public_canvas_views` cho Phase 3 (analytics dashboard).

---

## 11. Acceptance criteria

- [ ] `GET /v1/public/canvas-templates/{id}/canvas?share_token=X` trả 200 + canvas_data filtered nếu published + token match.
- [ ] Response **không chứa** `publish.shareToken`, `activeBlockId`, hoặc block có `isVisible === false`.
- [ ] Token sai / template chưa publish / template không tồn tại → đều trả **404 đồng nhất**.
- [ ] Token mismatch dùng **constant-time compare** (verify trong code review).
- [ ] ETag header có. Conditional GET với `If-None-Match` → 304.
- [ ] `Cache-Control: public, max-age=60, s-maxage=300` set đúng.
- [ ] Response time **p50 ≤ 100ms**, **p95 ≤ 300ms** (cache hit).
- [ ] Rate limit hoạt động — 429 với `Retry-After`.
- [ ] Integration test cho 5 case: published+match → 200; published+wrong-token → 404; not-published → 404; not-exists → 404; rate-limited → 429.

---

## 12. FE integration plan

### Khi BE deploy xong, FE cần:

1. **Thêm endpoint vào `rexerApi`** (`src/services/rexer/endpoints.ts`):

   ```ts
   canvasTemplates: {
     // ... existing
     getPublicCanvas: (id: string, shareToken: string, etag?: string) =>
       rx<PublicCanvasResponse>(
         `/public/canvas-templates/${id}/canvas`,
         {
           query: { share_token: shareToken },
           headers: etag ? { 'If-None-Match': etag } : undefined,
         }
       ),
   },
   ```

2. **Thêm types vào `src/services/rexer/types.ts`:**

   ```ts
   export interface PublicCanvasResponse {
     canvas_data: Record<string, unknown>;
     canvas_etag: string;
     name: string;
     description?: string;
     thumbnail_url?: string;
     published_at: string;
   }
   ```

3. **Update `src/app/p/[id]/[token]/page.tsx`** — thay:

   ```ts
   const resp = await rexerApi.canvasTemplates.getCanvas(id);
   ```

   bằng:

   ```ts
   const resp = await rexerApi.canvasTemplates.getPublicCanvas(id, token);
   ```

   - Bỏ check `parsed.publish?.published` + `parsed.publish.shareToken !== token` (BE đã verify).
   - Bỏ banner "REXER timeout" — endpoint public phải nhanh.
   - Set page metadata từ `name + description + thumbnail_url`.

4. **Thêm `metadata` cho SEO/social share** — page chuyển sang server component đọc `name + description + thumbnail_url` cho `<title>`, `og:image`, `og:description`.

5. **Test lại middleware** — confirm `/p/` đã trong `publicRoutes` (đã có) → không redirect viewer chưa login.

### Migration path

| Thời điểm | Hành vi |
|---|---|
| **Ngày 0** (BE chưa deploy) | FE call endpoint cũ. Public link **chỉ work cho user đã login rexer**. |
| **Ngày 1** (BE deploy) | FE switch sang `getPublicCanvas`. Public link **hoạt động hoàn toàn không cần auth**. |
| **Ngày 2** (Phase 2) | Custom domain mapping, password-protect, expiry. |

---

## 13. Open questions

1. **Rate limit per share_token = 600 req/phút có đủ không?** Nếu link viral trên Facebook (~1k req/phút spike), có cần nâng tier?
2. **Custom domain mapping** (Phase 2): user gắn domain riêng `landing.client.com` → BE serve qua domain đó? Cần resolve domain → templateId. Schema `client_domains` table?
3. **Password-protected share** (Phase 2): thêm `share_password_hash` trong `publish` meta? Endpoint nhận password trong body POST thay vì GET với query?
4. **Expiry token** (Phase 2): `share_token_expires_at` optional. BE check `now() > expires_at` → 404.
5. **Server-side rendering** (FE-side concern): có cần BE thêm endpoint `GET /v1/public/canvas-templates/{id}/og-image?share_token=X` để generate OG image dynamically từ first-block thumbnail không?
6. **Analytics events** (Phase 3): viewer click CTA / scroll depth → endpoint `POST /v1/public/canvas-templates/{id}/events` không-auth? Hoặc dùng third-party analytics (Plausible, GA4)?
7. **Field stripping**: ngoài `shareToken`, có field nào khác trong `canvas_data.blocks[]` cần ẩn không? (ví dụ `_authorNotes`, `_draftFields`).

---

## 14. References

- Editor route: `src/app/(app)/canvas-templates/[id]/page.tsx`
- Public viewer route: `src/app/p/[id]/[token]/page.tsx` (đã có, đợi BE switch)
- Publish UI: `src/components/modules/CanvasTemplate/block-editor/PublishDialog.tsx`
- Publish state shape: `src/components/modules/CanvasTemplate/block-editor/serialize.ts` (`PublishMeta`, `newShareToken`)
- Existing canvas-templates spec: `docs/be-canvas-templates-spec.md`
- AI block content spec (cho convention chung): `docs/be-ai-block-content-spec.md`
