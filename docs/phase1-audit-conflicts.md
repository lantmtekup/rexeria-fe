# Phase 1 Audit — Conflicts & Unclear Items

**Mục đích**: Liệt kê mọi điểm chưa rõ ràng, naming collision, và conflict giữa code đang có với scope Phase 1 (Brand Portal managed service) — để team đồng bộ trước khi BE bắt đầu code.

**Date**: 2026-05-21
**Reviewer**: FE Lan (`Lantm@tekup.vn`)
**Severity**:
- 🔴 **BLOCKER** — chặn việc khác, phải resolve trước
- 🟡 **MAJOR** — không chặn ngay nhưng sẽ gây refactor đắt sau
- 🟢 **MINOR** — naming / cosmetic, có thể fix kèm PR khác

**Status legend**:
- 🟢 **RESOLVED** — đã sửa trong session
- 🔵 **PROPOSED** — đã có giải pháp, cần align
- ⚪ **OPEN** — cần quyết định

---

## 🔴 BLOCKER

### B-01. 🟢 RESOLVED — TS error in `_remote.tsx`

- **File**: `src/app/overview/portal-demo/_remote.tsx:164`
- **Vấn đề**: Đã viết `res.projects` nhưng `ClientPortalProjectListResponse` shape thật là `{ items: ClientPortalProject[] }`.
- **Đã fix**: Đổi sang `res.items`, map field `project_id / template_name / analytics_summary.cta_clicks / conversions / last_publish_at`.

### B-02. 🟢 RESOLVED — Hierarchy Client (1) → Workspace (N)

- **Decision (Lan, 2026-05-21)**: 1 client có thể có nhiều workspace. Giữ `clients` table + bổ sung fields. Tạo `workspaces` table mới với FK `client_id`.
- **Hierarchy**:
  ```
  Client (Coca-Cola VN, pháp nhân, billing)
   ├── Workspace "Coca-Cola brand"   (templates, assets riêng)
   ├── Workspace "Fanta brand"
   ├── Workspace "Sprite brand"
   └── Workspace "Olympic 2026 campaign"
  ```
- **Update spec**: `be-workspace-multitenancy-spec.md` đã cập nhật:
  - `clients` extended với `legal_name, contact_email/phone, country_code, plan, meta`
  - `workspaces` mới: `client_id FK, slug (unique per client), name, description, logo_url, industry, status, meta`
  - `workspace_members` có cả `workspace_id` lẫn `client_id` (denorm)
  - Migration: mỗi client cũ → 1 workspace default `slug='main'`
  - Content tables (canvas_templates / products / assets / etc.) thêm **cả** `workspace_id` lẫn `client_id` (cột thứ 2 là denorm)
- **Loading data**: query phải `WHERE client_id=? AND workspace_id=?` — đặt client_id trước trong compound index.

### B-03. 🔵 PROPOSED — JWT claims cần `client_id` + `active_workspace_id` + `memberships[]`

- **Vấn đề**: Auth hiện tại (`be-alpha-spec.md` + `src/middleware.ts`) chỉ sign JWT với `{sub, role}`. Spec multitenancy cần claims đầy đủ cho scope.
- **Decision (per B-02)**: JWT mới gồm:
  ```json
  {
    "sub": "<user_id>",
    "role": "admin|staff|brand_owner|brand_member|brand_viewer|user|guest",
    "client_id": "<uuid>",            // chỉ brand_*; null cho admin/staff
    "active_workspace_id": "<uuid>",
    "memberships": [
      { "client_id": "<uuid>", "workspace_id": "<uuid>", "role": "brand_owner" }
    ]
  }
  ```
- **Header override** (chỉ staff): `X-Client-Override` + `X-Workspace-Override` — sticky cookie ở admin UI.
- **Cần quyết định**:
  1. Force re-login khi deploy multitenancy? — Đề xuất CÓ (clean migration, JWT cũ accept không scope nào).
  2. Endpoint `/v1/me/workspace/switch` rotate JWT để đổi active workspace.
- **Action item BE**: Cập nhật token signer + `/auth/me` response để chứa `memberships[]`.

---

## 🟡 MAJOR

### M-01. 🔵 PROPOSED — `/portal-demo` → `/portal` migration plan đã viết

- **Migration plan**: [portal-demo-to-production-migration.md](portal-demo-to-production-migration.md)
- **Approach**: 3 phase migration song song.
  - **Phase A**: Migrate 4 page có BE sẵn (Dashboard / Landing pages / Products / Profile). Demo giữ song song với banner cho Sales.
  - **Phase B**: Migrate 3 page chờ BE (Media / Comments / Curate).
  - **Phase C**: Migrate Ads (chờ Meta/Google/TikTok API).
- **Demo route lifecycle**:
  - Phase A-B: giữ làm showcase Sales với banner "Production ở /portal"
  - Phase C+30d: read-only watermark "DEMO" hoặc xoá
- **Chờ quyết định**: PM confirm Phase A timeline (sau khi BE workspace multitenancy ready).

### M-02. 🔵 PROPOSED — Template vs Project terminology

- **Concept clash**:
  - `docs/be-data-gap-home.md`: **Template** = design template (vd "LANDING HERO V1") | **Project** = instance landing (vd "Acme Summer Launch")
  - `docs/be-template-analytics-spec.md`: dùng "Template" lẫn lộn 2 nghĩa
  - `clientPortal.myProjects()` BE trả về **Project** nhưng FE `_remote.tsx` map thành `PortalTemplate`
- **Rủi ro**: Khi viết spec clone/version sau này, "template" → ambiguous.
- **Đề xuất**: 
  - "Template" = thiết kế reusable (`canvas_templates` table với `is_template=true`)
  - "Project" / "Landing" = instance đã publish gắn brand
  - Sửa label FE: "Templates" trong portal-demo → "Landing pages" / "Projects" cho đúng nghĩa BE.

### M-03. 🟢 RESOLVED — "Collection" trong rexerai chỉ = Airtable data table

- **Verify session docs**:
  - `be-workspace-multitenancy-spec.md` chỉ dùng "collection" trong context `data_collections` ✓
  - `be-client-portal-spec.md` không dùng "Collection" ✓
  - `be-asset-upload-spec.md` không dùng ✓
  - `be-template-analytics-spec.md` chỉ reference `360-admin-cms/CollectionAnalyticsPage.tsx` (file name external) ✓
- **Quyết định chốt**: "Collection" trong rexerai = Airtable-style data table (như `be-collections-spec.md` định nghĩa). Loại nghĩa landing page (360-admin-cms) — không port sang.

### M-04. 🟢 RESOLVED — Role enum + label mapping đã chốt

- **Decision (Lan, 2026-05-21)** — Đã document trong `be-workspace-multitenancy-spec.md` §3.3:

| DB role enum | UI label | Phạm vi |
|---|---|---|
| `admin` | "Admin Rexer" | Toàn hệ thống — đổi role user khác, billing, tạo client/workspace |
| `staff` | "Staff Rexer" | Operator — design template, edit canvas; KHÔNG sửa role/billing |
| `user` | "User" | Phase 2 self-serve creator |
| `guest` | "Khách" | Chưa login |
| `brand_owner` | "Brand Owner" | Decision-maker phía brand, invite member trong workspace |
| `brand_member` | "Brand Member" | Nhân viên brand, upload+comment |
| `brand_viewer` | "Brand Viewer" | Read-only |

- **Mapping với type `ActorName` trong `/overview` use cases**: gộp `admin + staff` → `'Admin'`, gộp brand_* → `'BrandClient'` (UC góc nhìn không phân biệt fine-grained).

### M-05. 🟢 RESOLVED — Skeleton placeholder đã tạo

- Đã tạo 3 placeholder page với "Coming soon" + spec link + dependencies list + demo preview:
  - **`src/app/(cms)/admin/workspaces/page.tsx`** → trỏ `be-workspace-multitenancy-spec.md`
  - **`src/app/(cms)/admin/assets/page.tsx`** → trỏ `be-asset-upload-spec.md` + preview `/portal-demo/media`
  - **`src/app/(cms)/admin/analytics/page.tsx`** → trỏ `be-template-analytics-spec.md` + preview `/overview/analytics/templates`
- Shared component **`AdminComingSoon`** (`src/components/modules/Admin/`) — render header + spec link + dependency checklist + optional preview.
- Khi BE Phase 1 ready: replace placeholder bằng component thật (giống pattern `AdminUsersPage`, `AdminProductsPage`).

### M-06. 🟢 RESOLVED — Asset shape adapter chưa có

- **Hiện trạng**: `_remote.tsx` có converter cho Product, Template, Dashboard. **Thiếu** `beAssetToPortal()` cho khi BE assets API xong.
- **Note**: BE `assets` API trong `endpoints.ts` đã có (`media.list`, `initUpload`, `completeUpload`) — sẽ cần adapter khi wire vào `/portal-demo/media/`.
- **Action**: Khi wire Media → BE, viết `beMediaAssetToPortalAsset()` trong `_remote.tsx`.

---

## 🟢 MINOR

### N-01. 🟢 RESOLVED — Đổi hết UI label sang "Landing page"

- **Decision (Lan, 2026-05-21)**: dùng nhất quán "Landing page / Landing pages" thay cho "Canvas Template / Template / Templates" ở mọi label hiển thị cho user.
- **Phạm vi đã đổi**:
  - Sidebar nav: "Templates" → "Landing pages"
  - Dashboard hero text + KPI card label
  - Templates page (đường dẫn route giữ `/templates/` internal nhưng UI hiển thị "Landing pages")
  - Analytics page title + KPI labels + table column header
  - Comments / Products UI strings
- **Giữ nguyên (KHÔNG đổi)**:
  - Type names (`PortalTemplate`, `FAKE_TEMPLATES`)
  - Route paths (`/templates/`, `/api/analytics/templates/`)
  - BE field names (`template_id`, `template_name`, `is_template`, `related_template_ids`) — đợi BE rename ở migration sau
  - Mục `X. Canvas Templates` trong `/overview` (use-case doc) — module name nội bộ

### N-02. ✅ Memory file đã đúng

- `~/.claude/projects/-Users-tranminhlan-Documents-rexerai/memory/rexerai-be-stack.md` — note BE là Go+Postgres, `/v1`, snake_case, CookieAuth ✓.

### N-03. 🟢 RESOLVED — Demo brand đổi sang neutral

- Client demo: `Coca-Cola Vietnam` → **`ACME Beverage Group`**
- Workspaces:
  - `Coca-Cola` → **Flagship Cola**
  - `Fanta` → **Citrus Soda**
  - `Sprite` → **Lemon Fizz**
  - `Olympic 2026 Campaign` → **Sport 2026 Campaign**
- Email: `ops@cocacola.vn` → `ops@acmebev.demo`
- An toàn pitch sales — không vi phạm trademark.
- Khi dev/demo cần realistic, sửa `src/app/overview/portal-demo/_data.ts` (có note).

---

## Tổng kết action items (cập nhật 2026-05-21)

| ID | Severity | Status | Action | Owner |
|---|:---:|:---:|---|---|
| B-01 | 🔴 | 🟢 | Đã fix TS error trong `_remote.tsx` | (done) |
| B-02 | 🔴 | 🟢 | Đã chốt hierarchy Client(1) → Workspace(N) + spec updated | (done) |
| B-03 | 🔴 | 🔵 | JWT claims schema đã propose; BE implement | BE lead |
| M-01 | 🟡 | 🔵 | Migration plan đã viết: `portal-demo-to-production-migration.md` | PM + FE |
| M-02 | 🟡 | 🟢 | Đã rename UI labels qua N-01 | (done) |
| M-03 | 🟡 | 🟢 | Verify: "Collection" trong session docs đều = data table | (done) |
| M-04 | 🟡 | 🟢 | Role enum + label mapping documented trong workspace spec §3.3 | (done) |
| M-05 | 🟡 | 🟢 | Skeleton placeholder đã tạo (workspaces/assets/analytics) | (done) |
| M-06 | 🟡 | 🟢 | Đã ghi chú — viết adapter khi wire Media live | (later) |
| N-01 | 🟢 | 🟢 | Đã đổi mọi UI label sang "Landing page" | (done) |
| N-02 | 🟢 | 🟢 | Memory file đã đúng | (verified) |
| N-03 | 🟢 | 🟢 | Demo brand → ACME Beverage Group (neutral) | (done) |

**Tổng**: 9/12 RESOLVED · 3/12 PROPOSED → chờ BE/PM
- B-03 (JWT) → BE implement theo spec đã có
- M-01 (Portal merge) → PM confirm timeline phase A
- Câu hỏi mở (xem dưới) → đợi quyết định product

---

## Câu hỏi mở chờ trả lời

1. **Multi-workspace per user**: 1 user (vd freelancer) thuộc nhiều brand workspace → UI switch như Notion sidebar, hay slug-based URL `/portal/cocacola-vn/...`?
2. **Project-level access grants** (đang có) vs **workspace-level memberships** (spec đề xuất) — chuyển đổi như thế nào? Brand client cũ có thể bị mất quyền nếu migration không cẩn thận.
3. **Phase 2 self-serve** — khi nào enable User role (creator) edit canvas trực tiếp? Hiện tại Phase 1 chỉ có Staff edit, BrandClient view-only.
4. **Comment moderation** — BrandClient comment có cần Staff review trước khi visible cho member khác trong brand?
5. **Asset retention** — brand churn (cancel plan) → asset trên S3 xử lý như thế nào? Giữ 30/60/90 ngày? GDPR?

---

**Tham khảo**:
- [be-workspace-multitenancy-spec.md](be-workspace-multitenancy-spec.md)
- [be-client-portal-spec.md](be-client-portal-spec.md)
- [be-asset-upload-spec.md](be-asset-upload-spec.md)
- [be-template-analytics-spec.md](be-template-analytics-spec.md)
- [be-data-gap-home.md](be-data-gap-home.md) — định nghĩa Template / Project
- `src/services/rexer/endpoints.ts` — clients + clientPortal endpoints hiện có
- `src/services/rexer/types.ts:426–520` — Client / ClientPortalProject shapes
