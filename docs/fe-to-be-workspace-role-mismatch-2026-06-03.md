# FE → BE: lệch field `role` vs `workspace_role` ở `/v1/portal/me/members`

**Ngày:** 2026-06-03
**Người báo:** FE (vovanphuc)
**Liên quan:** TÍNH NĂNG 2A (brand tạo/quản lý member), `docs/be-response-to-fe-qa-2026-06-03.md`
**Mức:** 🟡 cần thống nhất doc/field (FE đã tự thích ứng tạm)

## Tóm tắt

Contract 2A (BE gửi trước) mô tả mỗi member có `role ∈ brand_owner | brand_member | brand_viewer | staff`.
Thực tế khi verify live, `GET /v1/portal/me/members` trả **hai** field role khác nhau:

- `role` = **tier nền-tảng** (`users.role`), ví dụ `client_user` — KHÔNG phải brand role.
- `workspace_role` = **brand role thật** (`brand_owner` | `brand_member` | `brand_viewer`).

Hệ quả: FE (và `PortalMember.role` cũ) đọc `role` để xác định brand role → owner vừa
đăng ký bị nhận diện là `client_user`, không phải `brand_owner`. Triệu chứng: chip role hiển
thị "client_user" và nút quản lý member bị ẩn nhầm với chính owner.

## Bằng chứng (live, env dev — BE :9090)

User vừa self-register kèm `company_name` (tạo Brand + workspace, là owner).

`GET /v1/auth/me` → `user.role = "client_user"`, `user.principal_type = "client_user"`.

`GET /v1/portal/me/members` → 200:

```json
{
  "items": [
    {
      "user_id": "40d6d365-30e6-4697-8670-ea234fa0aa22",
      "email": "qa-owner@rexertest.local",
      "display_name": "QA Owner",
      "role": "client_user",            // ← tier nền-tảng, KHÔNG phải brand role
      "workspace_id": "a4577ad7-136d-4c6e-a2c4-bdd3cfeca99d",
      "workspace_role": "brand_owner",  // ← brand role thật nằm ở đây
      "active_workspace_id": "a4577ad7-136d-4c6e-a2c4-bdd3cfeca99d",
      "created_at": "2026-06-03T21:03:54.605471+07:00"
    }
  ]
}
```

Khác với contract đã gửi:
- contract ghi field brand role là `role`; thực tế là `workspace_role`.
- contract ghi field thời điểm join là `joined_at`; thực tế trả `created_at` (member object
  từ list không có `joined_at`).

## FE đã xử lý tạm (commit kèm)

- `PortalMember` thêm `workspace_role?` + `workspace_id?` + `created_at?`.
- Mọi chỗ cần brand role (gating owner-only, chip hiển thị, `<select>` đổi role) dùng
  `workspace_role ?? role`.
- `formatJoined(m.joined_at ?? m.created_at)`.

Các endpoint đổi-role/xóa verify OK với field cũ:
- `PATCH /v1/portal/me/members/:userId/role` body `{ "role": "brand_viewer" }` → **200**.
- `DELETE /v1/portal/me/members/:userId` → **200**.

## Đề nghị BE chốt 1 trong 2

1. **Giữ field như hiện tại** (`role` = tier, `workspace_role` = brand role) → cập nhật lại
   doc contract 2A cho khớp (field brand role là `workspace_role`, join time là `created_at`).
   FE đã chạy theo hướng này.
2. **Đổi field cho khớp contract** (`role` = brand role) → FE sẽ revert phần thích ứng.

Mong BE confirm hướng nào để FE chốt type cuối cùng.

## Phụ: 2 contract khác đã verify khớp (không cần làm gì)

- `POST /v1/portal/me/members` trả top-level `{ member, generated_password? }` — đúng, không bọc `{data}`. 409 trả `ERR_CLIENT_USER_DUPLICATE`.
- `POST /v1/brands/:brandId/users`: email chưa tồn tại → **404 `ERR_USER_NOT_FOUND`**; email đã tồn tại → **201 `{ membership: {...} }`** (không có `user`/`generated_password`). Khớp canonical link-only.
