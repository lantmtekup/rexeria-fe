# BE gap — `/portal/templates` thiếu `external_url`

2026-06-14 · FE → BE · priority P2 (FE đã có workaround chạy được)

## Vấn đề

Portal landing list (`/portal/landing-pages`) cần biết landing nào là **loại
ngoài (external)** để click mở thẳng URL ngoài (giống nút "Mở link" ở admin)
thay vì Preview nội bộ.

`GET /v1/portal/templates` hiện **không trả `external_url`** — SQL ở
`internal/repository/portal.go` (`ListTemplates`) SELECT từ bảng `pages` nhưng
bỏ cột `p.external_url`. FE không phân biệt được external/internal landing.

## Yêu cầu

Thêm `external_url` vào response item của:

| Endpoint | Trả thêm field | Nguồn |
|---|---|---|
| `GET /v1/portal/templates` | `external_url string \| null` | `pages.external_url` |

`/portal/templates` `id` đã = `pages.id` (post-cutover template == page), nên
chỉ cần thêm `p.external_url AS external_url` vào SELECT + map vào
`models.PortalTemplate`.

## Workaround FE hiện tại (sẽ gỡ khi BE trả field)

`loadTemplates` gọi thêm `GET /v1/workspaces/{ws}/pages` (brand-scoped, đã trả
`external_url`) rồi merge theo page id. Tốn 1 request/workspace.

Khi `/portal/templates` trả `external_url` → bỏ phần enrich, đọc trực tiếp.
