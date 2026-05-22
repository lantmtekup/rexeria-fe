# BE Fix — `/portal/templates` không trả data đúng workspace cho brand

**Date**: 2026-05-22
**Audience**: BE squad
**Priority**: 🔴 P0 — chặn UI brand portal `/portal/landing-pages` hiển thị thật, đang phải fallback fake.

---

## Triệu chứng

Brand user (`lantm@tekup.vn` · client `Tekup Company`) vào `/portal/landing-pages?ws=<id>` → page hiển thị banner `"Đang dùng fake data — empty list"` thay vì list canvas templates thật.

---

## Reproduce

```bash
# 1) Admin probe — BE đang trả 15 templates, nhưng tất cả workspace_id rỗng
curl --cookie "<admin>" \
  https://rexerai.tekupsoftware.com/v1/portal/templates
# → 200, items.length = 15, mọi item có workspace_id: ""

# 2) Brand probe — BE trả 0 items
curl --cookie "<brand: lantm@tekup.vn>" \
  https://rexerai.tekupsoftware.com/v1/portal/templates
# → 200, items: [] hoặc items.length = 0
```

Khoảng cách 15 vs 0 cho thấy BE đang strict-filter bằng `client_id` cho brand. Seed templates không gán `client_id` đúng + `workspace_id` rỗng → brand không thấy bất cứ gì.

---

## 3 việc cần BE làm

### Việc 1 — Migration backfill `workspace_id` + `client_id` cho seed templates

**Pain**: `canvas_templates` hiện có 15 row với `workspace_id = ''` (chuỗi rỗng) và `client_id` có thể null/admin. Brand user không match nên không thấy.

**Migration SQL** (đề xuất):

```sql
-- Step 1: đảm bảo mọi client có 1 workspace 'default'
INSERT INTO workspaces (id, client_id, name, slug, is_default, created_at, updated_at)
SELECT
  gen_random_uuid(),
  c.id,
  'Default',
  'default',
  TRUE,
  now(),
  now()
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM workspaces w
  WHERE w.client_id = c.id AND w.is_default = TRUE
);

-- Step 2: backfill canvas_templates.workspace_id = default workspace của client
-- chỉ chạm row có workspace_id rỗng/null
UPDATE canvas_templates ct
SET workspace_id = w.id
FROM workspaces w
WHERE w.client_id = ct.client_id
  AND w.is_default = TRUE
  AND (ct.workspace_id IS NULL OR ct.workspace_id = '');

-- Step 3 (optional): templates không có client_id rõ ràng (seed admin demo)
-- → gán client_id sang client demo cụ thể, hoặc xoá nếu không cần
-- BE confirm chính sách
SELECT id, name FROM canvas_templates WHERE client_id IS NULL;
```

**Sau migration, FE expect**:
```json
{
  "id": "...",
  "client_id": "<brand-uuid>",
  "workspace_id": "<default-ws-uuid>",   // ← KHÔNG còn "" hoặc null
  "name": "...",
  ...
}
```

---

### Việc 2 — Endpoint brand-side tạo canvas template

**Pain**: Brand portal không có cách tạo landing page mới. Hiện tại chỉ có `POST /v1/canvas-templates` (admin-style) yêu cầu FE pass `client_id` + `workspace_id` thủ công. Brand_user không có quyền hoặc bị scope nhầm.

**Endpoint cần thêm**:

```
POST /v1/portal/templates
```

- **Auth**: CookieAuth, role `client_user`
- **Auto-scope**: BE lấy `client_id` từ session + `workspace_id` từ `ctx.active_workspace_id` (set bởi `/me/workspace/switch`) hoặc từ body
- **Body**:

```ts
type CreatePortalTemplateRequest = {
  name: string;                     // required
  width?: number;                   // default 800
  height?: number;                  // default 600
  workspace_id?: string;            // optional override; default = ctx.active_workspace
  source_template_id?: string;      // optional — clone from existing
};
```

- **Response 201**: `PortalTemplate` (shape giống GET list)

**Validation BE**:
- `workspace_id` phải thuộc `client_id` của user → ngược lại 403
- `name` không rỗng, ≤ 200 chars
- Tự generate `canvas_data` seed (empty block-editor canvas) — same logic như admin POST

---

### Việc 3 — Confirm semantic filter `workspace_id`

**Câu hỏi**: Sau khi backfill, `GET /v1/portal/templates`:

| Query param | Expected behavior |
|---|---|
| Không truyền `workspace_id` | Trả templates của **mọi workspace** thuộc `client_id` (cross-workspace overview) |
| `?workspace_id=<id>` | Filter chính xác workspace đó |
| `?workspace_id=` (rỗng) hoặc invalid | 400 `ERR_BAD_REQUEST` |

FE hiện đang **không filter** ở query level — gọi không param + filter lại client-side bằng `activeWs.id`. Confirm BE OK với hành vi này, hay BE muốn FE bắt buộc pass `workspace_id`?

→ **Khuyến nghị**: giữ "no param = all workspaces of client" + thêm filter optional. FE sẽ pass `workspace_id` khi user chuyển workspace cụ thể.

---

## Effort BE estimate

| Việc | Effort |
|---|---|
| 1. Migration backfill | ~1 giờ (SQL + run rollout script + verify) |
| 2. `POST /portal/templates` | ~2-3 giờ (handler + validator + auth scope + tests) |
| 3. Confirm semantic + doc | ~30 phút |

**Total**: ~4 giờ work BE để portal `/landing-pages` chạy real data end-to-end.

---

## Test checklist sau khi BE ship

Brand user `lantm@tekup.vn` (client = Tekup Company):

- [ ] `GET /v1/portal/templates` → trả templates của Tekup Company, mọi item có `workspace_id != ""`
- [ ] `GET /v1/portal/templates?workspace_id=<lp-id>` → chỉ templates của workspace "Landing page service"
- [ ] `POST /v1/portal/templates {name:"Test"}` → 201 + tự gán `client_id=Tekup` + `workspace_id=<active>`
- [ ] `POST /v1/portal/templates {name:"X", workspace_id:"<other-brand-ws>"}` → 403 (workspace không thuộc client)
- [ ] Admin vẫn dùng được `GET /v1/portal/templates` để xem cross-client (nếu BE muốn admin cũng scope qua endpoint này, confirm)

Brand UI verify:

- [ ] `/portal/landing-pages?ws=<id>` không còn banner amber "fake data"
- [ ] Workspace switcher chuyển → list templates đổi theo
- [ ] Click "Tạo landing page" mới (nếu FE đã wire nút) → navigate vào canvas editor với canvas mới được BE tạo

---

## FE files đã sẵn sàng wire

| File | Trạng thái |
|---|---|
| `src/app/(client-portal)/portal/landing-pages/page.tsx` | ✅ Đã call `loadTemplates` + filter theo `activeWs.id` client-side |
| `src/app/(client-portal)/portal/_remote.tsx:loadTemplates` | ✅ Hit `/portal/templates`, fallback fake khi empty |
| `src/services/rexer/endpoints.ts:rexerApi.portal.listTemplates` | ✅ Wired |

Chỉ cần BE backfill data + (optional) ship `POST /portal/templates` → FE tự live mà không cần code thêm.

---

## Liên hệ

- **FE**: @Lantm — commit `e47aeee` đã wire `_PortalDataProvider` đảm bảo workspace switcher cập nhật live
- **BE**: chạy migration Step 1+2 → confirm shape → optional ship POST
- **PM**: P0 unblock brand demo. Sau khi xong → 1 việc lớn còn thiếu là `/portal/me/*` (profile + members)
