# Block System — Tài liệu bàn giao

> Cập nhật 2026-06-22. Phạm vi: kiến trúc block native, registry mới, quy trình
> marketing → dev, và các thay đổi UI ở `/admin/blocks`.

---

## 1. Hai hệ block (đừng nhầm)

| Thư mục | Vai trò | Trạng thái |
|---|---|---|
| `src/blocks/` | Legacy POC (port từ 360-cms), phục vụ trang dev `/admin/blocks/preview` | **Đã dọn** — chỉ giữ `framer-yume-hero` làm mẫu |
| `src/components/modules/block-editor/blocks/` | **Bộ block native ĐANG CHẠY prod** (component + `renderBlock`) | Nguồn thật, mọi landing page render từ đây |

`renderBlock.tsx` (trong thư mục native) là bộ điều phối render trung tâm — **không xoá thô**.

---

## 2. Kiến trúc: BlockDef registry (mới)

Trước đây thêm 1 block phải sửa **6 chỗ** rải rác (types union, factory, renderBlock,
LayersPanel, AddBlockDialog…). Nay gom về **1 `BlockDef`** co-located.

### Vị trí
```
src/components/modules/block-editor/blocks/_registry/
  types.ts                 # interface BlockDef + BlockRenderProps
  registry.ts              # BLOCK_REGISTRY — thêm block = +1 dòng
  defs/<block>.ts          # 1 def gom hết của 1 block
```

### `BlockDef` gồm
- `type` — khớp `type_code`
- `meta` — nhãn/màu (thay entry trong `BLOCK_TYPE_META`)
- `component` — component render (thay `case` trong `renderBlock`)
- `defaultContent: { vi, en }` — nội dung mặc định (thay map trong `factory`)
- `elements[]` — danh sách phần tử sửa được; mỗi phần tử có `fieldType`
  (`'text' | 'textarea' | 'image'`) → quyết định **widget edit** trong editor

### Cơ chế "registry-first, fallback code cũ"
5 file trung tâm (`renderBlock`, `factory`, `LayersPanel`, `MotionLayersPanel`,
`AddBlockDialog`) đọc registry **trước**, nếu block chưa migrate thì chạy đường cũ.
→ Block đã có `BlockDef` thì **không cần** đụng 5 file đó nữa.

> **Trạng thái migrate:** mới port `framer_yume_hero`. ~80 block còn lại vẫn đường
> switch cũ (vẫn chạy bình thường). Việc còn lại: migrate batch + bước cuối derive
> `BlockType`/`BLOCK_TYPE_META`/`BlockContent` từ registry để bỏ nốt phần type-level
> trong `types.ts`.

---

## 3. Thêm 1 block mới — step by step cho dev

> Hiện tại: 6 chỗ → còn **types.ts (type-level) + 1 def**. Sau khi migrate xong sẽ chỉ còn def.

1. `block-editor/types.ts` — thêm: member union `BlockType`, `interface <X>Content`,
   thêm vào union `BlockContent`, 1 entry `BLOCK_TYPE_META`.
2. Tạo component `blocks/<X>.tsx` — props `BlockRenderProps<XContent>`; mỗi phần tử
   sửa được gắn `data-element-key="<tên field>"`.
3. Tạo def `blocks/_registry/defs/<x>.ts` + thêm 1 dòng vào `registry.ts`.
4. Test: `/dev/blocks?type=<type_code>` → `yarn type-check` → `yarn build`.
5. **Deploy** (`cf:deploy`, tắt `next dev` trước) → `type_code` mới xuất hiện trong
   dropdown "Mapping code" ở admin.

---

## 4. Quy trình marketing → dev (status lifecycle)

`draft → in_dev → review → changes_requested → published`
(`src/lib/block-status.tsx`)

| Bước | Ai | Làm gì |
|---|---|---|
| 1 | Marketing | `/admin/blocks` → **Tạo mới** → block `draft`, viết brief vào **Ghi chú nội bộ** (`review_note`) |
| 2 | Dev | Code block + deploy (mục 3). Set status → `in_dev` |
| 3 | Dev | Mở block draft → **Sửa thông tin** → chọn **Mapping code** = block vừa code → Lưu |
| 4 | Dev | Set status → `review`, ghi chú bàn giao |
| 5 | Marketing | Duyệt → `published` ✅ hoặc `changes_requested` (về lại dev) |

**Mapping code = `type_code`** (khóa nối record DB ↔ code). Dropdown chỉ hiện type đã
deploy. Chỉ block **`published`** mới hiện cho user (picker, AI, trang public).
Chỉ block **`draft`** mới xoá được.

### Đổi Mapping code → tự dựng lại nội dung
Khi đổi "Mapping code" trong dialog rồi Lưu, FE **rebuild `settings`** sang nội dung
mặc định của type mới (giữ id + tên) → nhãn + preview khớp ngay, không còn lệch
`type_code` vs `settings.blockType`.

---

## 5. UI `/admin/blocks` (đã tinh gọn)

- **Header gọn**: thẻ stat trạng thái → 1 hàng **chip** bấm để lọc; bỏ subtitle + progress bar.
- **1 hàng filter**: Tìm kiếm · Tất cả type · Tất cả trạng thái · **Tag (multi-select)** · Clear · N/N · Grid|Table.
- **Tag filter**: popover checkbox + search, **chọn nhiều tag** (AND — block phải có tất cả tag đã chọn).
- **Dialog "Sửa thông tin" dạng Tabs**:
  - **Thông tin**: Tên, Thumbnail, Mô tả, Mapping code, Tags, Ghi chú nội bộ
  - **Phân loại**: Taxonomy (AI metadata)
  - **Duyệt**: Trạng thái, Lịch sử

### API liên quan (base = `NEXT_PUBLIC_REXER_API` + `/v1`)
`GET /blocks` (list) · `GET /blocks/:id` · `POST /blocks` (tạo) ·
`PATCH /blocks/:id` (sửa info/type_code/status/settings) · `DELETE /blocks/:id` ·
`POST /blocks/:id/clone`.
Lưu ý: **danh sách option dropdown** lấy từ code (`BLOCK_TYPE_META`), **không** gọi API.

---

## 6. Lưu ý vận hành

- **Đừng chạy `cf:build`/`cf:deploy` khi `next dev` đang mở** — đè chung `.next` → Internal
  Server Error. Dính thì `rm -rf .next` rồi `yarn dev` lại.
- Env dev: `.env.development.local` (gitignored) override `NEXT_PUBLIC_REXER_API`. Khi
  trỏ prod thì **cẩn thận** mọi thao tác tạo/sửa/xoá đều ghi DB prod.
- Deploy FE = Cloudflare Workers: `yarn cf:deploy` (build local, env phải trỏ prod).
