# Test Plan — Phase 1 Wave 2

**Date**: 2026-05-22
**Audience**: QA / PM / dev tự test
**Scope**: 4 feature mới ship tuần này (commits `0eb0145..6dfa67c`)

| Feature | Owner |
|---|---|
| Wave 1 API wiring (workspaces / folders / comments / notif / activity / inbox) | FE đã wire — test data flow |
| Portal live shell (workspace switcher + bell + activity) | FE |
| Admin tạo user — auto-gen password + copy creds | FE |
| Stats overlay Figma-style trên `/p/[id]/[token]` | FE |

---

## 0. Chuẩn bị (Setup — chỉ làm 1 lần)

### 0.1. Mở dev server
```bash
cd /Users/tranminhlan/Documents/rexerai
yarn dev
# Đợi dòng "Ready on http://localhost:3000"
```

### 0.2. Mở 2 trình duyệt incognito riêng biệt
- **Browser A** — dùng cho admin
- **Browser B** — dùng cho brand user mới (sẽ tạo ở test 2)

Hoặc dùng 2 profile Chrome khác nhau.

### 0.3. Credentials có sẵn
| Role | Email | Password |
|---|---|---|
| Admin Rexer | `admin@rexer.ai` | `Admin1234` |

> ⚠️ **Bảo mật**: credentials này chỉ dùng local/dev. Không commit vào code. Khi test xong xoá cookie/incognito.

---

## TC-01 — Login admin + smart redirect

| | |
|---|---|
| **Mục đích** | Verify role-based redirect sau login |
| **Browser** | A |
| **Time** | ~30s |

### Steps
1. Mở **Browser A** → `http://localhost:3000/sign-in`
2. Form đã prefill `admin@rexer.ai` / `Admin1234` (dev only — xác nhận đúng)
3. Click nút "Đăng nhập"

### Expected
- ✅ URL redirect về `/admin` (KHÔNG phải `/portal` hay `/home`)
- ✅ Sidebar admin hiện đầy đủ: Dashboard, Users, Clients, Workspaces, Templates, Analytics...
- ✅ Header trên cùng phải có avatar admin

### Nếu fail
- 401 → check BE đang chạy, cookie `rexer_session` được set không
- Redirect sai → check `RexerSignInForm.tsx:67` role detection logic

---

## TC-02 — Admin tạo user mới (Brand mới + auto-gen password)

| | |
|---|---|
| **Mục đích** | Verify modal tạo user, auto-gen pass, copy credentials |
| **Browser** | A (đã login admin từ TC-01) |
| **Time** | ~2 phút |

### Steps
1. Trong **Browser A** → click sidebar "Users" hoặc vào trực tiếp `http://localhost:3000/admin/users`
2. Click nút **"Tạo user"** (button đen góc phải, có icon UserPlus)
3. Modal mở ra — chọn role bằng cách click card **"Brand Client"** (card thứ 3, màu teal)
4. Trong section "Brand" → chọn tab **"Tạo brand mới"**
5. Fill form:
   - **Email**: `test-brand-1+{timestamp}@rexer.ai` (vd `test-brand-1-220522@rexer.ai` — đảm bảo unique)
   - **Tên hiển thị**: `Nguyễn Test User`
   - **Tên brand**: `ACME Test Brand`
   - **Password**: ĐỂ TRỐNG — checkbox "Auto-generate password" đang ✓ ON
6. Click nút **"Tạo user"** (đen, góc dưới phải)

### Expected khi đang submit
- ✅ Spinner xoay trong nút, disabled
- ✅ Không error hiện ra

### Expected khi thành công
- ✅ Toast xanh góc trên: `Đã tạo brand "ACME Test Brand" + owner user`
- ✅ Modal chuyển sang view **"Đã tạo user thành công"** (header xanh emerald, icon Check)
- ✅ Box vàng warning: "Lưu ngay password — chỉ hiện 1 lần ở đây"
- ✅ 2 field:
  - **Email**: hiện `test-brand-1-...@rexer.ai` + nút Copy
  - **Password**: hiện 16 ký tự mạnh (có lower/upper/digit/symbol) + nút Copy
- ✅ Meta hiện đầy đủ: tên, brand, role badge "Brand Client" (teal)

### Action — LƯU credentials
1. Click **"Copy tất cả"** (góc dưới trái modal)
2. Toast: "Đã copy email + password"
3. Paste vào notepad/sticky notes — sẽ dùng ở TC-04
4. Click **"Xong"** (đen, góc dưới phải) → modal đóng
5. Bảng users tự reload, thấy email mới ở dòng cuối (có thể cần scroll)

### Nếu fail
- 400 `ERR_EMAIL_EXISTS` → email trùng, đổi timestamp
- Modal stuck loading → check Network tab, `/api/rexer/auth/register` status
- Password chỉ 8 ký tự → bug `generatePassword()` — kiểm tra `crypto.getRandomValues`

---

## TC-03 — Admin invite user vào brand có sẵn (auto-gen từ BE)

| | |
|---|---|
| **Mục đích** | Verify path `/clients/{id}/users` + BE-side password gen |
| **Browser** | A |
| **Time** | ~1 phút |

### Steps
1. Trong **Browser A** → `/admin/users` → click "Tạo user"
2. Chọn role **"Brand Client"**
3. Trong section "Brand" → chọn tab **"Brand có sẵn (N)"** (N = số brand hiện có)
4. Dropdown brand → chọn **"ACME Test Brand"** (vừa tạo ở TC-02)
5. Fill:
   - **Email**: `test-staff-1-{timestamp}@rexer.ai`
   - **Tên hiển thị**: `Lê Brand Staff`
   - **Password**: ĐỂ TRỐNG — auto-gen ON
6. Hint dưới password phải đọc: `BE sẽ tự sinh — hiện sau khi tạo xong`
7. Click "Tạo user"

### Expected
- ✅ Toast: `Đã thêm user vào brand "ACME Test Brand"`
- ✅ Modal success — password label hiện `Password (BE auto-gen)`
- ✅ Password là chuỗi do BE sinh (có thể format khác với FE-gen — đó là dấu hiệu nó đến từ BE)

### Footer endpoint hint
- ✅ Hiển thị `POST /v1/clients/{id}/users (BE sinh password)`

### Nếu fail
- Password null/empty → BE chưa trả `generated_password` trong response → BE bug

---

## TC-04 — Brand login + portal shell live data

| | |
|---|---|
| **Mục đích** | Verify portal shell wire BE thật cho workspaces / bell / activity |
| **Browser** | B (incognito mới) |
| **Time** | ~2 phút |
| **Tiền điều kiện** | Đã có credentials từ TC-02 |

### Steps — Login
1. Mở **Browser B** → `http://localhost:3000/sign-in`
2. Form prefill admin → **XOÁ** và nhập:
   - Email: từ TC-02 (vd `test-brand-1-...@rexer.ai`)
   - Password: từ TC-02 (16 ký tự)
3. Click "Đăng nhập"

### Expected sau login
- ✅ URL redirect về `/portal` (KHÔNG phải `/admin` vì role là `client_user`)
- ✅ Header có chip Client trái + chip Workspace giữa

### Steps — Workspace switcher
4. Click chip Workspace (giữa header, có icon ChevronsUpDown)
5. Dropdown mở

### Expected
- ✅ Label header dropdown: `N workspace của ACME Test Brand` (N từ BE, không phải `4 workspace`)
- ✅ List workspace từ BE (nếu BE có nhiều brand → hiện brand của user thôi)
- ✅ Có thể click workspace khác để switch — URL đổi `?ws=<id>`

### Steps — Notification bell
6. Nhìn nút 🔔 góc trên-phải

### Expected
- ✅ Nếu BE có notification chưa đọc → badge đỏ + số
- ✅ Nếu BE rỗng → không có badge (button vẫn click được nhưng không action gì ở phase này)

### Steps — Activity feed
7. Scroll dashboard xuống section **"Hoạt động gần đây"**

### Expected
- ✅ List activity từ BE — mỗi item có format: icon + actor + subject + time relative ("vừa xong" / "X phút trước" / "hôm qua")
- ✅ Nếu BE chưa có activity cho workspace này → fallback hiện 8 item FAKE_ACTIVITY
- ✅ Banner amber góc dưới hiện "Đang dùng fake data" — đúng spec

### Steps — Client name
8. Nhìn label CLIENT bên trái header

### Expected
- ✅ Hiện `ACME Test Brand` (lấy từ `user.client_name`)
- ✅ KHÔNG hiện `ACME Beverage Group` (đó là FAKE_CLIENT default)

### Nếu fail
- Workspace list = 4 fake → BE `/me/workspaces` rỗng hoặc 401 → check user có membership chưa
- Client name = fake → `user.client_name` không có trong Redux → check `authSlice` mapping

---

## TC-05 — Stats overlay toolbar (admin/staff)

| | |
|---|---|
| **Mục đích** | Verify Figma-style overlay xuất hiện trên public landing |
| **Browser** | A (admin login) |
| **Time** | ~2 phút |
| **Viewport** | Tối thiểu **1440x900** (overlay yêu cầu width ≥ 1280px) |

### Tiền điều kiện — Publish 1 canvas template
1. Trong Browser A → `/canvas-templates` (hoặc `/admin/canvas-templates`)
2. Click vào 1 template bất kỳ → vào editor
3. Click nút **"Publish"** (góc trên-phải)
4. Dialog mở → toggle "Xuất bản" → ON
5. Copy link share: `http://localhost:3000/p/<id>/<token>`

### Steps — Mở public URL
1. Trong Browser A (vẫn login admin) → paste link share vào URL bar
2. Đợi page load xong (canvas render đầy đủ)

### Expected
- ✅ Page render canvas bình thường — không bị overlay che
- ✅ Góc trên-phải có **toolbar pill** floating: `[👁 Stats OFF]` (background trắng, border xám, shadow)

### Steps — Toggle ON
3. Click pill `Stats OFF`

### Expected sau click
- ✅ Pill đổi thành `[👁 Stats ON]` background đen, text trắng
- ✅ Bên phải pill xuất hiện dropdown range `30 ngày ▼`
- ✅ Indicator `live` hoặc `…` (loading) hoặc `no data`
- ✅ **Left gutter** (mép trái page): cards block summary xuất hiện, đánh số ❶❷❸ theo thứ tự block từ trên xuống
- ✅ **Right gutter** (mép phải page): cards element xuất hiện (chỉ nếu template có analytics events ≥ 50 views — có thể trống nếu page mới)
- ✅ **Leader line** (đường cong dashed xám) nối từ card → block tương ứng

### Steps — Card chi tiết
4. Hover card block trái

### Expected nội dung card
- ✅ Index ❶❷❸ ở header
- ✅ Block type uppercase (vd `HERO_OVERLAY`)
- ✅ Grid 2x2: 👁 views, 🖱 clicks, 📈 CTR (xanh ≥5%, cam ≥2%, đỏ <2%), ⏱ avg dwell
- ✅ Number format K/M (vd `12.4K`, `1.2M`)

### Steps — Date range
5. Click dropdown range → chọn `7 ngày`

### Expected
- ✅ Toolbar indicator chuyển `…` (loading) → `live`/`no data`
- ✅ Card numbers cập nhật (có thể bằng 0 nếu 7 ngày gần đây không có view)

### Steps — Persist localStorage
6. Mở DevTools → Application tab → Local Storage → `http://localhost:3000`
7. Tìm 2 key:

### Expected
- ✅ `rexer.statsOverlay.enabled` = `"1"`
- ✅ `rexer.statsOverlay.range` = `"7d"`

### Steps — Reload preserve
8. F5 reload page

### Expected
- ✅ Toolbar tự bật `Stats ON` (không phải reset về OFF)
- ✅ Range vẫn là `7 ngày`
- ✅ Cards mount lại đúng vị trí

### Steps — Toggle OFF
9. Click pill `Stats ON` → thành `Stats OFF`

### Expected
- ✅ Tất cả cards 2 bên gutter biến mất
- ✅ Leader lines biến mất
- ✅ Dropdown range biến mất
- ✅ Page hoàn toàn clean như khi chưa bật

### Nếu fail
- Toolbar không hiện → check console: `useAppSelector(s => s.auth.user)` có `role: 'admin'` không
- Cards không hiện khi ON → check Network: `GET /admin/analytics/templates/<id>/breakdown` response shape `BlockBreakdownRow[]`
- Cards lệch vị trí block → check `[data-block-id]` attribute có trên DOM block wrapper

---

## TC-06 — Stats overlay không hiện cho brand_user

| | |
|---|---|
| **Mục đích** | Verify permission gate — brand không thấy overlay (chờ BE wave 2) |
| **Browser** | B (brand user từ TC-04) |
| **Time** | ~30s |

### Steps
1. Trong **Browser B** → paste link share `http://localhost:3000/p/<id>/<token>` (cùng URL TC-05)
2. Đợi page load

### Expected
- ✅ Page render canvas đầy đủ
- ✅ **KHÔNG** có toolbar góc trên-phải
- ✅ **KHÔNG** có gutter cards
- ✅ Brand chỉ thấy page sạch như khách

### Lý do
- BE endpoint `/admin/analytics/templates/{id}/breakdown` là admin-only
- FE gate `role === 'admin' || 'staff'` ở `StatsAnnotationOverlay.tsx:355`
- Chờ wave 2 W2.1 — BE add `/portal/templates/{id}/breakdown` cho brand

---

## TC-07 — Edge case: viewport hẹp

| | |
|---|---|
| **Mục đích** | Overlay tự fold khi không đủ chỗ |
| **Browser** | A |
| **Time** | ~30s |

### Steps
1. Browser A → mở public URL với Stats ON
2. Resize window → kéo nhỏ lại < 1280px (vd 1024x768)

### Expected
- ✅ Cards gutter biến mất
- ✅ Banner amber góc dưới-phải hiện: `Viewport < 1280px — overlay cần màn hình rộng hơn để hiện gutter`
- ✅ Toolbar vẫn còn (vẫn toggle được)
- ✅ Resize lại > 1280px → cards re-mount đúng vị trí

---

## TC-08 — Edge case: public landing chưa publish

| | |
|---|---|
| **Mục đích** | Overlay không mount khi template chưa publish |
| **Browser** | A |
| **Time** | ~30s |

### Steps
1. Browser A → vào canvas-templates editor → tắt publish (toggle OFF)
2. Mở link share cũ → reload

### Expected
- ✅ Page hiện "Trang này chưa được xuất bản" + icon Globe2
- ✅ **KHÔNG** có toolbar
- ✅ **KHÔNG** có overlay
- ✅ Link "Về trang chủ REXER"

---

## TC-09 — Edge case: Comments page — fake fallback

| | |
|---|---|
| **Mục đích** | Verify comments page vẫn render với fake data (chưa wire BE) |
| **Browser** | B (brand) |
| **Time** | ~30s |

### Steps
1. Browser B → `/portal/comments`

### Expected
- ✅ Page render với 4 FAKE_THREADS (hardcoded UI demo)
- ✅ KHÔNG crash, KHÔNG empty state
- ✅ Banner "fake data" có thể hiện (tuỳ implementation)

### Lý do
- BE `templateComments` endpoint đã có nhưng FE chưa wire vào page này (chỉ wire qua `rexerApi.templateComments` ở service layer)
- Page rewrite là follow-up

---

## TC-10 — Edge case: Media folders — fake fallback

| | |
|---|---|
| **Mục đích** | Verify media page với folder tree fake |
| **Browser** | B |
| **Time** | ~30s |

### Steps
1. Browser B → `/portal/media`

### Expected
- ✅ Sidebar folders hiện tree FAKE_FOLDERS (Brand Guidelines, Tết 2026, etc.)
- ✅ Files area hiện FAKE_MEDIA_FILES
- ✅ Click folder → navigate tree được

### Lý do
- BE `mediaFolders` đã có nhưng page UI chưa rewrite (folder tree + file list cần redesign)
- Wired ở `_remote.tsx:loadMediaFolders` sẵn sàng

---

## TC-11 — Automated: E2E Playwright

| | |
|---|---|
| **Mục đích** | Smoke test toàn bộ overlay flow |
| **Time** | ~10s |

### Steps
```bash
cd /Users/tranminhlan/Documents/rexerai
npx playwright test tests/e2e/stats-overlay.spec.ts --project=chromium
```

### Expected output
```
Running 3 tests using 1 worker
  ✓  setup › authenticate as admin (~2s)
  ✓  toolbar appears for admin and toggles persist via localStorage (~5s)
  ✓  block elements carry data-block-id anchors for the overlay (~1s)
  3 passed (~10s)
```

### Nếu fail
- `BE login should succeed (got 401)` → BE chết hoặc creds sai
- `LIST canvas templates should succeed (got 401)` → cookie auth setup không persist
- `[data-block-id] timeout` → public render fail; check console screenshot ở `test-results/`

---

## Kết quả test — Template ghi nhận

Sao chép table này, fill cột **Status** + **Note** sau khi test:

| TC | Feature | Status | Tester | Note |
|---|---|---|---|---|
| TC-01 | Login + redirect | ⬜ | | |
| TC-02 | Tạo user brand mới | ⬜ | | |
| TC-03 | Invite user vào brand | ⬜ | | |
| TC-04 | Portal live shell | ⬜ | | |
| TC-05 | Stats overlay admin | ⬜ | | |
| TC-06 | Stats overlay brand (negative) | ⬜ | | |
| TC-07 | Viewport hẹp | ⬜ | | |
| TC-08 | Chưa publish | ⬜ | | |
| TC-09 | Comments fake | ⬜ | | |
| TC-10 | Media folders fake | ⬜ | | |
| TC-11 | Playwright e2e | ⬜ | | |

Legend: ⬜ chưa test · ✅ pass · ❌ fail · ⚠️ pass có warning

---

## Cleanup sau khi test

```bash
# Xoá test user đã tạo (qua admin UI hoặc DB)
# Reset localStorage
# Xoá cookies incognito (đóng browser)
```

Nếu cần xoá user qua API:
```bash
curl -X DELETE -b cookies.txt \
  'http://localhost:3000/api/rexer/clients/<test-brand-id>'
```

---

## Báo cáo bug

Nếu gặp lỗi, ghi nhận theo format:

```
[TC-XX] Feature
Steps to reproduce: 1. ... 2. ...
Expected: ...
Actual: ...
Browser/Viewport: ...
Console errors: (paste)
Network failed: (URL + status code)
Screenshot: (attach)
```

Gửi lên Slack `#rexer-dev` hoặc tạo issue trên GitLab.
