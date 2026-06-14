# BE gap — AI-Insights ↔ Marketing fullflow (2026-06-14)

> Gửi team BE + AI. FE đã ráp xong fullflow Marketing → AI-Insights → dựng
> template (xem `docs/plan-marketing-insights-bridge-2026-06-13.md`). Doc này
> liệt kê **3 gap phía BE** đang chặn flow chạy thật end-to-end. FE không cần
> sửa thêm — chờ BE.
>
> Liên quan: audit §20 (`docs/be-audit-2026-05-26.md`), spec wizard-v2
> (`be-ReXeR.ai/docs/be-spec-insights-wizard-v2-2026-06-10.md`).

---

## Gap 1 — [CHẶN] wizard-v2 endpoints + worker chưa lên prod (audit §20)

### ✅ BE xác nhận (2026-06-14): code XONG, chỉ chờ deploy
- Tất cả endpoint đã đăng ký trong `handler/insight.go`: `POST /insights/suggest`,
  `/classify-goal`, `/suggest-journey`, `/blocks/generate-content`
  (+ create/list/get/blueprint/handoff).
- AI worker: `StartAIJobWorker` trong `wire.go` tự chạy khi `!IsDev()`
  (prod/staging bật; chỉ tắt ở dev để e2e không race).
- Code đã nằm trên `main`.

### Việc còn lại (ops/BE — KHÔNG phải FE)
1. Deploy `main` lên prod.
2. Chạy migration **000024**.
3. Đảm bảo env prod là **non-dev** → worker tự chạy, report ra `succeeded`.

### ⚠️ Re-probe prod 2026-06-14 — vẫn CHƯA deploy
| Route (POST) | Prod |
|---|---|
| `insights/suggest` | ❌ 404 |
| `insights/classify-goal` | ❌ 404 |
| `insights/suggest-journey` | ❌ 404 |
| `insights/blocks/generate-content` | ❌ 404 |

→ Code ở main nhưng prod **chưa lấy bản mới**. Cần trigger deploy thật.

### Checklist verify SAU deploy (chạy với cookie admin)
```bash
B=https://rexerai.tekupsoftware.com/v1
# 1. endpoint sống (401/400 = OK, 404 = chưa deploy)
for ep in suggest classify-goal suggest-journey blocks/generate-content; do
  curl -s -o /dev/null -w "$ep %{http_code}\n" -X POST -b "$CK" \
    -H 'Content-Type: application/json' -d '{}' "$B/insights/$ep"
done
# 2. worker chạy: tạo report rồi poll tới succeeded (không kẹt queued)
#    POST /insights/reports {workspace_id, inputs} → GET /insights/reports/{id}
```

### Hiện trạng cũ (probe 2026-06-12, session admin hợp lệ)
| Route | Prod | Ghi chú |
|---|---|---|
| `GET /v1/insights/reports`, `POST /prefill` | ✅ | sống |
| `POST /v1/insights/suggest` | ❌ 404 | |
| `POST /v1/insights/classify-goal` | ❌ 404 | generate lại Goal |
| `POST /v1/insights/suggest-journey` | ❌ 404 | generate lại Journey |
| `POST /v1/insights/blocks/generate-content` | ❌ 404 | "AI tạo nội dung" |
| AI job worker (sinh blueprint) | ❌ dev gated | report kẹt `queued` |

### FE đang gọi (đều fallback toast khi 404, UI không vỡ)
- Tạo report: `POST /v1/insights/reports` + `inputs` (brief map từ Marketing).
- Generate lại từng step: `classify-goal` / `suggest-journey`.
- Re-run với `selections` (goal/journey đã chốt) để dựng lại blocks.

### Cần BE
Deploy nhánh `feat/insights-wizard-v2` (+ migration 000024) lên prod **và** bật
AI job worker ở môi trường test để report chạy ra `succeeded` thật. Đây là gap
**chặn toàn bộ** — 2 gap dưới chỉ kiểm chứng được sau khi cái này xong.

---

## Gap 2 — [TRUNG] PATCH blueprint không nhận `experience_goal`

### Hiện trạng
`PATCH /v1/insights/reports/{id}/blueprint` (KB3) body chỉ nhận:
```
UpdateInsightBlueprintBody { recommended_blocks?, customer_journey? }
```
→ Khi user **sửa Experience Goal** trong popup (đổi goal / sửa lý do AI gen),
FE **không gửi lên BE được** vì endpoint bỏ qua goal.

### FE workaround tạm
Lưu goal-edit vào `campaign.notes` (`insight_summary.goalEdit`) để seed lại khi
mở — nhưng đây là state phía Marketing, report trên BE vẫn giữ goal cũ. Nếu
chỗ khác đọc `report.blueprint.experience_goal` thì lệch.

### Cần BE
Thêm `experience_goal?: { primary_goal, secondary_goal?, rationale? }` vào
`UpdateInsightBlueprintBody` và merge vào blueprint (giống cách đã merge
journey/blocks). Khi đó FE bỏ workaround notes, lưu thẳng lên BE.

---

## Gap 3 — [TRUNG] Content sinh ra (generate-content) chưa gắn vào template handoff

### Hiện trạng — 2 bước tách rời
1. `POST /v1/insights/blocks/generate-content` (KB4) → sinh nội dung mẫu khớp
   `props_schema` của 1 block. FE hiện chỉ **hiển thị xem trước**, content này
   **không được lưu** đi đâu.
2. `POST /v1/insights/reports/{id}/handoff` (KB2) → dựng Template draft từ
   `block_codes`, nhưng các block dựng ra **rỗng nội dung** (chỉ có cấu trúc).

→ User sinh nội dung mẫu ở bước 1 rồi handoff ở bước 2 thì **content bị mất**;
phải gõ lại thủ công trong canvas editor.

### Cần BE (đề xuất — chọn 1)
- **(a)** `handoff` nhận thêm `block_contents?: { block_type_code, stage_key,
  content }[]` → dựng template **kèm content** đã sinh. FE gom content từ các
  lần generate-content rồi truyền vào handoff. *(ưu tiên — 1 call)*
- **(b)** Hoặc: generate-content **tự persist** content theo `report_id +
  block`, handoff đọc lại khi dựng.

Mục tiêu: user bấm "AI tạo nội dung" cho vài block → "Dùng kết quả này" → mở
editor là **landing đã có sẵn nội dung**, không phải gõ lại.

---

## Tóm tắt ưu tiên
1. **Gap 1** (deploy + worker) — chặn tất cả, làm trước.
2. **Gap 2** (PATCH goal) — nhỏ, mở rộng 1 field.
3. **Gap 3** (content → template) — quyết phương án (a)/(b) rồi build.

> FE phía Marketing đã sẵn sàng cho cả 3: chạy create/generate/handoff với
> fallback, chọn template truyền `block_codes`, lưu goal-edit. Khi BE xong từng
> gap, FE gỡ workaround tương ứng — không cần đổi UI.
