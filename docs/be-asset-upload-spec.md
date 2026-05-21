# BE Spec — Asset Upload (Phase 1)

**Mục tiêu**: Cho phép Brand Client (và Staff Rexer) upload tài liệu / hình ảnh để dùng làm input cho AI / canvas:
1. Direct-to-S3 upload qua presigned URL (không tốn bandwidth BE).
2. Metadata + tag + organize theo workspace.
3. Staff browse asset của brand khi làm template.
4. Search / filter asset (theo tag, type, ngày).

**Trạng thái**: 🆕 Mới. Phụ thuộc `be-workspace-multitenancy-spec.md`.

**Base**: `/v1`
**Auth**: CookieAuth.
**Convention**: snake_case JSON, UUID, ISO-8601.

---

## 0. Phạm vi Alpha

**Bao gồm**:
- Bảng `assets`.
- Endpoint presigned URL → FE upload trực tiếp lên S3.
- Endpoint confirm upload (FE bắn sau khi upload xong).
- List / get / delete / tag.
- Thumbnail auto-gen cho ảnh (Lambda trigger từ S3 event).
- Virus scan (ClamAV stub — chỉ flag, không block Alpha).
- Notification cho staff Rexer khi brand upload mới.

**Loại trừ**:
- Image manipulation (crop, resize) — Phase 2.
- Video transcode — Phase 2.
- Asset version history — Phase 2.
- CDN distribution — Phase 2 (Alpha dùng S3 + CloudFront origin).

---

## 1. Resource: `Asset`

### 1.1. Schema

| field          | type                | required | ghi chú                                                |
|----------------|---------------------|:--------:|--------------------------------------------------------|
| `id`           | uuid                |    ✓     |                                                        |
| `workspace_id` | uuid (FK)           |    ✓     | scope theo brand                                       |
| `uploaded_by`  | uuid (FK users.id)  |    ✓     | brand_member hoặc staff                                |
| `name`         | text (≤256)         |    ✓     | tên file gốc (sanitized)                               |
| `kind`         | enum                |    ✓     | xem §1.2                                               |
| `mime_type`    | text (≤128)         |    ✓     | `image/jpeg`, `application/pdf`, `video/mp4`...        |
| `size_bytes`   | bigint              |    ✓     | sau khi upload xong (S3 callback)                      |
| `s3_key`       | text                |    ✓     | path trên S3: `ws/<workspace>/<yyyy>/<mm>/<uuid>-<name>` |
| `s3_bucket`    | text                |    ✓     |                                                        |
| `cdn_url`      | text                |    —     | URL CDN public (signed nếu private bucket)             |
| `thumbnail_url`| text                |    —     | thumb 256x256 (Lambda gen sau upload)                  |
| `width`        | int                 |    —     | px (chỉ image)                                         |
| `height`       | int                 |    —     | px                                                     |
| `duration_ms`  | int                 |    —     | chỉ video / audio                                      |
| `tags`         | text[]              |    —     | array text labels                                      |
| `campaign`     | text (≤64)          |    —     | optional campaign tag                                  |
| `template_id`  | uuid (FK)           |    —     | gắn cho template cụ thể (NULL = chung)                 |
| `description`  | text (≤2048)        |    —     | note của user                                          |
| `scan_status`  | enum                |    ✓     | `pending` \| `clean` \| `infected` \| `error`          |
| `upload_status`| enum                |    ✓     | `pending` \| `uploaded` \| `failed`                    |
| `deleted_at`   | timestamptz         |    —     | soft delete                                            |
| `created_at`   | timestamptz         |    ✓     |                                                        |

### 1.2. Enum `kind`

| kind        | mime prefix                              |
|-------------|------------------------------------------|
| `image`     | image/*                                  |
| `video`     | video/*                                  |
| `audio`     | audio/*                                  |
| `document`  | application/pdf, .docx, .xlsx, .pptx     |
| `archive`   | application/zip, .rar, .7z               |
| `other`     | mọi mime khác                            |

BE detect từ `mime_type` lúc confirm upload — KHÔNG trust client.

### 1.3. Index

```sql
CREATE INDEX idx_assets_ws_created
  ON assets (workspace_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_template
  ON assets (template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_assets_kind
  ON assets (workspace_id, kind, created_at DESC);
CREATE INDEX idx_assets_tags_gin
  ON assets USING GIN (tags);
```

---

## 2. Upload flow

**Direct-to-S3** — FE upload trực tiếp, không qua BE.

```
┌──────┐                  ┌──────┐                    ┌────┐
│  FE  │                  │  BE  │                    │ S3 │
└──┬───┘                  └──┬───┘                    └─┬──┘
   │ POST /assets/presign    │                          │
   ├──────────────────────► │                          │
   │                         │ Validate + insert       │
   │                         │   (status=pending)      │
   │                         │                          │
   │ 200 { url, fields,      │                          │
   │       asset_id }        │                          │
   │ ◄──────────────────────┤                          │
   │                                                     │
   │ POST <s3_url> multipart                            │
   ├────────────────────────────────────────────────► │
   │                                                     │
   │ 204                                                 │
   │ ◄────────────────────────────────────────────────┤
   │                                                     │
   │ POST /assets/{id}/confirm                           │
   ├──────────────────────► │                          │
   │                         │ HEAD s3 → get size, mime│
   │                         ├────────────────────────►│
   │                         │ ◄───────────────────────┤
   │                         │ UPDATE status=uploaded  │
   │                         │ Enqueue thumbnail job   │
   │                         │ Enqueue virus scan      │
   │ 200 { asset }           │                          │
   │ ◄──────────────────────┤                          │
```

### 2.1. `POST /v1/assets/presign`

- **Security**: CookieAuth — bất kỳ user nào trong workspace.
- **Body**:
  ```json
  {
    "name": "brand-guideline.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 4521000,
    "kind_hint": "document",
    "campaign": "may_2026",
    "template_id": null
  }
  ```
- **Validation**:
  - `size_bytes ≤ 100 MB` (image/doc) hoặc `≤ 500 MB` (video) — hard limit.
  - `mime_type` thuộc whitelist (xem §2.3).
  - Quota: ≤ 10 GB / workspace (Alpha; Phase 2 tier-based).
- **Action**:
  1. Insert row `assets` (status = `pending`, scan = `pending`).
  2. Sinh S3 key: `ws/{workspace_slug}/{yyyy}/{mm}/{uuid}-{sanitized_name}`.
  3. Gọi AWS SDK `CreatePresignedPost` với expire 5 phút + content-type lock + max-size lock.
- **Response 200**:
  ```json
  {
    "asset_id": "...",
    "s3_url": "https://rexer-assets.s3.amazonaws.com/",
    "fields": {
      "key": "ws/cocacola-vn/2026/05/...",
      "Content-Type": "application/pdf",
      "Policy": "...",
      "X-Amz-Signature": "..."
    },
    "expires_at": "2026-05-21T07:35:00Z"
  }
  ```

### 2.2. `POST /v1/assets/{id}/confirm`

- **Security**: CookieAuth — chỉ user đã tạo asset.
- **Body**: `{}` (rỗng) hoặc optional `{ "tags": ["hero"], "description": "..." }`.
- **Action**:
  1. `HEAD` S3 object → verify exists + lấy size + content-type thực.
  2. Nếu mismatch (size lớn hơn declared, mime khác) → mark `upload_status=failed`, trả 422.
  3. UPDATE row: `status=uploaded`, `size_bytes=<actual>`, `mime_type=<actual>`.
  4. Detect `kind` từ mime; nếu image → enqueue thumbnail (Lambda).
  5. Enqueue virus scan (ClamAV worker hoặc AWS GuardDuty).
  6. Push notification cho Staff Rexer (xem §5).
- **Response 200**: full asset object.

### 2.3. MIME whitelist

```
image/jpeg, image/png, image/webp, image/gif, image/svg+xml
video/mp4, video/webm, video/quicktime
audio/mpeg, audio/wav
application/pdf
application/vnd.openxmlformats-officedocument.wordprocessingml.document
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
application/vnd.openxmlformats-officedocument.presentationml.presentation
application/zip
text/plain, text/csv
```

Mime không trong whitelist → reject ở `/presign` với `unsupported_mime`.

---

## 3. List / search / get / delete

### 3.1. `GET /v1/assets`

- **Query**:
  - `q` — search trong name + description (Postgres `ilike`).
  - `kind` — filter (image/video/document...).
  - `tags` — comma-sep.
  - `campaign`.
  - `template_id`.
  - `from`, `to` — ISO date.
  - `page`, `per_page` (default 24, max 100).
  - `sort` — `created_at_desc` | `name_asc` | `size_desc`.
- **Response**: paginated list + thumbnail URLs.

### 3.2. `GET /v1/assets/{id}`

- Detail single asset + signed `cdn_url` (TTL 1 giờ nếu bucket private).

### 3.3. `PATCH /v1/assets/{id}`

- Update tags, description, campaign, template_id. KHÔNG cho update name, s3_key, size.

### 3.4. `DELETE /v1/assets/{id}`

- Soft delete (`deleted_at = now()`).
- Cron job xoá file S3 sau 30 ngày soft-delete.

### 3.5. `POST /v1/assets/bulk-delete`

- Body: `{ "ids": ["uuid", ...] }`.

---

## 4. Thumbnail generation

**Trigger**: S3 ObjectCreated event → Lambda function.

**Logic**:
- Image: dùng `sharp` resize về 256×256 (cover), upload sang `<bucket>/thumbnails/<key>`.
- Video: ffmpeg extract frame ở giây 0.5, resize 256×256.
- PDF: pdf-image extract page 1.
- Khác: dùng icon mặc định theo `kind`.

Update `assets.thumbnail_url` qua webhook về BE.

---

## 5. Notifications

Khi Brand Client upload asset → notify Staff Rexer trực tiếp phụ trách workspace đó:

- **In-app**: row mới trong `notifications` table (xem `be-client-portal-spec.md` §5).
- **Email** (optional): digest 1 lần / ngày.

---

## 6. Quotas

| Plan              | Storage / workspace | Max single file | Bandwidth / month |
|-------------------|---------------------|-----------------|-------------------|
| `phase1_managed`  | 10 GB               | 100 MB image/doc, 500 MB video | 100 GB |
| `phase2_selfserve`| TBD                 | TBD             | TBD               |

Check ở `POST /presign` — vượt → trả `quota_exceeded` 402.

---

## 7. Error codes

| code                   | when                                              |
|------------------------|---------------------------------------------------|
| `unsupported_mime`     | MIME không trong whitelist                        |
| `file_too_large`       | size_bytes vượt limit                             |
| `quota_exceeded`       | workspace đã đầy quota                            |
| `presign_expired`      | confirm sau khi presigned URL hết hạn (>5 phút)   |
| `s3_object_not_found`  | confirm nhưng S3 chưa có object                   |
| `mime_mismatch`        | mime thực ≠ declared                              |
| `asset_not_found`      |                                                   |
| `not_owner`            | user khác cố delete asset không thuộc về          |

---

## 8. Test plan

- **Unit**: validate mime whitelist, size limit, slug sanitize trong S3 key.
- **Integration**:
  - Presign + curl upload với minio (local S3) + confirm → asset clean trong DB.
  - Upload file vượt size declared → confirm trả `mime_mismatch`.
  - Upload PDF rồi xoá → soft delete; cron sau 30 ngày → hard delete S3.
  - Quota: upload đến 9.99 GB rồi 1 file 100MB nữa → `quota_exceeded`.
- **Load**: 100 concurrent presign + upload qua minio — verify không deadlock.

---

## 9. Câu hỏi mở

1. Bucket private (signed URL TTL 1h) hay public (CDN)? — Đề xuất **private** cho doc/PDF, **public CDN** cho image dùng trong canvas (perf).
2. Sanitize tên file thế nào? — Đề xuất: keep alpha-numeric + dash + underscore + dot, replace còn lại bằng `-`.
3. Có cho phép Brand upload `application/javascript` / `text/html` không? — KHÔNG (XSS risk).
4. Resumable upload (TUS) cho file lớn? — Beta; Alpha dùng S3 multipart standard.

---

**Owner**: BE squad
**Reviewer**: FE Lan, DevOps, Security
**Liên quan**:
- [be-workspace-multitenancy-spec.md](be-workspace-multitenancy-spec.md) — workspace_id scope.
- [be-client-portal-spec.md](be-client-portal-spec.md) — UI portal show asset grid.
- [be-ai-canvas-apply-product-spec.md](be-ai-canvas-apply-product-spec.md) — AI dùng asset làm input.
