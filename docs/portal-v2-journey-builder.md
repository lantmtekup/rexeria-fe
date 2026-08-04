# Journey Builder — Keyword & cách hoạt động

## Journey Builder làm gì?

Bạn khai báo **thứ tự các bước** khách đi trong một chiến dịch nhiều trang:

ai vào từ kênh nào → vào trang nào → chỗ nào tách đường → dữ liệu gửi sang hệ thống nào → kết thúc bằng hành động nào (mua, để lại lead, v.v.).

Nó **không** chỉnh HTML/block của trang. Việc đó nằm ở Experiences.  
Nó **không** bật quảng cáo hay publish URL. Việc đó nằm ở Deploy / kênh ads.

Dùng khi chiến dịch có **nhiều trang, nhiều cửa vào, hoặc có nhánh**. Một trang một cửa, không nhánh → không bắt buộc dùng Journey.

Màn hình: `/portal-v2/journeys`.

---



## Liên quan module nào?

Thứ tự làm việc trong Portal V2:

1. **Brand / Product / Media** — persona, claim, asset đã duyệt
2. **Campaigns** — tạo chiến dịch (vd Super Serum Launch)
3. **Journey Builder** — khai lộ trình (bước này)
4. **Experiences** — dựng từng trang mà lộ trình trỏ tới
5. **Ready (người duyệt)** — xác nhận đủ điều kiện
6. **Deploy** — publish; Journey không có nút deploy riêng
7. **AI / Intel** — xem số sau khi chạy, so sánh path
8. **Automation** — nhân bản experience đã Proven sang sản phẩm khác


| Module                  | Quan hệ với Journey                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| **Campaigns**           | Copy của journey thuộc đúng 1 campaign. Blueprint thì chưa thuộc campaign nào.                     |
| **Experiences**         | Mỗi bước loại Experience trên journey trỏ 1 experience (trang). Journey không chứa nội dung trang. |
| **Brand**               | Segment / audience của journey lấy từ góc nhìn hành vi brand đã định nghĩa.                        |
| **Deploy**              | Phải mở đúng loại cửa vào journey đã khai (UTM, QR, email…).                                       |
| **CRM / Shopify / CDP** | Các bước Action / Outcome ghi hệ thống nhận dữ liệu hoặc checkout.                                 |
| **AI / Intel**          | Đọc sessions/lift theo từng bước experience, xếp theo path của journey.                            |
| **Command**             | Đếm “journey đang gắn campaign” và “blueprint trong thư viện”.                                     |


Xóa journey → lộ trình mất; experience đã gắn **không** bị xóa.

---



## Keyword — giải thích từng cái



### Journey

Một lộ trình gồm nhiều **node** nối bằng mũi tên.

Ví dụ: Paid ads → trang Reveal → trang Inspect → (sẵn mua?) → lưu CRM → checkout.

### Journey Builder

Màn quản lý và xem journey: danh sách, tạo mới, fork vào campaign, xem sơ đồ, xem số, xem checklist thiếu gì.

### Node (trạm / bước)

Một ô trên sơ đồ. Có đúng 5 loại (xem bên dưới). Mỗi node có:

- **name** — tên hiện trên sơ đồ  
- **purpose** (trong data gọi `d`) — câu trả lời: bước này giúp shopper việc gì. Để trống = fail checklist  
- **to** — danh sách bước tiếp theo



### Graph / Canvas

- **Graph** = toàn bộ node + mũi tên của một journey. Đây là dữ liệu gốc; layout, checklist, số simulate đều tính từ đây.  
- **Canvas** = tab vẽ sơ đồ đó. Hiện tại chủ yếu xem và chọn node; chưa kéo thả thêm/xóa node trên UI.



### Blueprint

Journey trong thư viện. Không gắn campaign.

- Không có số đo riêng (vì chưa chạy trong một campaign cụ thể).  
- Nếu đã có vài campaign fork nó, số hiện trên blueprint = cộng từ các copy (theo cùng experience id các bước trỏ tới).



### Copy / Campaign journey

Journey gắn **một** campaign sau khi bấm Use in campaign.

- Có thể có sessions / lift của đúng campaign đó.  
- Sửa copy không đổi blueprint.



### Origin

Với copy: id của blueprint gốc.  
Xóa blueprint → copy vẫn còn nhưng mất origin.

### Fork / Use in campaign

Tạo copy từ blueprint (hoặc từ copy khác, vẫn truy về cùng origin) và gắn vào một campaign.

- Cùng blueprint + cùng campaign lần 2 → mở lại copy cũ, không tạo thêm.  
- Blueprint không bị sửa khi fork.



### Duplicate

Nhân bản journey thành bản mới (tên thêm “(copy)”). Khác fork: không gắn campaign mới; chỉ clone.

### Delete

Xóa journey khỏi danh sách. Experience liên kết giữ nguyên.

---



### Entry

Bước đầu: khách vào từ kênh nào.


| Id         | Nghĩa                   |
| ---------- | ----------------------- |
| paid       | Quảng cáo trả phí       |
| social     | Bài social organic      |
| influencer | Link creator            |
| search     | Tìm kiếm                |
| email      | Email                   |
| website    | Từ site brand           |
| qr         | QR tại quầy / packaging |
| sms        | SMS                     |


Kèm theo:

- **Signal** — cách nhận diện click/visit (UTM, click ID, subscriber id, mã kệ…).  
- **Via / System** — hệ thống thường mang traffic đó (Meta, Klaviyo…).



### Experience (loại node)

Bước khách vào một **experience** của ReXeR (trang / flow đã dựng ở module Experiences).

Field liên quan:

- **x** — id experience  
- **xName** — tên đã resolve; không có = chưa gắn trang thật  
- **xCoverage** — % component có tracking; `0` = trang chưa đo gì → checklist báo thiếu



### Decision

Bước tách đường. Cần **≥ 2** mũi tên ra.  
Ví dụ: “Ready to buy?” → một nhánh sang trang giáo dục, một nhánh bỏ qua.

### Action

Bước hệ thống xử lý dữ liệu (không phải trang).  
Ví dụ: sync CRM, tạo delivery promise trên OMS.  
Phải ghi **via** (hệ thống nhận).

### Outcome

Bước kết thúc: kết quả campaign muốn đạt.  
Ví dụ: Purchase, Qualified lead, Known shopper, Click-through.  
Khớp **Objective** lúc tạo journey. Phải ghi **via**.

---



### Objective (`obj`)

Mục tiêu của journey / campaign. Quyết định outcome mặc định khi tạo mới:


| Objective | Outcome mặc định | Via điển hình       |
| --------- | ---------------- | ------------------- |
| insight   | Known shopper    | CDP profile         |
| lead      | Qualified lead   | CRM sync            |
| cta       | Click-through    | Destination handoff |
| convert   | Purchase         | Shopify checkout    |




### Segment / Audience (`seg`)

Nhóm hành vi dùng làm góc nhìn chính của journey (và để scale số ở tab Simulate).


| Id  | Tên                | Share (tỷ trọng hành vi dùng khi simulate) |
| --- | ------------------ | ------------------------------------------ |
| all | All shoppers       | 100% — không scale                         |
| s1  | High Intent        | 7%                                         |
| s2  | Active Comparator  | 14%                                        |
| s3  | Trust Seeker       | 17%                                        |
| s4  | Product Researcher | 12%                                        |
| s5  | Price Sensitive    | 11%                                        |


**want** = mô tả ngắn nhu cầu nhóm đó (text giải thích trên UI).

---



### Sessions

Số phiên đo được trên một bước Experience trong campaign.

### Lift

Chênh so với control, dạng phần thập phân: `0.18` = +18%, `-0.06` = −6%.

### Stats

Cặp `{ sessions, lift }` gắn trên bước Experience của **copy** đã chạy.  
Blueprint không tự có stats; lấy từ copy.

### Rollup

Cách gộp nhiều bước/copy: tổng sessions; lift trung bình **có trọng số theo sessions** (bước ít session ít ảnh hưởng headline).

### Not yet run

Chưa có stats. UI để trống / “Not yet run” — **không** hiện `0`.

### Assisted

Nhãn trên số journey: sessions/lift đo ở experience, rồi xếp theo path. Không khẳng định “vẽ journey này nên mới ra lift”.

### Resolve (số trên blueprint)

Với mỗi bước Experience của blueprint: tìm các bước cùng experience id trên mọi copy → rollup.  
Headline của blueprint = rollup các bước đó.

---



### Overview

Tab metadata: tên, mô tả, objective, audience, số node / experience / decision, sống ở thư viện hay campaign nào.

### Canvas

Tab sơ đồ + **Inspector** (chi tiết node đang chọn) + danh sách rule cấu trúc đang fail/pass.

### Inspector

Panel bên phải canvas: purpose, via, source/signal (entry), số nhánh (decision), experience gắn + coverage.

### Simulate / Walk

Tab xếp các bước Experience theo thứ tự cột trên sơ đồ, hiện:

- sessions đã scale theo segment  
- bao nhiêu người **reached** bước đó  
- lift của bước

Cách tính reached (tóm tắt):

1. Scale sessions × share của segment.
2. Trong cùng một cột, nhiều nhánh Experience chia lượng khách đến theo tỷ lệ sessions đo được — không nhánh nào nhận hết.
3. Bước sau không được có reached lớn hơn lượng đã tới từ bước trước (min-chain).

Không có stats → tab báo journey chưa chạy.

### Requirements / Readiness

Tab checklist + % rule đạt + việc từng node còn thiếu.

**Score** = số rule pass / tổng rule, làm tròn %.  
Màu: ≥80 xanh, ≥50 vàng, dưới 50 đỏ.

### Validation / Journey contract

Các rule cấu trúc máy kiểm (Canvas + Requirements):

1. Có ≥ 1 Entry
2. Có ≥ 1 Outcome
3. Mọi mũi tên trỏ node tồn tại
4. Mọi node tới được từ Entry
5. Mọi path tới được Outcome (không ngõ cụt)
6. Không vòng lặp
7. Mọi Experience node có gắn trang (`xName`)
8. Mọi node có purpose
9. Entry / Action / Outcome có via

Readiness thêm:

1. Mọi Experience gắn trang và `xCoverage > 0`



### Gap / Work list

Việc theo từng node, ngoài các rule trên: decision < 2 nhánh, node không phải outcome mà không có mũi tên ra, experience coverage = 0, thiếu purpose / via / link trang.

### Ready (quyết định người)

Checklist máy chỉ báo thiếu gì. Gắn Ready / cho Deploy là việc người duyệt — Journey Builder không tự Ready.

---



### Tagline / Summary

- **Tagline** — một dòng mô tả ngắn trên card.  
- **Summary** — đoạn mô tả dài hơn ở Overview.



### Structure

Dòng thống kê: tổng node · số Experience · số Decision; kèm “lives in” thư viện hay tên campaign.

### In market

Copy đã gắn campaign (có thể đã có hoặc chưa có số đo).

### Journey library

Nơi “sống” của blueprint (không gắn campaign).

---



## Ví dụ seed



### Product Launch Journey (blueprint `j1` + copy Super Serum)

Entry paid social → Reveal → Inspect → Decision “Ready to buy?”  
→ (chưa sẵn) Explain & prove → Action lưu profile → Outcome Purchase.

Copy campaign Super Serum đã có stats trên các bước Experience → Simulate có số.

### Gift Season Journey (blueprint `j2` + copy Christmas 2026)

Entry QR + email → “Who is it for?” → Decision người nhận đã biết chưa  
→ nhánh edit cá nhân hóa **hoặc** safe edit → Action gift note → Outcome Gift purchase.

Hai nhánh edit cùng cột → Simulate chia sessions giữa hai nhánh.  
Một experience trong blueprint có coverage 0 → readiness ~90% (còn thiếu tracking).

---



## Việc làm được trên UI hiện tại


| Việc                  | Chi tiết                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Lọc danh sách         | All / Blueprints / Campaign journeys + search tên/tagline/home                             |
| Tạo mới               | Nhập name, objective, audience → sinh blueprint có sẵn Entry paid + Outcome theo objective |
| Xem 4 tab             | Overview, Canvas, Simulate, Requirements                                                   |
| Fork                  | Chọn campaign → tạo/mở copy                                                                |
| Duplicate / Delete    | Nhân bản hoặc xóa                                                                          |
| Chọn node trên canvas | Đọc Inspector                                                                              |


Chưa có: kéo thả sửa graph, API lưu server, gợi ý gắn experience theo segment, tab AI Architect, so sánh 2 journey, nối bảng Fact thật thay số mock.