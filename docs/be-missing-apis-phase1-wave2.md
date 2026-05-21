# BE Missing APIs — Phase 1 Wave 2

**Date**: 2026-05-22
**Audience**: BE squad
**Status**: 🔴 Cần để FE ship đầy đủ tính năng đã build tuần này (stats overlay + create-user modal)
**Related**: `docs/be-missing-apis-phase1.md` (wave 1 — đã ship hết ✅)

Sau khi BE đã đóng xong wave 1 (workspaces / media folders / comments / notifications / activity / staff inbox — FE đã wire qua `rexerApi.workspaces` / `mediaFolders` / `templateComments` / `notifications` / `activityFeed` / `staffInbox`), FE phát hiện 3 gap mới khi triển khai:

1. **Stats overlay cho brand** — admin/staff thấy được, brand thì không (endpoint hiện admin-only)
2. **Admin user creation với role chỉ định** — modal `/admin/users` đang phải dùng `/auth/register` fallback, không set được `role = admin | staff`
3. **Element-level analytics target naming** — cần đồng bộ với DOM `data-element-id` để FE render được right-gutter card

---

## 🔴 P0 — Brand-accessible template analytics breakdown

**Pain point**: FE vừa ship `StatsAnnotationOverlay` (Figma-style gutter) ở route public `/p/[id]/[token]`. Toolbar hiện cho admin/staff vì gọi `GET /v1/admin/analytics/templates/{id}/breakdown` — endpoint **admin-only**. Brand vào xem page của chính mình không thấy được overlay → mất 80% giá trị tính năng.

**Goal**: Brand truy cập template của brand mình thì được xem breakdown tương đương admin, nhưng chỉ scope trong `client_id` của brand đó.

### Endpoint cần thêm

```
GET /v1/portal/templates/{templateId}/breakdown?start=&end=
```

- **Auth**: CookieAuth, role `client_user`
- **Authorization**: BE check `template.client_id == ctx.client_id`, ngược lại 403
- **Response shape**: y hệt `BlockBreakdownRow[]` (đã có ở `/v1/admin/analytics/templates/{id}/breakdown`)
- **Query**:
  - `start`, `end`: ISO timestamps. Default = last 30 days.

```ts
// Đã có ở src/services/rexer/types.ts — reuse
type BlockBreakdownRow = {
  block_id: string;
  block_type: string | null;
  views: number;
  clicks: number;
  unique_viewers: number;
  avg_dwell_ms: number | null;
  total_dwell_ms: number | null;
  top_action: string | null;
  top_target: string | null;
  actions: ActionStat[];
  funnel?: FunnelStep[] | null;
  slides?: SlideStat[] | null;
  images?: ImageStat[] | null;
};
```

### Tóm gọn

Cùng response, khác permission boundary. BE chỉ cần copy handler hiện tại, thay middleware admin → brand-scoped, và inject `client_id` filter vào query SQL.

### Lý do ưu tiên P0

- FE đã ship, đang chờ BE để demo cho brand
- Không có endpoint này, brand không thấy bất kỳ stats nào trên view của họ → tính năng đã code mất nửa giá trị
- Effort ước tính BE: ~2 giờ (copy handler + adjust auth + test)

---

## 🔴 P0 — Admin tạo user với role chỉ định

**Pain point**: Modal `AdminCreateUserModal.tsx` (FE) cho admin chọn 3 role: `admin | staff | client_user`. Hiện tại với role `client_user` thì OK (dùng `/auth/register` hoặc `/clients/{id}/users`), còn `admin / staff` **không có endpoint nào** trên BE → FE phải fallback `/auth/register` (luôn ra `client_user`) và toast warning "cần promote qua DB".

**Goal**: Admin tạo trực tiếp được user role `admin` hoặc `staff` qua UI.

### Endpoint cần thêm

```
POST /v1/admin/users
```

- **Auth**: CookieAuth, role `admin` (không cho `staff` — staff không thăng cấp được)
- **Body**:

```ts
type CreateAdminUserRequest = {
  email: string;            // required, unique
  display_name: string;     // required
  role: 'admin' | 'staff';  // required — endpoint này KHÔNG dùng cho client_user
                            // (client_user đã có /v1/auth/register + /v1/clients/{id}/users)
  password?: string;        // optional — nếu omit BE auto-gen như /clients/{id}/users
};
```

- **Response 201**:

```ts
type CreateAdminUserResponse = {
  user: RxUser;                  // role + display_name + email + ...
  generated_password?: string;   // chỉ trả khi request không kèm password
};
```

### Lưu ý security

- Audit log: log mọi lần admin tạo admin/staff khác (ai tạo, role, timestamp). Thêm bảng `admin_audit_log` nếu chưa có.
- Rate limit: ≤ 10/giờ/admin
- Không cho admin tự downgrade chính mình qua endpoint này (412 nếu `email == ctx.email`)
- Password gen nên dùng cùng generator như `/clients/{id}/users` (đã có) để consistency

### Đồng thời cân nhắc bổ sung

```
PATCH /v1/admin/users/{userId}/role
```

- Body: `{ role: 'admin' | 'staff' | 'client_user' }`
- Cho phép admin promote/demote user đã tồn tại — hữu ích cho onboarding staff cũ từng signup bằng `/auth/register`

### Effort BE

~3 giờ: handler + audit hook + test + sync với role enum hiện có

---

## 🟡 P1 — Đồng bộ element-level `target` schema

**Pain point**: `StatsAnnotationOverlay` có right gutter card cho element (CTA, slide, feature, ...) — nguồn data là `BlockBreakdownRow.actions[].targets[].target` (string). FE đo vị trí element trên DOM qua `[data-element-id]`. Để 2 bên match, `target` lúc analytics ingest phải dùng đúng cùng id với DOM `data-element-id`.

**Hiện trạng**:
- FE block templates (`renderBlock.tsx` + descendants) **chưa render** `data-element-id` attribute
- BE analytics ingest (`POST /v1/analytics/events`) accept `target` field nhưng không có constraint format
- Schema tracking config ở `extra-elements-spec.md` có khái niệm "event name" nhưng không nói rõ đây là `action` hay `target`

**Goal**: Chốt naming convention chung giữa BE và FE để cả hai cùng phát/đọc cùng id.

### Đề xuất convention

```ts
// Analytics event payload (đã có ở types.ts:751)
type AnalyticsEventInput = {
  template_id: string;
  block_id: string;
  element_id?: string;      // ← NEW: id ổn định trong block (vd "cta_primary")
  element_role?: string;    // ← NEW: phân loại element ("button" | "link" | "slide" | "image" | "form")
  action: string;           // user action ("click" | "view" | "submit" | "swipe")
  target?: string;          // alias = element_id (deprecate dần sau khi FE migrate)
  // ... các field hiện có
};
```

### Việc FE sẽ làm (đợt sau)

- Thêm `data-element-id` + `data-element-role` vào mỗi tracked element trong `renderBlock.tsx`
- `id` lấy từ tracking config có sẵn (`extra-elements-spec.md`)
- Khi user tạo block, FE auto-suggest id theo pattern `{block_type}_{role}_{ordinal}` (vd `hero_cta_1`)

### Việc BE cần làm trước

1. **Cho phép `element_id` ở `AnalyticsEventInput`** (hiện chỉ có `target`)
2. **Group `BlockBreakdownRow.actions[].targets[]` theo `element_id` mới**, fallback về `target` legacy nếu `element_id` rỗng
3. **Document convention** trong `be-template-analytics-spec.md` (update doc cũ)

### Effort BE

~4 giờ: schema migration cho events table, ingest handler update, breakdown aggregation update, doc

---

## Migration plan đề xuất

| Wave | Endpoint | FE blocker? |
|---|---|---|
| W2.1 | `GET /portal/templates/{id}/breakdown` | Yes — brand không thấy stats |
| W2.2 | `POST /admin/users` + `PATCH /users/{id}/role` | Yes — không tạo được admin/staff |
| W2.3 | Element-level naming (`element_id` / `element_role`) | No — right gutter card hiện skip vì FE chưa tag element. Wait BE confirm naming → FE tag → match |

Đề nghị BE prioritize W2.1 trước vì stats overlay là tính năng vừa ship, brand đang chờ.

---

## Test checklist sau khi BE ship

### W2.1 (brand breakdown)
- [ ] Brand login → mở `/p/<own-template>/<token>` → toggle Stats ON → thấy block summary cards
- [ ] Brand thử mở `/p/<other-brand-template>/<token>` → 403, toolbar không hiện
- [ ] Admin vẫn dùng được `/admin/analytics/templates/{id}/breakdown` như cũ
- [ ] Date range query (`start` / `end`) hoạt động đúng

### W2.2 (admin create user)
- [ ] Modal `/admin/users` → chọn role "Admin Rexer" → submit → user mới có `role: 'admin'` trong DB
- [ ] Chọn role "Staff Rexer" → user mới `role: 'staff'`
- [ ] Auto-gen password: omit field → BE trả `generated_password` → modal show + copy được
- [ ] Provided password (≥ 8 ký tự) → BE dùng password đó luôn
- [ ] Staff thử gọi endpoint → 403
- [ ] Admin thử tự downgrade chính mình → 412
- [ ] Audit log có record

### W2.3 (element-level naming)
- [ ] FE patch render block templates thêm `data-element-id`
- [ ] Ingest event với cả `element_id` + legacy `target` → BE dedupe, count đúng
- [ ] Breakdown response group theo `element_id` mới
- [ ] Right-gutter card overlay hiện element ≥ 50 views
