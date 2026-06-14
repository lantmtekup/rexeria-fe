# BE gap — `/campaigns` internal-only, chặn portal Marketing

2026-06-14 · FE → BE · chặn tab `/portal/marketing` cho brand user

## Triệu chứng

Brand/portal user mở `/portal/marketing` → "Failed to load campaigns /
Internal-only endpoint".

```
GET /v1/campaigns?limit=50
→ 403 {"code":"ERR_FORBIDDEN","message":"Internal-only endpoint"}
```

## Nguyên nhân

`/campaigns` (List/Create/Update/Delete) mount dưới group **internal**:
`internal/server/http/handler/handler.go:286` → `h.Campaign.Register(internal)`
→ `RequireInternal` reject client-portal user.

Marketing brief của portal sống trong `campaign.notes` (JSON), nên cả luồng
Marketing portal (list + tạo/sửa campaign) đều cần `/campaigns`. Hiện brand
không gọi được → tính năng Marketing không dùng được cho brand.

## Yêu cầu

Mở `/campaigns` cho brand, **brand-scoped** (giống pages/analytics):
- Chuyển `Campaign.Register` (ít nhất GET list + GET :id + POST/PATCH/DELETE
  mà portal Marketing dùng) sang group `priv`.
- Trong usecase: lọc theo brand của principal (brand user chỉ thấy campaign
  của brand mình); staff/admin xem tất cả như cũ.

## Ghi chú — pattern lặp lại

Cùng kiểu gating internal-only chặn brand đã gặp ở:
- `GET /v1/leads` (be-gap-leads-brand-access) — bảng "Danh sách ưu tiên".
- `GET /v1/analytics/funnel|timeseries|sources` (proxy/route) — tab Phễu.
- `GET /v1/campaigns` (doc này) — tab Marketing.

→ Nên rà soát toàn bộ endpoint mà **portal brand** cần và mở brand-scoped đồng
loạt thay vì sửa lẻ. FE tạm graceful-empty để không đổ raw error ra cho khách.
