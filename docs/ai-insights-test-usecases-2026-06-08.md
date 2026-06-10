# AI-INSIGHTS — Bộ use case test (QA) — v2 (có chân dung khách hàng)

**Ngày:** 2026-06-08 · **Thay cho v1** (v1 quá đơn giản, thiếu persona).
Mỗi brief có **chân dung khách hàng (persona) đầy đủ** + đáp án + mục tiêu test.

> ⚠️ **Spec-gap cho team AI (quan trọng):** §4.3 b1 spec ghép brief embed từ
> `key_messages + brand_positioning + campaign_objective + tone` — **THIẾU
> `customer_segments`**. Nếu không nhúng persona vào text embed thì **mọi case
> persona dưới đây sẽ không phân biệt được** (cùng ngành/sản phẩm → ra cùng block).
> → Đề nghị: chuỗi embed = `brand_positioning + campaign_objective +
> key_messages + tone + customer_segments(role/pain/motivation)`. Và cân nhắc
> thêm field `audience_fit[]` (enterprise/smb/consumer/affluent/donor…) trên block
> để có tín hiệu cứng, không chỉ dựa cosine.

---

## 1. Block Library v2 (24 block) — import trước

| id | name | goal_fit | industry_fit | tone | audience_fit | embedding_text (tóm tắt) |
|---|---|---|---|---|---|---|
| B01 | hero_overlay | awareness | all | bold,elegant | all | Hero ảnh nền + tiêu đề mạnh, ấn tượng đầu trang |
| B02 | hero_split | conversion | saas,tech,b2b | clean | smb,enterprise | Hero 2 cột pitch+CTA+ảnh sản phẩm |
| B03 | hero_video | awareness | fashion,lifestyle,entertainment | cinematic | consumer,affluent | Hero video kể chuyện thương hiệu |
| B04 | feature_grid | awareness,consideration | saas,tech | clean | smb,enterprise | Lưới tính năng/lợi ích |
| B05 | how_it_works | consideration | saas,services,education | helpful | consumer,smb | 3–4 bước dùng sản phẩm, gỡ rối |
| B06 | pricing_table | conversion | saas,ecommerce | clear | smb,consumer | Bảng giá nhiều gói + nút mua |
| B07 | comparison_table | consideration,conversion | saas,b2b | analytical | enterprise | So sánh gói/đối thủ, cho người cân nhắc kỹ |
| B08 | roi_calculator | conversion | b2b,saas,finance | analytical | enterprise | Máy tính ROI/tiết kiệm, chứng minh hiệu quả |
| B09 | testimonial | trust,conversion | all | warm | all | Lời chứng thực khách hàng |
| B10 | case_study | trust,consideration | b2b,saas | authoritative | enterprise | Case study chi tiết, kết quả đo được |
| B11 | logo_wall | trust | b2b,saas | minimal | enterprise | Dải logo khách hàng/đối tác |
| B12 | stats_band | trust | b2b,finance,saas | authoritative | enterprise | Dải số liệu uy tín/tăng trưởng |
| B13 | security_compliance | trust | fintech,healthcare,saas | serious | enterprise | Bảo mật, chứng chỉ, tuân thủ (SOC2/ISO/PCI) |
| B14 | countdown_cta | conversion,urgency | ecommerce,retail,f&b | energetic,urgent | consumer | Đếm ngược + CTA flash sale |
| B15 | bundle_offer | conversion | ecommerce,f&b | energetic | consumer | Combo/bundle giảm giá |
| B16 | product_gallery | consideration | ecommerce,fashion | visual | consumer | Lưới ảnh sản phẩm |
| B17 | lookbook_editorial | awareness | fashion,luxury | premium,cinematic | affluent | Lookbook biên tập, thẩm mỹ cao cấp |
| B18 | lead_form | lead_gen | b2b,services,education,real_estate | professional | all | Form thu lead (tư vấn/đăng ký) |
| B19 | demo_request | lead_gen | saas,b2b | professional | enterprise | Đặt lịch demo với sales |
| B20 | faq | consideration | all | helpful | all | Câu hỏi thường gặp |
| B21 | map_location | consideration | f&b,retail,real_estate,healthcare | practical | local | Bản đồ/chi nhánh/giờ mở cửa |
| B22 | newsletter_signup | retention,lead_gen | all | friendly | consumer | Đăng ký nhận tin |
| B23 | donation_cta | conversion | ngo,nonprofit | emotional | donor | Kêu gọi quyên góp |
| B24 | app_download | conversion | mobile,consumer_app | energetic | consumer | Tải app (App Store/Google Play) |

---

## 2. Test cases (brief + chân dung khách hàng)

### NHÓM A — Persona-driven: CÙNG sản phẩm/ngành, KHÁC persona → KHÁC block ⭐
> Đây là phép thử cốt lõi v2. Nếu engine ra **giống nhau** cho A1 vs A2 ⇒ chưa dùng
> tín hiệu persona (xem spec-gap đầu file).

**TC-A1 · SaaS HRM — bán cho ENTERPRISE (CFO/HR Director).**
- brand: TalentX · industry: saas · product: phần mềm quản lý nhân sự & chấm công
- objective: conversion (demo) · tone: professional, authoritative
- brand_positioning: "Nền tảng HRM cấp doanh nghiệp, bảo mật, tích hợp ERP"
- key_messages: ["giảm 30% thời gian vận hành HR", "tuân thủ luật lao động", "tích hợp SAP/Oracle", "bảo mật dữ liệu nhân sự"]
- **customer_segments / personas:**
  - *Bà Hương, 45, Giám đốc Tài chính, tập đoàn 2.000 nhân sự, TP.HCM.* Pain: chi phí
    vận hành HR cao, sợ rủi ro tuân thủ/kiểm toán. Motivation: ROI rõ ràng, an toàn dữ
    liệu. Objection: "chuyển đổi có rủi ro, tích hợp hệ thống cũ?". Kênh: giới thiệu,
    hội thảo ngành. Giai đoạn: cân nhắc kỹ, nhiều bên duyệt.
- **expected:** [B19, B08, B10, B13, B07, B12]  *(demo, ROI, case study, bảo mật, so sánh, số liệu)*
- **Mong đợi:** top nghiêng về **enterprise/trust** (B08/B10/B13/B12). B06 pricing đại
  chúng **không** nên top.

**TC-A2 · CÙNG SaaS HRM — nhưng bán cho SMB/STARTUP (founder tự mua).**
- objective: conversion (self-serve) · tone: friendly, clean
- brand_positioning: "HRM gọn nhẹ cho startup, dùng được trong 1 ngày, giá minh bạch"
- key_messages: ["miễn phí 14 ngày", "cài đặt 10 phút", "giá theo đầu người", "không cần IT"]
- **persona:** *Anh Khoa, 29, founder startup 15 người, Hà Nội.* Pain: không có HR
  chuyên trách, ngân sách hẹp. Motivation: rẻ, nhanh, tự làm. Objection: "phức tạp,
  đắt". Kênh: Google search, cộng đồng startup. Giai đoạn: tự quyết, nhanh.
- **expected:** [B02, B06, B05, B04, B09]  *(hero CTA, pricing, how-it-works, feature, testimonial)*
- **Mong đợi:** **B06 pricing + B05 how_it_works lên cao**; B13/B10/B08 (enterprise)
  **xuống thấp**. So A1 vs A2 phải **khác rõ rệt** dù cùng product.

### NHÓM B — Full-funnel theo ngành (brief giàu + persona)

**TC-B1 · Ecommerce thời trang — Flash sale (conversion/urgency).**
- brand: ZARO · industry: ecommerce/fashion · objective: conversion
- key_messages: ["sale 50% 3 ngày", "freeship", "mẫu mới", "số lượng có hạn"] · tone: energetic
- **persona:** *Linh, 24, nữ nhân viên văn phòng, thu nhập 12tr, mua sắm qua điện thoại
  buổi tối, nhạy giá, thích bắt trend, FOMO mạnh.*
- **expected:** [B14, B15, B16, B09, B01]  *(countdown, bundle, gallery, testimonial)*

**TC-B2 · Fintech đầu tư — App tích luỹ (lead_gen/trust).**
- brand: SafeInvest · industry: fintech · objective: conversion(app)+trust
- key_messages: ["lợi suất 7%/năm", "được cấp phép", "rút bất cứ lúc nào", "bảo hiểm tiền gửi"] · tone: serious, reassuring
- **persona:** *Anh Tuấn, 33, kỹ sư, thu nhập khá, muốn đầu tư an toàn, sợ lừa đảo/mất
  tiền, cần bằng chứng pháp lý + minh bạch trước khi nạp tiền.*
- **expected:** [B13, B12, B09, B24, B20]  *(bảo mật/pháp lý, số liệu, testimonial, tải app, FAQ)*
- **Mong đợi:** **B13 security_compliance** phải top (niềm tin là rào cản chính). Nếu
  B14 countdown lên top ⇒ engine sai ngữ cảnh (đầu tư ≠ flash sale).

**TC-B3 · Bất động sản — Mở bán dự án (lead_gen, local).**
- brand: GreenView · industry: real_estate · objective: lead_gen
- key_messages: ["căn hộ ven sông", "chính sách trả góp 0%", "vị trí trung tâm", "nhận giữ chỗ"] · tone: premium, trustworthy
- **persona:** *Vợ chồng anh Nam (38) – chị Hà (35), 2 con, thu nhập 60tr/tháng, mua
  nhà ở thực, quan tâm vị trí/tiện ích/pháp lý, cần xem mặt bằng + tư vấn trực tiếp.*
- **expected:** [B18, B21, B16, B09, B12, B20]  *(lead form, map, gallery, testimonial, số liệu, FAQ)*

**TC-B4 · Giáo dục — Khoá học online (lead_gen/consideration).**
- brand: EduPro · industry: education · objective: lead_gen
- key_messages: ["học mọi lúc", "chứng chỉ", "giảng viên thực chiến", "học thử miễn phí"] · tone: friendly, helpful
- **persona:** *Trang, 27, đi làm 3 năm muốn chuyển ngành sang data, ngân sách tự bỏ,
  bận rộn, cần lộ trình rõ + bằng chứng học viên ra nghề.*
- **expected:** [B05, B18, B09, B10, B20, B22]  *(how-it-works/lộ trình, lead form, testimonial, case study, FAQ, newsletter)*

**TC-B5 · NGO — Chiến dịch quyên góp (conversion, cảm xúc).**
- brand: HopeVN · industry: ngo · objective: conversion(donation)
- key_messages: ["1 bữa ăn = 15k", "minh bạch dòng tiền", "100% đến tay trẻ em"] · tone: emotional
- **persona:** *Cô Mai, 50, có thu nhập ổn định, hay làm từ thiện, quan tâm minh bạch
  & tác động thật, dễ xúc động trước câu chuyện cụ thể.*
- **expected:** [B23, B01, B12, B09, B22]  *(donation CTA, hero cảm xúc, số liệu tác động, chứng thực, newsletter)*

### NHÓM C — Tone/thẩm mỹ & phân khúc cao cấp

**TC-C1 · Thời trang xa xỉ — BST mới (awareness, premium).**
- brand: MAISON · industry: fashion/luxury · objective: awareness
- key_messages: ["thủ công", "phiên bản giới hạn", "di sản"] · tone: premium, cinematic
- **persona:** *Chị Vy, 40, doanh nhân, thu nhập rất cao, coi trọng đẳng cấp/độc bản,
  ghét cảm giác "sale rẻ tiền", mua theo cảm xúc thương hiệu.*
- **expected:** [B17, B03, B01, B09]  *(lookbook editorial, hero video, hero)*
- **Mong đợi:** **B17/B03 (premium/cinematic, affluent) top**; B14 countdown/B06
  pricing/B15 bundle **không xuất hiện** (sai tone + sai phân khúc) — test tone+audience.

### NHÓM D — Robustness / negative / đa ngôn ngữ

**TC-D1 · Brief nghèo.** chỉ brand_name + industry=education, không key_messages, không
persona. **Mong đợi:** score thấp/đều, không crash/NaN.

**TC-D2 · No-match.** industry="nông nghiệp công nghệ cao", objective="tuyển dụng kỹ
sư". **expected:** []. **Mong đợi:** HitRate=0, **MRR=0** (không chia 0). *Fixture bắt buộc.*

**TC-D3 · Đa ngôn ngữ.** Brief TC-A2 tiếng Việt + `embedding_text` block tiếng Anh.
**Mong đợi:** không sụp; nếu cosine tụt mạnh ⇒ sai model (review §4.1).

**TC-D4 · Persona mâu thuẫn key_messages (bẫy).** product cao cấp nhưng persona = sinh
viên ngân sách thấp + key_messages "giá rẻ". **Mong đợi:** quan sát engine ưu tiên
tín hiệu nào (tone premium vs persona giá rẻ) — dùng để chỉnh trọng số.

### NHÓM E — Metric biên (validate §5)

**TC-E1 · |E|>K.** TC-A1, K=3, expected 6 block → Recall@3 trần = 3/6=0.5.
**TC-E2 · |E|<K.** expected=[B23], K=5 → Precision@5 tối đa 0.2 (xem thêm Precision@|E|=1).
**TC-E3 · Worked example (tính tay, unit test cố định).** R=[B05,B07,B01,B02,B08],
E={B02,B07,B09}, K=5 → Precision=0.40, Recall=0.667, HitRate=1, MRR=0.50, NDCG≈0.498.

### NHÓM F — Active-learning (§4.4b)

**TC-F1 · Block đúng ngoài expected.** TC-B4 (khoá học) đề xuất B24 (app_download — nếu
có app học) hoặc B22 (newsletter) ngoài expected → chấm "Đúng" → "Cập nhật đáp án" →
expected mở rộng → chạy lại Recall tăng. **Lưu ý §3.4 review:** golden set tách riêng
để so version công bằng.

---

## 3. Bảng tổng "cần pass"

| TC | Mục tiêu | Then chốt |
|---|---|---|
| **A1 vs A2** | persona enterprise vs SMB (cùng product) | kết quả **khác rõ**; A1→trust/ROI, A2→pricing/how-it-works |
| B1 | flash sale | countdown/bundle top |
| B2 | fintech trust | security_compliance top; KHÔNG countdown |
| B3 | BĐS local lead | lead_form + map top |
| B4 | khoá học | how-it-works + lead_form + case_study |
| B5 | NGO cảm xúc | donation + hero cảm xúc + impact stats |
| C1 | luxury tone+audience | lookbook/video; KHÔNG sale/pricing |
| D1 | brief nghèo | không crash |
| D2 | no-match | HitRate=0, MRR=0 |
| D3 | đa ngôn ngữ | không sụp |
| D4 | persona mâu thuẫn | quan sát trọng số |
| E1/E2 | metric biên | trần Recall/Precision đúng |
| E3 | tính tay | 0.40/0.667/1/0.50/0.498 |
| F1 | active-learning | expected cập nhật, recall tăng |

---

## 4. Lưu ý khi đo (nhắc lại từ review)
- **Persona phải vào embed** (spec-gap đầu file) — nếu không, nhóm A/C/D4 vô nghĩa.
- **Cân nhắc field `audience_fit[]`** trên block để có tín hiệu cứng cho persona
  (enterprise vs consumer…), cộng vào công thức điểm (review §4.2).
- **Golden set cố định** cho A1/A2/B*/C1 để theo dõi "độ chính xác tổng thể" qua
  các phiên bản engine; vòng active-learning (F1) để tách riêng.
- D2/E3 là **fixture bắt buộc** cho unit test metric.

## 5. Gợi ý chạy
Import block library §1 + 14 brief §2 → chạy K=5 (E-cases theo tham số riêng) → ghi
metric → D3/E3 làm test cố định → A1 vs A2 là **chỉ báo chính** xem engine có thật sự
"hiểu" chân dung khách hàng hay chỉ match từ khoá ngành.
