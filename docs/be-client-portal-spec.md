# BE Spec — Brand Client Portal (Phase 1)

**Mục tiêu**: Cung cấp endpoint cho FE Brand Client Portal (`/portal/*`):
1. Dashboard tổng hợp stat (templates / views / leads / assets).
2. Recent activity stream (staff publish gì, brand upload gì).
3. Comments thread per-template (brand request edit ↔ staff resolve).
4. Brand profile management.
5. Inbox/Queue cho Staff Rexer xem việc cần làm.

**Trạng thái**: 🆕 Mới. Phụ thuộc:
- `be-workspace-multitenancy-spec.md` (workspace_id scope)
- `be-asset-upload-spec.md` (assets)
- `be-template-analytics-spec.md` (analytics)
- `be-canvas-templates-spec.md` (canvas_templates)

**Base**: `/v1`
**Auth**: CookieAuth.
**Convention**: snake_case JSON, UUID, ISO-8601.

---

## 0. Phạm vi Alpha

**Bao gồm**:
- Dashboard endpoint trả 6 stat + recent activity (cached 60s).
- Comments thread (1 thread / template).
- Notifications (in-app + count badge).
- Brand profile read/update.
- Staff inbox listing all open tasks across workspaces.

**Loại trừ**:
- @-mention trong comment (Phase 2).
- File attachment trong comment (Phase 2 — dùng `assets` endpoint riêng).
- Comment per-block (chỉ per-template ở Alpha).
- Real-time WebSocket update — Alpha dùng polling 30s.

---

## 1. Resource: `Comment`

### 1.1. Schema

| field          | type                | required | ghi chú                                                |
|----------------|---------------------|:--------:|--------------------------------------------------------|
| `id`           | uuid                |    ✓     |                                                        |
| `workspace_id` | uuid                |    ✓     | scope                                                  |
| `template_id`  | uuid                |    ✓     | FK canvas_templates                                    |
| `parent_id`    | uuid                |    —     | NULL = root; có giá trị = reply                        |
| `author_id`    | uuid (FK users)     |    ✓     |                                                        |
| `author_role`  | text                |    ✓     | snapshot role lúc viết (brand_owner / staff...)        |
| `body`         | text (≤4000)        |    ✓     | Markdown                                               |
| `status`       | enum                |    ✓     | `open` \| `resolved` (chỉ root)                        |
| `resolved_by`  | uuid                |    —     | NULL khi chưa resolve                                  |
| `resolved_at`  | timestamptz         |    —     |                                                        |
| `created_at`   | timestamptz         |    ✓     |                                                        |
| `updated_at`   | timestamptz         |    ✓     |                                                        |
| `deleted_at`   | timestamptz         |    —     | soft delete                                            |

### 1.2. Index

```sql
CREATE INDEX idx_cmt_template
  ON comments (template_id, created_at ASC) WHERE deleted_at IS NULL;
CREATE INDEX idx_cmt_status
  ON comments (workspace_id, status, created_at DESC)
  WHERE parent_id IS NULL AND deleted_at IS NULL;
```

---

## 2. Resource: `Notification`

### 2.1. Schema

| field          | type                | required | ghi chú                                                |
|----------------|---------------------|:--------:|--------------------------------------------------------|
| `id`           | uuid                |    ✓     |                                                        |
| `user_id`      | uuid                |    ✓     | recipient                                              |
| `workspace_id` | uuid                |    ✓     |                                                        |
| `kind`         | enum                |    ✓     | xem §2.2                                               |
| `actor_id`     | uuid                |    —     | người gây sự kiện                                      |
| `subject_type` | enum                |    ✓     | `template` \| `comment` \| `asset` \| `workspace`      |
| `subject_id`   | uuid                |    ✓     | id của object liên quan                                |
| `meta`         | jsonb (≤1 KB)       |    —     | `{ "template_title": "...", "comment_excerpt": "..." }`|
| `read_at`      | timestamptz         |    —     | NULL = chưa đọc                                        |
| `created_at`   | timestamptz         |    ✓     |                                                        |

### 2.2. Enum `kind`

| kind                    | recipient                                            |
|-------------------------|------------------------------------------------------|
| `template_published`    | Brand client members                                 |
| `template_updated`      | Brand client members                                 |
| `comment_new`           | Người khác trong thread + staff phụ trách            |
| `comment_resolved`      | Comment author                                       |
| `asset_uploaded`        | Staff Rexer của workspace                            |
| `workspace_invited`     | User được invite                                     |

### 2.3. Index

```sql
CREATE INDEX idx_notif_user_unread
  ON notifications (user_id, read_at, created_at DESC)
  WHERE read_at IS NULL;
CREATE INDEX idx_notif_user_all
  ON notifications (user_id, created_at DESC);
```

---

## 3. Endpoints — Brand Client

### 3.1. `GET /v1/portal/dashboard`

- **Security**: CookieAuth, bất kỳ role brand_*.
- **Cache**: 60s server-side.
- **Response**:
  ```json
  {
    "workspace": {
      "id": "...",
      "name": "Coca-Cola Vietnam",
      "logo_url": "..."
    },
    "stats": {
      "templates_count": 12,
      "templates_published": 8,
      "total_views_30d": 124820,
      "total_visitors_30d": 81240,
      "total_clicks_30d": 5620,
      "total_leads_30d": 287,
      "assets_count": 142,
      "storage_used_bytes": 2840000000
    },
    "trend": {
      "views_7d": [1200, 1450, 1320, ...],
      "leads_7d": [12, 18, 15, ...]
    },
    "open_comments": 3,
    "unread_notifications": 5
  }
  ```

### 3.2. `GET /v1/portal/templates`

- **Query**: `status` (draft / published / archived), `page`, `per_page`, `sort` (updated_at_desc / views_desc).
- **Response**: list canvas_template (chỉ những template thuộc workspace), kèm:
  - `thumbnail_url`
  - `views_30d`, `clicks_30d`, `leads_30d` (join analytics_events)
  - `open_comments_count`
  - `last_updated_by` (staff hoặc brand).

### 3.3. `GET /v1/portal/templates/{id}`

- Detail template + analytics summary 30d + comments count.

### 3.4. `GET /v1/portal/templates/{id}/analytics`

- Wrap endpoint `/v1/admin/analytics/templates/{id}/breakdown` nhưng scope theo workspace.
- Brand client thấy số liệu của template thuộc brand mình.

### 3.5. `GET /v1/portal/templates/{id}/comments`

- **Query**: `status` (open/resolved/all default open).
- **Response**: array comment + replies nested theo `parent_id`.

### 3.6. `POST /v1/portal/templates/{id}/comments`

- **Body**: `{ "body": "...", "parent_id": null }`.
- **Action**: insert; nếu có parent_id → notify root author + staff; nếu root → notify staff phụ trách.

### 3.7. `PATCH /v1/portal/comments/{id}`

- Sửa body (chỉ author).

### 3.8. `POST /v1/portal/comments/{id}/resolve`

- Mark root comment resolved (brand_owner hoặc staff).
- Notify thread participants.

### 3.9. `GET /v1/portal/assets`

- Proxy của `GET /v1/assets` (workspace-scoped).

### 3.10. `POST /v1/portal/assets/presign`

- Proxy của `POST /v1/assets/presign` (workspace-scoped).

### 3.11. `GET /v1/portal/notifications`

- **Query**: `unread` (boolean), `page`, `per_page` (default 20).
- **Response**: list + `total_unread`.

### 3.12. `POST /v1/portal/notifications/mark-read`

- **Body**: `{ "ids": ["uuid", ...] }` hoặc `{ "all": true }`.

### 3.13. `GET /v1/portal/profile`

- Brand info: name, logo, contact info, members list.

### 3.14. `PATCH /v1/portal/profile`

- **Security**: `brand_owner` only.
- **Body**: cho phép sửa logo_url, contact_phone, meta. KHÔNG cho sửa name/slug (admin only).

---

## 4. Endpoints — Staff Rexer

### 4.1. `GET /v1/admin/inbox`

- Aggregate tất cả task cần Staff xử lý cross-workspace:
  - Comment mới chưa resolve.
  - Asset upload mới chưa link vào template.
  - Workspace request publish.
- **Query**: `workspace_id` (filter), `kind`, `assignee_id`, `from`, `to`.
- **Response**:
  ```json
  [
    {
      "id": "...",
      "kind": "comment_new",
      "workspace": { "id": "...", "name": "Coca-Cola VN" },
      "subject_type": "template",
      "subject_id": "...",
      "subject_title": "Landing Tour Đà Nẵng",
      "actor": { "id": "...", "name": "An Nguyen" },
      "excerpt": "Đổi màu CTA sang xanh đậm hơn...",
      "created_at": "..."
    }
  ]
  ```

### 4.2. `POST /v1/admin/inbox/{id}/take`

- Staff claim task → assignee_id = staff hiện tại.

### 4.3. `POST /v1/admin/inbox/{id}/done`

- Mark resolved.

---

## 5. Notification firing rules

| Event                                  | Who gets notified                                                |
|----------------------------------------|------------------------------------------------------------------|
| Staff publish template lần đầu         | Brand client members (kind: `template_published`)                |
| Staff update template (canvas_data)    | Brand client members (kind: `template_updated`, throttle 1h)     |
| Brand client tạo comment root          | Staff phụ trách workspace (kind: `comment_new`)                  |
| Anyone reply comment                   | Root author + người đã reply trong thread                        |
| Staff resolve comment                  | Root author (kind: `comment_resolved`)                           |
| Brand client upload asset              | Staff phụ trách (kind: `asset_uploaded`, throttle 5 phút batch)  |
| Staff invite brand client              | Invitee (qua email, không in-app vì chưa có account)             |

**Throttle**: dùng Redis sorted-set với key `notif:{user_id}:{kind}:{subject_id}` — nếu fire trong cửa sổ → skip.

---

## 6. Caching

- Dashboard endpoint: cache 60s (key = `dashboard:{workspace_id}`).
- Templates list: cache 30s.
- Comments + notifications: KHÔNG cache (cần realtime feel).
- Invalidate khi:
  - Template publish/update → invalidate dashboard + templates list cache.
  - Asset upload confirm → invalidate dashboard cache.
  - Comment created/resolved → invalidate dashboard.

---

## 7. Error codes

| code                       | when                                              |
|----------------------------|---------------------------------------------------|
| `comment_too_long`         | body > 4000 ký tự                                 |
| `comment_not_found`        |                                                   |
| `cannot_edit_others_comment` | sửa comment người khác                          |
| `cannot_resolve_reply`     | thử resolve comment có parent_id                  |
| `not_workspace_member`     | brand cố xem workspace khác                       |
| `not_brand_owner`          | brand_member cố PATCH profile                     |

---

## 8. Test plan

- **Unit**: validate body length, parent_id constraint (1 level), markdown sanitize.
- **Integration**:
  - Brand A login → GET /portal/dashboard → chỉ thấy stat của workspace A.
  - Brand A tạo comment trên template không thuộc workspace mình → 403.
  - Staff resolve comment → root author nhận notif.
  - Throttle: spam 10 reply 1 phút → notif chỉ fire 1 lần đầu.
- **Load**: 100 brands cùng poll `/portal/dashboard` → cache hit rate > 90%.

---

## 9. UI mockup tham khảo

FE đang demo tại `/overview/portal-demo/*`:
- `/overview/portal-demo` — dashboard
- `/overview/portal-demo/templates` — list
- `/overview/portal-demo/assets` — upload zone
- `/overview/portal-demo/comments` — comments thread

Khi BE deploy xong → move sang `/portal/*` thật (đã có route group `(client-portal)`).

---

## 10. Câu hỏi mở

1. **@-mention trong comment** — Alpha có cần không? Đề xuất KHÔNG, chỉ cần thread đơn giản.
2. **Markdown support** — full GFM hay chỉ bold/italic/link? Đề xuất full GFM nhưng strip image/iframe để an toàn.
3. **Email digest** — gửi daily summary cho brand không login lâu? Phase 2.
4. **Activity log audit** — cần lưu mọi action staff làm (publish/edit/delete) để brand audit? Đề xuất CÓ bảng `audit_logs` riêng — nhưng làm spec riêng Phase 2.
5. **Brand client có thể tự edit canvas không?** Phase 1 KHÔNG (managed service). Phase 2 mới enable.

---

**Owner**: BE squad
**Reviewer**: FE Lan, Product, Ops (vì liên quan tới flow phục vụ brand)
**Liên quan**:
- [be-workspace-multitenancy-spec.md](be-workspace-multitenancy-spec.md)
- [be-asset-upload-spec.md](be-asset-upload-spec.md)
- [be-template-analytics-spec.md](be-template-analytics-spec.md)
- [be-canvas-templates-spec.md](be-canvas-templates-spec.md)
