# BE Spec — Lịch sử đổi trạng thái Block (Block Status History / Activity)

**Người yêu cầu:** FE team · **Ngày:** 2026-06-22 · **Ưu tiên:** 🔧 trung bình
**Liên quan:** `docs/be-audit-2026-05-26.md` §24 · lifecycle block migration `000037`
**Trạng thái:** ✅ BE đã ship endpoint + ghi audit (merge 2026-06-22) · FE client + UI đã đấu nối.

---

## 1. Mục tiêu

Trong dialog sửa block (admin), FE cần hiển thị **lịch sử đổi trạng thái duyệt** của
một block để theo dõi tiến độ:

> **Ai** đổi · từ **trạng thái nào** sang **trạng thái nào** · **lúc nào** · (kèm review_note).

Lifecycle hiện có (migration `000037`):
`draft → in_dev → review → changes_requested → published`.

Cần 2 thứ từ BE:
1. **Ghi lại** mỗi lần status đổi (actor + thời điểm + giá trị cũ/mới).
2. **Endpoint đọc** lịch sử đó: `GET /v1/blocks/:id/activity`.

---

## 2. Hiện trạng (probe BE 2026-06-22 — BE tự verify lại path)

| Mục | Tình trạng |
|---|---|
| `blocks.created_by`, `updated_by` (cột) | ✅ có cột, **nhưng usecase KHÔNG set `updated_by`** |
| `blocks.created_at` / `updated_at` | ✅ GORM tự set |
| Bảng lịch sử status riêng | ❌ không có |
| Bảng audit chung `activity_logs` | ✅ **đã có** (migration `000001:169-183`), block **chưa ghi** vào |
| Endpoint history | ❌ chưa có |

**Code points liên quan (BE verify lại):**
- `internal/usecase/block_canonical.go` — `Update` (~dòng 210 set status), `Create` (~dòng 46)
- `internal/repository/block.go:27-29` — `Update` = `Save(b)`
- `internal/server/http/handler/block_canonical.go:110-120` — handler `PATCH /blocks/:id`
- `internal/domain/models/activity_log.go` — model `ActivityLog`
- `internal/auth/context.go:31-37` — `auth.UserIDPtr(ctx)` lấy current user id

**Bảng `activity_logs` (đã tồn tại):**
```sql
-- migration 000001:169-183
CREATE TABLE public.activity_logs (
    id          uuid DEFAULT gen_random_uuid() NOT NULL,
    brand_id    uuid,
    actor_id    uuid NOT NULL,
    action      text NOT NULL,
    entity_type text NOT NULL,
    entity_id   uuid NOT NULL,
    metadata    jsonb DEFAULT '{}'::jsonb NOT NULL,
    ip_address  inet,
    user_agent  text,
    occurred_at timestamptz DEFAULT now() NOT NULL
);
```

---

## 3. Thiết kế (khuyến nghị: tái dùng `activity_logs`, KHÔNG cần bảng mới)

Ghi mỗi lần đổi status thành 1 dòng `activity_logs` với `entity_type='block'`,
`entity_id=block.id`, và diff cũ/mới nhét trong `metadata`. Endpoint đọc lại các
dòng đó, join `users` để lấy tên actor.

> Nếu BE muốn bảng riêng `block_status_events` thì cũng được — **miễn endpoint trả
> đúng shape ở §6** là FE chạy. Nhưng `activity_logs` đã đủ và nhất quán với audit chung.

---

## 4. Thay đổi BE — chi tiết

### 4.1. Set actor khi tạo/sửa block

Trong `block_canonical.go`:
- `Create`: `b.CreatedBy = auth.UserIDPtr(ctx)` (và `b.UpdatedBy = ...`).
- `Update`: `b.UpdatedBy = auth.UserIDPtr(ctx)` **trước khi** `repo.Update`.

(Hiện `updated_by` đang null — fix luôn để cột này có nghĩa, độc lập với history.)

### 4.2. Ghi `activity_logs` khi status đổi

Trong `Update`, sau khi đã có `oldStatus` (giá trị trước) và `newStatus`:

```go
// pseudo
if req.Status != nil && *req.Status != oldStatus {
    _ = activityLogRepo.Insert(ctx, &models.ActivityLog{
        BrandID:    block.BrandID,                 // nullable cho system block
        ActorID:    *auth.UserIDPtr(ctx),
        Action:     "block.status_change",
        EntityType: "block",
        EntityID:   block.ID,
        Metadata: map[string]any{
            "old_status":  oldStatus,
            "new_status":  *req.Status,
            "review_note": derefOrEmpty(req.ReviewNote), // nếu có
        },
        OccurredAt: time.Now(),
    })
}
```

Lưu ý:
- **Chỉ ghi khi status thực sự đổi** (old != new). Đổi name/tag/type **không** ghi
  (giữ history tập trung vào trạng thái). Có thể mở rộng sau với `action="block.updated"`.
- Ghi log **không được làm fail** request update nếu insert lỗi (best-effort, log warning).
- (Tùy chọn) ghi 1 dòng `action="block.created"` lúc Create để timeline có mốc đầu.

### 4.3. Endpoint đọc lịch sử

**`GET /v1/blocks/:id/activity`** — auth giống `GET /blocks/:id` (ai xem được block thì
xem được history; tôn trọng scope brand/workspace của block).

Query (sort mới nhất trước, join tên actor):
```sql
SELECT a.id, a.entity_id AS block_id, a.actor_id,
       u.display_name AS actor_name,
       a.action,
       a.metadata->>'old_status'  AS from_status,
       a.metadata->>'new_status'  AS to_status,
       a.metadata->>'review_note' AS review_note,
       a.occurred_at AS created_at
FROM activity_logs a
LEFT JOIN users u ON u.id = a.actor_id
WHERE a.entity_type = 'block' AND a.entity_id = $1
ORDER BY a.occurred_at DESC;
```

### 4.4. Index — ĐÃ CÓ SẴN, không cần thêm

Baseline `000001` đã tạo đúng index cần cho query này (`migration 000001:1856`):
```sql
CREATE INDEX idx_activity_logs_entity
  ON public.activity_logs USING btree (entity_type, entity_id, occurred_at DESC);
```
→ Không cần migration index mới (đã verify khi review 2026-06-22).

### 4.5. Đăng ký route

Thêm `GET /blocks/:id/activity` cạnh các route block hiện có (cùng group auth nội bộ
như `GET /blocks/:id`).

---

## 5. Phân quyền & scope

- Quyền đọc `GET /blocks/:id/activity` = quyền đọc block đó (admin/staff nội bộ; nếu
  block thuộc brand thì theo scope brand như block detail).
- `brand_id` của dòng activity = `block.brand_id` (null cho block hệ thống) — để audit
  chung lọc theo brand vẫn đúng.

---

## 6. Contract response (FE đang chờ đúng shape này)

`GET /v1/blocks/:id/activity` → **200**:
```jsonc
{
  "items": [
    {
      "id": "uuid",
      "block_id": "uuid",
      "actor_id": "uuid",
      "actor_name": "Nguyễn Văn A",          // join users.display_name; có thể null
      "action": "block.status_change",        // | "block.created" | "block.updated"
      "from_status": "in_dev",                // map metadata.old_status; null nếu không có
      "to_status": "review",                  // map metadata.new_status
      "review_note": "Trả lại chỉnh CTA",     // optional
      "created_at": "2026-06-22T03:30:00Z"    // = occurred_at, ISO-8601
    }
  ]
}
```

Quy ước:
- `status` hợp lệ: `draft | in_dev | review | changes_requested | published`.
- Sort **mới nhất trước** (`occurred_at DESC`).
- Block chưa có log nào → `{ "items": [] }` (đừng trả 404).
- FE cũng chấp nhận BE trả nguyên `metadata` object (sẽ tự map), nhưng **flatten
  `from_status`/`to_status` như trên là gọn nhất, ưu tiên cách này.**

---

## 7. Edge cases

| Tình huống | Kỳ vọng |
|---|---|
| Block legacy tạo trước feature | Không có log cũ → `items: []` (FE tự dựng mốc từ created/updated). |
| PATCH không đổi status (chỉ đổi tên/tag) | **Không** ghi log status. |
| PATCH đổi status A→A (no-op) | Không ghi (old == new). |
| Đổi status kèm review_note | Ghi `review_note` trong metadata của dòng đó. |
| Actor bị xoá khỏi `users` | `actor_name` = null (LEFT JOIN), FE hiển thị id rút gọn. |
| Insert activity_logs lỗi | Update block vẫn thành công; log warning, không 500. |

---

## 8. Acceptance criteria

1. Sau khi BE deploy: PATCH `/blocks/:id` đổi status → xuất hiện 1 dòng trong
   `activity_logs` (`entity_type='block'`, đúng old/new).
2. `blocks.updated_by` được set = user thực hiện PATCH (không còn null).
3. `GET /v1/blocks/:id/activity` trả `items` sort mới→cũ, có `actor_name`,
   `from_status`, `to_status`, `created_at` đúng contract §6.
4. Block chưa có lịch sử → `{ "items": [] }`, không 404.
5. Quyền: user không xem được block thì cũng không gọi được activity (403/404 nhất quán
   với `GET /blocks/:id`).

---

## 9. FE đã làm sẵn (sẽ tự chạy khi BE bật, không cần FE đổi UI)

- `rexerApi.blocks.activity(id)` → `GET /blocks/:id/activity`
  (`src/services/rexer/endpoints.ts`).
- Type `BlockActivity` / `BlockActivityResponse` (`src/services/rexer/types.ts`).
- Component `BlockStatusHistory` render timeline trong `EditBlockDialog`
  (`src/components/modules/Blocks/`).
- Khi endpoint **404** (chưa ship) → FE tự dựng timeline tối giản từ
  `created_at/updated_at` của block (gắn nhãn "tạm dựng"). BE bật endpoint là tự hiện
  lịch sử đầy đủ.

---

## 10. Quyết định cần BE xác nhận

1. Dùng `activity_logs` (khuyến nghị) hay bảng riêng `block_status_events`?
2. Có ghi thêm `action="block.created"` lúc tạo block không (để có mốc đầu timeline)?
3. Có cần phân trang cho activity không, hay block thường ít sự kiện nên trả hết 1 lần?
   (FE hiện không phân trang — nếu BE thấy cần, báo để FE thêm `?page/limit`.)
