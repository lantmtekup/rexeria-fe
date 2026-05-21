# BE Missing APIs — Phase 1 Portal

**Date**: 2026-05-21
**Audience**: BE squad
**Status**: 🔴 Blocker cho portal go-live thật (hiện FE fallback fake data cho các phần này)

Sau khi audit Swagger `https://rexerai.tekupsoftware.com/swagger/doc.json` (97 endpoints) so với 8 trang portal đang build, đây là **danh sách endpoint thiếu** mà BE cần bổ sung để portal production hoàn chỉnh.

---

## 🔴 P0 — Folder hierarchy cho Media (BLOCKER)

**Pain point**: FE đang implement Google Drive style với folder tree, nhưng `GET /v1/media` chỉ trả flat list. Không có cách tạo / nest / move folder.

### Endpoints cần thêm

```
POST   /v1/media/folders                        Tạo folder mới
GET    /v1/media/folders                        List folder dạng tree
GET    /v1/media/folders/{folderId}             Folder detail + child count
PATCH  /v1/media/folders/{folderId}             Rename / move (đổi parent_id)
DELETE /v1/media/folders/{folderId}             Xoá (soft) — cảnh báo nếu có file con

GET    /v1/media?folder_id={id}&page=&limit=    Filter file theo folder
PATCH  /v1/media/{mediaId}                      Move file (đổi folder_id) + rename
```

### Schema `MediaFolder`

```sql
CREATE TABLE media_folders (
  id            uuid PRIMARY KEY,
  client_id     uuid NOT NULL,     -- workspace scope (xem multitenancy spec)
  workspace_id  uuid,              -- nullable Phase 1 (chưa có workspaces table)
  parent_id     uuid,              -- nullable = root, FK self
  name          text NOT NULL,
  description   text,
  file_count    int DEFAULT 0,     -- denormalized
  child_count   int DEFAULT 0,     -- denormalized
  size_bytes    bigint DEFAULT 0,  -- denormalized total
  created_by    uuid NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL,
  deleted_at    timestamptz,

  UNIQUE (client_id, parent_id, name) WHERE deleted_at IS NULL
);

CREATE INDEX idx_folders_parent ON media_folders (parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_folders_client ON media_folders (client_id, updated_at DESC);
```

### Schema migration cho `media_assets`

Thêm cột:
```sql
ALTER TABLE media_assets ADD COLUMN folder_id uuid REFERENCES media_folders(id);
CREATE INDEX idx_media_folder ON media_assets (folder_id) WHERE folder_id IS NOT NULL;
```

### Response shape

```ts
// MediaFolder
{
  id: string;
  parent_id: string | null;
  name: string;
  description?: string;
  file_count: number;
  child_count: number;
  size_bytes: number;
  created_at: string;
  updated_at: string;
}

// GET /media response (extend hiện có)
{
  items: MediaAsset[];      // file in current folder
  folders: MediaFolder[];   // sub-folders in current folder
  breadcrumb: MediaFolder[];// path từ root → current
  page, limit, total, total_pages;
}
```

### Constraints
- **Max depth**: 8 levels (chống deep nesting gây UI vỡ)
- **Name unique** trong cùng 1 parent + cùng client
- **Move validation**: không cho move vào con của mình (cycle prevention)
- **Soft delete folder** → cascade soft delete file con (hoặc cảnh báo trước)

---

## 🔴 P0 — File operations chi tiết

**Pain point**: Có `init/raw/complete` upload nhưng thiếu CRUD chi tiết cho 1 file.

### Endpoints cần thêm

```
PATCH  /v1/media/{mediaId}                      Update metadata: name, description, tags, folder_id, campaign
DELETE /v1/media/{mediaId}                      Soft delete (đã có nhưng cần confirm bulk)
POST   /v1/media/bulk-delete                    Bulk delete { ids: [] }
POST   /v1/media/bulk-move                      Bulk move { ids: [], folder_id }
GET    /v1/media/{mediaId}/download             Signed URL TTL 1h (private bucket)
```

### Bổ sung field cho `MediaAsset`

```sql
ALTER TABLE media_assets ADD COLUMN tags text[];
ALTER TABLE media_assets ADD COLUMN campaign text;
ALTER TABLE media_assets ADD COLUMN description text;
ALTER TABLE media_assets ADD COLUMN thumbnail_url text;   -- Lambda gen sau upload
ALTER TABLE media_assets ADD COLUMN scan_status text DEFAULT 'pending';
   -- 'pending' | 'clean' | 'infected' | 'error'
```

### Optional Phase 2
- **Resumable upload (TUS)** cho file > 100MB
- **Zip import** — upload zip, BE auto-extract + tạo folder
- **Image transformations** — resize/crop on-fly qua URL params

---

## 🟡 P1 — Workspace multitenancy

**Pain point**: FE đã build workspace switcher (`useActiveWorkspace`) nhưng BE chưa có `workspaces` table. Hiện FE dùng fake `FAKE_WORKSPACES`.

### Endpoints cần thêm

```
POST   /v1/admin/clients/{clientId}/workspaces   Tạo workspace cho client
GET    /v1/clients/{clientId}/workspaces         List workspaces của client
PATCH  /v1/admin/workspaces/{workspaceId}        Update workspace
DELETE /v1/admin/workspaces/{workspaceId}        Soft delete

GET    /v1/me/workspaces                         List workspace user thuộc về
POST   /v1/me/workspace/switch                   Switch active_workspace_id (rotate JWT)
```

### Schema (đã document trong `be-workspace-multitenancy-spec.md`)

```sql
CREATE TABLE workspaces (...);          -- client_id FK, slug, name, etc.
CREATE TABLE workspace_members (...);   -- workspace × user × role
ALTER TABLE canvas_templates  ADD workspace_id uuid;
ALTER TABLE products          ADD workspace_id uuid;
-- etc cho mọi content table
```

### JWT claims bổ sung

```json
{
  "sub": "...",
  "role": "admin|staff|brand_owner|brand_member|brand_viewer",
  "client_id": "...",
  "active_workspace_id": "...",
  "memberships": [{"client_id":"...","workspace_id":"...","role":"..."}]
}
```

### Middleware
Mọi query content phải tự inject `WHERE client_id=? AND workspace_id=?`. Staff bypass qua header `X-Workspace-Override`.

---

## 🟡 P1 — Comments thread per template

**Pain point**: Page `/portal/comments` đang dùng fake data. Cần thread comment giữa Brand Client ↔ Staff Rexer per template.

### Endpoints

```
GET    /v1/portal/templates/{templateId}/comments  List comments + replies
POST   /v1/portal/templates/{templateId}/comments  Create comment (root hoặc reply qua parent_id)
PATCH  /v1/portal/comments/{commentId}             Sửa body (chỉ author)
POST   /v1/portal/comments/{commentId}/resolve     Mark resolved (chỉ root)
DELETE /v1/portal/comments/{commentId}             Soft delete
```

### Schema

```sql
CREATE TABLE template_comments (
  id            uuid PK,
  workspace_id  uuid,
  template_id   uuid NOT NULL,        -- FK canvas_templates
  parent_id     uuid,                 -- nullable; reply nếu có
  author_id     uuid NOT NULL,
  author_role   text NOT NULL,        -- snapshot ('brand_owner'/'staff'/...)
  body          text NOT NULL,        -- markdown, ≤ 4000 ký tự
  status        text DEFAULT 'open',  -- 'open' | 'resolved' (chỉ root)
  resolved_by   uuid,
  resolved_at   timestamptz,
  created_at    timestamptz,
  updated_at    timestamptz,
  deleted_at    timestamptz
);

CREATE INDEX idx_cmt_template ON template_comments (template_id, created_at ASC) WHERE deleted_at IS NULL;
```

### Markdown sanitize
Strip `<img>`, `<iframe>`, `<script>` tags để chống XSS.

---

## 🟡 P1 — Notifications

**Pain point**: Page header có 🔔 bell + badge số chưa đọc, nhưng hiện fake.

### Endpoints

```
GET    /v1/portal/notifications?unread=true&page=&limit=   List
POST   /v1/portal/notifications/mark-read                  Body: { ids: [] | all: true }
GET    /v1/portal/notifications/unread-count               Quick count cho badge
```

### Schema

```sql
CREATE TABLE notifications (
  id            uuid PK,
  user_id       uuid NOT NULL,
  workspace_id  uuid,
  kind          text NOT NULL,  -- xem dưới
  actor_id      uuid,
  subject_type  text NOT NULL,  -- 'template'|'comment'|'asset'|'workspace'
  subject_id    uuid NOT NULL,
  meta          jsonb,          -- { template_title, comment_excerpt, ... }
  read_at       timestamptz,
  created_at    timestamptz
);

CREATE INDEX idx_notif_user_unread ON notifications (user_id, read_at, created_at DESC) WHERE read_at IS NULL;
```

### `kind` enum

| kind | trigger |
|---|---|
| `template_published` | Staff publish landing → notify Brand |
| `template_updated` | Staff update template → notify Brand (throttle 1h) |
| `comment_new` | Brand comment → notify Staff |
| `comment_resolved` | Staff resolve → notify root author |
| `asset_uploaded` | Brand upload → notify Staff (throttle 5min batch) |
| `workspace_invited` | Staff invite member → notify invitee |

### Real-time
- Polling 30s cho Alpha
- WebSocket / SSE cho Beta

---

## 🟡 P1 — Activity feed (dashboard)

**Pain point**: Dashboard có "Recent activity" feed (8 row). Hiện fake.

### Endpoint

```
GET /v1/portal/activity?workspace_id=&limit=20
```

Aggregate từ multiple tables:
- `canvas_templates` (publish/update)
- `template_comments` (new/resolve)
- `media_assets` (upload)
- `workspace_members` (join)

Response: array sự kiện đã merge sort theo `created_at desc`.

---

## 🟡 P2 — Staff Inbox

**Pain point**: Staff Rexer cần 1 chỗ xem tất cả task xuyên-workspace cần xử lý.

### Endpoint

```
GET /v1/admin/inbox?status=open&kind=&assignee_id=
```

Aggregate:
- Comment chưa resolve
- Asset upload chưa link template
- Workspace request publish

```
POST /v1/admin/inbox/{itemId}/take     Staff claim
POST /v1/admin/inbox/{itemId}/done     Mark resolved
```

---

## 🟢 P3 — Ads platforms (low priority)

Page `/portal/ads` hiện full fake (Meta/Google/TikTok). Cần integration:

```
GET /v1/portal/ads/campaigns                  List campaigns from connected accounts
GET /v1/portal/ads/campaigns/{id}/metrics     Real-time metrics
POST /v1/portal/ads/oauth/{platform}/connect  OAuth flow để link account
```

Spec cần viết riêng (`be-ads-integration-spec.md`) — không gấp Alpha.

---

## 🟢 P3 — Curate (analytics_events ingest)

Page `/portal/curate` hiển thị 16 interaction types config. Cần:

```
GET    /v1/portal/curate/interaction-types     List enabled types per workspace
PATCH  /v1/portal/curate/interaction-types/{kind}  Enable/disable
GET    /v1/portal/curate/events?limit=20       Real-time event feed (last 25min)
```

`POST /v1/analytics/events` đã có nhưng đang 429 lỗi config → BE cần fix.

---

## 📋 Tóm tắt priority

| Priority | Module | Endpoints | Blocker level |
|:---:|---|:---:|---|
| 🔴 P0 | Media folders | 5 + 2 | Chặn /portal/media production |
| 🔴 P0 | File operations | 4 | UX bị thiếu (rename/move/bulk) |
| 🟡 P1 | Workspaces | 6 | Chặn multi-brand thật |
| 🟡 P1 | Comments | 5 | /portal/comments fake |
| 🟡 P1 | Notifications | 3 | Bell badge fake |
| 🟡 P1 | Activity feed | 1 | Dashboard fake feed |
| 🟡 P2 | Staff Inbox | 3 | Cần khi nhiều brand |
| 🟢 P3 | Ads platforms | 3+ | Có spec riêng sau |
| 🟢 P3 | Curate config | 3 | Phase 2 |

**Tổng**: ~33 endpoint mới cần BE bổ sung.

---

## 🐛 BE Bug cần fix

### B-1. `POST /v1/analytics/events` return 429 immediate
- Request đầu tiên đã `{"code":"too_many_requests","message":"analytics ingest temporarily unavailable"}`
- Có vẻ rate-limiter config sai (threshold = 0 hoặc endpoint chưa enable)
- Cần BE check config

### B-2. `GET /v1/admin/analytics/templates/{id}/breakdown` trả 500 khi id không phải UUID
- Currently: `{"code":"ERR_INTERNAL","message":"ERROR: invalid input syntax for type uuid: ..."}`
- Nên return `400 Bad Request` với clean message, không leak SQLSTATE

---

## Files liên quan

- FE folder UI: `src/app/(client-portal)/portal/media/page.tsx`
- FE workspace switcher: `src/app/(client-portal)/portal/_shell.tsx` + `_workspace.ts`
- FE comments: `src/app/(client-portal)/portal/comments/page.tsx`
- FE remote loaders: `src/app/(client-portal)/portal/_remote.tsx`
- Existing specs (đã viết, BE cần implement):
  - [be-workspace-multitenancy-spec.md](be-workspace-multitenancy-spec.md)
  - [be-asset-upload-spec.md](be-asset-upload-spec.md)
  - [be-client-portal-spec.md](be-client-portal-spec.md)
  - [be-template-analytics-spec.md](be-template-analytics-spec.md) ✅ đã implement

---

**Reviewer**: FE Lan (`Lantm@tekup.vn`) · BE squad lead
**Next step**: BE confirm priority + estimate timeline cho P0 (media folders + file ops) trước.
