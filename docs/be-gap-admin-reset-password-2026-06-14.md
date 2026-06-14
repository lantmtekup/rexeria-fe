# BE gap — Admin reset password cho member (2026-06-14)

> Gửi team BE. FE đã làm nút "Reset pass" trong tab Members của brand
> (`AdminClientDetailPage`). Chạy được trên **local (MVP mode)** nhưng **KHÔNG
> chạy trên prod**. Cần BE bổ sung 1 endpoint.

## Hiện trạng — FE workaround bằng 2 call có sẵn
Vì BE không có endpoint admin set-password, FE ghép:
1. `POST /v1/auth/forgot-password {email}` → lấy `reset_token`.
2. `POST /v1/auth/reset-password {token, new_password}` → đặt password FE sinh.
3. Hiện password mới cho admin copy gửi member.

## Vấn đề — prod không trả `reset_token`
Probe prod 2026-06-14:
```
POST /v1/auth/forgot-password {"email":"admin@rexer.ai"}
→ {"message":"If the email exists, a reset link has been sent"}   # KHÔNG có reset_token
```
- Local (MVP, chưa có SMTP) trả thẳng `reset_token` → FE chạy được.
- Prod trả message generic (đúng — không được lộ token cho bất kỳ ai) → FE
  không có token → không đặt được password biết trước → reset thất bại.

## Cần BE — endpoint admin reset password
Đề xuất:
```
POST /v1/admin/users/{id}/reset-password        (hoặc /brands/{brandId}/users/{id}/reset-password)
  auth: admin/staff, tenant-scoped
  body (optional): { new_password?: string }     # bỏ trống → BE tự sinh
  resp: { new_password: string }                 # trả về để admin copy gửi member
```
Yêu cầu:
- Chỉ admin/staff gọi được (không phải self-service như forgot-password).
- Trả `new_password` về (giống flow tạo user trả password 1 lần) để admin gửi
  cho member — đây là điểm khác forgot-password (forgot không lộ password).
- Set thẳng password (hash + update user), không cần token/email.

## FE sẵn sàng
Khi BE ship: FE đổi từ 2-call (forgot→reset) sang 1-call
`admin/users/{id}/reset-password`, hiện `new_password` trả về trong popup hiện
có. UI không đổi.
