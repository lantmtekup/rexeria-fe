# BE spec — ghi số liệu quảng cáo thủ công (staff manual entry)

**Trạng thái:** đề xuất (FE đã có UI local-demo tại `/admin/ads`).
**Ngày:** 2026-06-01
**Người soạn:** FE (Lan)
**Lý do:** Hệ thống CHƯA đấu API các nền tảng quảng cáo (Meta / Google / TikTok).
Trong giai đoạn này nhân viên Rexer cần **nhập tay** số liệu campaign theo khoảng
ngày để khách hàng (brand) thấy hiệu quả ở `/portal/ads`. Khi nào đấu API thật
thì endpoint này thành nguồn fallback/override thủ công.

---

## 1. Hiện trạng (đã probe)

- `GET /v1/campaigns/{id}/metrics` **đã có**, trả:
  ```json
  {
    "campaign_id": "uuid",
    "summary": { "impressions": 0, "clicks": 0, "spent_amount": 0,
                 "conversions": 0, "ctr": 0, "cpc": 0 },
    "daily": []
  }
  ```
  (handler `campaign.go:28`, chỉ GET).
- **KHÔNG có** endpoint ghi metrics. POST thử `/portal/ads/campaigns/{id}/metrics`
  → 403 (brand) / 404 (admin). Cần BE bổ sung.

---

## 2. Endpoint đề xuất

### 2.1 Ghi/ghi đè theo khoảng ngày

```
PUT /v1/admin/campaigns/{id}/metrics
```

- **Auth:** chỉ **staff/admin** (principal_type = admin). Brand KHÔNG được ghi.
- **Ý nghĩa:** upsert các bản ghi daily trong `[from, to]`. Mỗi ngày là 1 row;
  ghi lại thì **ghi đè** (idempotent theo `(campaign_id, date)`).

**Request body** (2 chế độ, FE gửi cùng 1 shape — luôn kèm `daily`):

```json
{
  "from": "2026-05-20",
  "to":   "2026-06-03",
  "mode": "range",            // "range" | "daily" — chỉ để audit, BE xử lý như nhau
  "daily": [
    { "date": "2026-05-20", "impressions": 88900, "reach": 34400,
      "clicks": 1772, "spend": 13178571, "conversions": 88 },
    { "date": "2026-05-21", "impressions": 88900, "reach": 34400,
      "clicks": 1772, "spend": 13178571, "conversions": 89 }
    // … 1 phần tử / ngày trong khoảng
  ]
}
```

- Ở chế độ **range**, FE đã tự chia đều total cho từng ngày trước khi gửi, nên
  body luôn có đủ `daily`. BE không cần tự chia.
- `spend` đơn vị **VND, integer** (khớp `spent_amount` của GET).
- Field per-day: `impressions, reach, clicks, spend, conversions` (đều `int >= 0`).

**Validation:**
- `from <= to`, tối đa **92 ngày** (FE cũng cap).
- `daily[].date` phải nằm trong `[from, to]`, không trùng.
- Mọi metric `>= 0`.
- 404 nếu campaign không tồn tại; 403 nếu không phải staff.

**Response:** trả lại đúng shape của `GET .../metrics` sau khi ghi (summary +
daily đầy đủ) để FE refresh không cần gọi lại:

```json
{
  "campaign_id": "uuid",
  "summary": { "impressions": 1245820, "reach": 482140, "clicks": 24812,
               "spent_amount": 184500000, "conversions": 1240,
               "ctr": 1.99, "cpc": 7435 },
  "daily": [ /* như request, đã chuẩn hoá */ ]
}
```

`ctr = clicks/impressions*100`, `cpc = spend/clicks` — BE tính, FE chỉ hiển thị.
`reach` cần **bổ sung** vào `summary` của GET (hiện chưa có).

### 2.2 (tuỳ chọn) Sửa 1 ngày

```
PUT /v1/admin/campaigns/{id}/metrics/{date}
```
Body = 1 object metric (không có `date`). Dùng khi sửa lẻ. Có thể làm sau.

---

## 3. Thay đổi schema GET hiện có

Thêm `reach` vào `summary` (đang thiếu) để brand-side `/portal/ads` hiển thị
đủ. `daily[]` cũng nên có `reach`.

---

## 4. Mô hình lưu

Bảng `campaign_metrics_daily` (gợi ý):

| col | type | note |
|---|---|---|
| campaign_id | uuid FK | |
| date | date | unique cùng campaign_id |
| impressions | bigint | |
| reach | bigint | |
| clicks | bigint | |
| spend | bigint | VND |
| conversions | bigint | |
| source | text | `'manual'` (sau này `'meta'`,`'google'`…) |
| updated_by | uuid | staff đã nhập |
| updated_at | timestamptz | |

`summary` của GET = SUM theo campaign (hoặc theo khoảng nếu GET nhận `?from&to`).
Cân nhắc cho GET nhận `?from=&to=` để brand lọc theo khoảng.

---

## 5. FE đã sẵn sàng

- UI: `/admin/ads` (component `AdminAdMetricsPage`, dialog
  `_UpdateMetricsDialog` — 2 mode range/daily, cap 92 ngày).
- Khi BE ship: FE đổi `handleSave` từ set state local → `PUT .../metrics`, và
  load list campaign + metrics thật (hiện đang SEED mock). Shape request đã
  thiết kế khớp mục 2.1 nên chỉ cần nối API.

---

## 6. Câu hỏi cho BE

1. Đặt route dưới `/admin/...` hay `/portal/ads/...` (staff-guard)? FE đề xuất
   `/admin/` cho rõ phân quyền.
2. GET metrics có nhận `?from&to` để lọc khoảng không?
3. `reach` có sẵn trong model chưa, hay cần thêm cột?
