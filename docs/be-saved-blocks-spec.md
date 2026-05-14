# BE Spec — Saved Blocks (Reusable Block Library)

**FE owner:** @Lantm
**Date:** 2026-05-14
**Status:** Đề xuất — FE đã ship phase 1 client-side (localStorage). BE confirm để FE migrate sang server-backed.
**Related:** `docs/be-extra-elements-spec.md`, `src/components/modules/CanvasTemplate/block-editor/savedBlocks.ts`

---

## 1. Mục tiêu

Cho phép user **save 1 block** đã tuỳ chỉnh (content + extra elements + element styles + motion + tracking) làm **block tái sử dụng** trong tài khoản của họ — sau đó insert lại vào bất kỳ canvas template nào.

**Use case điển hình:**
- Designer tạo block hero có nhiều hotspot + tracking + animation chuẩn đẹp → save
- Tạo canvas khác → mở "Saved blocks" → insert lại, không phải config từ đầu
- Có thể rename/delete saved blocks trong library

---

## 2. Phase 1 — FE client-side (đã ship)

`localStorage[rexer:saved-blocks]` lưu mảng `SavedBlock`:
```ts
{
  id: string;           // sb_<random>
  name: string;
  thumbnail?: string;   // optional, defer
  block: Block;         // full block payload — incl. extraElements
  createdAt: string;    // ISO
}
```

Hành vi:
- Lưu cục bộ trong trình duyệt user → mất khi clear cookies / đổi máy
- Cross-tab sync qua `storage` event + custom `rexer:saved-blocks:changed`
- API helpers tại `savedBlocks.ts`: `list / save / rename / delete / instantiate`

⚠️ **Hạn chế:** không sync giữa thiết bị; không share giữa user trong cùng team.

---

## 3. Phase 2 — BE-backed (proposed)

### 3.1. Endpoints

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/v1/saved-blocks` | List saved-blocks của user hiện tại (paginated) |
| `GET` | `/v1/saved-blocks/{id}` | Detail 1 saved-block |
| `POST` | `/v1/saved-blocks` | Tạo mới — body: `CreateSavedBlockRequest` |
| `PATCH` | `/v1/saved-blocks/{id}` | Rename / update thumbnail / replace block payload |
| `DELETE` | `/v1/saved-blocks/{id}` | Soft delete (set `deleted_at`) |
| `POST` | `/v1/saved-blocks/import` | Bulk import từ FE localStorage (migration aid) |

Optional, defer phase 3:
- `POST /v1/saved-blocks/{id}/share` — share saved block với user khác trong team
- `GET /v1/admin/saved-blocks` — admin xem toàn bộ

### 3.2. Request / response shape

**List response (`GET /v1/saved-blocks`)**

```jsonc
{
  "items": [
    {
      "id": "sb_<uuid>",
      "name": "Hero Epic Tower",
      "thumbnail_url": "https://cdn…/sb_xxx.jpg",  // optional
      "block_type": "hero_overlay",                 // derived from block.blockType
      "block": { /* full Block payload */ },
      "created_at": "2026-05-14T08:00:00Z",
      "updated_at": "2026-05-14T08:30:00Z",
      "user_id": "<uuid>"
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 4,
  "total_pages": 1
}
```

**Create request (`POST /v1/saved-blocks`)**

```jsonc
{
  "name": "Hero Epic Tower",
  "block": { /* Block payload — match canvas_data block schema v2.0 */ },
  "thumbnail_url": null   // optional
}
```

→ trả `SavedBlock` (response 201).

**Update request (`PATCH`)**

```jsonc
{
  "name": "Hero Epic Tower v2",        // optional
  "block": { /* … */ },                 // optional — replace full payload
  "thumbnail_url": "https://…",         // optional
  "version": 1                          // REQUIRED — optimistic lock (giống canvas_templates Q21)
}
```

### 3.3. Validation

- `name`: string, 1..200 chars, không bắt buộc unique (1 user có thể save 2 block cùng tên).
- `block`: validate đúng schema `canvas_data.blocks[]` (v2.0 schema, gồm `extraElements` nếu BE đã accept theo `be-extra-elements-spec.md`).
- `block.blockType`: phải nằm trong enum hiện tại (`hero_split | hero_overlay | feature_section | photo_gallery | booking_form | cta_section | image_carousel`).
- Cap **100 saved blocks/user** để tránh storage abuse.
- Soft delete: `deleted_at` IS NULL filter trên list.

### 3.4. Auth

- Phase 2: chỉ user-scope. Mỗi row có `user_id` (FK auth user). User chỉ đọc/sửa/xoá của chính mình.
- 403 `ERR_FORBIDDEN` khi cố access row của user khác.

### 3.5. Error codes (đề xuất)

| Code | HTTP | Khi nào |
|---|---|---|
| `ERR_SAVED_BLOCK_NOT_FOUND` | 404 | id không tồn tại / đã soft-delete |
| `ERR_SAVED_BLOCK_INVALID` | 400 | block payload sai schema |
| `ERR_SAVED_BLOCK_LIMIT` | 429 | user đạt 100/100 |
| `ERR_CANVAS_VERSION_CONFLICT` | 409 | PATCH với `version` sai (optimistic lock) |
| `ERR_FORBIDDEN` | 403 | Đọc/sửa row của user khác |
| `ERR_BAD_REQUEST` | 400 | JSON parse / validate cấu trúc |

---

## 4. DB schema (proposed)

```sql
CREATE TABLE saved_blocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  block_type    TEXT NOT NULL,           -- denormalised from block.blockType for filtering
  block         JSONB NOT NULL,          -- full Block payload
  thumbnail_url TEXT,
  version       INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX saved_blocks_user_active_idx
  ON saved_blocks (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX saved_blocks_user_type_idx
  ON saved_blocks (user_id, block_type)
  WHERE deleted_at IS NULL;
```

JSON column `block` không có constraint cứng — BE validator chạy ở app layer khi POST/PATCH.

---

## 5. Migration from localStorage

FE cung cấp **bulk import endpoint** để migrate user-existing saved blocks (localStorage) lên BE khi phase 2 ship:

`POST /v1/saved-blocks/import`

```jsonc
{
  "items": [
    {
      "name": "Hero Epic Tower",
      "block": { /* … */ },
      "created_at": "2026-05-14T08:00:00Z"   // FE preserves the timestamp
    }
  ]
}
```

Response:
```jsonc
{ "created": 4, "skipped": 0, "items": [/* 4 SavedBlock objects */] }
```

BE skip khi user đã có ≥ 100 saved blocks; FE hiện warning.

FE migration flow (1-time per user):
1. Login → FE detect `localStorage[rexer:saved-blocks]` còn data + `me.has_migrated_saved_blocks === false`
2. POST `/import` → response merge với BE list
3. Clear localStorage
4. Set `me.has_migrated_saved_blocks = true` qua một flag trong user profile

⚠️ Cần BE thêm 1 field `has_migrated_saved_blocks: boolean` trong user profile (hoặc `me_settings`).

---

## 6. Thumbnail

Phase 2 vẫn defer. FE muốn hiển thị thumbnail = canvas capture của block:
- Option A: BE generate thumbnail tự động khi POST/PATCH (chạy headless render). **Phức tạp**.
- Option B: FE chụp screenshot bằng `html2canvas` rồi upload vào media (URL được set trong `thumbnail_url`). **Đơn giản hơn**.

Phase 1 / 2 đều bỏ thumbnail; FE hiện hiển thị icon theo `block_type` thay thế. Confirm hướng cho phase 3.

---

## 7. Câu hỏi cần BE confirm

1. **Cap 100 saved blocks/user** có hợp lý không? Hay tier plan (free 20, pro unlimited)?
2. **Bulk import endpoint** OK không, hay BE chỉ accept POST từng cái?
3. **`me.has_migrated_saved_blocks`** flag có thể thêm vào user profile schema không?
4. **Validation block payload** — chạy chung validator với `canvas_data.blocks[]` (cùng v2.0 schema) hay cần validator riêng cho saved_blocks?
5. **Soft delete** — phase 2 có cần restore endpoint không, hay defer phase 3?
6. **Sharing** (giữa user cùng team) — phase 3 hay sớm hơn?

---

## 8. FE plan tiếp theo (sau khi BE ack)

Khi BE ship saved-blocks API, FE:
1. Bọc `savedBlocks.ts` thành thin client gọi `rexerApi.savedBlocks.*` thay cho localStorage.
2. Giữ shape `SavedBlock` không đổi cho consumers — chỉ thay storage layer.
3. Thêm migration flow (§5).
4. Loading / error state cho list (vì giờ là async).
5. Optimistic update: khi POST/PATCH/DELETE → patch local cache trước, rollback nếu BE fail.

Effort FE wire BE: **~1.5 ngày**.

---

## 9. Liên hệ

- FE: @Lantm
- BE: ack 6 câu §7 trước khi schedule patch
- Spec / PO: align nếu cần sharing / team-scope
