# Block Library Discipline

Kỷ luật giữ thư viện block gọn — để kiến trúc Canva-style không biến thành "mỗi
thiết kế một block" (cái bẫy mà chính kiến trúc muốn tránh). Áp cho canvas
block-editor (`src/components/modules/CanvasTemplate/block-editor/`).

## Nguyên tắc: biến thể nhỏ = `select`, đừng đẻ block mới

Khi một "biến thể" chỉ khác về cấu hình mà **DOM gần như không đổi**, dùng một
slot `select` trên block có sẵn — KHÔNG thêm `BlockType` mới:

| Tình huống | Đúng | Sai |
|---|---|---|
| Ảnh trái / ảnh phải / căn giữa | slot `select` `layout` | 3 block riêng |
| Có / không nút CTA | slot `boolean` | 2 block riêng |
| 2 / 3 / 4 cột | slot `select` `columns` | 3 block riêng |
| Tông sáng / tối | brand/style token | 2 block riêng |

**Chỉ thêm `BlockType` mới khi cấu trúc DOM khác hẳn** (vd hero ≠ pricing table ≠
testimonial carousel). `select`/`boolean` đã là first-class trong slot schema +
`DynamicSchemaForm`; render đọc giá trị để đổi class/layout.

## Tripwire CI

`yarn lint:blocks` (`scripts/check-block-library.mjs`) đếm union `BlockType` và
**fail khi vượt cap mềm** (`MAX_BLOCK_TYPES`, hiện 52; baseline 49). Đây là chốt
buộc cân nhắc "biến thể hay block mới?", không phải lệnh cấm cứng — nếu thật sự
cần block mới, bump cap kèm một dòng lý do. Nên chạy trong CI cạnh `lint` +
`type-check`.

## Tín hiệu backlog (đừng đoán — đọc dữ liệu)

Quyết định **build block nào tiếp / bỏ block nào** dựa trên hai tín hiệu BE đã có:

### 1. Thiếu block (Phase 4 — recipe)
Khi recommender gặp một `function` **required** trong recipe mà không block nào
lấp, nó trả `missing_functions` trong blueprint (`recommend_blocks` step). Gom
các tín hiệu này = danh sách block **nên build** theo nhu cầu thật.

### 2. Block ít dùng / hay bị sửa (Phase 3 — block_metrics)
```sql
-- Block hay được gợi ý nhưng ít được giữ lại (gợi ý chưa khớp → xem lại / gộp)
SELECT block_type_code, recommend_count, accepted_count,
       round(accepted_count::numeric / NULLIF(recommend_count,0), 2) AS accept_rate
FROM block_metrics
WHERE recommend_count >= 10
ORDER BY accept_rate ASC NULLS FIRST
LIMIT 20;

-- Block gần như không bao giờ được chấp nhận → ứng viên gộp/bỏ
SELECT block_type_code, recommend_count, accepted_count
FROM block_metrics
WHERE accepted_count = 0 AND recommend_count >= 5;

-- Cặp block hay đi cùng nhau → ứng viên gộp thành 1 block/template
SELECT block_a, block_b, count FROM block_cooccurrence ORDER BY count DESC LIMIT 20;
```

Quy trình: `missing_functions` → build thêm; accept_rate thấp / accepted=0 →
gộp hoặc bỏ; co-occurrence cao → cân nhắc gộp thành 1 block hoặc curated template.
