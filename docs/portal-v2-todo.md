# Portal V2 — việc còn nợ

Ghi lại ngày 2026-08-07, sau đợt ráp API cho Automation, Experiences, Products,
Brand, Campaigns và Journeys. Mỗi mục nêu **hiện trạng đã kiểm chứng**, không
phải phỏng đoán — chỗ nào chưa kiểm thì nói rõ.

---

## 1. Số liệu nói hai giọng

### 1.1 Thẻ journey 62% vs chi tiết 33%

`JourneyCard` hiện điểm sẵn sàng do FE tự tính (`journeyReadiness`), còn modal
chi tiết đã đọc `GET /journeys/{id}/readiness`. Hai bên chấm ở tầng khác nhau
nên lệch hẳn: **62% ngoài thẻ, 33% khi mở ra**.

Gọi `/readiness` cho từng thẻ nghĩa là N request mỗi lần mở màn. Hai đường:

- bỏ % khỏi thẻ, chỉ giữ ở chi tiết — rẻ, và thẻ vốn là chỗ liếc qua;
- hoặc BE trả `readiness_score` ngay trong `GET /journeys` (một cột suy ra lúc
  đọc, giống `signal_coverage` của experiences).

Cần chốt hướng trước khi sửa.

### 1.2 `walkJourney` vẫn là luật của FE

`share` nay lấy từ `GET /intel/segments` (đo được), nhưng **cách nhân dòng chảy
qua từng chặng** vẫn do FE quyết. BE có `POST /journeys/{id}/walk` chưa dùng.

---

## 2. Bản sao luật phải đồng bộ tay

`src/lib/portal-v2/journeys/helpers.ts` → `validateJourney` giữ **12 luật** gương
`internal/core/journey_validator.go`.

Bản sao này **bắt buộc**: một bản nháp chưa lưu thì không hỏi server được. Nhưng
nó đã lệch một lần (FE 9 luật / BE 12, và `experience_ref` kiểm nhầm `xName` thay
vì `experience_id`), khiến màn hình báo "100% ready" rồi `PUT` trả 422.

**Đổi luật ở BE thì phải sửa cả hai chỗ.** Chưa có test nào bắt được sự lệch này.

---

## 3. Experiences trong Campaigns vẫn cục bộ

`bindRouteToItems`, `ensureCampaignExperiences`, `handleEnsureExperience`,
`handlePatchExperience` chỉ đổi React state. Gắn trải nghiệm vào hạng mục chiến
dịch → thấy ngay, **tải lại trang là mất**.

`ensureCampaignJourneys` cũng dựng bản tại chỗ cho chiến dịch chưa có fork; bản
đó không nằm trên server.

BE có `POST /campaigns/{cid}/items/{iid}/experiences` và `DELETE` tương ứng —
chưa ráp.

---

## 4. Route BE chưa dùng

Journeys dùng 9/15. Còn: `review`, `walk`, `compare`, `recommend-route`,
`stage`, `stage-candidates`.

`stage` / `stage-candidates` đáng chú ý — chúng xếp node của hành trình vào hạng
mục chiến dịch, đúng thứ mục 3 đang làm bằng tay ở FE.

---

## 5. Trường API còn thiếu

| Chỗ | Thiếu gì |
|---|---|
| `CampaignV2` | không trả `objective`, dù cột có trong DB — `CampaignView.goal` vì thế luôn null |
| `CampaignV2` / `JourneyResponse` | chỉ có `owner_id` (uuid), không có tên. UI đang để trống thay vì hiện uuid |
| `Experience` | `features`/`benefits` đã phơi ra nhưng **không bản ghi nào có dữ liệu** |
| `/journeys/{id}/stats` | không trả `lift`; UI chỉ vẽ lift khi có nguồn khác |

---

## 6. Nội dung AI rò chữ của khuôn

Trang do Automation sinh còn `logoAlt = "PNJ"` — tên thương hiệu của khuôn sang
trang sản phẩm khác. Sáu chỗ "PNJ" còn lại chỉ là tên block nội bộ, vô hại.

Kiểm chứng: 6/6 block đều được AI viết lại, nội dung khác nhau theo sản phẩm —
nên đây là lỗi phạm vi của `apply_product`, không phải block bị bỏ qua.

---

## 7. Nháp journey: lưu được nhưng chưa dùng được

`PUT` nay chỉ kiểm phần **cấu trúc** (`core.StructuralCheckIDs`), phần đủ-điều-
kiện dời sang `Use`/`Promote`. Hệ quả cần theo dõi: một hành trình có thể nằm
trong thư viện ở trạng thái không bao giờ chạy được, và **không có màn nào liệt
kê chúng**. Cân nhắc một bộ lọc "chưa đủ điều kiện" ở danh sách.

---

## 8. Ngoài phạm vi Portal V2

- 🔴 `admin@rexer.ai` / `Admin1234` đăng nhập được vào **production** với quyền
  admin; mật khẩu nằm trong `internal/database/seeds/qc_data.up.sql` đã commit.
- Còn stub: "Build experience", thêm dòng variant, chọn Product type.
- Campaigns/Journeys chưa lọc theo brand ở BE `List` — Journeys đã có
  `brand_id`, Campaigns thì đi qua `GET /campaigns?brand_id=`.
- Test `middleware/TestRLSContext_PinsGUCToRequestConnection` hỏng sẵn từ trước
  đợt này (đã kiểm bằng cách stash thay đổi).

---

## 9. Chưa push

16 commit FE trên `feat/portal-v2-modules`, 6 commit BE trên `feat/v2-merge-main`.
Remote HTTPS đòi mật khẩu; SSH đã xác thực sẵn (`git@gitlab.com`, `@lantm.tekup`).
