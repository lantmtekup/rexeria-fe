# BE Spec — Client + Workspace Multi-tenancy (Phase 1)

**Mục tiêu**: Cho phép Rexer phục vụ nhiều client và mỗi client có nhiều workspace với data isolation rõ ràng:
1. **Client** = pháp nhân / công ty mua dịch vụ (vd "Coca-Cola Vietnam"). 1 client có thể có **nhiều workspace** con (vd brand Coca-Cola, brand Fanta, brand Sprite — đều thuộc Coca-Cola VN client).
2. Mỗi **Workspace** chứa template / asset / collection / analytics riêng — không lẫn sang workspace khác cùng client trừ khi user có quyền cả 2.
3. Staff Rexer (role `admin`/`staff`) thấy mọi client + mọi workspace (qua header override).
4. **Brand Client user** (role `brand_*`) thuộc về 1 client; được cấp quyền vào ≥ 1 workspace của client đó.
5. Middleware scope: mọi query phải filter theo `workspace_id` active; `client_id` chỉ dùng cho việc list workspace của user / billing / admin.

**Hierarchy**:
```
Client (Coca-Cola Vietnam, pháp nhân, billing entity)
 ├── Workspace "Coca-Cola brand"       (templates, assets, products riêng)
 ├── Workspace "Fanta brand"
 ├── Workspace "Sprite brand"
 └── Workspace "Olympic 2026 campaign" (cross-brand)
```

**Trạng thái**: 🆕 Mới. Foundational — chặn các spec khác (analytics, assets, portal) cho tới khi xong.

**Base**: `/v1`
**Auth**: CookieAuth — JWT claim chứa `workspace_id` active + `role`.
**Convention**: snake_case JSON, UUID, ISO-8601.
**Error body**: `pkg_http.ErrorBody`.

---

## 0. Phạm vi Alpha

**Bao gồm**:
- **Extend `clients` table** (đang có) — thêm fields `slug`, `logo_url`, `industry`, `legal_name`, `contact_email/phone`, `country_code`, `plan`, `meta`.
- Bảng mới **`workspaces`** có `client_id` FK → `clients.id` (N:1).
- Bảng mới **`workspace_members`** (user_id × workspace_id × role).
- Migration: thêm cột `workspace_id` (NOT NULL với default workspace cho data cũ) vào:
  `canvas_templates`, `data_collections`, `products`, `assets`, `analytics_events`, `saved_blocks`. Bonus: thêm `client_id` cho denorm/perf nếu query toàn-client.
- Migration data cũ: mỗi `client` đang có → tạo 1 default workspace có cùng tên.
- Endpoint admin tạo / sửa / invite workspace.
- Endpoint user list workspace mình thuộc về + switch active.
- Middleware scope query theo `workspace_id` (primary) + `client_id` (cho billing / cross-workspace report).
- Email invite flow (invite vào 1 workspace cụ thể của client).

**Loại trừ Alpha**:
- Workspace billing / plan tier (Phase 2).
- Cross-workspace clone template (Phase 2).
- Workspace usage analytics (Phase 2).
- SSO per-workspace (Phase 3).

---

## 1. Resource: `Client` (extends existing `clients` table)

### 1.1. Schema

`clients` đã có (xem `src/services/rexer/types.ts:426`) — extend các cột mới (cũ vẫn giữ):

| field          | type                | required | ghi chú                                                |
|----------------|---------------------|:--------:|--------------------------------------------------------|
| `id`           | uuid                |    ✓     | (đã có)                                                |
| `name`         | text (≤128)         |    ✓     | (đã có) — "Coca-Cola Vietnam"                          |
| `status`       | enum                |    ✓     | (đã có) — `active` \| `paused` \| `archived`           |
| **`legal_name`**   | text (≤256)     |    —     | **MỚI** — tên pháp nhân in hợp đồng                    |
| **`contact_email`**| text            |    ✓     | **MỚI** — primary contact                              |
| **`contact_phone`**| text (≤32)      |    —     | **MỚI**                                                |
| **`country_code`** | text(2)         |    —     | **MỚI** — ISO 3166-1                                   |
| **`plan`**     | enum                |    ✓     | **MỚI** — `phase1_managed` \| `phase2_selfserve`       |
| **`meta`**     | jsonb (≤4 KB)       |    —     | **MỚI** — billing/contract notes                       |
| `created_at`   | timestamptz         |    ✓     | (đã có)                                                |
| `updated_at`   | timestamptz         |    ✓     | (đã có)                                                |

**Đặc biệt**: KHÔNG có `slug` / `logo_url` / `industry` ở client level — những thứ đó thuộc workspace (vì 1 client có thể có nhiều brand riêng biệt).

---

## 2. Resource: `Workspace` (mới)

### 2.1. Schema

| field          | type                | required | ghi chú                                                |
|----------------|---------------------|:--------:|--------------------------------------------------------|
| `id`           | uuid                |    ✓     |                                                        |
| `client_id`    | uuid (FK clients.id)|    ✓     | **N:1 — 1 client có nhiều workspace**                  |
| `slug`         | text (≤32)          |    ✓     | unique per client; dùng cho URL `/portal/[client]/[slug]` |
| `name`         | text (≤128)         |    ✓     | "Coca-Cola", "Fanta", "Olympic 2026 Campaign"          |
| `description`  | text (≤512)         |    —     | "Brand chính của Coca-Cola VN"                         |
| `logo_url`     | text                |    —     | từ S3 — logo brand riêng của workspace                 |
| `industry`     | text (≤64)          |    —     | "Beverage", "F&B"... — có thể khác sub-brand           |
| `status`       | enum                |    ✓     | `active` \| `paused` \| `archived`                     |
| `meta`         | jsonb (≤4 KB)       |    —     | color palette, custom_domain, notes...                 |
| `created_by`   | uuid (FK users.id)  |    ✓     | staff Rexer đã tạo workspace                           |
| `created_at`   | timestamptz         |    ✓     |                                                        |
| `updated_at`   | timestamptz         |    ✓     |                                                        |

### 2.2. Index

```sql
CREATE INDEX idx_ws_client ON workspaces (client_id, status, created_at DESC);
CREATE UNIQUE INDEX idx_ws_slug_per_client ON workspaces (client_id, slug);
```

**Lưu ý**: `slug` chỉ unique per-client (không global) — vd cả "Coca-Cola VN" client và "Pepsi VN" client đều có thể có workspace slug `main-brand`.

---

## 3. Resource: `WorkspaceMember`

Bảng nối user ↔ workspace (N:N). Một user có thể là member của nhiều workspace; 1 workspace có nhiều member.

### 3.1. Schema

| field         | type                          | required | ghi chú                                  |
|---------------|-------------------------------|:--------:|------------------------------------------|
| `id`          | uuid                          |    ✓     |                                          |
| `workspace_id`| uuid (FK workspaces.id)       |    ✓     |                                          |
| `client_id`   | uuid (FK clients.id)          |    ✓     | denorm để query nhanh "user X thuộc clients nào" |
| `user_id`     | uuid (FK users.id)            |    ✓     |                                          |
| `role`        | enum                          |    ✓     | xem §3.2                                 |
| `status`      | enum                          |    ✓     | `active` \| `invited` \| `removed`       |
| `invited_by`  | uuid (FK users.id)            |    —     | NULL nếu là staff Rexer tự add           |
| `invited_at`  | timestamptz                   |    —     |                                          |
| `joined_at`   | timestamptz                   |    —     | NULL khi `invited` chưa accept           |
| `created_at`  | timestamptz                   |    ✓     |                                          |

### 3.2. Enum `role` (workspace-scoped)

| role            | mô tả                                                                         |
|-----------------|-------------------------------------------------------------------------------|
| `brand_owner`   | Decision-maker phía brand (xem all, invite member khác trong workspace)       |
| `brand_member`  | Nhân viên brand (xem analytics, upload assets, comment)                       |
| `brand_viewer`  | Read-only — chỉ xem dashboard, không upload / comment                         |

**Lưu ý**: role `admin` / `staff` (global) **không** lưu trong bảng này — họ có quyền xem mọi workspace qua middleware bypass.

### 3.3. Global role enum (`users.role`)

Phân biệt admin vs staff để rõ permission:

| role     | quyền | UI label |
|----------|-------|----------|
| `admin`  | System admin — đổi role user khác, quản lý billing, tạo client, xoá workspace | "Admin Rexer" |
| `staff`  | Operator — design template, edit canvas, manage brand content; KHÔNG đổi role / billing | "Staff Rexer" |
| `user`   | Self-serve user (Phase 2+) — sở hữu canvas riêng nhưng không thuộc client managed | "User" |
| `guest`  | Khách chưa login — chỉ xem trang public `/p/[slug]` | "Khách" |

**Khi nào dùng cái nào**:
- Trang `/overview` (use case docs) gọi chung là **"Admin"** cho cả 2 (vì UC góc nhìn không phân biệt) — internal type `ActorName = 'Admin'`.
- DB enum thực tế phân biệt rõ `admin` vs `staff` để control panel `/admin/users` chỉ admin mới có quyền edit role.
- Brand-side: `brand_owner | brand_member | brand_viewer` (workspace-scoped, không phải global).

### 3.3. Constraints

```sql
CREATE UNIQUE INDEX idx_wm_unique
  ON workspace_members (workspace_id, user_id)
  WHERE status != 'removed';
CREATE INDEX idx_wm_user ON workspace_members (user_id, status);
CREATE INDEX idx_wm_workspace ON workspace_members (workspace_id, status);
CREATE INDEX idx_wm_client_user ON workspace_members (client_id, user_id, status);
```

Một user có thể thuộc nhiều workspace của cùng client (vd "Brand Manager" của Coca-Cola VN có quyền cả 4 brand) hoặc nhiều client (freelancer agency).

**Constraint cross-table**: `workspace_members.client_id` PHẢI bằng `workspaces.client_id` (trigger hoặc CHECK constraint).

---

## 4. Migration data cũ

### 4.1. Bước 1 — Extend `clients` table
```sql
ALTER TABLE clients ADD COLUMN legal_name   text;
ALTER TABLE clients ADD COLUMN contact_email text;
ALTER TABLE clients ADD COLUMN contact_phone text;
ALTER TABLE clients ADD COLUMN country_code text(2);
ALTER TABLE clients ADD COLUMN plan         text DEFAULT 'phase1_managed';
ALTER TABLE clients ADD COLUMN meta         jsonb;
-- Backfill: contact_email từ admin user đầu tiên thuộc client
UPDATE clients SET contact_email = COALESCE(...);
ALTER TABLE clients ALTER COLUMN contact_email SET NOT NULL;
```

### 4.2. Bước 2 — Tạo `workspaces` + `workspace_members`
```sql
CREATE TABLE workspaces (...);
CREATE TABLE workspace_members (...);
-- Cho mỗi client hiện có, tạo 1 default workspace cùng tên
INSERT INTO workspaces (id, client_id, slug, name, status, created_by)
  SELECT uuid_generate_v4(), c.id, 'main', c.name, 'active', c.id /* or system */
  FROM clients c;
```

### 4.3. Bước 3 — Add `workspace_id` + `client_id` vào content tables
```sql
ALTER TABLE canvas_templates  ADD COLUMN workspace_id uuid, ADD COLUMN client_id uuid;
ALTER TABLE data_collections  ADD COLUMN workspace_id uuid, ADD COLUMN client_id uuid;
ALTER TABLE products          ADD COLUMN workspace_id uuid;  -- products.client_id đã có
ALTER TABLE assets            ADD COLUMN workspace_id uuid, ADD COLUMN client_id uuid;
ALTER TABLE analytics_events  ADD COLUMN workspace_id uuid, ADD COLUMN client_id uuid;
ALTER TABLE saved_blocks      ADD COLUMN workspace_id uuid, ADD COLUMN client_id uuid;

-- Backfill: gán workspace_id = workspace default của client
UPDATE <table> t
SET workspace_id = w.id, client_id = w.client_id
FROM workspaces w
WHERE w.client_id = t.client_id AND w.slug = 'main';

-- Sau backfill:
ALTER TABLE <table> ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE <table> ALTER COLUMN client_id    SET NOT NULL;

CREATE INDEX idx_<table>_workspace_time ON <table>(workspace_id, created_at DESC);
CREATE INDEX idx_<table>_client_time    ON <table>(client_id, created_at DESC);
```

**Lý do giữ cả 2 cột**: `workspace_id` để filter chính xác per-brand; `client_id` để query nhanh cho billing / cross-workspace report mà không phải JOIN qua `workspaces`.

### 4.4. Bước 4 — Migrate `client_users` → `workspace_members`
```sql
-- Mỗi client_user cũ → 1 workspace_member cho workspace default
INSERT INTO workspace_members (id, workspace_id, client_id, user_id, role, status, joined_at)
  SELECT uuid_generate_v4(), w.id, cu.client_id, cu.user_id, 'brand_owner', 'active', cu.created_at
  FROM client_users cu
  JOIN workspaces w ON w.client_id = cu.client_id AND w.slug = 'main';
```

---

## 5. JWT claims

Cập nhật JWT khi user login:
```json
{
  "sub": "<user_id>",
  "role": "admin" | "staff" | "brand_owner" | "brand_member" | "brand_viewer" | "user" | "guest",
  "client_id": "<uuid>",           // chỉ cho brand_* — null với admin/staff
  "active_workspace_id": "<uuid>", // workspace đang chọn
  "memberships": [
    { "client_id": "<uuid>", "workspace_id": "<uuid>", "role": "brand_owner" },
    { "client_id": "<uuid>", "workspace_id": "<uuid>", "role": "brand_member" }
  ],
  "exp": 1234567890
}
```

- `role` top-level = role **global** (`admin`/`staff`) hoặc role trong active workspace.
- `client_id` chỉ có cho `brand_*` role — bảo đảm không cross-client.
- `memberships[]` cho phép switch giữa các workspace cùng client (hoặc cross-client với freelancer).
- `active_workspace_id` mặc định = workspace đầu tiên user thuộc về; rotate qua endpoint switch (§6.5).
- Staff Rexer login: `client_id` = null, `memberships` = `[]`, có quyền override qua header `X-Workspace-Override` + `X-Client-Override`.

---

## 6. Endpoints

### 6.1. `POST /v1/admin/clients/{client_id}/workspaces`

- **Security**: CookieAuth, role `admin` / `staff`.
- **Path**: `client_id` — client cha của workspace mới.
- **Body**:
  ```json
  {
    "slug": "coca-cola-main",
    "name": "Coca-Cola Main Brand",
    "description": "Brand chính của Coca-Cola VN",
    "industry": "Beverage",
    "logo_url": null
  }
  ```
- **Validation**:
  - `slug` unique per `client_id` (cùng slug ở client khác là OK).
  - `name` required.
  - `client_id` phải tồn tại và `status = active`.
- **Response 201**: full workspace object có `client_id`.

### 6.2. `POST /v1/admin/clients` (extend nếu cần)

- Tạo client mới (chỉ admin). Sau khi tạo, gọi 6.1 để tạo workspace đầu tiên.
- **Body**:
  ```json
  {
    "name": "Coca-Cola Vietnam",
    "legal_name": "Công ty TNHH Coca-Cola Việt Nam",
    "contact_email": "ops@cocacola.vn",
    "country_code": "VN",
    "plan": "phase1_managed"
  }
  ```

### 6.3. `POST /v1/admin/workspaces/{id}/invite`

- **Security**: CookieAuth, role `admin` / `staff` (hoặc `brand_owner` của chính workspace đó).
- **Body**:
  ```json
  {
    "email": "ceo@cocacola.vn",
    "role": "brand_owner",
    "first_name": "An",
    "last_name": "Nguyen"
  }
  ```
- **Action**:
  1. Tìm hoặc tạo user theo email (status = `pending`).
  2. Tạo `workspace_member` (status = `invited`).
  3. Gửi mail có link `/accept-invite?token=...` (token TTL 7 ngày).
- **Response 200**: `{ "invite_id": "...", "expires_at": "..." }`.

### 5.3. `POST /v1/auth/accept-invite`

- **Security**: public, dùng token từ mail.
- **Body**:
  ```json
  { "token": "...", "password": "..." }
  ```
- **Action**: validate token, set password, mark member `active`, set `joined_at`, issue session cookie.

### 5.4. `GET /v1/me/workspaces`

- **Security**: CookieAuth.
- **Response**: list workspace user thuộc về:
  ```json
  [
    {
      "workspace_id": "...",
      "slug": "cocacola-vn",
      "name": "Coca-Cola Vietnam",
      "logo_url": "...",
      "role": "brand_owner",
      "is_active": true
    }
  ]
  ```

### 5.5. `POST /v1/me/workspace/switch`

- **Body**: `{ "workspace_id": "..." }`
- **Action**: validate user là member; rotate JWT với `active_workspace_id` mới; trả cookie mới.
- **Response 200**: `{ "active_workspace_id": "..." }`.

### 5.6. `GET /v1/admin/workspaces`

- **Security**: CookieAuth, `admin` / `staff` only.
- **Query**: `q` (search), `status`, `plan`, `page`, `per_page`, `sort`.
- **Response**: paginated list.

### 5.7. `PATCH /v1/admin/workspaces/{id}`

- Sửa name, logo, status, plan, meta.

### 5.8. `DELETE /v1/admin/workspaces/{id}/members/{user_id}`

- Soft-remove member (status = `removed`).

---

## 7. Middleware scope (Client + Workspace)

Mỗi handler API (trừ `/admin/workspaces` và `/auth/*`) phải tự động filter query theo **cả `workspace_id` lẫn `client_id`**:

**Quy tắc scope**:
- Brand client (`brand_*`): `WHERE workspace_id = me.active_workspace_id AND client_id = me.client_id` — hard-enforced, không thể bypass.
- Staff Rexer (`admin`/`staff`): mặc định `WHERE workspace_id = active_workspace_id` từ header override; có thể đặt `?across_workspaces=true` để xem toàn-client (cho billing report).
- Bonus: dùng `client_id` đứng đầu compound index → query nhanh + bảo vệ chéo client.

```go
func ScopeMiddleware(next http.Handler) http.Handler {
    return func(w, r) {
        claims := authFromCookie(r)
        var clientID, workspaceID string

        if isStaff(claims.Role) {
            // Staff: header override > active từ JWT
            clientID    = pickFirst(r.Header.Get("X-Client-Override"),    claims.ActiveClientID)
            workspaceID = pickFirst(r.Header.Get("X-Workspace-Override"), claims.ActiveWorkspaceID)
        } else {
            // brand_*: chỉ scope theo claims, KHÔNG đọc header
            clientID    = claims.ClientID
            workspaceID = claims.ActiveWorkspaceID
            // Validate: workspace phải thuộc client (xảy ra ở repository CHECK constraint, double-check ở đây)
            if !isMember(claims.UserID, workspaceID) {
                http.Error(w, "forbidden_workspace", 403)
                return
            }
        }

        ctx := withScope(r.Context(), clientID, workspaceID)
        next(w, r.WithContext(ctx))
    }
}
```

**Repository layer** đọc cả `ctx.ClientID()` và `ctx.WorkspaceID()` và append vào mọi query:
```sql
WHERE client_id = ? AND workspace_id = ?
```
Đặt `client_id` trước trong WHERE clause để hit compound index `(client_id, workspace_id, created_at)`.

**Postgres RLS (nice-to-have Phase 2)**: bật Row-Level Security policy để DB tự enforce.

---

## 7. Error codes

| code                  | when                                              |
|-----------------------|---------------------------------------------------|
| `workspace_not_found` | id không tồn tại                                  |
| `workspace_slug_taken`| slug đã được dùng                                 |
| `invite_expired`      | token quá 7 ngày                                  |
| `invite_invalid`      | token sai / đã dùng                               |
| `not_member`          | user cố switch sang workspace không thuộc về      |
| `forbidden_workspace` | brand_client cố truy cập workspace khác           |

---

## 8. Test plan

- **Unit**: validate slug format, role enum, JWT claim builder.
- **Integration**:
  - Tạo 2 workspace A, B; user X member A only.
  - User X gọi `GET /canvas-templates` khi active = A → chỉ thấy template A.
  - User X gọi switch sang B → trả `not_member` 403.
  - Staff gọi với `X-Workspace-Override: B` → thấy template B.
- **Migration**: chạy backfill trên fixture có data — verify mọi row có `workspace_id`.

---

## 9. Câu hỏi mở

1. User Y belong to 5 workspace — UI nên dùng dropdown switch hay slug-based URL (`/portal/cocacola-vn`)?
2. Slug có cho phép đổi sau khi tạo không? — Đề xuất KHÔNG (vì sẽ break public URL `/p/[slug]/...`); rename bằng cách archive + tạo workspace mới.
3. Khi staff Rexer làm việc cho 1 brand, header `X-Workspace-Override` được set thế nào — manual mỗi request hay sticky cookie? — Đề xuất sticky cookie `rxr_ws_override` với UI selector ở admin top-bar.

---

**Owner**: BE squad lead
**Reviewer**: FE Lan, Eng lead, Ops
**Liên quan**:
- [be-asset-upload-spec.md](be-asset-upload-spec.md) — cần `workspace_id` trên `assets`.
- [be-client-portal-spec.md](be-client-portal-spec.md) — portal endpoints dùng workspace scope.
- [be-template-analytics-spec.md](be-template-analytics-spec.md) — add workspace_id vào analytics_events.
- [be-alpha-spec.md](be-alpha-spec.md) — auth flow mở rộng cho brand_client.
