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

## 7b. Settings — tab "Data & export" chưa ráp

`GET /v1/org/ground-truth/export` đã có và trả `{rows, governance}`, nhưng
`DataPanel` vẫn xuất `MOCK_FACT_ROWS`. Bốn tab còn lại (General, Measurement,
Signals & privacy, Team & roles) đã đọc ghi api thật.

Kèm hai trường General không nguồn nào trả: `since` (ngày mở tài khoản) — hiện
để trống, và `orgPlan` đang lấy tạm `account_type` vì BE không có khái niệm
"gói" tách riêng.

Và: Resend chỉ gửi được tới email chủ tài khoản cho tới khi xác minh một domain
tại `resend.com/domains` rồi đổi `REXER_MAIL_FROM_EMAIL` sang địa chỉ thuộc
domain đó. Trước lúc ấy, mời người khác luôn rơi vào nhánh "trả mật khẩu để
chuyển tay".

## 7c. Modal trải nghiệm — phần chưa theo kịp prototype

Đã ráp `GET /v1/experiences/{id}` nên block, tín hiệu và độ phủ nay cùng một
nguồn. Còn lệch `plan-v2/rexer-platform-v2.html` (bản `rexer-demo-v3.html`
giống hệt từng byte ở phần này, đã diff):

| Thiếu | Vì sao chưa làm |
|---|---|
| ~~Nút chính `Use this experience`~~ | ✅ đã ráp 2026-08-07 — xem mục 10 |
| Khối **Media** (`computed from Media`) | cần nối asset ↔ experience, chưa có đường đọc |
| Strip dạng chip (`wins … / loses …`, `order proven best`) | ăn Dossier + Order Bench; `/dossier` trả `measured:false`, mọi mảng rỗng |
| Băng Proven trong thân + nút `Approve as Proven` | hiện là nút nhỏ dưới footer |
| Tab **Orchestration** / **Dossier** | `lineage` trả `copies_count: 0`, dossier chưa có số |

Và một thiếu sót của API: **danh sách không trả số block**, nên thẻ chỉ đếm
được `funnel_coverage` (tối đa 5 vai, và 99/100 bản ghi trả `null`). Muốn thẻ
ghi đúng "9 block" thì BE phải thêm một cột đếm vào `GET /v1/experiences`.

Ghi kèm một sự thật về dữ liệu: lấy mẫu 24 bản ghi ngày 2026-08-07 ra **1 bản
đã gắn thẻ, 14 bản canvas thường (0 component), 9 bản rỗng**. Nên `layers[]` có
HAI hình dạng — `{key,role,block_type,block_signal,components}` và
`{id,name,blockType,isVisible}` (camelCase). `v2DetailToLayers` đọc cả hai; đổi
BE thì phải xem lại chỗ đó.

## 8. Ngoài phạm vi Portal V2

- 🔴 `admin@rexer.ai` / `Admin1234` đăng nhập được vào **production** với quyền
  admin; mật khẩu nằm trong `internal/database/seeds/qc_data.up.sql` đã commit.
- Còn stub: "Build experience", thêm dòng variant, chọn Product type.
- Campaigns/Journeys chưa lọc theo brand ở BE `List` — Journeys đã có
  `brand_id`, Campaigns thì đi qua `GET /campaigns?brand_id=`.
- Test `middleware/TestRLSContext_PinsGUCToRequestConnection` hỏng sẵn từ trước
  đợt này (đã kiểm bằng cách stash thay đổi).

---

## 10. Trải nghiệm thuộc về BRAND, không thuộc về chiến dịch (2026-08-07)

Đổi mô hình miền, **có sửa BE**. Trước đây một bản copy chỉ tồn tại được bên
trong một hạng mục chiến dịch; nay nó thuộc về brand đã lấy nó, còn chiến dịch
là nơi nó *được dùng* — một quyết định sau và tuỳ chọn.

| | Trước | Sau |
|---|---|---|
| `POST /experiences/{id}/use` | `campaign_id` + `item_id` **bắt buộc** | cả hai tuỳ chọn, **đi cùng nhau**; rỗng ⇒ bản của brand |
| `ListCopies` | `WHERE campaign_item_id IS NOT NULL` | mọi page chưa lưu trữ của brand, thêm `state=unassigned` |
| `AttachToItem` với bản chưa gán | `SubjectMismatchError` | nộp bản đó vào hạng mục (kiểm brand trước) |
| Fork trùng | idempotent theo `(origin, item)` | chỉ khi CÓ hạng mục — lấy nhiều bản về sửa là hợp lệ |

Chỗ đó là lý do màn Trải nghiệm từng giấu **55/56 trang**: page sinh từ trình
dựng / luồng AI không bao giờ ghi `campaign_item_id`, nên màn hình liệt kê "cái
bạn đã làm" lại không liệt kê cái nào bạn đã làm.

Đo lại sau khi sửa (brand RexerStudio): **131 mục** = 82 template · 21 của tôi ·
1 copy sản phẩm · 1 copy chủ đề · 26 khối.

Còn nợ:

- `state=unassigned` chưa có test nào; ba bộ lọc `unassigned` /
  `product_copies` / `topic_copies` dựa vào việc INNER JOIN `campaign_items`
  tự loại bản chưa gán — đúng nhưng ngầm.
- FE chưa có nút "gán vào chiến dịch" cho một bản đã có ở tab **Của tôi**; hiện
  chỉ gán được lúc fork. Đường BE đã thông (`AttachToItem`).
- `docs/docs.go` (swagger sinh ra) chưa chạy lại sau khi đổi `state` và
  `UseExperienceRequest`.

## 9. Chưa push

16 commit FE trên `feat/portal-v2-modules`, 6 commit BE trên `feat/v2-merge-main`.
Remote HTTPS đòi mật khẩu; SSH đã xác thực sẵn (`git@gitlab.com`, `@lantm.tekup`).
