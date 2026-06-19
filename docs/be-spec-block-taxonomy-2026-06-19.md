# BE cần: taxonomy AI chuyển xuống per-block

FE đã gửi taxonomy trong body `/v1/blocks` (create + update) nhưng BE đang drop vì `blocks` chưa có field. Cần thêm.

## 1. Thêm field vào bảng `blocks` + model + request
Các field (giống đang có ở `block_types`):
- `function` (text), `page_role` (text), `proof_type` (text), `needs_media` (text)
- `funnel_stage`, `goal_tags`, `tone`, `industry_fit` (text[] / jsonb)
- `has_cta` (bool)

Việc:
- Migration: thêm cột trên vào `blocks`.
- `models.Block` + `CreateBlockRequest` + `UpdateBlockRequest`: thêm field (json snake_case).
- Repo/usecase: persist khi create/update.
- Khi tạo block từ catalog → **seed mặc định copy taxonomy từ `block_type`** (block tự override sau).

## 2. AI engine `recommend_blocks`
Hiện match brief với taxonomy của `block_type` → trả `block_type_code`.
Đổi: match với taxonomy của **block** (scope brand) → trả về **block cụ thể** (`block_id`).

## 3. Bỏ taxonomy khỏi `block_types`?
Không bắt buộc xoá. Giữ taxonomy ở `block_type` làm **default** để seed cho block mới. FE đã bỏ UI sửa taxonomy ở block-type, chỉ sửa ở từng block.

Xong phần 1 là taxonomy lưu được; phần 2 để AI dùng đúng.
