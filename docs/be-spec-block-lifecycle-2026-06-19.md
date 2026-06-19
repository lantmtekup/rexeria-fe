# BE cần: vòng đời duyệt block (status + ghi chú)

Marketing yêu cầu block → dev triển khai → marketing review → publish. Cần thêm
2 field vào `blocks` + gạn block chưa publish ở 3 nơi.

## 1. Thêm field vào bảng `blocks` (migration 000035)

- `status` (text, default `'draft'`) — enum:
  `draft` | `in_dev` | `review` | `changes_requested` | `published`
- `review_note` (text, nullable) — ghi chú nội bộ: brief từ marketing + comment review.

Việc:
- Migration: thêm 2 cột. **Block cũ (đã có)**: set `status = 'published'` (đang dùng → coi như đã duyệt).
- `models.Block` + `CreateBlockRequest` + `UpdateBlockRequest`: thêm 2 field (json snake_case).
- Repo/usecase: persist khi create/update.
- Create không truyền status → mặc định `'draft'`.

FE đã gửi `status` + `review_note` trong body create/update từ 2026-06-19.

## 2. Gạn block chưa publish (chỉ `status='published'` mới cho user cuối)

- **AI `recommend_blocks`**: chỉ xét block `status='published'`. Bỏ block draft/in_dev/review/changes_requested khỏi kết quả.
- **Render trang public** (`page_canonical`): block trong page đã publish nếu trỏ tới block `status != 'published'` → bỏ qua / không render (an toàn cho người xem).
- (Picker "Thêm block" FE đã tự lọc `status='published'`.)

## 3. (Tuỳ chọn) filter list

`GET /v1/blocks?status=` để FE lọc server-side. Hiện FE lọc client nên không bắt buộc.

Xong là block có quy trình duyệt; chỉ block đạt chuẩn mới đến tay user.
