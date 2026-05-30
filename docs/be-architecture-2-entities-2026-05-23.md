# BE Architecture Response — 2-Entity Intent (Project vs CanvasTemplate)

> **Date**: 2026-05-23
> **Audience**: FE squad (@Lantm) + BE squad
> **Status**: ✅ **Decided** — keep 2 entities, doc the intent, ship small QoL wins
> **Responds to**: [`docs/be-architecture-clarification-2026-05-23.md`](./be-architecture-clarification-2026-05-23.md)
> **Audit ref**: [`docs/be-audit-2026-05-23.md`](./be-audit-2026-05-23.md)

---

## 🚨 TL;DR — KHÔNG refactor lớn

Code BE đã verify empirically. 3 câu hỏi của Lantm được trả lời như sau:

| Q | Verdict | Hệ quả |
|---|---|---|
| Q1: `Project.config_json` flexible hay schema-bound? | ✅ **Schema-bound** — validate against `TemplateVersion.FieldSchemaJSON` mỗi lần write/publish | Project KHÔNG thể chứa full canvas tree |
| Q2: `/canvas-templates` quan hệ với Project? | ✅ **Disjoint** — không FK 2 chiều, không bridge code | 2 entity tách biệt theo thiết kế |
| Q3: Publish flow chính thức? | ⚠️ **2 path song song** — cả 2 LIVE | Project→Release→`/p/:slug` và CanvasTemplate→`/public/canvas-templates/{id}/canvas?share_token=` |

→ **Audit doc giả định "1 trong 2 phải canonical, cái kia sai" — code thực tế là 2 entity intentional**, mỗi cái phục vụ 1 use case khác nhau. **Không refactor**. FE chỉ cần biết khi nào dùng cái nào.

---

## 1. 2 entity — 2 use case

```
┌─────────────────────────────────────────┐    ┌─────────────────────────────────────────┐
│  Project (templated form-fill landing)  │    │  CanvasTemplate (full WYSIWYG canvas)   │
├─────────────────────────────────────────┤    ├─────────────────────────────────────────┤
│ Persona: Non-designer brand /           │    │ Persona: Designer / agency /            │
│          admin spin-up nhanh             │    │          power user                      │
│                                          │    │                                          │
│ Input shape: 5-15 known fields           │    │ Input shape: free-form block tree       │
│ (headline, cta_label, ...)               │    │ (50+ blocks, motion, custom CSS)        │
│                                          │    │                                          │
│ Validator: ConfigValidatorService        │    │ Validator: none — accept any JSON        │
│  (whitelist từ TemplateVersion           │    │                                          │
│   .FieldSchemaJSON)                      │    │                                          │
│                                          │    │                                          │
│ Authoring tool: form UI                  │    │ Authoring tool: Fabric.js canvas editor │
│ Publish: POST /projects/{id}/publish     │    │ Publish: PATCH canvas_data.publish      │
│   → freeze snapshot in releases table    │    │   .{published:true, shareToken, ...}    │
│ Public: GET /p/{slug} (server-rendered   │    │ Public: GET /public/canvas-templates    │
│   HTML)                                  │    │   /{id}/canvas?share_token=... (JSON)   │
│                                          │    │                                          │
│ Versioned: TemplateVersion + Release     │    │ Versioned: optimistic version int        │
│ Rollback: ✅ POST /releases/{id}/rollback│    │ Rollback: ❌ overwrite-in-place         │
└─────────────────────────────────────────┘    └─────────────────────────────────────────┘
```

**Tuyến rõ ràng**: Project = light form-fill, CanvasTemplate = heavy WYSIWYG. Cả 2 đều shipped, không overlap chức năng.

---

## 2. Empirical evidence (code reference)

### Q1 — `Project.config_json` schema-bound

- `Project` model **không có** field `config_json` trực tiếp (`internal/domain/models/project.go:9-45`). Config lưu trong bảng riêng `project_config_revisions` qua `ProjectConfigRevision.ConfigJSON` (`internal/domain/models/project_config.go:19-28`).
- Mỗi lần write/publish đều validate:
  - `internal/usecase/project.go:209` — `Create` gọi `u.validatorSvc.Validate(version.FieldSchemaJSON, ...)`
  - `internal/usecase/project.go:402` — `PutConfig` cũng gọi validator
  - `internal/usecase/publish.go:75,98` — Publish re-validate
- Validator (`internal/core/validator.go:21-80`): kiểm tra required fields từ `TemplateVersion.FieldSchemaJSON` đều có và non-empty. Field ngoài schema vẫn được accept (whitelist không strict).

→ Project = templated landing, không phải free-form WYSIWYG.

### Q2 — CanvasTemplate disjoint với Project

- `Project` không có `canvas_template_id` field.
- `CanvasTemplate` (`internal/domain/models/canvas_template.go:16-40`) không có `project_id` field.
- Migration `000107_create_canvas_templates.up.sql` chỉ tạo FK đến `clients.id`, `collections.id`, `users.id` — **không** đến `projects.id`.
- Zero bridge usecase (không `cloneFromCanvasTemplate`, `attachCanvasToProject`, ...). Chỉ có `AITemplate.canvas_template_id` (AI feature, không liên quan Project pipeline).

→ 2 entity song song có chủ ý.

### Q3 — 2 publish path live song song

**Path 1 (Project → Release → `/p/:slug`)**:
- Handler: `internal/server/http/handler/landing.go:49,72-136`.
- Lookup: `projectRepo.GetBySlug` → check `ActiveReleaseID` + `release.State == "published"` → extract config từ `release.SnapshotJSON["config"]`.
- Render: server-side HTML từ template; pulls `headline`, `subheadline`, `body`, `cta_label`, `cta_href` (lines 106-122).
- Frozen snapshot: ✅ persist trong `Release.SnapshotJSON` tại publish time (`internal/usecase/publish.go:115-121`).

**Path 2 (CanvasTemplate → share token → `/public/canvas-templates/{id}/canvas?share_token=...`)**:
- Handler: `internal/usecase/canvas_template.go:607-679` (`GetPublicCanvas`).
- Lookup: `repo.GetWithCanvas` → check `is_active=true` + `canvas_data.publish.published=true` + constant-time compare `shareToken`.
- Render: JSON response với `canvas_data` (filtered: publish meta + draft fields stripped, invisible blocks bỏ).
- Frozen: ❌ live data + 60s LRU cache (`publicCanvasCache`). Mỗi write invalidate cache ngay.

→ 2 path khác nhau hoàn toàn, không deprecate cái nào.

---

## 3. Decision matrix: dùng entity nào?

| Use case của user | Dùng entity nào | Vì sao |
|---|---|---|
| Admin/staff tạo "blank landing" cho brand (campaign launch) | **Project** | Form-fill nhanh, publish lifecycle có sẵn, releases/rollback support |
| Brand mở wizard "chọn template từ catalog" | **Project** với `template_id` | Catalog `/v1/templates` → spawn Project có version-locked |
| Brand kéo thả block, vẽ tự do, motion, custom CSS | **CanvasTemplate** | Full WYSIWYG, free-form JSON, share-link publish |
| Designer/agency thiết kế landing nâng cao | **CanvasTemplate** | Same as above |
| Brand share link "Xem live" cho stakeholder review | **CanvasTemplate** với share_token | Path 2, no public URL friendly |
| Brand publish landing chính thức tại `acme.com/p/summer-launch` | **Project** | Slug-based URL, server-rendered HTML, SEO-friendly |
| Tracking analytics (block-level dwell, click) | **CanvasTemplate** keyed by `template_id` | `/v1/analytics/events` ingest |
| Tracking analytics (page-level funnel, UTM) | **Project** keyed by `project_id` | `/v1/track` ingest |

---

## 4. FE wire mapping — sửa gì, giữ gì

Đối chiếu với phần "FE hiện đang làm" trong audit doc:

| FE route hiện tại | Đúng/Sai | Action |
|---|---|---|
| `/admin/canvas-templates` = "Quản lý landing pages của admin" | ⚠️ **Tuỳ ngữ cảnh** | Nếu admin quản WYSIWYG free-form (cho agency clients) — giữ. Nếu admin quản campaign landing (form-fill) — wire thêm `/admin/projects` page riêng |
| `/portal/landing-pages` = list canvas-templates của brand | ⚠️ **Tuỳ ngữ cảnh** | Brand designer → giữ. Brand non-designer → nên có thêm tab "Projects" hoặc swap entirely |
| `/portal/templates` = canvas-templates với `is_template=true` | ❌ **Sai entity** | Đổi thành catalog `/v1/templates` (system blueprints). `is_template` flag trên canvas-template là cho copy-from-canvas-as-template flow nội bộ, không phải catalog |
| Brand click "Dùng template này" → `POST /canvas-templates/{id}/clone-to-workspace` | ❌ **Sai entity nếu user muốn form-fill landing** | Đổi thành `POST /v1/projects` body `{template_id, client_id, workspace_id, name}` cho non-designer brand. Giữ clone-to-workspace cho designer brand |
| Admin click "Tạo landing cho khách" → `POST /canvas-templates + assign` | ❌ **Sai entity nếu form-fill** | Đổi thành `POST /v1/projects` |
| Publish landing → đợi BE ship `/canvas-templates/{id}/publish` | ❌ **Endpoint không cần ship** | Project publish đã LIVE: `POST /v1/projects/{id}/publish/validate` + `POST /v1/projects/{id}/publish`. Canvas-template publish dùng PATCH canvas_data.publish (đã LIVE) |
| Public URL `/p/{canvas_template_id}/{share_token}` | ⚠️ | Cho WYSIWYG flow đúng (path 2). Cho form-fill landing dùng `/p/{project_slug}` (path 1) |
| Analytics tracker → `/analytics/events` (template_id) | ✅ | Đúng cho block-level. Page-level funnel + UTM → `/track` (project_id) |

**Tóm tắt**: FE đã build phần lớn đúng cho persona designer/agency. Cho persona non-designer brand (form-fill quick launch), wire thêm Project flow — endpoint đã LIVE từ Phase 1, chỉ cần FE pages mới hoặc tabs trên page hiện tại.

---

## 5. Migration: KHÔNG cần convert

- 18 canvas-templates hiện tại → giữ nguyên, là WYSIWYG instances của các brand designer
- 10 projects hiện tại → giữ nguyên, là form-fill landings của các campaign launch (đa số là seed data)
- Không có data loss, không có entity collision

---

## 6. QoL wins đề xuất (cần BE squad duyệt trước khi code)

Khi FE wire publish flow cho canvas-templates, gặp 2 friction:

### Win 1 — Expose publish summary trong CanvasTemplate read responses 🔥 (recommended)

**Vấn đề**: List endpoint `/canvas-templates` strip `canvas_data` để giữ payload nhỏ → FE không biết được canvas-template nào đang published mà không phải gọi GET-with-canvas từng cái.

**Fix**: Thêm field `publish` (struct summary) vào `CanvasTemplate` response shape:

```json
{
  "id": "...",
  "name": "...",
  ...existing fields...,
  "publish": {
    "is_published": true,
    "share_token": "abc123…",       // ⚠️ chỉ trả cho owner / admin, không trả cho public read
    "published_at": "2026-05-20T10:00:00Z"
  }
}
```

**Implementation**:
- Repo `ListMeta` thêm SQL extract `canvas_data->'publish' AS publish_raw` để khỏi pay full TOAST cost
- Usecase fold `publish_raw` JSON thành `CanvasPublishSummary` struct
- Get-with-canvas: populate từ `CanvasData.publish` đã loaded
- Filter `share_token` ra ngoài cho non-owner reads (giữ guard hiện tại)

**Effort**: 2-3h. Không cần migration. Bcck-compat (field mới).

### Win 2 — Explicit publish/unpublish endpoints (optional)

**Vấn đề**: Hiện FE publish bằng `PATCH /canvas-templates/{id}` với body chứa `canvas_data.publish` — implicit, dễ sai shape.

**Fix**: Thêm:
```
POST /canvas-templates/{id}/publish   → set publish={published:true, shareToken: <gen>, publishedAt: now}
POST /canvas-templates/{id}/unpublish → set publish={published:false}, invalidate token
```

Usecase generate `shareToken` nội bộ (32-char hex), invalidate `publicCache.InvalidateID` ngay.

**Effort**: 2-3h. Không cần migration.

**Đánh đổi**: Adds 2 routes; nhưng FE call site sạch hơn (1 verb thay vì PATCH body shape).

### Skip — không đề xuất

- ❌ Status field on canvas_templates table (migration cost, lifecycle field `is_active` đã đủ cho draft/archived distinction)
- ❌ Releases/rollback cho canvas-templates (designer flow vốn không cần immutable snapshot — đó là vì sao Project entity tồn tại)
- ❌ Merge 2 entity — Q1/Q2/Q3 verdict đã loại bỏ option này

---

## 7. Action items

### BE squad

- [ ] Ship Win 1 (publish summary trên CanvasTemplate read) — chờ confirm
- [ ] Optional Ship Win 2 (explicit publish/unpublish endpoints) — chờ confirm
- [ ] Add comment block trong `internal/domain/models/canvas_template.go` clarify đây là WYSIWYG path tách biệt khỏi Project (analogous comments đã thêm cho `/track` vs `/analytics/events` trong commit 3545c48)

### FE squad

- [ ] Đọc doc này + decision matrix (§3)
- [ ] Review FE wire mapping (§4) — chỉ refactor những row có ❌ rõ ràng (catalog library swap, publish endpoint switch)
- [ ] Nếu cần Project-based landing flow cho non-designer brand → ship `/portal/projects` page mới (endpoint đã LIVE từ Phase 1, không cần BE work)
- [ ] Confirm Win 1 đủ unblock canvas-template publish UX không

### Quyết định cần align

- [ ] Persona breakdown: brand đa số là designer (CanvasTemplate-first) hay non-designer (Project-first)? — ảnh hưởng default landing flow trong FE shell

---

## 8. Liên hệ

- **BE squad**: vovanphuc100598@gmail.com
- **FE owner**: @Lantm (`lantm.tekup@gmail.com`)
- **Commit ref**: `3545c48` (swagger regen + audit ship)
- **Decision deadline**: trong tuần này — block các tính năng publish/lifecycle ở FE
