# QA — Full flow test: Tạo brand → Public 1 landing page

**Ngày:** 2026-06-08 · **Soạn:** Senior Tester · **Phạm vi:** end-to-end hành
trình từ lúc admin tạo 1 brand đến khi 1 landing page được public + xem analytics.
Cover happy path + negative + boundary + permission + UI/cross-browser + known gaps.

---

## 0. Chuẩn bị

### 0.1 Tài khoản
| Role | Tài khoản (seed local) | Quyền |
|---|---|---|
| Platform admin | `admin@rexer.ai` / `Admin1234` | full admin, không thuộc brand nào |
| Brand user | (user thuộc brand vừa tạo) | chỉ portal của brand mình |

> Prod: dùng tài khoản prod tương ứng. Đăng nhập sai pass → §X negative.

### 0.2 Môi trường cần verify
- **Trình duyệt:** Chrome, **Safari** (đặc biệt: `<select>` không glossy), Firefox, mobile Safari.
- **BE target:** local `:8080` vs prod. Một số tính năng cần BE mới (đánh dấu ⚠️BE).
- **Trạng thái mạng:** offline/timeout giữa chừng (negative).

### 0.3 Quy ước
P0 = chặn release · P1 = quan trọng · P2 = nên có. Mỗi case: **Bước → Kết quả mong đợi**.

---

## PHASE 1 — Tạo & quản lý Brand (admin)

**TC-1.1 (P0) Tạo brand hợp lệ.** Admin → Khách hàng → Tạo brand: tên, email,
plan… → Lưu. **KQ:** brand xuất hiện trong list; mở detail OK; có workspace mặc định.

**TC-1.2 (P1) Validate.** Bỏ trống tên / email sai định dạng / slug trùng. **KQ:**
báo lỗi field rõ ràng, không tạo.

**TC-1.3 (P1) Sửa brand.** Đổi tên/contact/plan → Lưu → reload giữ đúng (verify 2
chiều, không chỉ toast).

**TC-1.4 (P2) Trùng tên/slug brand.** **KQ:** 409 / báo trùng.

**TC-1.5 (P1) Quyền.** Brand user gọi tạo brand → 403 / không thấy nút.

---

## PHASE 2 — Workspace của brand

**TC-2.1 (P1)** Tab Workspaces → tạo workspace (slug lowercase-kebab) → KQ: hiện
trong list, badge count tăng.
**TC-2.2 (P2)** Slug sai (hoa/ký tự lạ) → báo lỗi. Slug trùng trong brand → 409.
**TC-2.3 (P1)** Brand mới có **workspace mặc định** (is_default) để tạo landing.

---

## PHASE 3 — Members

**TC-3.1 (P1)** Tab Members → mời user (email + role). **KQ:** user vào list; role đúng.
**TC-3.2 (P1)** `role` (PortalMember) vs `workspace_role` hiển thị đúng (be-contract).
**TC-3.3 (P2)** Mời email trùng / sai định dạng → báo lỗi.
**TC-3.4 (P1)** Brand user đăng nhập → vào đúng `/portal` (không phải `/home`/`/admin`).

---

## PHASE 4 — Tracking keys (tab Brand)

**TC-4.1 (P1) Tạo key.** Tab Tracking keys → Tạo key (name + origins + workspace) →
**KQ:** modal "Lưu key ngay" hiện **plaintext key + snippet**, nút Copy, cảnh báo
"chỉ hiện 1 lần". Đóng → list chỉ còn `key_prefix…`.
**TC-4.2 (P0)** Plaintext **không** xem lại được sau khi đóng modal.
**TC-4.3 (P1)** Rotate → confirm → key cũ chết, modal key mới.
**TC-4.4 (P1)** Revoke → confirm "không hoàn tác" → biến mất khỏi list.
**TC-4.5 (P1)** Toggle active↔disabled (PATCH status).
**TC-4.6 (P1) Quyền:** brand user chỉ **xem** list, không thấy nút ghi (isInternal gate).
**TC-4.7 (P2)** Validate: name rỗng / origin không phải URL / sửa key đã revoked → lỗi.

---

## PHASE 5 — Products (cho landing dùng)

**TC-5.1 (P1) Admin tạo product hộ brand.** `/admin/products` → "Tạo sản phẩm" →
chọn brand (hoặc dùng filter brand) → **wizard portal** (name/category/sku/colors/
certs/ảnh) → tạo. **KQ:** product hiện trong list với **cột Brand đúng**; flow
giống hệt portal.
**TC-5.2 (P1)** Filter brand → list đổi theo; "Tất cả brand" → toàn bộ.
**TC-5.3 (P1) Portal tạo product** (brand user) → cùng wizard → product thuộc brand mình.
**TC-5.4 (P2)** Tạo product không chọn brand (admin) → bắt buộc chọn brand (BrandPickDialog).
**TC-5.5 (P2)** Validate tên rỗng (wizard chặn bước 1).
**TC-5.6 (P1)** Upload ảnh product trong wizard → ảnh gắn (best-effort nếu media lỗi).

---

## PHASE 6 — Media / Assets

**TC-6.1 (P0) Upload (portal).** `/portal/media` → Upload → chọn file →
init→raw→complete. **KQ:** file hiện; ảnh có thumbnail (prod CDN); doc/video →
icon. **Safari:** verify nút Upload mở picker.
**TC-6.2 (P1) Upload trong folder.** Vào folder → Upload → file nằm **đúng trong
folder** (move sau upload nếu BE chưa bind folder_id).
**TC-6.3 (P1)** Tạo folder / rename / xoá (folder rỗng).
**TC-6.4 (P1)** Chọn nhiều file → bulk delete / chuyển thư mục.
**TC-6.5 (P1)** Rename file, sửa tags; search theo tên.
**TC-6.6 (P1) Admin asset hộ brand.** `/admin/assets` (menu sidebar) → chọn brand →
**đổi brand là đổi data**; brand chưa có asset → **trống** (không stale). ⚠️BE:
folders 403 + media chưa scope brand_id (đang lọc client-side) → verify lại khi BE ship.
**TC-6.7 (P2)** Drag-drop upload vào vùng trống.
**TC-6.8 (P2)** Upload file lớn / nhiều file → progress `done/total`, có toast lỗi từng file.
**TC-6.9 (P1) Thumbnail vỡ** (public_url không tới) → fallback icon, KHÔNG hiện alt text.

---

## PHASE 7 — Template (tiền đề tạo landing)

**TC-7.1 (P1)** `/admin/templates`: phân biệt **block template** vs **code template**
(mint-coint/hero-classic). Preview mỗi loại render đúng.
**TC-7.2 (P2)** Tạo block template (shell) → vào detail add canvas blocks → Save Version.
**TC-7.3 (P1)** Code template: editor là **form** (CodeTemplatePageEditor), không canvas.

---

## PHASE 8 — Tạo Landing page ⭐

**TC-8.1 (P0) Từ template.** `/admin/landing-pages` → "Tạo landing" → mode **Từ
template** → chọn brand → workspace (auto default) → template → Tạo. **KQ:** page
tạo (status draft), hiện trong list, brand/workspace đúng.
**TC-8.2 (P0) External link.** Mode **External link** → name + URL domain → Tạo.
**KQ:** ⚠️BE — cần `external_url` + tạo page không template. Nếu BE chưa ship →
toast lỗi (đúng kỳ vọng); khi ship → row có badge **External** + nút "Mở link".
**TC-8.3 (P1)** Validate: name rỗng / chưa chọn brand / chưa chọn template (mode
template) / URL không hợp lệ (mode external) → báo lỗi, không tạo.
**TC-8.4 (P1)** Brand chưa có workspace → disable/empty workspace → không tạo được.
**TC-8.5 (P2)** Tạo landing từ portal (brand user) qua "Use template".
**TC-8.6 (P2)** Empty-state list → nút "Tạo landing" hoạt động.

---

## PHASE 9 — Sửa Landing

**TC-9.1 (P0) Block template → canvas editor.** List → "Mở editor (canvas)" →
BlockEditor; thêm/sửa block, đổi content/ảnh → Save Version.
**TC-9.2 (P1) Code template → form.** Mở editor → CodeTemplatePageEditor (form +
live preview) → sửa field → Lưu (`type_metadata`) → preview đổi.
**TC-9.3 (P1) Sửa thông tin** (kebab) → đổi name/slug → Lưu; external → đổi URL.
**TC-9.4 (P1)** Slug trùng trong workspace → 409.
**TC-9.5 (P2)** Landing copy (template_version_id ≠ template.current) vẫn mở editor
được (resolve qua slug/id/public blueprint).

---

## PHASE 10 — Publish

**TC-10.1 (P0) Publish từ editor.** Save Version → Publish → status `published`;
snapshot HEAD version (be-audit §13).
**TC-10.2 (P1) Publish từ list kebab** (draft → Publish). **KQ:** status đổi; lưu ý
list-publish giữ template_version_id hiện tại (không bump HEAD — cần editor để snapshot).
**TC-10.3 (P1) Unpublish** (published → kebab) → status draft → `/p/{slug}` 404.
**TC-10.4 (P1) Validate trước publish** (`/publish/validate`) — thiếu nội dung bắt buộc → cảnh báo.
**TC-10.5 (P2) Cài domain** (kebab → DomainSettingsDialog) → map custom domain.
**TC-10.6 (P1) Archive/Restore** + **bulk archive** (table). Hard-delete (nếu flag) → type "XOA".

---

## PHASE 11 — Public render `/p/{slug}` ⭐

**TC-11.1 (P0) Block landing published** → `/p/{slug}` render canvas blocks đúng
(ảnh, animation), không trắng.
**TC-11.2 (P0) Code landing published** → render React component (vd mint-coint hero/sections).
**TC-11.3 (P1) External landing** → "Mở link" mở **đúng URL ngoài** (tab mới).
**TC-11.4 (P1) Draft/unpublished** → `/p/{slug}` **404/notFound** (chỉ serve published).
**TC-11.5 (P1) Slug rỗng** → list dùng id; "Xem landing" fallback editor (chưa có trang live).
**TC-11.6 (P2) Fallback** block trống + không code-tpl → iframe HTML BE (legacy).
**TC-11.7 (P1) Nút "Mở landing"**: published+slug → `/p/{slug}`; external → URL;
chưa publish → editor.

---

## PHASE 12 — Analytics

**TC-12.1 (P0) Cards view.** `/admin/landing-pages/{slug}/analytics` → block cards
(views/clicks/CTR/dwell) đọc từ **published blueprint** (không "chưa có block" cho
landing copy).
**TC-12.2 (P1) Code template** → **section cards** + "Breakdown theo CTA" (meta.tracking),
KHÔNG "chưa có block".
**TC-12.3 (P1) Overlay view** → render trang + stats card cạnh block; toggle ON/OFF;
đổi range 7/14/30d; kéo-thả card (lưu vị trí); demo data khi BE rỗng (badge demo/live).
**TC-12.4 (P1) Reach/CTR** đúng; landing chưa có event → "chưa có event" state.
**TC-12.5 (P2)** Brand user xem analytics (portal breakdown) — không 403.

---

## CROSS-CUTTING

### X. Permissions (P0)
- Brand user **không** truy cập `/admin/*` → redirect `/portal`.
- Chưa login vào `/admin/*` hoặc `/portal/*` → redirect `/sign-in` (không kẹt spinner).
- Session BE hết hạn (401 `/auth/me`) → tự đá ra `/sign-in` (cookie local clear, không bounce loop).
- Staff-bound-brand không thao tác cross-brand (asset/tracking-key).

### Y. UI / Cross-browser (P1)
- **Safari:** mọi `<select>` (filter brand, status, sort, form) **phẳng + chevron**,
  không glossy/mũi tên đôi.
- Modal không tràn (key/snippet/tracking-key dài) — `min-w-0`/`break-all`.
- Loading skeleton mọi trang list; empty states đúng.
- Responsive: analytics overlay cảnh báo khi viewport < 1360px.

### Z. Negative / Boundary (P1)
- Mạng lỗi giữa upload/create → toast lỗi, không kẹt; retry được.
- Pagination biên (trang cuối, total=0).
- Field max length (name 200, URL 2048…) → BE 400 hiển thị thân thiện.
- Double-submit (bấm nhanh) → disable khi saving, không tạo trùng.
- Đổi brand/filter liên tục → không race, data đúng brand cuối.

---

## KNOWN GAPS (chờ BE — đánh dấu khi test)
1. **External landing** (TC-8.2/11.3): cần BE `external_url` + tạo page không
   template — `be-spec-external-landing-2026-06-07.md`.
2. **Admin asset scope** (TC-6.6): `GET /media` + `/media/folders` chưa honor
   `?brand_id` cho platform admin (folders 403; media trả all → FE lọc tạm) —
   `be-spec-admin-asset-scope-2026-06-07.md`.
3. **Media local** (`/files`): BE local không serve `public_url` → thumbnail vỡ trên
   local (prod CDN OK).
4. **Ads brand-scope / micro-site pages-metrics**: xem `be-tasks-2026-06-05.md`,
   `be-spec-micro-site-pages-stats`.

> Khi BE ship các mục trên → chạy lại đúng TC tương ứng, xác nhận hết workaround.
