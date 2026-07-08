# Brief cho Team Content — Chuẩn bị dữ liệu test AI-Insights & AI-Automation

**Ngày:** 2026-07-05 · **Người giao:** Lân · **Đối tượng:** Team Content (không cần biết code)
**Mục tiêu:** Chuẩn bị đủ dữ liệu nội dung để QA test 2 tính năng AI trên portal ReXeR.ai.

> Tài liệu liên quan (đã có sẵn, tham khảo thêm):
> - `docs/ai-insights-test-usecases-2026-06-08.md` — bộ use case QA v2 (24 block + persona)
> - `docs/ai-insights-seed-data-2026-06-08.md` — seed data cũ

---

## PHẦN A — Hiểu 2 tính năng (đọc trước khi làm)

### A1. AI-Insights là gì?

**Vị trí:** Portal → menu **Insights** (`/portal/insights` → nút tạo mới mở wizard).
Ngoài ra còn nhúng trong **Campaign editor** (`/portal/marketing`, tab AI-Insights).

**Nó làm gì:** Người dùng (brand) điền một **brief chiến lược** qua wizard nhiều bước
→ AI phân tích và trả về một **bản Blueprint chiến lược trải nghiệm** gồm 4 phần:

1. **Experience Goal** — AI phân loại mục tiêu trải nghiệm vào 1 trong 6 loại
   (Product Discovery / Interactive Story / Comparison / Lead & Excitement /
   Brand Storytelling / Guided Decision-making), kèm độ tin cậy + lý do.
2. **Customer Journey** — hành trình khách hàng đề xuất: tên pattern + các stage
   (mỗi stage có intent + lý do).
3. **Recommended Blocks** — block giao diện đề xuất cho từng stage (hero, form
   thu lead, bảng giá, testimonial…), mỗi block có lý do chọn.
4. **Recommended Templates** — 1 vài template landing đề xuất (từ thư viện thật
   hoặc AI tự ghép), từ đó bấm 1 nút để **dựng landing page thật**.

**Wizard nhập liệu gồm 7 bước nhập + 3 bước AI:**

| Bước | Nội dung cần điền |
|---|---|
| 1. Thương hiệu (brand) | Tên, định vị (positioning), giọng điệu — chọn chip: *Sang trọng / Tin cậy / Cảm xúc / Hiện đại / Thân thiện*, nhận diện hình ảnh (màu sắc, phong cách) |
| 2. Sản phẩm (product) | Danh sách tính năng/điểm nổi bật, lợi ích, giá & chính sách giá, tình huống sử dụng (use case) |
| 3. Mục tiêu (objective) | Chọn chip mục tiêu chiến dịch: *Nhận biết / Giáo dục / Thu lead / Chuyển đổi / Ra mắt* (chọn được nhiều) |
| 4. Khách hàng (audience) | **Persona** (chân dung: tuổi, nghề, hoàn cảnh), độ tuổi, hành vi, **nỗi đau (pain points)**, động lực, thiết bị chính (mobile/desktop/cả hai) |
| 5. Thị trường (market) | Đối thủ, xu hướng thị trường, kỳ vọng của khách |
| 6. Tài sản (assets) | Liệt kê tài sản sẵn có: deck, bộ ảnh, video, phối cảnh… |
| 7. Thách thức (challenges) | Chọn chip: *Chuyển đổi thấp / Giá trị sản phẩm chưa rõ / Tương tác yếu / Chu kỳ bán dài* |
| 8–10 (AI) | Goal → Journey → Review: AI gợi ý, người dùng xác nhận/chỉnh rồi chạy |

**Điểm quan trọng:** Ngoài brief tay, hệ thống còn **tự kéo dữ liệu có sẵn trong CMS**
(workspace → sản phẩm → chiến dịch đã chọn) để đỡ phải nhập lại — chỉ hỏi thêm
những trường còn thiếu. **Nghĩa là dữ liệu sản phẩm/chiến dịch trong CMS càng đầy
đủ thì AI càng thông minh** → team content phải chuẩn bị cả data trong CMS chứ
không chỉ brief trên giấy.

Hệ thống hỗ trợ 2 ngôn ngữ **vi / en**. Đã có sẵn 1 brief mẫu ngành BĐS
("Happy City Cà Mau") được prefill trong wizard làm chuẩn tham khảo về độ chi tiết.

### A2. AI-Automation là gì?

**Vị trí:** Portal → menu **AI-Automation** (`/portal/ai-automation`).

**Nó làm gì:** "Một bản gốc, nhiều landing" — nhân bản 1 trang đã duyệt ra nhiều
sản phẩm. Flow 4 bước:

1. **Bản gốc** — chọn 1 landing/template **đã kích hoạt (active)** làm khuôn.
2. **Sản phẩm** — tick chọn 1 hoặc nhiều sản phẩm trong catalog + (tuỳ chọn) nhập
   1–2 câu **định hướng** (vd: *"nhấn mạnh vàng nguyên chất, giọng sang trọng"*).
3. **AI tạo** — mỗi sản phẩm chạy 1 job: AI **viết lại toàn bộ nội dung chữ** và
   **thay ảnh** của bản gốc theo đúng sản phẩm đó.
4. **Kết quả** — mỗi sản phẩm ra 1 landing riêng (hiện số field đã viết lại, số
   ảnh đã thay), bấm xem trước từng trang. Sau đó có bước **"Đẩy sang các kênh"**:
   chọn 1 landing vừa tạo → sinh biến thể cho các kênh **Ad / Email / Curate /
   Landing** (mỗi kênh giữ lại bộ block phù hợp).

**Điểm quan trọng:** AI lấy nội dung từ **hồ sơ sản phẩm trong CMS** (tên, mô tả,
ảnh đại diện). Sản phẩm thiếu mô tả/ảnh → landing ra sẽ nghèo nàn. Đây chính là
chỗ team content quyết định chất lượng test.

---

## PHẦN B — Task giao cho Team Content

### Task 1 — Bộ hồ sơ thương hiệu + catalog sản phẩm (nhập vào CMS)

Chuẩn bị **5 bộ ngành** khác nhau, mỗi bộ gồm:

- **1 hồ sơ thương hiệu**: tên, định vị 2–3 câu, giọng điệu, mô tả nhận diện
  (màu, phong cách ảnh).
- **5–10 sản phẩm/bộ**, mỗi sản phẩm bắt buộc có:
  - Tên sản phẩm chuẩn (đúng chính tả, có thể chứa số/ký tự: "Nhẫn Kim Cương 18K – RXR-102")
  - Mô tả 100–200 từ: chất liệu/tính năng, lợi ích, đối tượng phù hợp, giá
  - **1 ảnh đại diện chất lượng** (≥1200px, đúng sản phẩm, không watermark)
  - 2–3 ảnh phụ nếu có
- **1–2 chiến dịch mẫu**/bộ: tên chiến dịch, mục tiêu, thông điệp chính, thời gian.

Gợi ý 5 ngành (đa dạng để test AI đổi giọng):

| # | Ngành | Giọng điệu chủ đạo | Ghi chú |
|---|---|---|---|
| 1 | Bất động sản cao cấp | Sang trọng, tin cậy | Đã có mẫu Happy City — làm 1 dự án khác để so |
| 2 | SaaS / phần mềm B2B | Chuyên nghiệp, rõ ràng | Cần cả bản bán cho doanh nghiệp lớn lẫn bản cho startup (xem Task 3) |
| 3 | Trang sức / kim hoàn | Sang trọng, cảm xúc | Khớp demo "vàng nguyên chất" đang dùng nội bộ |
| 4 | F&B / bán lẻ | Trẻ trung, khẩn trương (flash sale) | Test block đếm ngược, combo |
| 5 | Giáo dục / khoá học | Thân thiện, dẫn dắt | Test thu lead + form đăng ký |

**Bàn giao:** file Excel/Sheet theo cột: `ngành | brand | sản phẩm | mô tả | giá |
link ảnh | chiến dịch`, kèm folder ảnh đặt tên theo sản phẩm. (Việc nhập vào CMS
có thể do team content tự nhập qua portal hoặc chuyển team dev import — thống nhất sau.)

### Task 2 — Viết brief AI-Insights hoàn chỉnh cho từng ngành

Mỗi ngành ở Task 1 viết **1 brief đầy đủ 7 mục** theo bảng ở phần A1, độ chi tiết
**tương đương mẫu Happy City** (mỗi mục 3–6 gạch đầu dòng, persona phải có tên,
tuổi, nghề, nỗi đau, động lực, kênh tiếp cận — không viết chung chung kiểu
"khách hàng 25–45 tuổi thích chất lượng").

Yêu cầu thêm:
- Viết **bằng tiếng Việt**; riêng ngành SaaS viết thêm **1 bản tiếng Anh** để test `lang=en`.
- Mỗi brief kèm dòng "**Tài sản sẵn có**" khớp với ảnh thật đã nộp ở Task 1.

### Task 3 — Cặp brief "cùng sản phẩm, khác khách hàng" (test quan trọng nhất)

Với ngành SaaS: viết **2 brief cho CÙNG 1 sản phẩm** nhưng:
- **Bản A:** bán cho doanh nghiệp lớn (persona: giám đốc tài chính ~45 tuổi, sợ
  rủi ro, cần ROI, bảo mật, nhiều cấp duyệt).
- **Bản B:** bán cho startup nhỏ (persona: founder ~29 tuổi, ngân sách hẹp, cần
  rẻ – nhanh – tự làm).

Mục đích: AI phải ra **2 blueprint khác nhau rõ rệt** (bản A nghiêng về case study,
bảng so sánh, bảo mật, đặt lịch demo; bản B nghiêng về bảng giá, hướng dẫn 3 bước,
dùng thử miễn phí). Nếu 2 kết quả giống nhau → báo bug. Có thể lặp lại cặp này cho
ngành BĐS (người mua ở thực vs nhà đầu tư).

### Task 4 — Bảng "đáp án mong đợi" cho QA chấm

Với **mỗi brief** ở Task 2 & 3, team content điền thêm 3 dòng dự đoán (dựa trên
hiểu biết marketing, không cần biết hệ thống):

1. **Goal mong đợi:** 1 trong 6 loại (xem A1, phần 1).
2. **Journey mong đợi:** 3–5 chặng bằng lời (vd: Gây chú ý → Tạo niềm tin → Thu lead).
3. **Loại section mong đợi trên landing:** 5–7 loại (vd: hero ảnh lớn, số liệu uy
   tín, cảm nhận khách hàng, form tư vấn…).

Đây là căn cứ để QA chấm output AI đúng/sai — không có đáp án thì không test được.

### Task 5 — Bộ định hướng (brief ngắn) cho AI-Automation

Viết cho mỗi ngành **3–5 câu định hướng** dạng 1–2 câu/câu lệnh để dán vào ô
"Định hướng" khi chạy automation, ví dụ:
- "Nhấn mạnh vàng nguyên chất 24K, giọng sang trọng, giá chỉ hiện khi khuyến mãi."
- "Giọng gấp gáp, nhấn ưu đãi hết hạn cuối tuần, kêu gọi đặt bàn ngay."
- 1 câu **cố tình mơ hồ** ("làm cho đẹp hơn") và 1 câu **mâu thuẫn với sản phẩm**
  ("nhấn mạnh giá rẻ" cho sản phẩm cao cấp) — để test AI xử lý input xấu.

### Task 6 — Bộ dữ liệu "xấu" (edge case)

Chuẩn bị thêm trong CMS ~5 sản phẩm lỗi có chủ đích:
- Sản phẩm **không có ảnh**.
- Sản phẩm **mô tả 1 dòng** ("Nhẫn đẹp").
- Sản phẩm **mô tả cực dài** (500+ từ, lan man).
- Sản phẩm tên có **emoji/ký tự đặc biệt** ("Sữa rửa mặt 🌿 30% OFF!!!").
- Sản phẩm **mô tả tiếng Anh** trong khi chạy lang=vi.

Mục đích: xem AI có làm landing gãy/ảnh trống/nội dung vô nghĩa không.

---

## PHẦN C — Kịch bản test sẽ chạy (để content hiểu data dùng vào đâu)

| # | Kịch bản | Dữ liệu dùng |
|---|---|---|
| C1 | Chạy wizard AI-Insights từng ngành → so blueprint với "đáp án" Task 4 | Task 2 + 4 |
| C2 | Cặp A/B cùng sản phẩm khác persona → blueprint phải khác nhau | Task 3 |
| C3 | Từ blueprint bấm dựng landing thật → mở editor xem block đúng đề xuất | Task 2 |
| C4 | AI-Automation: 1 bản gốc × 1 / 3 / 10 sản phẩm → kiểm tra từng landing: chữ đúng sản phẩm, ảnh đúng sản phẩm, giọng đúng định hướng | Task 1 + 5 |
| C5 | Multi-channel: 1 landing → biến thể Ad / Email / Curate → mỗi kênh giữ block hợp lý | Task 1 |
| C6 | Chạy lại C1/C4 với data xấu | Task 6 |
| C7 | Chạy 1 brief tiếng Anh | Task 2 (bản EN) |

**Tiêu chí chấm output (rubric gợi ý cho C4):** ① nội dung nhắc đúng tên + đặc tính
sản phẩm, không lẫn sản phẩm khác; ② giọng điệu khớp định hướng; ③ ảnh sản phẩm
được thay đúng; ④ không sót nội dung của bản gốc (tên sản phẩm cũ, giá cũ);
⑤ tiếng Việt tự nhiên, không lỗi chính tả/dịch máy.

**Lưu ý cho QA (không phải việc content):** kết quả automation có thể gắn nhãn
`stub` (chạy engine giả lập khi AI thật chưa bật) — thấy nhãn này thì nội dung
không phản ánh chất lượng AI thật, cần báo lại để bật engine thật trước khi chấm.

---

## PHẦN D — Deadline & bàn giao đề xuất

| Hạng mục | Ước lượng | Ưu tiên |
|---|---|---|
| Task 1 (2 ngành đầu: BĐS + trang sức) | 2 ngày | P0 — chặn test automation |
| Task 5 (định hướng automation) | 0.5 ngày | P0 |
| Task 2 + 4 (brief + đáp án, 2 ngành đầu) | 2 ngày | P1 — chặn test insights |
| Task 3 (cặp A/B) | 1 ngày | P1 |
| Task 1/2/4 các ngành còn lại | 3 ngày | P2 |
| Task 6 (data xấu) | 0.5 ngày | P2 |

Bàn giao tập trung 1 folder Drive: `AI-Testing-Content/` gồm `01-catalog.xlsx`,
`02-briefs/` (mỗi brief 1 file), `03-expected/` (đáp án), `04-images/`, `05-automation-briefs.md`.
