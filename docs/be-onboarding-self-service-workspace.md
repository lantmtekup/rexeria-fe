# BE Issue — `POST /brands` không gắn owner/workspace cho caller

**Filed**: 2026-07-09
**Severity**: 🔴 Critical — chặn hoàn toàn tính năng self-service onboarding cho user cũ chưa có brand
**Reporter**: FE team (qua Claude Code, verify sống với dev BE)
**Resource**: `brands`
**Endpoints**: `POST /brands` (non-admin, `rexerApi.brands.create`)

---

## 1. Tóm tắt

Mục tiêu: cho phép 1 user ĐÃ ĐĂNG NHẬP nhưng chưa có brand (`user.brand_id`
null — case phổ biến với user tự đăng ký trước khi FE có bản vá tự-sinh
`company_name`, xem phần "Bối cảnh" bên dưới) tự tạo brand+workspace của
riêng mình mà không cần admin, để vào được `/portal` — nơi flow "chọn
template → tạo landing page" (`/portal/templates`, `cloneIntoWorkspace()`)
đã hoạt động đầy đủ.

`POST /brands` là endpoint non-admin DUY NHẤT hiện có để tạo brand
(`rexerApi.brands.create`, `src/services/rexer/endpoints.ts:1577-1583`).
Nhưng gọi endpoint này (kể cả bằng chính user đã đăng nhập) tạo ra 1 brand
**mồ côi** — không gắn với user gọi API theo bất kỳ cách nào:

- Response có `created_by: null` (không phải id của caller).
- Gọi lại `GET /auth/me` NGAY SAU đó — `user.brand_id` vẫn `null`, không đổi.
- `GET /me/workspaces` vẫn trả mảng rỗng — không có workspace nào được tạo
  kèm theo.

**Expected**: `POST /brands` phải (a) set `created_by` = user đang gọi API,
(b) tự tạo 1 workspace mặc định (giống hành vi của `/auth/register` khi có
`company_name` — xem §3), và (c) gán user đó role `brand_owner` trên
workspace mới, để `GET /auth/me` sau đó trả về `brand_id`+`active_workspace_id`
mới và `GET /me/workspaces` thấy workspace đó.

## 2. Repro steps (verify sống trên dev BE, 2026-07-09)

1. Login 1 user bất kỳ (đã test cả user brand-less lẫn user ĐÃ có brand sẵn
   — kết quả giống hệt nhau, xác nhận đây là lỗi hệ thống của endpoint, không
   phụ thuộc trạng thái brand hiện tại của caller).
2. `POST /brands`:
   ```json
   {
     "slug": "qc-onboard-test-461228984",
     "name": "QC Onboard Test workspace",
     "contact_email": "qc.onboard.test.461228984@rexer.ai",
     "plan": "phase2_self_serve"
   }
   ```
   (Lưu ý: `plan` là field **bắt buộc thực tế** dù type `CreateBrandRequest.plan?`
   đánh dấu optional — thiếu field này BE trả `500 ERR_INTERNAL`:
   `"new row for relation \"brands\" violates check constraint
   \"brands_plan_chk\""`. Đây là lỗi phụ thứ 2, xem §4.)
3. Response `201`:
   ```json
   {
     "brand": {
       "id": "0d5ed473-1abe-4732-8d36-9c5ca029b696",
       "slug": "qc-onboard-test-461228984",
       "name": "QC Onboard Test workspace",
       "status": "pending",
       "plan": "phase2_self_serve",
       "created_by": null,
       ...
     }
   }
   ```
   → `created_by: null` — brand không gắn với caller.
4. `GET /auth/me` ngay sau đó — **không đổi** so với trước khi gọi
   `POST /brands`, vẫn không có `brand_id`/`active_workspace_id`.
5. `GET /me/workspaces` — `[]` (rỗng).

## 3. Đối chiếu — cơ chế ĐÚNG đã có sẵn ở `/auth/register`

Để BE dùng làm tham chiếu: khi `POST /auth/register` được gọi kèm
`company_name`, hành vi ĐÚNG như mong đợi xảy ra ngay lập tức, verify sống
cùng ngày:

```json
// POST /auth/register { ..., "company_name": "QC Onboard Test's workspace" }
// → 201, user object đã có:
"brand_id": "e9c69b05-9b46-43ab-a1aa-c88f4fe8ce9a",
"active_workspace_id": "8067d6bc-6914-46fd-85a5-18b3c585d13d"

// GET /me/workspaces ngay sau đó:
[{
  "workspace": { "id": "8067d6bc-...", "slug": "default", "name": "Default", "is_default": true },
  "role": "brand_owner"
}]

// brand.created_by === user.id (đúng, không null như POST /brands)
// brand.plan tự động = "phase1_managed" (không cần FE gửi field plan)
```

Đây là hành vi ĐÚNG cần replicate cho `POST /brands` khi gọi bởi 1 user đã
đăng nhập (không qua register): gắn `created_by`, tự tạo workspace "Default",
gán `brand_owner`, và refresh `brand_id`/`active_workspace_id` lên user.

## 4. Lỗi phụ — `plan` field

`CreateBrandRequest.plan` (`src/services/rexer/types.ts:2343`) đánh dấu
optional (`plan?: BrandPlan`) nhưng DB constraint `brands_plan_chk` bắt buộc
giá trị hợp lệ, không có default → thiếu field này trả `500` thay vì `400`
validation error rõ ràng. Đề xuất: BE set default `plan` (vd
`phase2_self_serve` cho brand tự tạo qua flow này) khi field bị thiếu, hoặc
validate & trả `400` thay vì để lọt xuống DB constraint thành `500`.

## 5. Đề xuất phạm vi fix

Ưu tiên theo mức độ cần thiết cho tính năng self-service onboarding:

1. **Bắt buộc**: `POST /brands` set `created_by` = caller + auto-tạo
   workspace "Default" + gán `brand_owner` (đúng §3).
2. **Nên có**: default `plan` khi field thiếu (đúng §4), tránh 500 mơ hồ.
3. Sau khi (1) xong, FE sẽ build tiếp UI `/onboarding` (route đã có sẵn chỗ
   trỏ tới từ `SocialLoginButtons.tsx:115` cho Google sign-up mới, hiện 404)
   để user cũ chưa có brand tự đặt tên workspace và gọi endpoint này.

## Liên quan

- `docs/be-alpha-spec.md` — mô tả cơ chế auto-brand qua `/auth/register`.
- `docs/fe-to-be-workspace-role-mismatch-2026-06-03.md` — bug report trước
  đó về field `workspace_role`, cùng khu vực brand/workspace onboarding.
