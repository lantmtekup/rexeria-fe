# BE Architecture Clarification — Templates vs Projects vs Canvas-templates

> **Date**: 2026-05-23
> **Audience**: BE squad — decision maker for landing-page data model
> **Status**: 🔴 **Blocking** — FE phase 1 may have built on wrong entity
> **Liên quan**: `docs/be-audit-2026-05-23.md` (swagger audit), `docs/be-todo.md`

---

## 🚨 TL;DR — 1 câu hỏi quyết định kiến trúc

Trong BE hiện tại có **3 entity** liên quan đến landing pages, và FE đã build trên 1 entity có thể **không phải canonical**. Câu hỏi cho BE:

> **Project (`/v1/projects`) có hỗ trợ full canvas customization (block tree, motion, extra elements) qua field `config_json` không? Hay chỉ field-fill đơn giản (headline, cta_label) như example seed data hiện tại?**

Quyết định của BE → FE biết nên giữ canvas-templates (sai) hay refactor sang projects (đúng theo user mental model).

---

## 1. User intent (Lantm, FE owner)

> "Canvas template là cái để user dùng để chỉnh sửa. Nghĩa là 1 template sẽ được rất nhiều user sử dụng. Khi họ sử dụng thì sẽ tạo ra 1 landing page mới thuộc quyền sở hữu của user đó."

**Mental model**:

```
┌──────────────────────┐         clone        ┌────────────────────────┐
│  Template (blueprint)│ ──────────────────→  │ Landing page (instance)│
│  shared by many      │                       │ owned by 1 brand        │
│  versioned           │                       │ has publish lifecycle   │
└──────────────────────┘                       └────────────────────────┘
        (1)                                              (N)
```

Đây là pattern chuẩn: **catalog → instance**, giống Figma templates → user designs, hoặc Shopify themes → store fronts.

---

## 2. BE đang có 3 entity — cross-probe evidence

Login admin cookie (`admin@rexer.ai`), probe live BE:

### 2.1 `/v1/templates` — 9 rows

```bash
curl -b cookie https://rexerai.tekupsoftware.com/v1/templates
```

```json
{
  "id": "44444444-0000-0000-0000-000000000001",
  "code": "landing-hero-v1",
  "name": "Landing Hero v1",
  "description": "Single-hero landing page for campaign launches.",
  "category": "landing",
  "tags": ["hero", "launch", "featured"],
  "status": "active",
  "preview_mode": "rendered",
  "current_version_id": "55555555-0000-0000-0000-000000000001",
  "thumbnail_url": "https://...",
  "author": { "id": "...", "email": "...", "display_name": "...", "role": "..." },
  "created_at": "...",
  "updated_at": "..."
}
```

**Đặc trưng**:
- Có `code` (slug-style, vd `landing-hero-v1`)
- Có `category` + `tags` (catalog discovery)
- Có versions (`/templates/{id}/versions`)
- System-owned, không có `client_id`
- **→ Đây là TEMPLATE (catalog/blueprint).**

### 2.2 `/v1/projects` — 10 rows

```bash
curl -b cookie https://rexerai.tekupsoftware.com/v1/projects
```

```json
{
  "id": "66666666-0000-0000-0000-000000000001",
  "client_id": "11111111-0000-0000-0000-000000000001",
  "product_id": null,
  "name": "Acme Summer Launch",
  "slug": "acme-summer-launch",
  "status": "draft",
  "template_id": "44444444-0000-0000-0000-000000000001",
  "template_version_id": "55555555-0000-0000-0000-000000000001",
  "active_release_id": null,
  "template": { ...nested Template object... },
  "client":   { ...nested Client object... }
}
```

**Đặc trưng**:
- `template_id` + `template_version_id` → link với Template, version-locked
- `client_id` → brand owner
- `status` (`draft` / `published`) + `active_release_id`
- `slug` (URL-safe identifier — đặc trưng landing page)
- Có lifecycle endpoints:
  ```
  POST /projects/{id}/publish/validate
  POST /projects/{id}/publish
  GET  /projects/{id}/active-release
  GET  /projects/{id}/releases
  POST /releases/{id}/rollback
  ```
- **→ Đây là LANDING PAGE (brand's instance).**

### 2.3 `/v1/canvas-templates` — 18 rows

```bash
curl -b cookie https://rexerai.tekupsoftware.com/v1/canvas-templates?limit=1
```

```json
{
  "id": "6a49c81d-9a71-4db3-b0ae-f2737ddf0b15",
  "client_id": "8dd7494e-...",
  "workspace_id": "954b6951-...",
  "name": "[Editing] Tiện ích nổi bật",
  "width": 800,
  "height": 600,
  "canvas_size_bytes": 1654,
  "canvas_etag": "sha256:...",
  "engine": "fabric",
  "engine_version": "5.3.0",
  "is_active": true,
  "is_template": false,
  "is_public_template": false,
  "version": 1,
  "created_by": "...",
  "updated_by": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

**Đặc trưng**:
- Có `canvas_data` (full block tree, motion, extra elements — WYSIWYG payload)
- Có `client_id` + `workspace_id` (brand-scoped)
- **KHÔNG có** `template_id` (không link với Template catalog)
- **KHÔNG có** `status` lifecycle field (chỉ có `is_active` boolean)
- **KHÔNG có** publish endpoint (no `/canvas-templates/{id}/publish`)
- **KHÔNG có** release/rollback
- **KHÔNG có** `slug`
- Có `is_template` + `is_public_template` flags — như muốn dùng kiểu template nhưng không kết nối với `/templates`
- **→ Vai trò không rõ ràng**. Có thể là:
  - (a) Editing surface — raw canvas data layer, dự định back từng project bằng 1 canvas-template?
  - (b) Legacy free-form landing system tách biệt khỏi templates/projects?
  - (c) Cả 2 — bị duplicate concept?

---

## 3. So sánh 3 entity

| Aspect | `/templates` (catalog) | `/projects` (instance) | `/canvas-templates` (surface?) |
|---|---|---|---|
| Vai trò user model | Blueprint (1) | Landing page (N) | ? |
| Owner | System (Rexer) | Brand (client_id) | Brand (client_id) |
| Field overrides per instance | N/A | `config_json` (seed: 2 keys) | N/A |
| Full canvas blocks | N/A | ❓ chưa rõ | ✅ |
| Versioned | ✅ `current_version_id` | ✅ qua `template_version_id` | ❌ chỉ có `version: int` |
| Publish lifecycle | ❌ | ✅ draft/published + releases | ❌ |
| `/publish` endpoint | ❌ | ✅ + `/publish/validate` | ❌ |
| Release/rollback | ❌ | ✅ | ❌ |
| URL slug | ❌ | ✅ `acme-summer-launch` | ❌ |
| Cross-reference fields | — | `template_id`, `template_version_id` | none (orphan) |
| Public render endpoint | — | `?` (chưa rõ) | ✅ `/public/canvas-templates/{id}/canvas?share_token=` |

---

## 4. FE hiện đang làm gì (and why it may be wrong)

```
                FE đang làm                              Đúng theo user model
  ──────────────────────────────────────       ─────────────────────────────────────
  /admin/canvas-templates                      /admin/templates
   = "Quản lý landing pages của admin"         = "Quản lý blueprint catalog"
   ❌ wrong entity                              ✅ matches /v1/templates

  /portal/landing-pages
   = list canvas-templates owned by brand      = list projects của brand
   ❌ wrong entity                              ✅ matches /v1/projects

  /portal/templates (template library)
   = canvas-templates with is_template=true    = browse /v1/templates catalog
   ❌ wrong entity                              ✅ matches /v1/templates

  Brand click "Dùng template này"
   → POST /canvas-templates/{id}/clone-to-workspace  → POST /projects with template_id
   ❌ tạo entity sai                                 ✅ tạo Project đúng pattern

  Admin click "Tạo landing cho khách"
   → POST /canvas-templates + assign                 → POST /projects với template_id + client_id
   ❌ bypass Template hệ thống                       ✅ chọn từ catalog

  Publish landing
   → ❌ không có endpoint                            → POST /projects/{id}/publish (đã có sẵn)
   FE đợi BE ship publish/canvas-templates           ✅ Endpoint đã LIVE từ ban đầu

  Public URL của landing
   → /p/{canvas_template_id}/{share_token}           → /p/{project_slug} hoặc /p/{project_id}/{release_id}
   FE đang dùng cookie-flow                          ✅ URL gắn với project+release
```

→ Nhiều thứ FE đã build trên canvas-templates **có sẵn ở /projects** nhưng dùng sai entity.

---

## 5. Câu hỏi cốt lõi cho BE

### Q1 — `Project.config_json` schema có flexible đến mức nào?

Probe seed data trả về:

```json
{
  "config_json": {
    "cta_label": "Shop now",
    "headline": "Acme Summer"
  }
}
```

→ Trông như **field-fill schema** (headline, cta_label — 2 keys). Đây có phải limit cứng theo schema của template version, hay flexible JSON chấp nhận bất kỳ shape (kể cả full canvas tree với 50 blocks)?

**Nếu flexible JSON** → có thể chứa toàn bộ canvas_data → Project = full WYSIWYG landing → canvas-templates không cần nữa → FE refactor sang projects toàn bộ.

**Nếu schema-bound** → Project = templated form-fill landing (lightweight). Cho full WYSIWYG cần thêm field như `canvas_data_override` hoặc link `canvas_template_id`.

### Q2 — `canvas-templates` namespace có vai trò gì trong BE design?

3 khả năng:
- **(a)** Editing surface / WYSIWYG storage layer cho Project — nhưng currently không có FK liên kết
- **(b)** Legacy system (đã merge nhưng chưa refactor)
- **(c)** Parallel WYSIWYG path cho use case khác (vd: admin scratch design before promoting to Template)

→ BE confirm vai trò để FE biết khi nào nên dùng `/canvas-templates` vs `/projects`.

### Q3 — Brand publish flow chính thức là gì?

Hiện FE đang public render qua `/public/canvas-templates/{id}/canvas?share_token=...`. Nhưng `/projects/{id}/publish` + releases mới là pattern chuẩn cho landing lifecycle.

- Brand publish landing → tạo Release của Project → khách vào URL `/p/{project_slug}` mở `active_release_id`?
- Hay vẫn dùng `share_token` trên canvas-template?

---

## 6. 2 options + impact

### Option 1 — Projects = canonical landing (FE refactor lớn)

**Nếu BE confirm Q1 = flexible JSON** hoặc thêm `canvas_data_override` field vào Project.

**BE work** (nhỏ nếu config_json đã flexible):
- Confirm config_json không bị validate cứng theo Template schema
- Có thể bỏ namespace `/canvas-templates` công khai (chỉ giữ internal)

**FE work** (~1 tuần):
- [ ] Add `rexerApi.projects.list/get/create/update/publish/unpublish` (đã có endpoint, chỉ wire)
- [ ] `/portal/landing-pages` swap → `rexerApi.projects.list({client_id, workspace_id})`
- [ ] `/portal/landing-pages/[id]/preview` → load project's config_json hoặc release snapshot
- [ ] `/portal/landing-pages/[id]/analytics` → query analytics theo `project_id` thay vì `canvas_template_id`
- [ ] `/portal/templates` (library) swap → `rexerApi.templates.list()` (system catalog)
- [ ] "Dùng template này" → `POST /projects` body `{template_id, client_id, workspace_id, name}`
- [ ] Admin assign → tạo Project (skip canvas-templates)
- [ ] Canvas editor `/canvas-templates/{id}` → vẫn dùng làm editing surface, lưu state vào project's config_json hoặc canvas storage layer
- [ ] Public render `/p/{slug}` → `GET /projects/{id}/active-release` → render từ release snapshot
- [ ] Analytics tracker → switch `template_id` field sang `project_id`

**Migration**:
- Existing canvas-templates được tạo qua FE: convert thành Projects (1 migration script BE-side)
- Mỗi canvas-template với `client_id` set → tạo Project tương ứng với template_id = pick "blank" Template
- Set Project.config_json = canvas-template.canvas_data

### Option 2 — Canvas-templates = canonical landing (BE thêm publish lifecycle)

**Nếu BE confirm Q1 = schema-bound** và muốn giữ canvas-templates làm landing layer.

**BE work** (3-5 ngày):
- [ ] Thêm `status` field vào `canvas_templates` table (`draft` / `published` / `archived`)
- [ ] Thêm `share_token` + `last_publish_at` columns
- [ ] Ship endpoints:
  ```
  POST /canvas-templates/{id}/publish     → status=published, generate share_token
  POST /canvas-templates/{id}/unpublish   → status=draft, invalidate token
  POST /canvas-templates/{id}/archive     → status=archived
  POST /canvas-templates/{id}/restore     → status=draft
  ```
- [ ] Optional: releases/rollback nếu cần immutable snapshots
- [ ] Public render: `/p/{canvas_template_id}/{share_token}` đã có sẵn — chỉ cần BE validate token đúng
- [ ] Document vai trò của `/projects` namespace để FE biết khi nào dùng (probably internal only)

**FE work** (~3 ngày):
- [ ] Wire publish/unpublish/archive buttons trên `LandingRow` (đã có UI sẵn, chỉ wire endpoint mới)
- [ ] Status badge live (currently chỉ là `is_active` boolean)
- [ ] Sample share_token trong PortalTemplate response để "Xem live" link hoạt động

**Đánh đổi**: BE phải duplicate lifecycle logic giữa Project và canvas-templates. Hai entity overlap về vai trò.

---

## 7. Đề xuất next step

1. **BE phản hồi Q1 + Q2 + Q3** — 1 buổi sync ngắn 30 phút quyết định kiến trúc.
2. **Quyết định Option 1 vs Option 2** dựa trên answer.
3. **FE pause** mọi tính năng publish/lifecycle cho tới khi quyết định xong, để tránh build thêm trên entity sai.
4. **Audit current data**:
   - 18 canvas-templates BE có sẵn — sẽ thành gì sau khi quyết định?
   - 10 projects BE có sẵn — đang ai dùng?
5. **Migration plan**: nếu Option 1, BE viết migration script convert canvas-templates → projects.

---

## 8. Probe script cho BE QA verify

```bash
#!/usr/bin/env bash
BASE="https://rexerai.tekupsoftware.com/v1"
CK=/tmp/admin.cookie

curl -sS -c "$CK" -X POST -H 'Content-Type: application/json' \
  -d '{"email":"admin@rexer.ai","password":"<dev-password>"}' \
  "${BASE}/auth/login" > /dev/null

# === Q1: Can config_json hold full canvas data? ===
PROJECT_ID=$(curl -s -b $CK "${BASE}/projects" | jq -r '.items[0].id')
echo "Probing project ${PROJECT_ID} config..."

# Try POSTing complex config
curl -s -b $CK -X POST -H 'Content-Type: application/json' \
  -d '{
    "config_json": {
      "blocks": [
        {"id": "b1", "blockType": "hero_split", "contentVi": {"desktop": {"title": "X"}}},
        {"id": "b2", "blockType": "feature_section", "contentVi": {}}
      ],
      "schema_version": "2.0"
    }
  }' "${BASE}/projects/${PROJECT_ID}/config" | jq .

# Expected: 200 if flexible, 400 with validation errors if schema-bound

# === Q2: canvas-templates relationship with projects ===
# Check if any project has canvas-template reference
curl -s -b $CK "${BASE}/projects/${PROJECT_ID}" | jq 'keys'
# Expected: see if 'canvas_template_id' appears
```

---

## 9. Liên hệ

- **FE owner**: @Lantm (`lantm.tekup@gmail.com`)
- **Repo**: `gitlab.com/lantm.tekup/rexerai` branch `develop`
- **Probe date**: 2026-05-23 17:30 ICT
- **Reference**: 
  - `docs/be-audit-2026-05-23.md` — swagger gap audit
  - `docs/be-todo.md` — master TODO list
- **Decision needed by**: ASAP — FE đang block các tính năng publish/lifecycle
