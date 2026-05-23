# Rexer Spec v2 — FE/BE Aligned

> **Date**: 2026-05-23 (sau khi BE gửi spec)
> **Status**: ✅ **Architecture chốt** — chuẩn bị FE migration
> **Reference**:
> - `docs/rexer-system-spec-v1.md` (FE draft v1)
> - BE doc "Landing Builder — Backend Architecture Doc v1.0" (Phase 1 Managed Service)
> **Audience**: BE squad + FE owner + PM
> **Purpose**: ACK BE's decisions, ghi delta vs v1, FE migration plan, 3 open questions cần align tiếp.

---

## 1. ✅ BE quyết định — FE ACK toàn bộ 10 items

| # | Decision | FE v1 đề xuất | BE chốt | Status |
|---|---|---|---|---|
| 1 | CanvasDocument bảng riêng 1-1 với Landing | Option A | ✅ Chọn A | KHỚP |
| 2 | Template có `config_schema` + `canvas_blueprint` | Option B | ✅ Chọn B | KHỚP |
| 3 | Phase 1 chỉ W4 (admin assign), W3 hoãn Phase 2 | W4 | ✅ W4 only | KHỚP |
| 4 | Phase 1 Admin/Staff publish, Brand review-only | Admin publish | ✅ | KHỚP |
| 5 | `Landing.slug` unique `(brand_id, workspace_id)` | Recommend | ✅ | KHỚP |
| 6 | SavedBlock brand-level (Phase 1) | Recommend | ✅ | KHỚP |
| 7 | Public URL `/p/{landing_slug}/{share_token}` | Option A | ✅ | KHỚP |
| 8 | Status enum `draft/published/archived` | Recommend | ✅ Brand giữ `active/pending/suspended` riêng | KHỚP (Brand tách lifecycle hợp lý) |
| 9 | `canvas_templates` vs `canvas_documents` tách bảng | Tôi đề xuất rename | ⚠️ BE GIỮ 2 BẢNG | DELTA — xem §3 |
| 10 | Archived không hard delete (Phase 1) | Recommend | ✅ | KHỚP |

→ 9/10 khớp hoàn toàn. 1 điểm tôi hiểu sai (§3 below).

---

## 2. Glossary chuẩn — final

| Term | BE table | Vai trò | FE type rename |
|---|---|---|---|
| **Brand** | `brands` | Tenant cao nhất | `Brand` (was `Client`) |
| **Workspace** | `workspaces` | Sub-folder trong brand | `Workspace` ✅ |
| **Landing** | `landings` | Trang đích brand-owned | `Landing` (was `Project` / `PortalTemplate`) |
| **CanvasDocument** | `canvas_documents` | Editing surface 1-1 với Landing | `CanvasDocument` (was `CanvasTemplate`) |
| **CanvasDocumentVersion** | `canvas_document_versions` | History rolling 50 versions cho autosave | `CanvasDocumentVersion` (NEW) |
| **Release** | `releases` | Snapshot immutable khi publish | `Release` ✅ |
| **CanvasTemplate** | `canvas_templates` | **Catalog template** tái sử dụng (≠ canvas_documents) | `CanvasTemplate` ⚠️ giữ tên BE |
| **SavedBlock** | `saved_blocks` | Brand-level block library | `SavedBlock` (was `SavedBlockServer`) |
| **Asset** | `assets` | Media file với SHA-256 dedupe | `Asset` (was `MediaAsset`) |
| **ActivityLog** | `activity_logs` | Audit log cho actions | `ActivityLog` (NEW) |

### ⚠️ Cảnh báo naming `canvas_templates`

BE giữ tên `canvas_templates` cho **CATALOG** (Template tái sử dụng) — đây là **vai trò NGƯỢC** với hiểu lầm trước đây của FE.

**TRƯỚC** (FE nhầm): `canvas_templates` = editing surface per-landing  
**SAU** (BE chốt): `canvas_templates` = catalog blueprint (giống `Template` trong v1 của tôi)

→ FE phải re-map tâm trí: khi nghe "canvas_templates" → nghĩ tới **catalog blueprint**, không phải landing editor.

---

## 3. Delta lớn nhất — `canvas_templates` vs `canvas_documents`

### Sự thật BE quyết định

```
                      ┌────────────────────┐
                      │  canvas_templates  │   ← CATALOG (BE chốt)
                      │  - config_schema   │      reusable across brands
                      │  - canvas_blueprint│      status: draft/published/archived
                      │  - category        │      "Landing Hero v1", "Event RSVP v2"
                      └─────────┬──────────┘
                                │
                                │ admin assigns template → clone blueprint
                                │
                                ▼
   ┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
   │   landings   │ 1—1   │ canvas_documents │ 1—N   │canvas_document_versions│
   │  - slug      │ ◀────▶│   - content       │ ◀────▶│  - content (rolling 50)│
   │  - template_id│      │   - version       │       │  - created_at         │
   └──────────────┘       └──────────────────┘       └──────────────────────┘
            │                                                    
            │ 1—N (snapshots)                                    
            ▼                                                    
   ┌──────────────┐                                              
   │   releases   │  ← immutable snapshot khi publish            
   │  - content   │                                              
   │  - version_label "v1", "v2.1"                                
   └──────────────┘                                              
```

### Insight quan trọng

- `canvas_templates` = catalog (system-curated reusable blueprints) — **Template** trong spec v1 của tôi đổi tên thành **CanvasTemplate** để khớp BE
- `canvas_documents` = per-landing editing surface — đây là **CanvasDocument** trong v1
- Không cần thêm bảng `templates` riêng — `canvas_templates` đã đóng cả vai trò catalog

### Hệ quả cho FE

- Bỏ ý định rename `canvas-templates` → `canvas-documents`
- Adopt 2 entity riêng:
  - **CanvasTemplate** = blueprint (admin/staff publish vào catalog)
  - **CanvasDocument** = brand's WYSIWYG editor state

---

## 4. Những thứ BE doc bổ sung — FE adopt

### 4.1 `canvas_document_versions` — autosave history

BE giữ rolling 50 version gần nhất:
```sql
canvas_document_versions (
  id, canvas_document_id, content, version, edited_by, created_at
)
```

**FE impact**:
- UI thêm "Version history" sidebar trong canvas editor
- Endpoint mới: `GET /api/landings/:id/canvas/versions`, `POST /api/landings/:id/canvas/revert/:vId`

### 4.2 `assets` table với SHA-256 dedupe

```sql
UNIQUE (brand_id, file_hash)
```

**FE impact**:
- Upload flow: client tính hash trước upload → nếu BE đã có → reuse asset_id, không upload lại
- Tiết kiệm storage + bandwidth

### 4.3 `activity_logs` table

```sql
activity_logs (
  brand_id, actor_id, action, entity_type, entity_id, metadata, created_at
)
```

**FE impact**:
- Trang `/admin/brands/{id}` tab "Activity" hiển thị toàn bộ audit
- Admin assign template event log
- Brand publish event log
- (FE đã có `/portal/activity` — sẽ wire endpoint thật)

### 4.4 `releases.version_label`

`"v1"`, `"v2.1"` — string, không phải auto-increment

**FE impact**:
- UI version selector trong release history dùng label thay vì release_no số
- Admin có thể custom label khi publish

### 4.5 `archived_at` timestamp trên Landing

**FE impact**:
- Hiển thị "Archived 7 ngày trước" trong list
- Phase 2 cron 90 ngày dùng field này

### 4.6 `brands.slug` + `workspaces.slug`

BE thêm slug cho brand và workspace.

**FE impact**:
- Brand profile có field slug (immutable sau khi tạo)
- URL có thể nâng cấp `/portal?brand=coca-cola&ws=marketing` thay vì UUID

### 4.7 Optimistic lock pattern

BE dùng `version INT`, 409 response khi mismatch:
```
PATCH /api/landings/:id/canvas
Body: { content, version }
Response 409: { error: 'version_conflict', current_version, current_content }
```

**FE impact**:
- `useAutosave` hook update: gửi `version` mỗi PATCH, handle 409 → merge dialog
- Hiện FE dùng `canvas_etag` SHA-256 → switch sang `version` int

---

## 5. API endpoint mapping — BE pattern vs v1 plan

BE dùng **resource-nested REST**, FE v1 plan dùng **flat with filter**. Adopt BE pattern.

### Landing CRUD

| Action | v1 plan (flat) | BE chốt (nested) |
|---|---|---|
| List landings của workspace | `GET /v1/landings?workspace_id=...` | `GET /api/workspaces/:wsId/landings` |
| Create landing | `POST /v1/landings` body có workspace_id | `POST /api/workspaces/:wsId/landings` |
| Get detail | `GET /v1/landings/:id` | ✅ same |
| Archive | `DELETE /v1/landings/:id` | `DELETE /api/landings/:id` (soft) |
| Restore | NEW | `POST /api/landings/:id/restore` |
| Publish | `POST /v1/landings/:id/publish` | ✅ same |
| Unpublish | `POST /v1/landings/:id/unpublish` | ✅ same |

### Canvas autosave

| Action | v1 plan | BE chốt |
|---|---|---|
| Load canvas | `GET /v1/landings/:id/canvas` | ✅ same |
| Autosave | `PATCH /v1/canvas-documents/:id` (direct) | `PATCH /api/landings/:id/canvas` (nested) |
| Version history | NEW | `GET /api/landings/:id/canvas/versions` |
| Revert | NEW | `POST /api/landings/:id/canvas/revert/:vId` |

### Release

| Action | v1 plan | BE chốt |
|---|---|---|
| List releases | `GET /v1/landings/:id/releases` | ✅ same |
| Get release | NEW | `GET /api/releases/:id` |
| Rotate share token | NEW | `POST /api/landings/:id/share-token/rotate` |

### Template (canvas_templates catalog)

| Action | v1 plan | BE chốt |
|---|---|---|
| List catalog | `GET /v1/templates` | `GET /api/templates` (BE doc dùng `templates` shorthand) |
| Get template | `GET /v1/templates/:id` | `GET /api/templates/:id` |
| Admin assign | `POST /v1/landings` với template_id | `POST /api/admin/templates/assign` (BE chốt endpoint riêng) |

### SavedBlock

| Action | v1 plan | BE chốt |
|---|---|---|
| List | `GET /v1/saved-blocks?client_id=` | `GET /api/brands/:id/saved-blocks` |
| Create | `POST /v1/saved-blocks` | `POST /api/brands/:id/saved-blocks` |
| Delete | `DELETE /v1/saved-blocks/:id` | ✅ same |

### Public render

```
GET /p/:landing_slug/:share_token   ← BE chốt
```

**FE rewrite**: `/api/rexer/p/*` proxy → BE.

---

## 6. FE migration plan

### Phase A — Type alias (0.5 ngày, không break)

Thêm alias trong `services/rexer/types.ts`:

```ts
// Canonical names matching BE v2 spec
export type Brand = Client;                  // legacy → new
export type BrandResponse = ClientResponse;
export type BrandUser = ClientUser;
export type Landing = Project;
export type LandingListResponse = ProjectListResponse;
export type CanvasDocument = CanvasTemplate; // ⚠️ ngược semantic — see §3
export type Release = ReleaseAlias;          // BE đã có
export type Asset = MediaAsset;
// CanvasTemplate giữ nguyên — vai trò catalog (mới)
```

### Phase B — Update FE call sites theo BE endpoint mới (1 sprint)

Khi BE ship endpoint mới:

| FE file | Action |
|---|---|
| `services/rexer/endpoints.ts` | Add nested endpoints (`/workspaces/:id/landings`, `/brands/:id/saved-blocks`, …) |
| `portal/landing-pages/page.tsx` | Switch `rexerApi.portal.listTemplates()` → `rexerApi.workspaces.listLandings(wsId)` |
| `portal/landing-pages/_CreateLandingDialog.tsx` | Switch `POST /portal/templates` → `POST /workspaces/{wsId}/landings` |
| `AdminAssignTemplateDialog.tsx` | Switch `/canvas-templates/{id}/assign` → `POST /admin/templates/assign` |
| `AdminAddLandingForClientDialog.tsx` | Switch 2-step (POST canvas-templates + assign) → 1-step `POST /admin/templates/assign` |
| `BlockEditor.tsx` autosave | Update version-lock từ ETag string → version int |

### Phase C — UI cập nhật theo BE features mới

- [ ] Version history sidebar trong canvas editor (BE đã có endpoint)
- [ ] Restore-from-version dialog
- [ ] Share token rotate button trong publish actions
- [ ] Activity log tab trong admin brand detail (replace fake `/portal/activity`)
- [ ] Upload flow tính hash trước, dùng dedupe

### Phase D — Route + label rename FE

```
/admin/users      → /admin/brands         (i18n + Next redirect)
/portal/landing-pages → /portal/landings  (đồng bộ tên BE)
/portal/templates → /portal/template-catalog (clear semantic)
```

---

## 7. ❓ 3 open questions cần align tiếp

BE doc không cover các điểm sau — cần PM/BE clarify:

### Q1. Role naming chính thức

BE doc nhắc "admin/staff/brand" chứ không nêu role string cụ thể. Hiện tại:
- BE legacy: role `client_user` cho brand member
- FE đề xuất: `brand_user`

→ **Cần BE xác nhận**: rename `client_user` → `brand_user` luôn trong Phase 1, hay backward compat?

### Q2. Brand profile fields ngoài schema BE doc

BE doc Section 3.1 chỉ liệt kê 5 field cho `brands`:
```
id, name, slug, status, created_at, updated_at
```

Nhưng FE đã build form profile có:
- `legal_name`, `contact_email`, `contact_phone`, `country_code`, `logo_url`, `industry`, `plan`, `member_count`, `storage_used_gb`, `storage_quota_gb`

→ **Cần BE xác nhận**: các field này ở table nào? `brand_profile` riêng? Hay add vào `brands`?

### Q3. FE route convention

BE doc tập trung BE, FE phải tự quyết:
- `/admin/users` đổi sang `/admin/brands` hay giữ?
- `/portal/landing-pages` đổi sang `/portal/landings` (đồng bộ BE) hay giữ?
- `/portal/templates` (đang trỏ về library) đổi sang `/portal/template-catalog`?

→ **PM quyết**: rename hay giữ vì SEO/bookmark đã share?

---

## 8. ❓ 5 BE open questions (BE doc §7) — FE position

### Q1. Storage cho assets — S3 vs self-host

**FE không quyết** — chỉ dùng `asset.file_url`. Khuyến nghị S3-compatible (Backblaze B2 / Cloudflare R2) + CDN (Cloudflare) để rẻ + nhanh global.

### Q2. JSONB index trên `canvas_documents.content`

**FE position**: chưa cần search nội dung block ở Phase 1. Khi cần search "tìm landing có block hero" → dùng JSONPath query đơn giản trên Postgres, không cần Elastic riêng.

### Q3. Rate limit autosave

**FE position**: per-landing 20 req/min HỢP LÝ. Per-user có thể bypass bằng cách edit 2 landing đồng thời. Hiện FE debounce 3s + max 30s, ~20 req/min worst case.

### Q4. UUID v7

**FE position**: ✅ ủng hộ — time-sortable giúp pagination cursor-based dễ hơn.

### Q5. Multi-region

**FE position**: Phase 1 single region (VN). Multi-region để Phase 3+ khi có user nước ngoài.

---

## 9. Workflow update — Phase 1 final

Sau khi align với BE, workflow chính:

### W4 (Phase 1 — single admin flow)

```
1. Admin /admin/templates → chọn canvas_template từ catalog
2. Admin /admin/brands/{id} → tab Landings → "Tạo landing cho khách"
3. Modal: chọn template + workspace + tên + ghi chú
4. POST /api/admin/templates/assign
   Body: {
     template_id: <canvas_template_uuid>,
     brand_id: <client>,
     workspace_id: <ws>,
     title: "Hè 2026 promo",
     notes: "Đã set sẵn hero..."
   }
5. BE:
   a. Tạo landing row (status='draft', slug='he-2026-promo')
   b. Tạo canvas_document row, clone canvas_template.canvas_blueprint vào content
   c. Write activity_log: action='landing.create', actor=admin, entity=landing
   d. Notification cho brand
6. Admin redirect → canvas editor /admin/landings/{id}/edit
7. Edit autosave (PATCH /api/landings/:id/canvas with version)
8. Brand thấy noti, mở /portal/landings → status badge [draft]
9. Brand click Preview → /portal/landings/{id}/preview (auth-gated)
10. Brand comment nếu cần chỉnh
11. Staff resolve comment, sửa canvas
12. Staff click Publish:
    a. POST /api/landings/:id/publish/validate
    b. Nếu valid → POST /api/landings/:id/publish
    c. BE snapshot canvas → tạo release, generate share_token
    d. Activity log + notification
13. URL /p/{slug}/{share_token} sống cho public
14. Brand thấy status [published] + nút "Analytics" enabled
```

---

## 10. Sẵn sàng họp

### ✅ Đã align

- 10/10 architecture decisions
- 6 features mới từ BE doc đã hiểu + plan migrate
- API endpoint mapping rõ ràng

### 🔴 Cần BE quyết trong họp

1. Role naming (`client_user` → `brand_user`?)
2. Brand profile extra fields ở đâu (Q2 §7)
3. FE route rename timeline + permanent redirect

### 🟡 Cần PM quyết

1. Đặt tên route mới hay giữ legacy
2. Phase 1 ship khi nào (BE work ~2 tuần cho schema + endpoints)
3. Brand profile UI hiển thị field nào (sau khi BE confirm schema)

### 📋 Sau họp

- BE assign ETA cho từng endpoint
- FE Phase A (type alias) start ngay không đợi BE
- Update `docs/be-todo.md` master list theo BE doc Section 5 endpoints
- Archive các doc cũ: `be-architecture-clarification`, `be-audit`, `naming-glossary` (redundant với doc này + BE doc)

---

## 11. Tham chiếu

- `docs/rexer-system-spec-v1.md` — FE draft v1 (sẽ archive sau khi v2 chốt)
- **BE doc "Landing Builder — Backend Architecture Doc v1.0"** — source of truth
- `docs/be-audit-2026-05-23.md` — swagger gap audit (redundant)
- `docs/be-todo.md` — sẽ rewrite theo BE doc Section 5
- `docs/naming-glossary-improvement-2026-05-23.md` — redundant với §2 doc này

---

## 12. Liên hệ

- **FE owner**: @Lantm (`lantm.tekup@gmail.com`)
- **BE doc owner**: Product (per BE doc)
- **Doc này**: v2.0 — FE post-alignment review
