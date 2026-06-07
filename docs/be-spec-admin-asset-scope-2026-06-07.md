# BE implementation — Admin quản lý Asset/Media hộ brand (brand_id scoping)

**Ngày:** 2026-06-07 · **Soạn:** FE (Lan) · **Loại:** spec code-được-luôn (trỏ đúng
file:line BE hiện tại). Mục tiêu: cho **platform admin/staff** quản lý + tạo asset
(upload, folder, xoá, move, rename, tag) **hộ 1 brand** — giống landing/micro-site.

---

## 1. Hiện trạng BE (đã đọc)

- Model **đã có scope**: `media.go:15` `BrandID *string`, `:14` `WorkspaceID *string`;
  `media_folder.go:11` `BrandID string`, `:12` `WorkspaceID *string`. ⇒ **không cần
  migration cột mới.**
- Routes: `media.go` (`GET/POST /media`, uploads init/complete, bulk-delete/move,
  PATCH/DELETE `/media/:id`), `media_folder.go` (CRUD `/media/folders`).
- **Chặn admin:** `mediaFolderUsecase.callerScope` (`internal/usecase/media_folder.go:33-50`)
  lấy brand theo `auth.PrincipalBrandID(ctx)`; platform admin (không brand) →
  `ForbiddenError("platform admin must call this endpoint via a tenant context")`.
- `GET /media` handler (`media.go:59-68`) các param: owner_scope, page_id, media_type,
  status, tag, q, ids, folder_id, page, limit — **KHÔNG có `brand_id`**.

→ Hệ quả: admin **không** list/tạo/upload media cho 1 brand cụ thể được.

---

## 2. Thay đổi cần làm

### 2.1 `callerScope` — cho platform admin truyền `brand_id`
Sửa `callerScope` (media_folder.go) + scope tương đương bên `media` usecase: thêm
tham số `brandIDOverride string` (lấy từ query `?brand_id`).

Logic mới:
```go
func (u *mediaFolderUsecase) callerScope(ctx context.Context, brandOverride string) (string, *string, string, error) {
	p := auth.FromContext(ctx)
	if p == nil || p.User == nil {
		return "", nil, "", consts.UnauthorizedError("login required")
	}
	// Platform admin + ?brand_id → scope vào brand đó.
	if auth.IsPlatformAdmin(ctx) && brandOverride != "" {
		return brandOverride, auth.ActiveWorkspaceID(ctx), p.User.ID, nil
	}
	// Brand user / staff brand-bound → brand của mình (như cũ).
	cid := auth.PrincipalBrandID(ctx)
	if cid == nil {
		if p.User.BrandID == nil || *p.User.BrandID == "" {
			return "", nil, p.User.ID, consts.ForbiddenError("platform admin must pass ?brand_id")
		}
		v := *p.User.BrandID
		cid = &v
	}
	return *cid, auth.ActiveWorkspaceID(ctx), p.User.ID, nil
}
```
Staff brand-bound: nếu có `?brand_id` khác brand mình → `403` (chỉ platform admin
được cross-brand). Tuỳ chính sách — FE chỉ gửi brand_id khi là admin.

### 2.2 `GET /media/folders` — nhận `?brand_id`
Handler `media_folder.go` `List`: đọc `brand_id` từ query, truyền vào `callerScope`.
Trả folders của brand đó (đã filter theo brand_id sẵn trong repo).

### 2.3 `GET /media` — nhận `?brand_id` ⚠️ (đang bị bỏ qua hoàn toàn)
**Bug hiện tại:** handler `media.go` `List` build filter từ query nhưng **KHÔNG đọc
`brand_id`** (chỉ owner_scope/page_id/media_type/status/tag/q). Và
`scopedMediaFilter` (`internal/usecase/media.go:276`): `if IsPlatformAdmin(ctx) {
return filter }` → admin **không** bị set `filter.BrandID` → trả **TẤT CẢ media mọi
brand**. Hệ quả FE: đổi brand ở `/admin/assets` data không đổi (FE đang phải lọc
client-side tạm).
**Cần:** (a) handler đọc `c.QueryParam("brand_id")` → `filter.BrandID`; (b)
`scopedMediaFilter` cho platform admin: nếu có `filter.BrandID` (từ query) thì giữ;
brand user vẫn ép theo brand mình. Repo đã filter `brand_id` sẵn
(`repository/media.go:45`).

### 2.4 `POST /media/folders` (create) — nhận `brand_id` trong body
`CreateMediaFolderRequest` thêm `brand_id?` (optional). Khi platform admin → tạo
folder trong brand đó (qua callerScope override). Brand user bỏ qua.

### 2.5 `POST /media/uploads/init` — gắn asset vào brand
`InitUploadRequest` (media.go:88, `owner_scope oneof=project library`) thêm
`brand_id?` (+ `workspace_id?`). Khi admin upload hộ brand → asset tạo ra có
`media.BrandID = brand_id`. Hiện init set brand theo caller; cần honor override khi
platform admin.

### 2.6 Bulk + mutate đã có scope theo asset
`bulk-delete`, `bulk-move`, `PATCH /media/:id` (rename/tag), `DELETE /media/:id`:
thao tác theo asset id — chỉ cần **authz check** asset.brand_id == scope brand
(platform admin được mọi brand). Không cần param brand_id (id đã định danh).

---

## 3. Contract FE gọi (sau khi BE ship)

```
GET  /v1/media/folders?brand_id={id}&parent_id=        → { items, breadcrumb }
GET  /v1/media?brand_id={id}&folder_id=&q=&tag=&page=&limit=  → { items, ... }
POST /v1/media/folders            body { brand_id, parent_id?, name, description? }
PATCH/DELETE /v1/media/folders/{id}
POST /v1/media/uploads/init       body { brand_id, owner_scope:'library', filename, mime_type, file_size, media_type }
PUT  /v1/media/uploads/{uploadId}/raw   (file)
POST /v1/media/uploads/complete   body { upload_id, checksum? }
PATCH /v1/media/{id}              body { original_filename?, tags? }   (rename/tag)
POST /v1/media/bulk-delete        body { ids[] }
POST /v1/media/bulk-move          body { ids[], folder_id }
```
- Platform admin: luôn kèm `brand_id`. Brand user: bỏ qua (BE tự lấy brand mình).
- Mọi response media item trả `brand_id` (field đã có).

## 4. Quyền
| Action | brand user (brand mình) | platform admin |
|---|---|---|
| List/upload/folder/delete/move/rename/tag | ✅ (brand mình) | ✅ mọi brand (kèm `?brand_id`/body) |
| staff brand-bound cross-brand | ❌ | — |

## 5. Acceptance
1. admin `GET /media/folders?brand_id=B` → folders của B (không Forbidden như cũ).
2. admin `POST /media/folders {brand_id:B,name}` → folder thuộc B.
3. admin upload (init brand_id=B → raw → complete) → asset có `brand_id=B`.
4. brand user gọi không brand_id → vẫn brand mình (regression).
5. admin `GET /media?brand_id=B&q=logo` → asset B khớp search.

## 6. FE đã/đang build (khớp contract)
- API layer thêm `brand_id?` vào `media.list`, `mediaFolders.list/create`,
  `media.initUpload`; type `MediaAsset.brand_id`.
- Component dùng chung `<MediaLibrary brandId? />`: portal (brandId = của user, bỏ
  fake) + admin AssetsTab (brandId = clientId). Thao tác: upload, folder CRUD,
  delete/move/rename, tag/search.

## 7. Câu hỏi BE
1. Staff brand-bound có được truyền brand_id khác mình không (mình đề xuất KHÔNG)?
2. Quota/limit khi admin upload hộ brand tính theo brand nào (brand đích)?
