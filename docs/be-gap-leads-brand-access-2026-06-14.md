# BE gap — `/v1/leads` trả "Internal-only" cho portal/brand user

2026-06-14 · FE → BE · chặn tab "Phễu & Lead" → bảng "Danh sách ưu tiên"

## Triệu chứng

Brand/portal user (và cả session admin qua portal) gọi:

```
GET /v1/leads?page_id=<uuid>&sort_by=score&sort_order=desc&limit=50&range=30d
→ 403  {"code":"ERR_FORBIDDEN","message":"Internal-only endpoint"}
```

→ SalesView "Danh sách ưu tiên" không đọc được lead. (FE đã graceful: hiện
empty state thay vì đổ lỗi, nhưng brand vẫn KHÔNG xem được lead của chính mình.)

## Phân tích

- Chuỗi `"Internal-only endpoint"` chỉ phát ra từ middleware `RequireInternal`
  (`internal/server/http/middleware/auth.go:88`), tức route đang nằm dưới group
  `internal` ở **binary đang chạy**.
- Nhưng code `origin/main` đã mount đúng trên `priv`:
  `internal/server/http/handler/handler.go:247` → `h.Lead.Register(priv)`.
- Usecase cũng đã brand-scope: `leadUsecase.resolvePageScope` →
  `authorizer.EnsureCanAccessBrand(page.BrandID)` (brand khác → `PageNotFound`,
  không phải Forbidden).

→ Kết luận: **binary prod đang chạy cũ hơn `7e403ef`** (commit đưa leads lên
priv, cùng commit thêm `/v1/analytics/funnel|timeseries|sources`). Đây là cùng
hiện tượng analytics 404 trước đó — rebuild là hết.

## Yêu cầu

1. **Rebuild/redeploy BE từ main** (`make qc` lại) rồi verify:
   ```bash
   curl -s -c /tmp/cj -X POST localhost:9090/v1/auth/login -H 'Content-Type: application/json' \
     -d '{"email":"<brand_user>","password":"..."}' -o /dev/null -w '%{http_code}\n'
   curl -s -b /tmp/cj "localhost:9090/v1/leads?page_id=<uuid_brand_owns>&limit=50" -w '\n%{http_code}\n'
   ```
   Kỳ vọng sau rebuild: `200 {"items":[...]}` (page thuộc brand user) hoặc `404`
   (page khác brand) — KHÔNG còn `Internal-only`.

2. Nếu sau rebuild vẫn `Internal-only` ⇒ leads thực sự còn bị mount dưới
   `internal`: chuyển **GET `/v1/leads`** (read) sang `priv` (giữ brand-scope qua
   `resolvePageScope`). Write (`PATCH /v1/leads/:id`, `POST .../deal`) tuỳ chính
   sách — nếu muốn brand tự đổi trạng thái lead thì cũng để priv.

## Ghi chú dữ liệu

Bảng `leads` chỉ sinh row khi site gửi event `lead_submit` qua `/v1/track`
(kèm contact/name → tách vào bảng `leads`). Seed analytics 7 ngày chỉ có
`form_submit` trong `analytics_events`, **không** tạo lead. Muốn demo có lead,
seed thẳng bảng `leads` (FE có thể cung cấp script tương tự seed analytics).
