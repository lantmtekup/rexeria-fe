# BE Spec — Canvas Templates (Design Builder)

**Mục tiêu**: bổ sung resource `canvas_templates` để FE designer/builder lưu canvas (layers + animation + multi-page) với performance tối ưu (lazy-load, ETag, CDN-friendly).

**Base**: `/v1`
**Auth**: `CookieAuth`
**Convention**: `snake_case` JSON, UUID, ISO-8601, response envelope `{ canvas_template: ... }`.
**Error body**: reuse `pkg_http.ErrorBody`.

> Quyết định kiến trúc đã chốt với FE team: phương án **B (resource riêng)** thắng A/C về performance vì:
> - List view không bloat (`canvas_data` chỉ load on-demand)
> - Update isolated, không drag theo data khác
> - Cache hit rate cao (template ít update sau finalize)
> - Có thể serve qua CDN
>
> File này gộp **API contract** + **DDL** + **Go sketches** + **performance budgets** + **test matrix** + **sprint plan**.

---

## 0. Mục lục

1. [Scope](#1-scope)
2. [Định vị codebase](#2-định-vị-codebase)
3. [Resource `canvas_templates`](#3-resource-canvas_templates)
4. [`canvas_data` JSON schema](#4-canvas_data-json-schema)
5. [Endpoints (lazy-load pattern)](#5-endpoints-lazy-load-pattern)
6. [ETag + caching strategy](#6-etag--caching-strategy)
7. [CDN delivery (Phase 2)](#7-cdn-delivery-phase-2)
8. [Authorization](#8-authorization)
9. [Error code catalog](#9-error-code-catalog)
10. [SQL DDL](#10-sql-ddl)
11. [Go struct sketches](#11-go-struct-sketches)
12. [Service-layer logic](#12-service-layer-logic)
13. [Handler routes](#13-handler-routes)
14. [Performance budgets](#14-performance-budgets)
15. [Test matrix](#15-test-matrix)
16. [Acceptance criteria](#16-acceptance-criteria)
17. [Sprint plan](#17-sprint-plan)
18. [Phase 2 backlog](#18-phase-2-backlog)
19. [Open questions](#19-open-questions)
20. [FE migration plan](#20-fe-migration-plan)
21. [References](#21-references)

---

## 1. Scope

| Phase | Phạm vi |
|---|---|
| **MVP** (3 ngày 1 dev) | CRUD canvas templates + lazy-load metadata vs full canvas + ETag caching + thumbnail upload |
| **Phase 2** (3 ngày) | CDN publish (S3/CloudFront), version history, real-time collab, merge fields với Collection |

---

## 2. Định vị codebase

```
internal/
├── domain/models/canvas_template.go
├── repository/canvas_template.go
├── service/canvas_template.go
└── http/handler/canvas_template.go

migrations/
└── XXXX_create_canvas_templates.sql
```

---

## 3. Resource: `canvas_templates`

### 3.1 Entity (DB row, full)

| field | type | required | ghi chú |
|---|---|:---:|---|
| `id` | UUID | ✓ | BE sinh |
| `client_id` | UUID | — | scope theo client (nullable cho global template) |
| `collection_id` | UUID | — | optional link tới Collection (cho data-driven canvas) |
| `name` | varchar(255) | ✓ | tên template |
| `description` | text(2000) | — | |
| `width` | int | ✓ | px, default `800` |
| `height` | int | ✓ | px, default `600` |
| `thumbnail_url` | varchar(512) | — | URL/CDN — **không nhúng base64** vào row, lưu riêng để list nhẹ |
| `canvas_data` | JSONB | ✓ | scene full (xem §4) — **chỉ load khi GET /:id/canvas** |
| `canvas_size_bytes` | int (generated) | — | `octet_length(canvas_data::text)` — monitor nặng nhẹ |
| `canvas_etag` | varchar(64) | ✓ | hash của `canvas_data`, FE gửi `If-None-Match` để skip download |
| `engine` | varchar(32) | — | `fabric` (mặc định) hoặc `konva`/`custom` cho future |
| `engine_version` | varchar(16) | — | vd `fabric@6.4.0` để FE biết deserialize đúng |
| `is_active` | bool | ✓ | default `true`. Soft-delete = false |
| `is_template` | bool | ✓ | default `false`. Template chuẩn để clone |
| `version` | int | ✓ | optimistic-lock counter, default `1` |
| `created_by` | UUID | ✓ | |
| `updated_by` | UUID | ✓ | |
| `created_at` | timestamptz | ✓ | |
| `updated_at` | timestamptz | ✓ | |

### 3.2 Metadata vs Full payload

| Endpoint | Trả `canvas_data`? | Mục đích |
|---|:---:|---|
| `GET /v1/canvas-templates` | ❌ | List view — chỉ id/name/thumbnail/width/height/size/etag |
| `GET /v1/canvas-templates/{id}` | ❌ | Detail header — metadata + computed fields |
| `GET /v1/canvas-templates/{id}/canvas` | ✅ | **Editor mở** — trả full + `ETag` header + `Cache-Control` |
| `POST/PATCH` | ✅ | Create/save canvas |

> Quan trọng: list endpoint **KHÔNG SELECT `canvas_data`** ở SQL level → tránh kéo MB-size jsonb qua wire.

---

## 4. `canvas_data` JSON schema

Inspired by Fabric.js scene format, mở rộng cho multi-page + animation + merge fields.

```jsonc
{
  "schema_version": "1.0",      // FE migrate khi BE bump
  "engine": "fabric",
  "background": "#ffffff",      // hoặc gradient/image
  "pages": [
    {
      "id": "page_01",
      "name": "Page 1",
      "objects": [               // ← LAYERS (z-order = index)
        {
          "id": "obj_01",
          "type": "textbox",     // textbox | image | rect | circle | triangle | line | group | mergeField
          "left": 100, "top": 50,
          "width": 200, "height": 40,
          "angle": 0,
          "scaleX": 1, "scaleY": 1,
          "opacity": 1,
          "visible": true,
          "locked": false,
          "props": {              // engine-specific (Fabric.js raw props)
            "text": "Hello {{customer.name}}",
            "fontFamily": "Inter",
            "fontSize": 24,
            "fill": "#111827"
          },
          "animation": {           // ← per-layer animation
            "enter": "fade",       // none | fade | slide-up | slide-down | zoom-in | bounce
            "loop":  "pulse",      // none | pulse | float | glow
            "duration_ms": 600,
            "delay_ms": 0,
            "easing": "ease-out"
          },
          "merge_field": {         // optional — bind tới Collection record field
            "collection_id": "abc-123",
            "field_key": "customer_name",
            "fallback": "Customer"
          }
        }
        // ... more objects
      ]
    }
    // ... more pages
  ],
  "global_animations": {           // animation áp cho cả page (page transition)
    "page_transition": "slide",    // none | fade | slide | zoom
    "auto_play": false
  }
}
```

### 4.1 Layer = element trong `pages[].objects[]`

- **Z-order**: thứ tự trong array. Index 0 = bottom, last = top.
- **Group**: `type: "group"` chứa `props.children: ObjectId[]` hoặc nested objects.
- **Lock/Visibility**: `locked` + `visible` boolean per-object.

### 4.2 Animation 2 cấp

1. **Per-layer** (`object.animation`) — entrance, idle loop, duration, delay, easing.
2. **Global page** (`global_animations.page_transition`) — chuyển page.

Preset enum (FE chuẩn hoá thành CSS class):
- `enter`: `none | fade | slide-up | slide-down | slide-left | slide-right | zoom-in | zoom-out | bounce | rotate-in`
- `loop`: `none | pulse | float | glow | rotate | shake`
- `easing`: `linear | ease-in | ease-out | ease-in-out | bounce | spring`

### 4.3 Merge fields (data-driven)

Khi `merge_field` set:
- FE render thay `{{customer.name}}` bằng `record.data[field_key]`
- BE không validate `merge_field` (FE responsibility) — chỉ store as-is
- Phase 2: BE có thể validate `collection_id` + `field_key` tồn tại

---

## 5. Endpoints (lazy-load pattern)

### 5.1 List (metadata only)

```
GET /v1/canvas-templates
```

**Query params**:
- `client_id`, `collection_id`, `is_template`, `is_active` (default `true`)
- `q` — search `name`/`description`
- `page` (1), `limit` (50, max 200)
- `sort` (default `-updated_at`)

**Response** `CanvasTemplateListResponse`:
```json
{
  "items": [
    {
      "id": "...",
      "name": "Hero v1",
      "description": "Landing hero with animated CTA",
      "thumbnail_url": "https://cdn.../hero-v1.jpg",
      "width": 800, "height": 600,
      "canvas_size_bytes": 12450,
      "canvas_etag": "sha256:abc123",
      "engine": "fabric",
      "is_template": true,
      "version": 3,
      "updated_at": "..."
    }
  ],
  "page": 1, "limit": 50, "total": 12, "total_pages": 1
}
```

> ⚠️ KHÔNG có `canvas_data` ở list response. SQL phải `SELECT id, name, ..., NULL AS canvas_data` hoặc whitelist columns.

### 5.2 Get metadata (header + computed)

```
GET /v1/canvas-templates/{id}
```

**Response** `CanvasTemplateResponse`:
```json
{
  "canvas_template": {
    "id": "...", "name": "Hero v1",
    "thumbnail_url": "...",
    "width": 800, "height": 600,
    "canvas_size_bytes": 12450,
    "canvas_etag": "sha256:abc123",
    "engine": "fabric", "engine_version": "fabric@6.4.0",
    "version": 3,
    "is_active": true, "is_template": true,
    "created_by": "...", "updated_by": "...",
    "created_at": "...", "updated_at": "..."
    // KHÔNG có canvas_data
  }
}
```

### 5.3 **Get canvas data** (lazy, cacheable)

```
GET /v1/canvas-templates/{id}/canvas
```

**Request headers**:
```
If-None-Match: "sha256:abc123"
```

**Response 200 (cache miss)**:
```http
HTTP/1.1 200 OK
ETag: "sha256:abc123"
Cache-Control: private, max-age=86400
Content-Type: application/json

{
  "canvas_data": { /* full scene as in §4 */ },
  "canvas_etag": "sha256:abc123",
  "version": 3
}
```

**Response 304 (cache hit)**:
```http
HTTP/1.1 304 Not Modified
ETag: "sha256:abc123"
```

**Tại sao tách endpoint**: FE list 20 templates → 20 metadata fetch (nhẹ). User mở 1 template → 1 fetch canvas. Editor reload → 304 nếu chưa đổi.

### 5.4 Create

```
POST /v1/canvas-templates
```

Body `CreateCanvasTemplateRequest`:
```json
{
  "name": "Hero v1",
  "description": "Landing hero",
  "collection_id": null,
  "width": 800, "height": 600,
  "engine": "fabric",
  "engine_version": "fabric@6.4.0",
  "canvas_data": { /* scene */ },
  "is_template": false
}
```

- Required: `name`, `width`, `height`, `canvas_data`.
- BE compute `canvas_etag = sha256(canvas_data)`.
- BE compute `canvas_size_bytes` (auto via generated column).
- Reject nếu `canvas_size_bytes > 10MB` → `413 PAYLOAD_TOO_LARGE`.

**Response**: `201 CanvasTemplateResponse` (full metadata, **không có `canvas_data`**).

### 5.5 Update (PATCH partial)

```
PATCH /v1/canvas-templates/{id}
```

Body `UpdateCanvasTemplateRequest`:
```json
{
  "name": "Hero v2",
  "canvas_data": { /* new scene */ },
  "version": 3
}
```

- **`version` REQUIRED** — optimistic lock.
- Nếu gửi `canvas_data` → BE re-compute `canvas_etag`.
- Có thể gửi chỉ metadata (rename, move collection) **không kèm** `canvas_data` → tránh rewrite jsonb column tốn IO.

**Conflict response 409**: `CANVAS_VERSION_CONFLICT`.

### 5.6 Update thumbnail (riêng — multipart hoặc URL)

```
PUT /v1/canvas-templates/{id}/thumbnail
```

Body `multipart/form-data` hoặc JSON `{ "thumbnail_url": "https://..." }`.

> Tách endpoint vì thumbnail update khi user "Save preview" (FE generate PNG từ canvas) — không cần touch `canvas_data`.

### 5.7 Clone (Phase 2)

```
POST /v1/canvas-templates/{id}/clone
```

Body `{ "name": "Hero v1 (copy)", "collection_id": null }`.

→ Server copy row, reset `version=1`, set `created_by` = current user.

### 5.8 Delete (soft)

```
DELETE /v1/canvas-templates/{id}
```

Set `is_active = false`. Trả `200 + MessageBody`.

### 5.9 Curl examples

```bash
# 1) Login
curl -X POST $BE/v1/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@rexer.ai","password":"Admin1234"}' -c c.txt

# 2) Create canvas
TID=$(curl -s -X POST $BE/v1/canvas-templates -H 'Content-Type: application/json' -b c.txt \
  -d '{
    "name":"Hero v1",
    "width":800,"height":600,
    "engine":"fabric","engine_version":"fabric@6.4.0",
    "canvas_data":{"schema_version":"1.0","pages":[{"id":"p1","name":"Page 1","objects":[]}]}
  }' | jq -r .canvas_template.id)

# 3) List (metadata only — fast)
curl -b c.txt "$BE/v1/canvas-templates?limit=20" | jq '.items | map({id,name,canvas_size_bytes})'

# 4) Lazy-load canvas (with ETag)
curl -b c.txt -i "$BE/v1/canvas-templates/$TID/canvas"
# → 200 + ETag: "sha256:..."

# 5) Re-fetch with If-None-Match → 304
curl -b c.txt -i -H 'If-None-Match: "sha256:abc123"' \
  "$BE/v1/canvas-templates/$TID/canvas"

# 6) Patch metadata only (cheap)
curl -X PATCH $BE/v1/canvas-templates/$TID -H 'Content-Type: application/json' -b c.txt \
  -d '{"name":"Hero v1 (renamed)","version":1}'

# 7) Patch canvas (rewrites jsonb)
curl -X PATCH $BE/v1/canvas-templates/$TID -H 'Content-Type: application/json' -b c.txt \
  -d '{"canvas_data":{"schema_version":"1.0","pages":[]},"version":2}'
```

---

## 6. ETag + caching strategy

### 6.1 ETag generation

Server compute `canvas_etag = "sha256:" + hex(sha256(canvas_data_json))` mỗi khi `canvas_data` thay đổi (CREATE hoặc PATCH có canvas_data).

Lưu vào column `canvas_etag` để query nhanh, không phải re-hash.

### 6.2 Conditional GET

FE editor cache `canvas_etag` trong IndexedDB/localStorage. Khi reload:
1. `GET /v1/canvas-templates/{id}` → metadata mới (rẻ).
2. So sánh `canvas_etag` server vs cache.
3. Nếu match → dùng cache local, **không gọi `/canvas`**.
4. Nếu khác → `GET /canvas` với `If-None-Match: <old_etag>` → 200 + new payload, hoặc 304 nếu vẫn match (race window).

### 6.3 Cache headers

```
Cache-Control: private, max-age=86400, must-revalidate
ETag: "sha256:..."
Vary: Cookie
```

- `private` — không cache trên CDN edge cho user-specific (Phase 1)
- `max-age=86400` — browser cache 24h, sau đó revalidate
- `must-revalidate` — không serve stale khi expired
- `Vary: Cookie` — auth-aware

Phase 2 → `public` + CDN nếu template chia sẻ (xem §7).

### 6.4 Server-side cache (optional, nâng cao)

Redis key `canvas:{id}:{etag}` → cache JSON 1 giờ. Hit rate cao vì etag chỉ đổi khi user save.

---

## 7. CDN delivery (Phase 2)

Pattern Webflow/Figma:

1. Khi user save canvas → BE async push `canvas_data` lên S3:
   ```
   s3://rexer-canvas/{client_id}/{canvas_id}/{etag}.json
   ```
2. CloudFront serve với `public, max-age=31536000, immutable` (etag in path → never invalidate).
3. BE trả `canvas_url` thay vì serve JSON:
   ```json
   {
     "canvas_template": { ..., "canvas_url": "https://cdn.rexer.ai/xxx/yyy/sha256-abc.json" }
   }
   ```
4. FE fetch trực tiếp từ CDN — BE round-trip 0.

**Tradeoff**: thêm S3 + CloudFront infra. MVP skip, làm nếu scale > 1000 templates active.

---

## 8. Authorization

- User chỉ thấy template thuộc `client_id` mình hoặc `client_id IS NULL` (global library).
- `is_template = true` + `client_id IS NULL` → ai cũng đọc được, chỉ admin update.
- `DELETE` cần `created_by = user.id` HOẶC role = `admin`.
- Clone (Phase 2): được phép từ template public, copy về client của mình.

---

## 9. Error code catalog

| code | status | trigger |
|---|:---:|---|
| `CANVAS_NOT_FOUND` | 404 | id không tồn tại hoặc archived |
| `CANVAS_VERSION_CONFLICT` | 409 | optimistic lock fail |
| `CANVAS_PAYLOAD_TOO_LARGE` | 413 | `canvas_size_bytes > 10MB` |
| `CANVAS_INVALID_SCHEMA` | 400 | `schema_version` unsupported hoặc `pages` thiếu |
| `CANVAS_ENGINE_UNSUPPORTED` | 400 | `engine` không phải `fabric`/`konva` |
| `THUMBNAIL_INVALID_FORMAT` | 400 | upload không phải PNG/JPG/WebP |
| `THUMBNAIL_TOO_LARGE` | 413 | > 500KB |

---

## 10. SQL DDL

### 10.1 Migration

```sql
CREATE TABLE canvas_templates (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id          UUID            NULL REFERENCES clients(id) ON DELETE CASCADE,
    collection_id      UUID            NULL REFERENCES data_collections(id) ON DELETE SET NULL,
    name               VARCHAR(255)    NOT NULL,
    description        TEXT            NULL,
    width              INT             NOT NULL DEFAULT 800,
    height             INT             NOT NULL DEFAULT 600,
    thumbnail_url      VARCHAR(512)    NULL,
    canvas_data        JSONB           NOT NULL DEFAULT '{}'::jsonb,
    canvas_size_bytes  INT             GENERATED ALWAYS AS (octet_length(canvas_data::text)) STORED,
    canvas_etag        VARCHAR(64)     NOT NULL,
    engine             VARCHAR(32)     NOT NULL DEFAULT 'fabric',
    engine_version     VARCHAR(16)     NULL,
    is_active          BOOLEAN         NOT NULL DEFAULT TRUE,
    is_template        BOOLEAN         NOT NULL DEFAULT FALSE,
    version            INT             NOT NULL DEFAULT 1,
    created_by         UUID            NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by         UUID            NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT canvas_size_limit CHECK (canvas_size_bytes <= 10485760)  -- 10MB hard limit
);

-- Indexes
CREATE INDEX idx_canvas_client_active ON canvas_templates (client_id, is_active, updated_at DESC);
CREATE INDEX idx_canvas_collection    ON canvas_templates (collection_id) WHERE collection_id IS NOT NULL;
CREATE INDEX idx_canvas_template_pub  ON canvas_templates (is_template) WHERE is_template = TRUE AND client_id IS NULL;

-- Optional: full-text search trên name/description (Phase 2)
-- CREATE INDEX idx_canvas_fts ON canvas_templates USING GIN (to_tsvector('simple', name || ' ' || COALESCE(description,'')));

COMMENT ON COLUMN canvas_templates.canvas_data IS
    'Fabric.js scene serialized — see be-canvas-templates-spec.md §4';
COMMENT ON COLUMN canvas_templates.canvas_etag IS
    'sha256(canvas_data) — populated in service before INSERT/UPDATE';
COMMENT ON COLUMN canvas_templates.canvas_size_bytes IS
    'Generated column for monitoring + CHECK constraint enforcement';
```

> **KHÔNG dùng GIN trên `canvas_data`** vì chúng ta không search trong scene. GIN sẽ tốn 30-50% storage không cần thiết.

### 10.2 Tại sao không partition?

MVP < 100K rows không cần. Nếu sau scale > 10M rows → partition theo `client_id` hoặc `created_at` (yearly).

---

## 11. Go struct sketches

```go
package models

type CanvasTemplate struct {
    ID               uuid.UUID  `json:"id" db:"id"`
    ClientID         *uuid.UUID `json:"client_id,omitempty" db:"client_id"`
    CollectionID     *uuid.UUID `json:"collection_id,omitempty" db:"collection_id"`
    Name             string     `json:"name" db:"name"`
    Description      *string    `json:"description,omitempty" db:"description"`
    Width            int        `json:"width" db:"width"`
    Height           int        `json:"height" db:"height"`
    ThumbnailURL     *string    `json:"thumbnail_url,omitempty" db:"thumbnail_url"`
    CanvasData       JSONMap    `json:"canvas_data,omitempty" db:"canvas_data"`  // omitempty for list endpoints
    CanvasSizeBytes  int        `json:"canvas_size_bytes" db:"canvas_size_bytes"`
    CanvasEtag       string     `json:"canvas_etag" db:"canvas_etag"`
    Engine           string     `json:"engine" db:"engine"`
    EngineVersion    *string    `json:"engine_version,omitempty" db:"engine_version"`
    IsActive         bool       `json:"is_active" db:"is_active"`
    IsTemplate       bool       `json:"is_template" db:"is_template"`
    Version          int        `json:"version" db:"version"`
    CreatedBy        *uuid.UUID `json:"created_by,omitempty" db:"created_by"`
    UpdatedBy        *uuid.UUID `json:"updated_by,omitempty" db:"updated_by"`
    CreatedAt        time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`
}

// Two view models — list strips canvas_data, detail includes it via separate endpoint.

type CanvasTemplateMeta struct {
    // Same fields as CanvasTemplate but with CanvasData omitted.
    // Use a copy struct or json tag tricks to enforce no canvas_data in list responses.
}

// Request types

type CreateCanvasTemplateRequest struct {
    Name           string     `json:"name" validate:"required,max=255"`
    Description    *string    `json:"description,omitempty" validate:"omitempty,max=2000"`
    CollectionID   *uuid.UUID `json:"collection_id,omitempty"`
    Width          int        `json:"width" validate:"required,min=1,max=10000"`
    Height         int        `json:"height" validate:"required,min=1,max=10000"`
    Engine         string     `json:"engine,omitempty" validate:"omitempty,oneof=fabric konva custom"`
    EngineVersion  *string    `json:"engine_version,omitempty"`
    CanvasData     JSONMap    `json:"canvas_data" validate:"required"`
    IsTemplate     bool       `json:"is_template,omitempty"`
}

type UpdateCanvasTemplateRequest struct {
    Name           *string    `json:"name,omitempty" validate:"omitempty,max=255"`
    Description    *string    `json:"description,omitempty"`
    CollectionID   *uuid.UUID `json:"collection_id,omitempty"`
    Width          *int       `json:"width,omitempty"`
    Height         *int       `json:"height,omitempty"`
    Engine         *string    `json:"engine,omitempty"`
    EngineVersion  *string    `json:"engine_version,omitempty"`
    CanvasData     JSONMap    `json:"canvas_data,omitempty"`
    IsTemplate     *bool      `json:"is_template,omitempty"`
    IsActive       *bool      `json:"is_active,omitempty"`
    Version        int        `json:"version" validate:"required,min=1"`
}

// Response envelopes

type CanvasTemplateResponse struct {
    CanvasTemplate CanvasTemplate `json:"canvas_template"`
}

type CanvasDataResponse struct {
    CanvasData JSONMap `json:"canvas_data"`
    CanvasEtag string  `json:"canvas_etag"`
    Version    int     `json:"version"`
}

type CanvasTemplateListResponse struct {
    Items      []CanvasTemplate `json:"items"`  // service layer must zero out CanvasData
    Page       int              `json:"page"`
    Limit      int              `json:"limit"`
    Total      int64            `json:"total"`
    TotalPages int              `json:"total_pages"`
}
```

---

## 12. Service-layer logic

### 12.1 Compute ETag

```go
import (
    "crypto/sha256"
    "encoding/hex"
    "encoding/json"
)

func computeCanvasEtag(data JSONMap) (string, error) {
    b, err := json.Marshal(data)
    if err != nil { return "", err }
    sum := sha256.Sum256(b)
    return "sha256:" + hex.EncodeToString(sum[:]), nil
}
```

Run trong Create + Update (khi `canvas_data` thay đổi).

### 12.2 List query — KHÔNG select canvas_data

```sql
SELECT id, client_id, collection_id, name, description,
       width, height, thumbnail_url,
       canvas_size_bytes, canvas_etag,
       engine, engine_version,
       is_active, is_template, version,
       created_by, updated_by, created_at, updated_at
       -- canvas_data EXCLUDED
FROM canvas_templates
WHERE is_active = TRUE
  AND ($1::uuid IS NULL OR client_id = $1 OR client_id IS NULL)
ORDER BY updated_at DESC
LIMIT $2 OFFSET $3;
```

> Crucial: nếu `SELECT *` thì jsonb column vẫn fetched từ TOAST → vẫn chậm. **Whitelist columns**.

### 12.3 Get canvas — conditional response

```go
func (h *Handler) GetCanvas(c *gin.Context) {
    id := uuid.MustParse(c.Param("id"))
    meta, err := h.svc.GetMeta(ctx, id)
    if err != nil { /* 404 */ return }

    // Check If-None-Match
    if match := c.GetHeader("If-None-Match"); match != "" {
        if strings.Trim(match, `"`) == strings.Trim(meta.CanvasEtag, `"`) {
            c.Header("ETag", `"`+meta.CanvasEtag+`"`)
            c.Status(http.StatusNotModified)
            return
        }
    }

    // Cache miss — fetch full
    full, err := h.svc.GetWithCanvas(ctx, id)
    if err != nil { /* 500 */ return }

    c.Header("ETag", `"`+full.CanvasEtag+`"`)
    c.Header("Cache-Control", "private, max-age=86400, must-revalidate")
    c.Header("Vary", "Cookie")
    c.JSON(http.StatusOK, CanvasDataResponse{
        CanvasData: full.CanvasData,
        CanvasEtag: full.CanvasEtag,
        Version:    full.Version,
    })
}
```

### 12.4 Update — re-hash ETag if canvas changed

```go
func (s *Service) Update(ctx context.Context, id uuid.UUID, req UpdateRequest, userID uuid.UUID) (CanvasTemplate, error) {
    cur, err := s.repo.GetMeta(ctx, id)
    if err != nil { return CanvasTemplate{}, ErrNotFound }
    if cur.Version != req.Version {
        return CanvasTemplate{}, ErrVersionConflict
    }

    fields := []string{"updated_by = $userid", "updated_at = now()", "version = version + 1"}
    args := map[string]interface{}{"userid": userID}

    if req.CanvasData != nil {
        etag, err := computeCanvasEtag(req.CanvasData)
        if err != nil { return CanvasTemplate{}, err }
        fields = append(fields, "canvas_data = $data", "canvas_etag = $etag")
        args["data"] = req.CanvasData
        args["etag"] = etag
    }
    // ... other fields ...

    sql := fmt.Sprintf(`UPDATE canvas_templates SET %s WHERE id = $id AND version = $ver RETURNING *`,
        strings.Join(fields, ", "))
    // execute, scan, return
}
```

### 12.5 Optimistic lock pattern — same as Collections

Xem `docs/be-collections-spec.md` §12.2.

### 12.6 Strip CanvasData từ list

```go
func (s *Service) List(ctx context.Context, filters Filters) (CanvasTemplateListResponse, error) {
    rows, total, err := s.repo.ListMeta(ctx, filters)  // SQL whitelist columns, no canvas_data
    if err != nil { return CanvasTemplateListResponse{}, err }
    return CanvasTemplateListResponse{Items: rows, Page: filters.Page, ...}, nil
}
```

---

## 13. Handler routes

```go
canvas := v1.Group("/canvas-templates", authMiddleware)
canvas.GET("",              h.List)                  // metadata only
canvas.POST("",             h.Create)
canvas.GET("/:id",          h.Get)                   // metadata only
canvas.PATCH("/:id",        h.Update)                // partial update
canvas.DELETE("/:id",       h.Delete)                // soft delete
canvas.GET("/:id/canvas",   h.GetCanvas)             // ← LAZY: full canvas_data + ETag
canvas.PUT("/:id/thumbnail", h.UpdateThumbnail)      // multipart or url

// Phase 2
canvas.POST("/:id/clone",   h.Clone)
canvas.GET("/:id/versions", h.ListVersions)
canvas.GET("/:id/versions/:v", h.GetVersion)
```

### 13.1 Swagger annotations

Theo pattern hiện có. Đặc biệt cho `/canvas` endpoint — annotate response codes 200 + 304:

```go
// @Summary Get canvas data (lazy-load + ETag)
// @Tags canvas
// @Param id path string true "Canvas template ID"
// @Param If-None-Match header string false "ETag from previous fetch"
// @Success 200 {object} CanvasDataResponse
// @Success 304 "Not Modified"
// @Failure 404 {object} pkg_http.ErrorBody
// @Router /v1/canvas-templates/{id}/canvas [get]
```

---

## 14. Performance budgets

> Mục tiêu cho production. CI integration test phải đo và fail nếu vượt.

| Operation | p50 | p95 | p99 | Note |
|---|---|---|---|---|
| `GET /canvas-templates` (50 items) | < 50ms | < 150ms | < 300ms | Whitelist SQL columns, skip jsonb |
| `GET /canvas-templates/{id}` (meta) | < 30ms | < 80ms | < 150ms | 1 row, primary key lookup |
| `GET /canvas-templates/{id}/canvas` (cache miss, 500KB) | < 100ms | < 300ms | < 500ms | TOAST fetch + json marshal |
| `GET /canvas-templates/{id}/canvas` (304) | < 10ms | < 30ms | < 50ms | Etag compare only, no body |
| `POST /canvas-templates` (500KB scene) | < 200ms | < 500ms | < 1s | Insert + sha256 |
| `PATCH /canvas-templates/{id}` (canvas only, 500KB) | < 200ms | < 500ms | < 1s | TOAST rewrite + sha256 |
| `PATCH /canvas-templates/{id}` (metadata only, no canvas) | < 50ms | < 150ms | < 300ms | Quick row update |

**Payload size budget**:
- `canvas_data` warn ở 2MB, hard limit 10MB.
- List endpoint response < 100KB cho 50 items.
- Thumbnail < 500KB.

---

## 15. Test matrix

### 15.1 Unit tests

| # | Case | Expected |
|---|---|---|
| U1 | `computeCanvasEtag` deterministic | Same input → same etag |
| U2 | `computeCanvasEtag` sensitive to key order | Sorted keys → stable hash (use canonical JSON) |
| U3 | List service strips `CanvasData` | Items have `CanvasData == nil` |
| U4 | Update without `canvas_data` skips re-hash | ETag không đổi |
| U5 | Optimistic lock stale version | `CANVAS_VERSION_CONFLICT` |

### 15.2 Integration tests

| # | Method + path | Setup | Expected |
|---|---|---|---|
| I1 | `POST` body `{name, width, height, canvas_data}` | logged-in | 201, etag computed |
| I2 | `GET /canvas-templates` | 3 templates exist | items có 3, **không có `canvas_data`** field |
| I3 | `GET /:id` | exists | metadata trả, **không có `canvas_data`** |
| I4 | `GET /:id/canvas` | exists, no `If-None-Match` | 200 + body + ETag header |
| I5 | `GET /:id/canvas` với `If-None-Match` matching | | **304 Not Modified**, no body |
| I6 | `GET /:id/canvas` với `If-None-Match` stale | | 200 + new etag |
| I7 | `PATCH /:id` body `{name, version}` | v1 | 200, v2, etag KHÔNG đổi |
| I8 | `PATCH /:id` body `{canvas_data, version}` | v1 | 200, v2, etag THAY ĐỔI |
| I9 | `PATCH /:id` body `{version: 1}` after I8 | DB v2 | 409 `CANVAS_VERSION_CONFLICT` |
| I10 | `POST` body với `canvas_data` > 10MB | | 413 `CANVAS_PAYLOAD_TOO_LARGE` |
| I11 | `DELETE /:id` | own | 200, `is_active = false` |
| I12 | `GET` after delete | | item not in list |

### 15.3 Performance tests (k6 / vegeta)

```
scenarios:
  list_100rps:
    executor: constant-vus
    vus: 10
    duration: 30s
    exec: GET /v1/canvas-templates?limit=50
  fetch_canvas_50rps:
    vus: 5
    exec: GET /v1/canvas-templates/{id}/canvas (with If-None-Match 50% chance)
```

Pass criteria: p95 trong budget §14.

### 15.4 FE e2e (sau swap)

Khi BE deploy + FE clone canvas designer từ 360 → e2e check:
- List 20 canvas → < 200ms
- Mở 1 canvas → fetch + render
- Edit, save → ETag thay đổi
- Reload page → 304 (cache hit)

---

## 16. Acceptance criteria

### AC-1 · DDL & migration
- [ ] Migration apply sạch trên DB trống.
- [ ] `canvas_size_bytes` generated column tự update khi `canvas_data` thay đổi.
- [ ] CHECK constraint `canvas_size_bytes <= 10MB` enforce.
- [ ] Indexes tồn tại theo §10.1.

### AC-2 · Endpoints (8 cái MVP)
- [ ] CRUD: GET list / GET meta / POST / PATCH / DELETE.
- [ ] **GET `/canvas` lazy-load** với ETag + Cache-Control.
- [ ] PUT `/thumbnail` riêng.
- [ ] Wrap response `{ canvas_template: ... }`.
- [ ] List response **KHÔNG** có `canvas_data` field (kiểm tra bằng `jq '.items[0] | has("canvas_data") | not'`).

### AC-3 · ETag + caching
- [ ] `canvas_etag` recompute khi `canvas_data` đổi.
- [ ] `If-None-Match` matching → 304.
- [ ] `Cache-Control: private, max-age=86400` set trên 200.
- [ ] Update metadata-only KHÔNG đổi etag.

### AC-4 · Validation
- [ ] `width`/`height` 1-10000.
- [ ] `engine` enum check.
- [ ] Payload > 10MB → 413.
- [ ] Version conflict → 409.

### AC-5 · Auth
- [ ] User chỉ thấy template thuộc `client_id` mình hoặc `client_id IS NULL`.
- [ ] Non-owner DELETE → 403.

### AC-6 · Performance
- [ ] `GET /canvas-templates` (50 items, no canvas_data) p95 < 150ms (k6 verified).
- [ ] `GET /:id/canvas` p95 < 300ms cho 500KB scene.
- [ ] 304 response p95 < 30ms.

### AC-7 · Tránh API issues từ master log
- [ ] Không hard-code `localhost` trong response.
- [ ] Date trả ISO-8601 trực tiếp (không `SimpleDate` wrap).
- [ ] List response có `total_pages`.

### AC-8 · Tests
- [ ] Unit tests cover U1–U5.
- [ ] Integration tests cover I1–I12.
- [ ] k6 perf test pass budget §14.

---

## 17. Sprint plan

| Day | Task | Owner |
|---|---|---|
| **D1 AM** | Migration + entity Go struct | BE-1 |
| **D1 PM** | Repo (list whitelist, get meta, get with canvas) + sha256 helper | BE-1 |
| **D2 AM** | Service (etag, optimistic lock) + handler CRUD | BE-1 |
| **D2 PM** | `/canvas` endpoint với conditional 304 + Cache headers | BE-1 |
| **D3 AM** | `/thumbnail` endpoint + auth filter + role check | BE-1 |
| **D3 PM** | Unit + integration tests + Swagger + k6 perf | BE-1 |

**Estimate**: 3 ngày 1 dev.

---

## 18. Phase 2 backlog

| # | Item | Effort |
|---|---|---|
| P2-1 | Clone endpoint (`POST /:id/clone`) | 0.5d |
| P2-2 | Version history (table `canvas_template_versions`, endpoint list/get) | 1.5d |
| P2-3 | CDN publish to S3 (async worker, `canvas_url` field) | 2d |
| P2-4 | Real-time collab (WebSocket, OT/CRDT) | 5d+ |
| P2-5 | Merge fields validate (resolve `collection_id` + `field_key`) | 1d |
| P2-6 | Server-side render to PNG/PDF (cho thumbnail auto + export) | 2d |
| P2-7 | Animation preview server-side render (frame-by-frame) | 3d |

---

## 19. Open questions

1. **Storage backend**: chỉ Postgres (jsonb) hay tách `canvas_data` lưu S3 ngay từ MVP? S3 nhanh hơn cho large scenes nhưng phức tạp transactional.
2. **`canvas_etag` algorithm**: SHA-256 vs xxHash? SHA-256 secure nhưng chậm hơn (~5x). Cho ETag không cần crypto-secure → xxHash đủ và rẻ hơn.
3. **Multi-page**: limit số page tối đa (vd 100)?
4. **Engine versioning**: nếu user save với `fabric@5` rồi BE upgrade lên 6 → BE migrate sceneJSON tự động hay yêu cầu FE handle?
5. **Thumbnail generation**: FE tự generate (canvas → toDataURL) rồi PUT lên BE? Hay BE render từ `canvas_data` (cần headless browser)?
6. **Compression**: Postgres `TOAST` đã compress jsonb. Có cần thêm app-level gzip không? Recommend **không** — TOAST đủ và phá khả năng SQL `data->>field` query.
7. **Quota**: limit số template per client? Limit total `canvas_size_bytes` per client?

---

## 20. FE migration plan

Khi BE ready (giả định FE đã clone canvas designer từ 360-admin-cms):

1. Tạo `src/services/rexer/endpoints.ts`:
   ```ts
   canvasTemplates: {
     list:        (q?) => rx<CanvasTemplateListResponse>('/canvas-templates', { query: q }),
     get:         (id) => rx<CanvasTemplateResponse>(`/canvas-templates/${id}`).then(r => r.canvas_template),
     getCanvas:   (id, etag?) => rx<CanvasDataResponse>(`/canvas-templates/${id}/canvas`, {
       headers: etag ? { 'If-None-Match': etag } : undefined,
     }),
     create:      (b) => rx<CanvasTemplateResponse>('/canvas-templates', { method: 'POST', body: b }).then(r => r.canvas_template),
     update:      (id, b) => rx<CanvasTemplateResponse>(`/canvas-templates/${id}`, { method: 'PATCH', body: b }).then(r => r.canvas_template),
     remove:      (id) => rx<{ message?: string }>(`/canvas-templates/${id}`, { method: 'DELETE' }),
     setThumbnail:(id, file) => { /* multipart PUT */ },
   }
   ```

2. Cache layer (FE-side):
   - Lưu `canvas_etag` trong IndexedDB key `canvas:{id}:meta`.
   - Lưu `canvas_data` trong IndexedDB key `canvas:{id}:data:{etag}`.
   - Khi mở editor: fetch metadata → so sánh etag → load data từ cache hoặc fetch.

3. Wire `CanvasEditor.tsx` (clone từ 360):
   - Replace Supabase calls bằng `rexerApi.canvasTemplates.*`.
   - Adapt UI components từ Ant Design → atoms rexerai.
   - Toast `message.error` → `sonner.toast.error`.

---

## 21. References

- **Source canvas designer**: `360-admin-cms/src/containers/frontend/canvas-designer/` (CanvasEditor, hooks/use-canvas, components/LayersPanel)
- **Fabric.js docs**: https://fabricjs.com (engine cho canvas serialization)
- **Original DDL**: `360-admin-cms/supabase/migrations/20260406010000_create_canvas_templates.sql` (đã tham khảo, mở rộng cho rexerai)
- **Animation precedent**: `360-admin-cms/supabase/migrations/20260405180000_story_points_text_style_animation.sql`
- **Architecture decision**: phương án **B** (resource riêng) — chọn vì performance, xem chat history với FE team
- **Companion spec**: `docs/be-collections-spec.md` (Collection liên kết qua `collection_id`)
- **Master BE issues log**: `docs/be-issues-master.md` — tránh repeat issues cũ

---

**Câu hỏi / blocker** ping FE team — FE sẽ clone canvas designer source khi BE thông báo deploy staging.
