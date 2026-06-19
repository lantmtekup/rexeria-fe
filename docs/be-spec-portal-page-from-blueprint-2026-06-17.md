# BE cần: cho `source_template_id` OPTIONAL ở `POST /portal/templates`

## Vấn đề
`POST /v1/portal/templates` đang **bắt buộc `source_template_id`** (clone-only). Brand
không tạo được landing từ block đã chọn (chỉ clone template có sẵn).

## Mong muốn
Cùng endpoint `POST /v1/portal/templates`, cho `source_template_id` **optional**,
nhận thêm `canvas_blueprint`. Đúng 1 trong 2:

```json
{
  "name": "Landing: Kể chuyện thương hiệu",
  "workspace_id": "4dc2857d-...",            // optional
  "source_template_id": "<uuid>",            // (A) clone — như hiện tại
  "canvas_blueprint": { "schema_version": "2.0", "blocks": [ ... ] }  // (B) MỚI: dựng từ block
}
```

- Có `canvas_blueprint` → BE tự dựng template + version + page từ block brand gửi.
- Có `source_template_id` → clone như cũ.
- Không có cái nào → 400.

**Response:** `Page` (như hiện tại).
**Quyền:** brand (`client_user`) gọi được, khoá theo brand + workspace người gọi.

## Block trong `canvas_blueprint.blocks[]` — BE phải đọc `blockType`

Mỗi block FE gửi:
```json
{
  "id": "uuid-local",
  "blockType": "hero_split",     // ← BLOCK TYPE ở đây (camelCase)
  "name": "...",
  "contentVi": { "desktop": { ... } },
  "contentEn": { "desktop": { ... } },
  "isVisible": true
}
```

BE create-from-blueprint phải:
1. **Đọc block type qua key `blockType`** (validator `canvas_blueprint_validator.go`
   đã đọc đúng: `firstString(block_type, blockType, block_id)`). KHÔNG bỏ qua field này.
2. **Persist mỗi block với `type_code = blockType`** (tham chiếu catalog `block_types`).
   → đây là chỗ "be chưa handle".
3. Mỗi code phải có trong `block_types` + `supported_surfaces` chứa `landing`,
   nếu không sẽ lỗi `unknown block type` / surface.

**Các code AI sinh ra (cần có trong catalog, surface=landing):**
`hero_split`, `hero_overlay`, `feature_section`, `photo_gallery`, `booking_form`,
`cta_section` (đúng enum `ai.go`). 6 code này là tối thiểu.

## Chỗ sửa cụ thể (BE)

**Endpoint:** `POST /v1/portal/templates` (route giữ nguyên).
**File:** `internal/usecase/portal.go` → func `CreateTemplate` (hiện ~dòng 171-210).
**Model:** `internal/domain/models/canvas_template.go` `CreatePortalTemplateRequest`
đã có sẵn `CanvasBlueprint JSONMap` — KHÔNG cần thêm field.

Sửa logic trong `CreateTemplate`:

1. **Bỏ** chỗ ép buộc:
```go
if req.SourceTemplateID == nil || strings.TrimSpace(*req.SourceTemplateID) == "" {
    return nil, consts.BadRequestError(consts.ErrBadRequest, "source_template_id is required")
}
```
→ đổi thành: cần **đúng 1 trong** `source_template_id` | `canvas_blueprint` (không có → 400).

2. **Nhánh blueprint** (deps `u.templateUC`, `u.pageUC` đã inject sẵn):
```go
templateID := strings.TrimSpace(deref(req.SourceTemplateID))
if len(req.CanvasBlueprint) > 0 {
    // a) tạo template backing
    tpl, err := u.templateUC.Create(ctx, &models.CreateTemplateRequest{
        Code:        "portal-landing-" + <unique>,   // unique, max 100
        Name:        req.Name,
        PreviewMode: "rendered",
        Status:      "active",
    })
    if err != nil { return nil, err }
    // b) đổ block vào draft
    if _, err := u.templateUC.SaveDraftCanvasBlueprint(ctx, tpl.Template.ID, req.CanvasBlueprint); err != nil {
        return nil, err
    }
    // c) commit draft → version v1 (tự set current_version_id vì template mới)
    if _, err := u.templateUC.CreateVersion(ctx, tpl.Template.ID, &models.CreateTemplateVersionRequest{
        Version: "1.0.0", SchemaVersion: "2.0",
        FieldSchemaJSON: models.JSONMap{}, DefaultConfigJSON: models.JSONMap{},
    }); err != nil { return nil, err }
    templateID = tpl.Template.ID
}
```

3. **Tạo page** (giữ nguyên đoạn cuối, chỉ dùng `templateID` ở trên):
```go
return u.pageUC.Create(ctx, wsID, &models.CreatePageRequest{
    Type: consts.PageTypeLanding, TemplateID: templateID, Name: strings.TrimSpace(req.Name),
})
```

> Note: `CreateVersion` lấy canvas từ draft buffer (`template.go` ~312) + version
> đầu tự set `current_version_id` (~345) → `pageUC.Create(TemplateID)` dùng đúng
> version chứa block. `templateUC` gọi in-process nên không vướng `RequireInternal`.

## Hết
FE đã sẵn: gọi `POST /portal/templates` với `canvas_blueprint` (không gửi
`source_template_id`). BE sửa `CreateTemplate` như trên + đảm bảo 6 block code
trong catalog (surface=landing) là chạy.
