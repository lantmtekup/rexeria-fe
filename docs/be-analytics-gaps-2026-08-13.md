# Analytics (Portal V2) — những gì BE còn thiếu

Ngày rà: **2026-08-13** · FE `rexerai@develop` (c9d93d5) · BE `be-ReXeR.ai@main` (d062ba7)

Màn `/portal-v2/analytics` đã nối `/v1/intel/*` cho hai tab đầu. Tài liệu này liệt kê
phần còn lại, theo đúng thứ tự nên làm.

Quy ước chung: mọi endpoint dưới đây nằm trên `priv` (đã đăng nhập), nhận **lát cắt §8
sẵn có** (`brand_id`, `campaign_id`, `item_id`, `experience_id`, `channel`, `from`,
`to`) và trả tiền ở đơn vị `*_cents`. Không endpoint nào cần bảng mới — mọi số đã nằm
trong `fact_daily`.

---

## Đã nối, chạy được ngay

| Màn | Endpoint |
| --- | --- |
| Ô tổng đo (phiên · chuyển đổi · doanh thu · ROAS) | `GET /v1/intel/overview` |
| Ô "độ phủ đo" | `GET /v1/intel/trust` → `coverage.tracked_components_pct` |
| Phễu 5 chặng + điểm rò | `GET /v1/intel/funnel` |
| Bảng chiến dịch + drill hạng mục → trải nghiệm | `GET /v1/intel/campaigns?expand=subjects` |
| Phễu riêng của một trải nghiệm | `GET /v1/experiences/{id}/stats` |
| Bảng block của một trải nghiệm | `GET /v1/intel/blocks?experience_id=` |
| Độ phủ của một trải nghiệm | `GET /v1/experiences/{id}/coverage` |

---

## Nhóm 1 — chặn hẳn màn hình

### 1.1 `GET /v1/intel/channels` — cơ cấu kênh

Chặn: biểu đồ "Cơ cấu kênh" ở tab Tổng quan, ô "Kênh tốt nhất" ở tab Xếp hạng.

`fact_daily.channel` đã là một chiều của bảng, nhưng §8 chỉ nhận nó làm **bộ lọc** —
không endpoint nào gộp **theo** nó. FE không thay thế được bằng cách gọi lặp: nó không
biết trước danh sách kênh, và gọi `/intel/overview` một lần cho mỗi kênh đoán được thì
vừa N+1 vừa sót kênh chưa từng thấy.

Query: lát cắt §8 chuẩn (`channel` bị bỏ qua — chính nó là chiều gộp).

```jsonc
{
  "items": [
    {
      "channel": "facebook",        // "" ⇒ không xác định, ĐỪNG đổi thành "direct"
      "sessions": 12480,
      "converted": 316,
      "cvr": 0.0253,
      "lift": 0.18,                 // null khi không có đối chứng
      "revenue_cents": 984000000,   // null khi lát cắt không ai chốt trên nền tảng
      "confidence_tier": "high"
    }
  ],
  "total": 4
}
```

Xếp giảm dần theo `sessions`. `lift` so với phần CÒN LẠI của lát cắt (pooled rest), cùng
cách `/intel/campaigns` đang làm — đừng so một kênh với chính nó.

### 1.2 `GET /v1/intel/components` — khoan xuống component

Chặn: hai tầng cuối của drill (block → component → chi tiết tín hiệu).

`/intel/blocks` chỉ trả **một** `top_component` mỗi loại khối. Dữ liệu đầy đủ đã có:
`fact_daily` có `component_key`, `signals`, `assists`, và repo đã có sẵn
`factRepo.QueryComponents()` — chỉ thiếu chỗ để hỏi.

Query: lát cắt §8 + `block_type_code` (bắt buộc) hoặc `block_key` (xem mục 2.1).

```jsonc
{
  "items": [
    {
      "component_key": "cta-primary",
      "block_type_code": "hero_reveal",
      "signal_type": "intent",       // intent | engagement | conversion
      "event": "tap",                // cơ chế: view | tap | complete | submit
      "meaning": "Bấm CTA chính",
      "signals": 8420,
      "assists": 214,
      "assist_rate": 0.031,          // null khi không đối chứng — ĐỪNG trả 0
      "confidence_tier": "directional"
    }
  ],
  "total": 3
}
```

Lưu ý cho FE: UI hiện đang vẽ "97% conf" và cột cường độ `●●●`. Hai thứ đó **không có
trong BE** và cũng không nên bịa — FE sẽ đổi sang `confidence_tier`. Xem mục 3.2.

### 1.3 `GET /v1/intel/subjects` — xếp hạng theo sản phẩm/chủ đề

Chặn: toàn bộ tab Xếp hạng nhánh "Sản phẩm", thẻ layer "Sản phẩm" ở Tổng quan.

Hiện không có grain nào trả được: `/intel/campaigns` có `subjects[]` nhưng **lồng trong
từng chiến dịch** (một sản phẩm chạy ở 3 chiến dịch ⇒ 3 dòng rời), và `IntelSubjectRow`
**không có `revenue_cents`** — trong khi màn này xếp hạng theo doanh thu.

Query: lát cắt §8 chuẩn (không có `item_id` — chính nó là chiều gộp).

```jsonc
{
  "items": [
    {
      "item_id": "…",                        // đại diện; xem splits để biết đủ
      "subject": { "kind": "product", "product_id": "…", "name": "Căn 2PN Tower A" },
      "sessions": 9120,
      "converted": 187,
      "cvr": 0.0205,
      "lift": 0.12,
      "revenue_cents": 742000000,            // null khi mode lead
      "aov_cents": 3968000,                  // null khi revenue null
      "leads": 402,
      "spend_cents": 88000000,               // xem mục 3.1 — hiện chỉ có ở cấp chiến dịch
      "cac_cents": null,                     // null cho tới khi 3.1 được chốt
      "campaigns": 3,
      "confidence_tier": "high",
      "best_experience": { "page_id": "…", "name": "…", "cvr": 0.031 },
      "best_channel":    { "channel": "facebook", "cvr": 0.028 },
      "splits": [                            // chỉ khi ?expand=splits
        { "campaign_id": "…", "campaign_name": "…", "sessions": 4100, "cvr": 0.022, "lift": 0.19 }
      ]
    }
  ],
  "total": 12
}
```

`splits[]` là thứ màn "thành tích" cần: cùng một sản phẩm ở nhiều chiến dịch, để FE tính
độ nhất quán. Không có nó thì FE phải gọi `/intel/campaigns` rồi tự ghép — và vẫn thiếu
doanh thu.

### 1.4 `GET /v1/intel/experiences` và `GET /v1/intel/journeys` — hai bảng xếp hạng còn lại

Chặn: tab Xếp hạng nhánh "Trải nghiệm" và "Hành trình", hai thẻ layer tương ứng.

Hiện chỉ có API **cho từng mục một** (`/experiences/{id}/stats`, `/journeys/{id}/stats`).
Xếp hạng cả thư viện bằng cách gọi lần lượt là N+1 với N = số template của brand.

`/intel/experiences` — grain **khái niệm** (template + toàn bộ copy của nó, đúng cách
`experience_id` đang resolve):

```jsonc
{
  "items": [
    {
      "experience_id": "…",          // id template
      "name": "…",
      "role": "EXP",                 // vai phễu mạnh nhất, null khi chưa đủ mẫu
      "sessions": 15200,
      "cvr": 0.024,
      "lift": 0.31,
      "revenue_cents": 1120000000,
      "engagement_depth": 0.42,      // interactions / views, null khi chưa gắn điểm đo
      "signal_coverage": 0.68,       // 0..1 — tránh N+1 sang /coverage
      "campaigns": 4,
      "confidence_tier": "high",
      "best_channel": { "channel": "zalo", "cvr": 0.029 },
      "funnel": [ { "role": "ATT", "label": "…", "count": 15200, "drop_pct": null } ],
      "splits": [ /* như 1.3, chỉ khi ?expand=splits */ ]
    }
  ],
  "total": 23
}
```

`/intel/journeys` — cùng khuôn, thay `funnel` bằng `completion_rate` + `leaks[]` (đã có
sẵn trong `JourneyStatsResponse`) và **bổ sung tỷ lệ từng chặng** (mục 2.3).

---

## Nhóm 2 — sửa/bổ sung field, không cần endpoint mới

### 2.1 `/intel/blocks`: trả thêm `block_key`, `page_id`, `label`, `components_tracked`, `campaigns`

Hiện gộp theo `block_type_code` và **chỉ** trả code đó. Hệ quả:

- không có `block_key` ⇒ không hỏi tiếp được component (mục 1.2 phải nhận `block_type_code`
  thay vì khoá thật);
- không có nhãn ⇒ màn hình đang hiện thẳng `hero_reveal` cho người dùng cuối;
- không có `components_tracked` ⇒ cột "N điểm đo" không có nguồn;
- không có `campaigns` ⇒ không nói được "khối này giữ phong độ ở mấy chiến dịch".

### 2.2 `/intel/campaigns`: bổ sung `channel` và `signal_coverage` cho `experiences[]`, `revenue_cents` cho `subjects[]`

`channel` đã có trong fact, chỉ bị gộp mất. `signal_coverage` nhúng sẵn để màn drill khỏi
gọi `/experiences/{id}/coverage` cho từng dòng. `revenue_cents` ở tầng hạng mục là điều
kiện cần của mục 1.3.

### 2.3 `/journeys/{id}/stats`: bổ sung tỷ lệ từng chặng

Hiện có `leaks[]` nhưng không có `steps[] { name, rate }`, nên biểu đồ phễu của hành
trình không vẽ được.

### 2.4 `/intel/blocks`: bổ sung `assist_rate`

FE xếp hạng block theo assist. `top_component.assists` là **số đếm của một component**,
không phải tỷ lệ của cả khối.

---

## Nhóm 3 — cần chốt hướng, không phải bug

### 3.1 Chi phí chỉ tồn tại ở cấp chiến dịch

`ad_campaign_metrics_daily` khoá theo `campaign_id`; không có chiều hạng mục / trang /
kênh (`internal/repository/fact_daily.go`, `spendSQL`).

⇒ **ROAS và CAC ở cấp sản phẩm hoặc trải nghiệm là không tính được.** Hai đường:

- **A.** BE bổ sung grain chi phí (`item_id`/`channel`) — cần nguồn dữ liệu quảng cáo
  chi tiết hơn hiện có.
- **B.** FE bỏ hai ô đó ở các màn dưới cấp chiến dịch, chỉ giữ ở cấp chiến dịch và toàn
  danh mục.

Chưa chốt thì FE để `—`; không suy ROAS từ chi phí của chiến dịch mẹ chia đều.

### 3.2 Không có "% tin cậy" và "cường độ tín hiệu"

UI component drill đang thiết kế với `97% conf` và `●●●`. BE chỉ có bậc chuỗi
(`high | directional | early | unmeasured`). Đề nghị: **FE đổi sang bậc**, BE không thêm
số phần trăm — một phần trăm tin cậy không có định nghĩa thống kê ở đây thì nó là một
con số trang trí.

---

## Ghi chú kiểm chứng

- `revenue_cents: null` nghĩa là **chưa từng đo** (mọi đối tượng chốt bằng lead/booking
  ngoài nền tảng), khác hẳn `0`. FE đã tách hai trường hợp; xin giữ đúng quy ước này ở
  các endpoint mới.
- `lift: null` = không có nhóm đối chứng. FE ẩn pill thay vì hiện `+0%`.
- Mọi số suy ra phải **cân theo phiên** ở BE (§1.3, cấm mean-of-means) — FE cố tình
  không cộng lại từ các dòng đã gộp.
