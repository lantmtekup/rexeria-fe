# BE implementation — Landing page "external link" (không template)

**Ngày:** 2026-06-07 · **Soạn:** FE (Lan) · **Loại:** spec code-được-luôn (đã trỏ
đúng file:line BE hiện tại). FE đã build UI Tạo/Edit landing 2 mode; mode "external"
chờ phần BE dưới đây.

---

## 1. Mục tiêu

Cho phép admin/staff đăng ký 1 **landing host bên ngoài** (đã có domain riêng) vào
hệ thống: chỉ gồm **name + URL**, KHÔNG template/canvas/version. Click ở admin/portal
→ mở thẳng URL. Page loại này vẫn thuộc 1 brand + workspace, vẫn nằm trong list
`/v1/pages`, vẫn archive/restore được.

**Discriminator:** `external_url != NULL` ⇒ page là external landing.

---

## 2. DB migration `000022_external_landing`

Hiện `pages.template_version_id` là `uuid NOT NULL` + FK `ON DELETE RESTRICT`
(`000001_canonical_baseline.up.sql:1021,3591`). Cần nới để external landing không
cần version.

**`000022_external_landing.up.sql`:**
```sql
ALTER TABLE public.pages ADD COLUMN external_url text;

-- External landing không có version → cho phép NULL.
ALTER TABLE public.pages ALTER COLUMN template_version_id DROP NOT NULL;

-- Đúng 1 trong 2 nguồn: template version (page dựng nội bộ) HOẶC external_url.
ALTER TABLE public.pages
  ADD CONSTRAINT pages_source_chk
  CHECK (
    (template_version_id IS NOT NULL AND external_url IS NULL)
    OR
    (template_version_id IS NULL AND external_url IS NOT NULL)
  );
```

**`000022_external_landing.down.sql`:**
```sql
ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_source_chk;
-- Lưu ý: chỉ set lại NOT NULL được nếu không còn row external (template_version_id NULL).
ALTER TABLE public.pages ALTER COLUMN template_version_id SET NOT NULL;
ALTER TABLE public.pages DROP COLUMN IF EXISTS external_url;
```

---

## 3. Model — `internal/domain/models/page.go`

### 3.1 `Page` struct (thêm field, ~sau dòng 20 `TypeMetadata`)
```go
ExternalURL *string `json:"external_url" gorm:"column:external_url"`
```
`TemplateVersionID` giữ nguyên `string` cũng được (external landing để empty `""`),
nhưng **khuyến nghị đổi sang `*string`** cho khớp cột nullable:
```go
TemplateVersionID *string `json:"template_version_id" gorm:"column:template_version_id;type:uuid"`
```
(Nếu đổi sang pointer thì sửa các chỗ gán `*tpl.CurrentVersionID` → `tpl.CurrentVersionID`,
và đọc `page.TemplateVersionID` ở `page_canonical.go:185,269,651` + nơi serialize.)

### 3.2 `CreatePageRequest` (dòng ~71) — nới `template_id`, thêm `external_url`
```go
type CreatePageRequest struct {
	Type         string  `json:"type" validate:"omitempty,oneof=landing ad curate email"`
	TemplateID   string  `json:"template_id" validate:"omitempty,uuid"`   // ⇐ bỏ "required"
	ExternalURL  string  `json:"external_url" validate:"omitempty,url,max=2048"` // ⇐ mới
	Name         string  `json:"name" validate:"required,min=1,max=200"`
	Slug         string  `json:"slug" validate:"omitempty,max=200"`
	Description  string  `json:"description" validate:"omitempty,max=2000"`
	TypeMetadata JSONMap `json:"type_metadata"`
	HandoffNotes string  `json:"handoff_notes" validate:"omitempty,max=2000"`
}
```
**Rule (validate ở usecase, không chỉ tag):** đúng 1 trong (`TemplateID`,
`ExternalURL`) phải có. Cả hai rỗng hoặc cả hai có → `400 ERR_BAD_REQUEST`
("exactly one of template_id or external_url is required").

### 3.3 `UpdatePageRequest` (dòng ~83) — thêm `external_url`
```go
ExternalURL *string `json:"external_url" validate:"omitempty,url,max=2048"`
```
Chỉ áp dụng cho page vốn là external (đổi/sửa URL). Không cho biến page
template-based ↔ external qua update (giữ đơn giản).

---

## 4. Usecase — `internal/usecase/page_canonical.go`

### 4.1 `Create` (func bắt đầu dòng 120) — rẽ nhánh external

Chèn ngay sau khi lấy `ws` (sau dòng ~128, trước `tpl, err := ...GetByID`):
```go
external := strings.TrimSpace(req.ExternalURL)
// XOR: đúng 1 nguồn.
if (req.TemplateID == "" && external == "") || (req.TemplateID != "" && external != "") {
	return nil, consts.BadRequestError(consts.ErrBadRequest,
		"exactly one of template_id or external_url is required")
}

if external != "" {
	// ── External landing: không template/version/revision ──
	pageType := req.Type
	if pageType == "" {
		pageType = consts.PageTypeLanding
	}
	uid := auth.UserIDPtr(ctx)
	typeMeta := req.TypeMetadata
	if typeMeta == nil {
		typeMeta = models.JSONMap{}
	}
	explicitSlug := strings.TrimSpace(req.Slug) != ""
	slugBase := req.Slug
	if !explicitSlug {
		slugBase = req.Name
	}
	slug, err := u.resolveSlug(ctx, workspaceID, pageType, slugBase, "", explicitSlug)
	if err != nil {
		return nil, err
	}
	p := &models.Page{
		BrandID:      ws.BrandID,
		WorkspaceID:  workspaceID,
		Slug:         slug,
		Name:         strings.TrimSpace(req.Name),
		Type:         pageType,
		TypeMetadata: typeMeta,
		Status:       consts.PageStatusPublished, // external landing live ngay (xem Q1)
		ExternalURL:  &external,
		// TemplateVersionID để NULL (cột đã nullable).
		AssignedBy: uid, CreatedBy: uid, UpdatedBy: uid,
	}
	now := time.Now()
	p.AssignedAt = &now
	if req.Description != "" { d := req.Description; p.Description = &d }
	if err := u.pageRepo.Create(ctx, p); err != nil {
		return nil, err
	}
	return p, nil // KHÔNG seed page_revision (không có canvas)
}

// ── còn lại: nhánh template cũ giữ nguyên ──
```

> Lưu ý: nhánh template cũ (dòng 130-215) **không đổi**, chỉ nằm sau khối `if external`.

### 4.2 `Update` — cho sửa `external_url`
Trong hàm update page, sau khi load page: nếu `page.ExternalURL != nil` và
`req.ExternalURL != nil` → set `page.ExternalURL = req.ExternalURL`. (Validate URL
đã làm ở tag.) Không cho set external_url lên page template-based (trả 400 nếu cần).

---

## 5. Status / publish / các luồng khác

- **Status:** external landing set `published` ngay lúc tạo (Q1 — xác nhận giúp).
  `CanTransitionTo` (page.go:39) vẫn áp dụng nếu muốn archive/restore.
- **Publish/Unpublish** (`POST /pages/{id}/publish`): external landing không có
  release/version → **publish nên là no-op trả 200** (hoặc 400 "external landing
  has no release"). FE không gọi publish cho external. BE chọn cách an toàn.
- **Archive/Restore/Delete:** dùng chung cơ chế hiện tại (chỉ set status/archived_at),
  không liên quan version → OK sẵn.
- **`GET /v1/pages` + `GET /v1/pages/{id}`:** tự trả `external_url` qua struct tag.
  KHÔNG cần đổi handler.
- **Analytics breakdown** (`/admin/analytics/templates/{id}/breakdown`): external
  landing không có block → trả rỗng (FE đã handle empty).
- **Public render `/v1/public/pages/{slug}` (tuỳ chọn, Q2):** nếu muốn `/p/{slug}`
  redirect ra ngoài, trả `external_url` + để FE 302. Hiện FE list mở thẳng URL nên
  KHÔNG bắt buộc.

---

## 6. Validation & error (tổng hợp)

| Tình huống | Mã | Message |
|---|---|---|
| cả `template_id` lẫn `external_url` rỗng | 400 `ERR_BAD_REQUEST` | exactly one of template_id or external_url is required |
| có cả 2 | 400 `ERR_BAD_REQUEST` | (như trên) |
| `external_url` không phải URL | 400 (validate tag `url`) | external_url must be a valid URL |
| `name` rỗng | 400 | name required |
| slug trùng (nếu explicit) | 409 `ERR_PAGE_DUPLICATE_SLUG` | (dùng `resolveSlug` sẵn có) |

---

## 7. Acceptance / test

1. `POST /v1/workspaces/{ws}/pages` body `{type:"landing", name:"Promo", external_url:"https://promo.tekup.vn"}`
   → `201`, page có `external_url` set, `template_version_id == null`, `status=="published"`, KHÔNG có page_revision.
2. Body có cả `template_id` lẫn `external_url` → `400`.
3. Body thiếu cả hai → `400`.
4. `external_url:"not-a-url"` → `400`.
5. `GET /v1/pages?type=landing` → item external có field `external_url`.
6. `PATCH /v1/pages/{id}` `{external_url:"https://new.tekup.vn"}` trên external page → `200`, URL đổi.
7. `DELETE /v1/pages/{id}` (archive) external page → `200`, status `archived`; restore OK.
8. Tạo landing từ template (body có `template_id`, không `external_url`) → vẫn chạy như cũ (regression).

---

## 8. FE đã build sẵn (khớp contract trên)

- `Page.external_url`, `CreatePageRequest.external_url`, `UpdatePageRequest.external_url`
  (`src/services/rexer/types.ts`).
- Dialog Tạo/Edit landing 2 mode (`src/components/dialogs/LandingFormDialog.tsx`):
  - template mode → `pages.create(ws, {type:'landing', template_id, name})` (chạy rồi).
  - external mode → `pages.create(ws, {type:'landing', name, external_url})` ← cần §4.
  - edit external → `pages.update(id, {name, external_url})` ← cần §4.2.
- List `/admin/landing-pages`: row có `external_url` → badge "External" + nút "Mở link"
  mở URL (tab mới). Không có thì mở editor như cũ.

→ Sau khi BE deploy §2-§4: bật lại test, external mode chạy thật. Không cần FE đổi gì
thêm (trừ khi BE đổi tên field).

## 9. Câu hỏi BE
1. External landing set `published` luôn lúc tạo, hay cho `draft` rồi publish? (FE
   đề xuất `published` luôn vì chỉ là link.)
2. Có làm `/public/pages/{slug}` 302 redirect cho external landing không, hay để FE
   mở thẳng `external_url`? (không gấp.)
