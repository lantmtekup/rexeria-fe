# BE gap — `Use` chặn theo `kind` thay vì `campaign_item_id`, khoá cả kho template hệ thống

2026-08-24 · FE → BE · priority **P1** (không có workaround; brand mới không dùng được thư viện)

## Vấn đề

`POST /v1/experiences/{id}/use` hiện chỉ nhận nguồn `kind: 'template'`:

```
400 — cannot fork a copy; only a template can be used
```

Điều kiện chặn đặt trên **`kind`**, nhưng thứ thực sự cần chặn là **độ sâu
lineage**. Hệ quả: một `Experience` có `kind: 'copy'` nhưng
`pages.campaign_item_id IS NULL` cũng bị 400, dù fork từ nó vẫn giữ lineage
phẳng hai tầng.

Đó đúng là loại bản ghi mà Exchange sinh ra. Nhánh "add" cho một listing
`kind: 'page'` không có `exchange_item_id` gọi:

```
POST /v1/workspaces/{ws}/pages   { type: 'landing', template_id }
```

→ ra một `pages` row, `is_template = false`, `campaign_item_id` NULL ⇒
`stateOf()` phía FE xếp vào state `unassigned` (tab "Mine"). Không phải
template ⇒ `AttachToItem` từ chối.

### Số đo trên brand thật (2026-08-24)

| Nguồn                                                       | Số bản ghi | Brand thấy ở đâu      |
| ------------------------------------------------------------ | ------------ | ------------------------- |
| `state=unassigned` (copy, `campaign_item_id` NULL)       | 11           | tab Mine                  |
| `state=templates` lọc `brand_id NOT NULL`               | 1            | tab My sources            |
| `GET /v1/templates` với `brand_id IS NULL` (hệ thống) | ~75          | **không tab nào** |

`CampaignItemModal` lọc ứng viên bằng `is_template`, nên brand chưa có template
riêng mở picker ra rỗng dù `GET /v1/experiences` trả 11 bản dùng được.

Workaround hiện có: `POST /v1/experiences/{id}/duplicate` (→ `promotePage`,
`usecase/experience.go:866`) để promote page thành template rồi mới `use`. Ba
row cho một ý định, và template sinh ra ở giữa đang dính hai lỗi FE riêng:
rename gọi `PATCH /v1/pages/{id}` trên một `templates.id` → 404 `Page not found`; `useResolvedCanvasTarget` rơi vào nhánh template-owned và đọc
`Template.draft_canvas_blueprint` (rỗng sau promote) → canvas trắng.

## Yêu cầu

Đổi guard trong `Use` từ `kind` sang `campaign_item_id`:

| Nguồn                                             | Hiện tại | Đề nghị         |
| -------------------------------------------------- | ---------- | ------------------ |
| `kind: 'template'` (`is_template = true`)      | 201        | 201                |
| `kind: 'copy'`, `campaign_item_id IS NULL`     | 400        | **201**      |
| `kind: 'copy'`, `campaign_item_id IS NOT NULL` | 400        | 400 (giữ nguyên) |

Cột `pages.campaign_item_id` đã tồn tại — `ListCopies` đang filter trên nó.
Không cần migration.

### ⚠️ FORK — KHÔNG PHẢI ASSIGN

Đây là điểm quan trọng nhất của tài liệu, và bản đầu viết hụt (xem "Cập nhật
lần 2" ở cuối).

`Use` phải **TẠO MỘT ROW MỚI** và **KHÔNG ĐỘNG VÀO ROW NGUỒN**:

| | Row nguồn sau lệnh | Row mới | `COUNT(*)` trên `pages` |
|---|---|---|---|
| ✅ Đúng (fork) | `campaign_item_id` **vẫn NULL** | có, `campaign_item_id` = item | **+1** |
| ❌ Sai (assign) | `campaign_item_id` bị ghi = item | không | **+0** |

Lý do: row nguồn là **hàng trong thư viện của brand, dùng lại cho nhiều sản
phẩm**. Ghi `campaign_item_id` lên chính nó ⇒ nó rời thư viện, và lần dùng
thứ hai cho một sản phẩm khác không còn nguồn nào để lấy.

Đây đúng là hành vi `Use` đang làm với `kind: 'template'`. Nguồn
`campaign_item_id IS NULL` phải xử lý **y hệt** — chỉ khác ở guard cho qua,
không khác ở việc ghi.

### Vì sao không phá invariant lineage

Guard sinh ra để chặn lineage nhiều tầng, thứ làm `factmath` không gộp được
theo `origin_id`. Nới như trên không tạo tầng mới, vì nguồn được phép thêm là
row chưa thuộc `campaign_item` nào:

```
page (campaign_item_id NULL) ─┬→ copy (campaign_item_id = A)
                              ├→ copy (campaign_item_id = B)
                              └→ copy (campaign_item_id = C)
```

Vẫn depth = 2. Row đã có `campaign_item_id` vẫn bị chặn ⇒ không sinh depth 3.

Giữ nguyên: unique constraint trên `(origin_id, campaign_id, campaign_item_id)`
và tính idempotent của fork (gọi lại cùng `(origin, item)` trả row cũ,
201 → 200).

## Call site bị ảnh hưởng — sửa `Use` là thông cả ba

| Endpoint                                             | Ghi chú                                                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `POST /v1/experiences/{id}/use`                    | nơi guard nằm                                                                                             |
| `POST /v1/campaigns/{cid}/items/{iid}/experiences` | `AttachToItem` gọi thẳng `u.Use(...)` — không cần sửa riêng                                      |
| `POST /v1/journeys/{id}/use`                       | auto-stage fork mọi node`kind: 'experience'` xuống campaign item (`auto_forked`); đi qua cùng guard |

## Cần BE xác nhận

1. **`origin_id` của row mới** khi nguồn là copy `campaign_item_id IS NULL`:
   set = `source.id`, hay chain lên `source.origin_id`? FE giả định **`source.id`**
   (để `factmath` có đáy xác định). Nếu BE chọn chain thì FE phải đổi cách
   dedupe trong `CampaignItemModal.ownTemplates` (đang so `origin`).
2. **`UseExperienceRequest` còn ràng buộc nào ngoài `kind`** — xác nhận không
   có check `is_template` ẩn ở tầng repository/tenant.
3. **`PUT /v1/journeys/{id}` có validate `RxJourneyNode.experience_id` phải là
   template không?** Nếu có thì nới cùng lúc; nếu không thì node gán một copy
   `unassigned` sẽ lưu được nhưng auto-stage ở `journeys/use` mới 400 — hỏng
   lệch pha, khó lần.
4. **Template hệ thống (`templates.brand_id IS NULL`)** — `Use` có cho fork
   cross-tenant như `POST /v1/exchange/items/{id}/add` không? Nếu có thì FE bỏ
   luôn được bước Exchange add cho case dùng một lần.

## Test case

| # | Nguồn                                                     | `campaign_id`/`item_id` | Kỳ vọng                                                   |
| - | ---------------------------------------------------------- | --------------------------- | ----------------------------------------------------------- |
| 1 | `kind: 'template'`, brand-owned                          | không gửi                 | 201, row mới`campaign_item_id` NULL                      |
| 2 | `kind: 'copy'`, `campaign_item_id` NULL                | không gửi                 | **201** (hiện 400)                                   |
| 3 | `kind: 'copy'`, `campaign_item_id` NULL                | gửi cả cặp               | **201 + ROW MỚI** gắn item; **row nguồn giữ `campaign_item_id` NULL**; `COUNT(*)` +1 |
| 4 | lặp lại#3 y hệt                                         | gửi cả cặp               | 200, trả đúng row#3                                      |
| 5 | `kind: 'copy'`, `campaign_item_id` NOT NULL            | bất kỳ                    | 400`cannot fork…` — giữ nguyên                        |
| 6 | `kind: 'copy'`, `campaign_item_id` NULL                | chỉ gửi`campaign_id`    | 400 — cặp phải đi cùng nhau, giữ nguyên              |
| 7 | `templates.brand_id IS NULL`                             | không gửi                 | xác nhận theo mục 4                                      |
| 8 | `POST /journeys/{id}/use`, node trỏ copy `unassigned` | —                          | `auto_forked` đếm đúng, node có `resolved_page_id` |

## Phía FE đã làm sẵn

Nhánh `fix/workflow-main`, chưa merge:

- `CampaignExperience` thêm `itemId: string | null` (map từ `RxExperience.item_id`)
- `CampaignItemModal.ownTemplates`: `e.template || e.itemId === null`
- `journeyLink.master()`: nhận cùng điều kiện — hai đầu phải khớp, lệch một bên
  thì `bindRouteToItems` fork lặng lẽ không chạy và node hiện như chưa gán
- `ExperiencePickerModal`: `state === 'template' || state === 'unassigned'`

BE nới guard là chạy, FE không phải sửa lại. Trước khi nới, chọn một mục
`unassigned` sẽ ăn đúng `cannot fork a copy; only a template can be used` —
biểu hiện mong đợi, không phải regression mới.

---

## Cập nhật sau khi BE nới guard (2026-08-24, chiều)

Đo trên môi trường thật, cùng một nguồn `kind: 'copy'`, `campaign_item_id IS NULL`,
cùng một `campaign_item` đích:

| Đường vào | Kết quả |
|---|---|
| `POST /v1/campaigns/{cid}/items/{iid}/experiences` | ✅ 201 — nhận |
| `POST /v1/experiences/{id}/use` + `{campaign_id, item_id}` | ❌ vẫn `cannot fork a copy; only a template can be used` |

⇒ Guard mới **chỉ áp ở nhánh `AttachToItem`**, chưa áp ở `Use` gọi trực tiếp.
Giả định trong tài liệu này ("`AttachToItem` gọi thẳng `u.Use(...)` nên không
cần sửa riêng") **không còn đúng** — hai nhánh đã tách.

### Đề nghị BE

Nới nốt guard ở chính `Use`, để hai đường trở lại đồng nhất. Ưu tiên P2 (FE đã
có đường đi được, xem dưới), nhưng để lệch lâu dài là nợ: cùng một thao tác,
hai endpoint, hai kết quả.

Vẫn còn treo, chưa xác nhận: **mục 4** — `Use` có cho fork template hệ thống
(`templates.brand_id IS NULL`) cross-tenant không.

### FE đã xử lý tạm

`forkExperience` (`services/portal-v2/experienceUse.ts`) định tuyến theo đích:

```
target != null  →  POST /campaigns/{cid}/items/{iid}/experiences   (đường chạy được)
target == null  →  POST /experiences/{id}/use  { brand_id }        (không có đường thay thế)
```

Nhánh `target == null` **không có endpoint nào thay được** — chỉ `Use` sinh ra
được bản `campaign_item_id` NULL. Nếu guard ở `Use` cũng chặn nguồn
`unassigned` cho nhánh này thì "lấy một bản của mình" từ một mục ở tab Exchange
sẽ hỏng, không có workaround FE.

---

## Cập nhật lần 2 (2026-08-24, tối) — bản đầu viết hụt, BE làm đúng thứ được viết

Sau khi BE nới guard, đo lại trên môi trường thật:

```
Trước khi bấm : All experiences = 18
Thêm một mục `campaign_item_id IS NULL` vào một campaign item
Sau khi bấm   : All experiences = 18      ← không có row mới
```

Row nguồn bị **ghi `campaign_item_id`** thay vì được nhân bản. Nó rời tab
"chưa gán" và không dùng lại được cho sản phẩm thứ hai.

### Lỗi nằm ở tài liệu này, không ở phía BE

Bản đầu, test case 3 viết:

> `kind: 'copy'`, `campaign_item_id` NULL → 201, `campaign_item_id` = item đã gửi

Câu đó chỉ mô tả **kết quả có gắn item**. Assign row nguồn thoả đúng câu này.
Không có chỗ nào nói phải sinh row mới và giữ nguyên nguồn — trong khi case 1
và 2 lại có chữ "row mới", nên đọc theo mạch đó thì "assign" là cách hiểu hợp
lý. Bảng "Yêu cầu" cũng chỉ nói mã đổi 400 → 201.

Đã bổ sung mục **"⚠️ FORK — KHÔNG PHẢI ASSIGN"** ở trên và viết lại test case 3.

### Việc còn lại cho BE — nhỏ

Trong nhánh vừa sửa, đổi từ *ghi `campaign_item_id` lên row nguồn* sang *đi
đúng đường nhân bản mà nguồn `kind: 'template'` đang dùng*. Guard đã đúng rồi,
chỉ còn phần ghi.

Kiểm nghiệm thu: chạy test case 3 và xác nhận `COUNT(*)` trên `pages` **tăng 1**,
đồng thời `SELECT campaign_item_id FROM pages WHERE id = <nguồn>` **vẫn NULL**.
