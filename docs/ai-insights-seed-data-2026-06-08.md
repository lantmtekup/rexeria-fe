# AI-INSIGHTS — Seed data (3 JSON import) — 2026-06-08

Gồm 3 file để import/chạy test. Copy mỗi block ```json vào đúng file:
1. `block_library.json` — thư viện block (24, có `embedding_text`, `audience_fit`).
2. `brand_briefs.json` — brief + **customer_segments (persona đầy đủ)** + đáp án.
3. `test_expectations.json` — kỳ vọng QA để đối chiếu (đáp án, K, metric tính tay).

> Lưu ý cho AI: chuỗi embed brief PHẢI gồm `customer_segments` (xem review §spec-gap),
> nếu không các case persona (A1 vs A2, C1, D4) sẽ không phân biệt được.

---

## 1. `block_library.json`

```json
{
  "version": "1.0",
  "embedding_model": "text-embedding-3-small",
  "blocks": [
    { "id": "B01", "type": "hero_overlay", "name": "Hero Overlay", "description": "Hero ảnh nền lớn + tiêu đề mạnh", "style_tags": ["bold", "fullscreen"], "tone": ["bold", "elegant"], "industry_fit": ["all"], "goal_fit": ["awareness"], "audience_fit": ["all"], "best_for": "Gây ấn tượng đầu trang cho mọi ngành", "content_schema": { "tag": "text", "title": "text", "subtitle": "text", "cta_text": "text", "cta_link": "url", "background_url": "image" }, "embedding_text": "Hero ảnh nền toàn màn hình với tiêu đề lớn mạnh mẽ, tạo ấn tượng thị giác ngay đầu trang, dùng cho nhận diện thương hiệu mọi ngành." },
    { "id": "B02", "type": "hero_split", "name": "Hero Split", "description": "Hero 2 cột pitch + CTA + ảnh", "style_tags": ["clean", "two-column"], "tone": ["clean", "professional"], "industry_fit": ["saas", "tech", "b2b"], "goal_fit": ["conversion"], "audience_fit": ["smb", "enterprise"], "best_for": "Pitch sản phẩm hướng chuyển đổi", "content_schema": { "eyebrow": "text", "title": "text", "description": "text", "image_url": "image", "cta_text": "text", "cta_link": "url" }, "embedding_text": "Hero hai cột: tiêu đề pitch sản phẩm phần mềm bên trái và ảnh minh hoạ bên phải, kèm nút kêu gọi dùng thử hoặc mua, tối ưu chuyển đổi cho SaaS/B2B." },
    { "id": "B03", "type": "hero_video", "name": "Hero Video", "description": "Hero video kể chuyện thương hiệu", "style_tags": ["cinematic", "video"], "tone": ["cinematic", "premium"], "industry_fit": ["fashion", "lifestyle", "entertainment"], "goal_fit": ["awareness"], "audience_fit": ["consumer", "affluent"], "best_for": "Storytelling thương hiệu cao cấp", "content_schema": { "video_url": "video", "title": "text", "subtitle": "text" }, "embedding_text": "Hero nền video điện ảnh kể câu chuyện thương hiệu, cảm xúc và thẩm mỹ cao cấp, phù hợp thời trang, lifestyle, giải trí cho khách hàng tinh tế." },
    { "id": "B04", "type": "feature_grid", "name": "Feature Grid", "description": "Lưới tính năng/lợi ích", "style_tags": ["grid", "clean"], "tone": ["clean"], "industry_fit": ["saas", "tech"], "goal_fit": ["awareness", "consideration"], "audience_fit": ["smb", "enterprise"], "best_for": "Giải thích tính năng sản phẩm", "content_schema": { "eyebrow": "text", "title": "text", "features": "list" }, "embedding_text": "Lưới 3-6 ô tính năng/lợi ích sản phẩm với icon và mô tả ngắn, giúp người dùng hiểu giá trị sản phẩm phần mềm." },
    { "id": "B05", "type": "how_it_works", "name": "How It Works", "description": "3-4 bước sử dụng", "style_tags": ["steps", "numbered"], "tone": ["helpful"], "industry_fit": ["saas", "services", "education"], "goal_fit": ["consideration"], "audience_fit": ["consumer", "smb"], "best_for": "Gỡ rối quy trình, giảm e ngại", "content_schema": { "title": "text", "steps": "list" }, "embedding_text": "Các bước 1-2-3 hướng dẫn cách bắt đầu và sử dụng sản phẩm/khoá học một cách đơn giản, giảm e ngại cho người mới." },
    { "id": "B06", "type": "pricing_table", "name": "Pricing Table", "description": "Bảng giá nhiều gói + nút mua", "style_tags": ["table", "tiers"], "tone": ["clear"], "industry_fit": ["saas", "ecommerce"], "goal_fit": ["conversion"], "audience_fit": ["smb", "consumer"], "best_for": "Chốt đơn self-serve", "content_schema": { "title": "text", "plans": "list" }, "embedding_text": "Bảng giá minh bạch nhiều gói theo đầu người với nút mua/dùng thử, dành cho khách tự quyết, giá cả rõ ràng." },
    { "id": "B07", "type": "comparison_table", "name": "Comparison Table", "description": "So sánh gói/đối thủ", "style_tags": ["table", "matrix"], "tone": ["analytical"], "industry_fit": ["saas", "b2b"], "goal_fit": ["consideration", "conversion"], "audience_fit": ["enterprise"], "best_for": "Người cân nhắc kỹ, nhiều bên duyệt", "content_schema": { "title": "text", "rows": "list", "columns": "list" }, "embedding_text": "Bảng so sánh chi tiết các gói hoặc so với đối thủ theo từng tiêu chí, dành cho doanh nghiệp cân nhắc kỹ trước khi mua." },
    { "id": "B08", "type": "roi_calculator", "name": "ROI Calculator", "description": "Máy tính ROI/tiết kiệm", "style_tags": ["interactive", "calculator"], "tone": ["analytical"], "industry_fit": ["b2b", "saas", "finance"], "goal_fit": ["conversion"], "audience_fit": ["enterprise"], "best_for": "Chứng minh hiệu quả tài chính", "content_schema": { "title": "text", "inputs": "list", "formula": "text" }, "embedding_text": "Công cụ tương tác cho người dùng nhập số liệu để tính ROI, chi phí tiết kiệm hoặc lợi nhuận, thuyết phục người ra quyết định tài chính doanh nghiệp." },
    { "id": "B09", "type": "testimonial", "name": "Testimonial", "description": "Lời chứng thực khách hàng", "style_tags": ["quote", "social-proof"], "tone": ["warm"], "industry_fit": ["all"], "goal_fit": ["trust", "conversion"], "audience_fit": ["all"], "best_for": "Tăng tin tưởng", "content_schema": { "quotes": "list" }, "embedding_text": "Trích dẫn lời khen và đánh giá của khách hàng thật kèm tên và ảnh, tăng độ tin cậy và bằng chứng xã hội." },
    { "id": "B10", "type": "case_study", "name": "Case Study", "description": "Case study kết quả đo được", "style_tags": ["story", "metrics"], "tone": ["authoritative"], "industry_fit": ["b2b", "saas"], "goal_fit": ["trust", "consideration"], "audience_fit": ["enterprise"], "best_for": "Bằng chứng kết quả cho B2B", "content_schema": { "client": "text", "challenge": "text", "result": "text", "metrics": "list" }, "embedding_text": "Câu chuyện khách hàng doanh nghiệp với bối cảnh, giải pháp và kết quả định lượng cụ thể, thuyết phục bằng bằng chứng thực tế." },
    { "id": "B11", "type": "logo_wall", "name": "Logo Wall", "description": "Dải logo khách hàng/đối tác", "style_tags": ["logos", "minimal"], "tone": ["minimal"], "industry_fit": ["b2b", "saas"], "goal_fit": ["trust"], "audience_fit": ["enterprise"], "best_for": "Uy tín qua khách hàng lớn", "content_schema": { "logos": "list" }, "embedding_text": "Dải logo các khách hàng và đối tác lớn đang tin dùng, tạo uy tín nhanh cho doanh nghiệp B2B/SaaS." },
    { "id": "B12", "type": "stats_band", "name": "Stats Band", "description": "Dải số liệu uy tín/tăng trưởng", "style_tags": ["numbers", "metrics"], "tone": ["authoritative"], "industry_fit": ["b2b", "finance", "saas"], "goal_fit": ["trust"], "audience_fit": ["enterprise"], "best_for": "Chứng minh quy mô/tăng trưởng", "content_schema": { "stats": "list" }, "embedding_text": "Dải các con số ấn tượng như số khách hàng, tăng trưởng, tỉ lệ hài lòng, củng cố uy tín và quy mô." },
    { "id": "B13", "type": "security_compliance", "name": "Security & Compliance", "description": "Bảo mật, chứng chỉ, tuân thủ", "style_tags": ["badges", "trust"], "tone": ["serious"], "industry_fit": ["fintech", "healthcare", "saas"], "goal_fit": ["trust"], "audience_fit": ["enterprise"], "best_for": "Gỡ rào cản niềm tin về an toàn dữ liệu/tiền", "content_schema": { "title": "text", "certifications": "list", "points": "list" }, "embedding_text": "Phần trình bày bảo mật, chứng chỉ tuân thủ như SOC2, ISO, PCI, được cấp phép, bảo hiểm tiền gửi, gỡ lo ngại về an toàn dữ liệu và tài chính." },
    { "id": "B14", "type": "countdown_cta", "name": "Countdown CTA", "description": "Đếm ngược + CTA flash sale", "style_tags": ["timer", "urgent"], "tone": ["energetic", "urgent"], "industry_fit": ["ecommerce", "retail", "f&b"], "goal_fit": ["conversion", "urgency"], "audience_fit": ["consumer"], "best_for": "Tạo cảm giác gấp gáp, FOMO", "content_schema": { "title": "text", "deadline": "datetime", "cta_text": "text", "cta_link": "url" }, "embedding_text": "Đồng hồ đếm ngược thời gian khuyến mãi kèm nút mua ngay, tạo cảm giác gấp gáp và FOMO cho flash sale thương mại điện tử." },
    { "id": "B15", "type": "bundle_offer", "name": "Bundle Offer", "description": "Combo/bundle giảm giá", "style_tags": ["offer", "pricing"], "tone": ["energetic"], "industry_fit": ["ecommerce", "f&b"], "goal_fit": ["conversion"], "audience_fit": ["consumer"], "best_for": "Tăng giá trị đơn hàng", "content_schema": { "title": "text", "items": "list", "old_price": "number", "new_price": "number" }, "embedding_text": "Gói combo nhiều sản phẩm với giá ưu đãi gộp, kích thích mua thêm, tăng giá trị đơn hàng cho bán lẻ và F&B." },
    { "id": "B16", "type": "product_gallery", "name": "Product Gallery", "description": "Lưới ảnh sản phẩm", "style_tags": ["grid", "visual"], "tone": ["visual"], "industry_fit": ["ecommerce", "fashion"], "goal_fit": ["consideration"], "audience_fit": ["consumer"], "best_for": "Khoe sản phẩm bằng hình", "content_schema": { "items": "list" }, "embedding_text": "Lưới ảnh sản phẩm hoặc bộ sưu tập với giá và tên, giúp khách xem và cân nhắc sản phẩm thời trang/thương mại điện tử." },
    { "id": "B17", "type": "lookbook_editorial", "name": "Lookbook Editorial", "description": "Lookbook biên tập thẩm mỹ cao", "style_tags": ["editorial", "premium"], "tone": ["premium", "cinematic"], "industry_fit": ["fashion", "luxury"], "goal_fit": ["awareness"], "audience_fit": ["affluent"], "best_for": "Thương hiệu xa xỉ, nhận diện", "content_schema": { "spreads": "list" }, "embedding_text": "Lookbook kiểu tạp chí biên tập với bố cục thẩm mỹ cao cấp, kể câu chuyện bộ sưu tập thời trang xa xỉ cho khách hàng giàu có." },
    { "id": "B18", "type": "lead_form", "name": "Lead Form", "description": "Form thu lead", "style_tags": ["form"], "tone": ["professional"], "industry_fit": ["b2b", "services", "education", "real_estate"], "goal_fit": ["lead_gen"], "audience_fit": ["all"], "best_for": "Thu thông tin tư vấn/đăng ký", "content_schema": { "title": "text", "fields": "list", "submit_text": "text" }, "embedding_text": "Biểu mẫu thu thập thông tin khách hàng tiềm năng để tư vấn, đăng ký, nhận tài liệu hoặc giữ chỗ." },
    { "id": "B19", "type": "demo_request", "name": "Demo Request", "description": "Đặt lịch demo với sales", "style_tags": ["form", "scheduling"], "tone": ["professional"], "industry_fit": ["saas", "b2b"], "goal_fit": ["lead_gen"], "audience_fit": ["enterprise"], "best_for": "Sales-led cho doanh nghiệp", "content_schema": { "title": "text", "fields": "list" }, "embedding_text": "Biểu mẫu đặt lịch demo trực tiếp với đội sales cho khách doanh nghiệp, quy trình bán hàng sales-led của SaaS/B2B." },
    { "id": "B20", "type": "faq", "name": "FAQ", "description": "Câu hỏi thường gặp", "style_tags": ["accordion"], "tone": ["helpful"], "industry_fit": ["all"], "goal_fit": ["consideration"], "audience_fit": ["all"], "best_for": "Gỡ băn khoăn trước quyết định", "content_schema": { "items": "list" }, "embedding_text": "Danh sách câu hỏi thường gặp dạng accordion, giải đáp băn khoăn và phản đối phổ biến trước khi khách quyết định." },
    { "id": "B21", "type": "map_location", "name": "Map & Location", "description": "Bản đồ/chi nhánh/giờ mở cửa", "style_tags": ["map", "local"], "tone": ["practical"], "industry_fit": ["f&b", "retail", "real_estate", "healthcare"], "goal_fit": ["consideration"], "audience_fit": ["local"], "best_for": "Doanh nghiệp có địa điểm vật lý", "content_schema": { "address": "text", "map_embed": "text", "hours": "text" }, "embedding_text": "Bản đồ vị trí, địa chỉ chi nhánh và giờ mở cửa, dành cho doanh nghiệp có cửa hàng/dự án vật lý phục vụ khách địa phương." },
    { "id": "B22", "type": "newsletter_signup", "name": "Newsletter Signup", "description": "Đăng ký nhận tin", "style_tags": ["form", "inline"], "tone": ["friendly"], "industry_fit": ["all"], "goal_fit": ["retention", "lead_gen"], "audience_fit": ["consumer"], "best_for": "Nuôi dưỡng/giữ chân", "content_schema": { "title": "text", "placeholder": "text" }, "embedding_text": "Ô đăng ký email nhận bản tin và ưu đãi, dùng để nuôi dưỡng lead và giữ chân khách hàng." },
    { "id": "B23", "type": "donation_cta", "name": "Donation CTA", "description": "Kêu gọi quyên góp", "style_tags": ["emotional", "cta"], "tone": ["emotional"], "industry_fit": ["ngo", "nonprofit"], "goal_fit": ["conversion"], "audience_fit": ["donor"], "best_for": "Chiến dịch gây quỹ", "content_schema": { "title": "text", "impact_text": "text", "amounts": "list", "cta_text": "text" }, "embedding_text": "Lời kêu gọi quyên góp giàu cảm xúc với mức đóng góp gợi ý và tác động cụ thể, dành cho tổ chức phi lợi nhuận gây quỹ." },
    { "id": "B24", "type": "app_download", "name": "App Download", "description": "Tải app", "style_tags": ["badges", "mobile"], "tone": ["energetic"], "industry_fit": ["mobile", "consumer_app"], "goal_fit": ["conversion"], "audience_fit": ["consumer"], "best_for": "Chuyển đổi tải ứng dụng", "content_schema": { "title": "text", "app_store_url": "url", "play_store_url": "url", "screenshot_url": "image" }, "embedding_text": "Khối kêu gọi tải ứng dụng với nút App Store và Google Play kèm ảnh màn hình app, chuyển đổi cài đặt cho ứng dụng di động." }
  ]
}
```

---

## 2. `brand_briefs.json`

```json
{
  "version": "1.0",
  "briefs": [
    {
      "id": "BR-A1",
      "brand_name": "TalentX",
      "industry": "saas",
      "product": "Phần mềm quản lý nhân sự & chấm công cấp doanh nghiệp",
      "campaign_objective": "conversion",
      "brand_positioning": "Nền tảng HRM cấp doanh nghiệp, bảo mật cao, tích hợp ERP",
      "key_messages": ["Giảm 30% thời gian vận hành HR", "Tuân thủ luật lao động & kiểm toán", "Tích hợp SAP/Oracle", "Bảo mật dữ liệu nhân sự"],
      "tone": ["professional", "authoritative"],
      "assets": ["logo", "product_screenshots", "case_study_pdf"],
      "customer_segments": [
        { "name": "Bà Hương", "age": 45, "gender": "nữ", "role": "Giám đốc Tài chính (CFO)", "company_size": "2000 nhân sự", "income": "rất cao", "location": "TP.HCM", "pain_points": ["chi phí vận hành HR cao", "rủi ro tuân thủ & kiểm toán", "dữ liệu phân mảnh"], "motivations": ["ROI rõ ràng", "an toàn dữ liệu", "tích hợp hệ thống sẵn có"], "objections": ["chuyển đổi rủi ro", "tích hợp hệ thống cũ phức tạp"], "channels": ["giới thiệu", "hội thảo ngành", "email sales"], "funnel_stage": "evaluation (nhiều bên duyệt)" }
      ],
      "expected_blocks_hint": ["B19", "B08", "B10", "B13", "B07", "B12"]
    },
    {
      "id": "BR-A2",
      "brand_name": "TalentX",
      "industry": "saas",
      "product": "Phần mềm quản lý nhân sự & chấm công (bản cho startup)",
      "campaign_objective": "conversion",
      "brand_positioning": "HRM gọn nhẹ cho startup, dùng được trong 1 ngày, giá minh bạch",
      "key_messages": ["Miễn phí 14 ngày", "Cài đặt 10 phút", "Giá theo đầu người", "Không cần IT"],
      "tone": ["friendly", "clean"],
      "assets": ["logo", "product_screenshots"],
      "customer_segments": [
        { "name": "Anh Khoa", "age": 29, "gender": "nam", "role": "Founder startup", "company_size": "15 người", "income": "trung bình", "location": "Hà Nội", "pain_points": ["không có HR chuyên trách", "ngân sách hẹp", "ngại công cụ phức tạp"], "motivations": ["rẻ", "nhanh", "tự làm được"], "objections": ["phức tạp", "đắt", "tốn thời gian setup"], "channels": ["Google search", "cộng đồng startup", "review"], "funnel_stage": "tự quyết, nhanh" }
      ],
      "expected_blocks_hint": ["B02", "B06", "B05", "B04", "B09"]
    },
    {
      "id": "BR-B1",
      "brand_name": "ZARO",
      "industry": "fashion",
      "product": "Thời trang nữ công sở",
      "campaign_objective": "conversion",
      "brand_positioning": "Thời trang trẻ trung, hợp xu hướng, giá tốt",
      "key_messages": ["Sale 50% 3 ngày", "Freeship", "Bộ sưu tập mới", "Số lượng có hạn"],
      "tone": ["energetic"],
      "assets": ["product_photos", "sale_banner"],
      "customer_segments": [
        { "name": "Linh", "age": 24, "gender": "nữ", "role": "Nhân viên văn phòng", "income": "12 triệu/tháng", "location": "Đà Nẵng", "pain_points": ["ngân sách hạn chế", "sợ bỏ lỡ deal"], "motivations": ["giá tốt", "bắt trend", "freeship"], "objections": ["chất lượng có xứng giá?"], "channels": ["mobile", "Instagram", "TikTok"], "funnel_stage": "mua ngẫu hứng buổi tối" }
      ],
      "expected_blocks_hint": ["B14", "B15", "B16", "B09", "B01"]
    },
    {
      "id": "BR-B2",
      "brand_name": "SafeInvest",
      "industry": "fintech",
      "product": "App đầu tư tích luỹ",
      "campaign_objective": "conversion",
      "brand_positioning": "Đầu tư an toàn, minh bạch, được cấp phép",
      "key_messages": ["Lợi suất 7%/năm", "Được cấp phép", "Rút bất cứ lúc nào", "Bảo hiểm tiền gửi"],
      "tone": ["serious", "reassuring"],
      "assets": ["license_docs", "app_screenshots"],
      "customer_segments": [
        { "name": "Anh Tuấn", "age": 33, "gender": "nam", "role": "Kỹ sư phần mềm", "income": "khá", "location": "TP.HCM", "pain_points": ["sợ lừa đảo/mất tiền", "không có thời gian nghiên cứu"], "motivations": ["an toàn", "minh bạch", "tiện lợi"], "objections": ["có lừa đảo không?", "pháp lý rõ ràng?"], "channels": ["Google", "review app", "bạn bè"], "funnel_stage": "cân nhắc kỹ trước khi nạp tiền" }
      ],
      "expected_blocks_hint": ["B13", "B12", "B09", "B24", "B20"]
    },
    {
      "id": "BR-B3",
      "brand_name": "GreenView",
      "industry": "real_estate",
      "product": "Dự án căn hộ ven sông",
      "campaign_objective": "lead_gen",
      "brand_positioning": "Căn hộ ven sông, tiện ích đầy đủ, vị trí trung tâm",
      "key_messages": ["Căn hộ ven sông", "Trả góp 0%", "Vị trí trung tâm", "Nhận giữ chỗ"],
      "tone": ["premium", "trustworthy"],
      "assets": ["renders", "masterplan", "location_map"],
      "customer_segments": [
        { "name": "Anh Nam & chị Hà", "age": "38 & 35", "gender": "cặp đôi", "role": "Gia đình 2 con", "income": "60 triệu/tháng", "location": "TP.HCM", "pain_points": ["chọn vị trí phù hợp", "lo pháp lý dự án", "tài chính trả góp"], "motivations": ["nhà ở thực", "tiện ích cho con", "an toàn pháp lý"], "objections": ["pháp lý rõ chưa?", "vị trí thực tế thế nào?"], "channels": ["Google", "sàn BĐS", "đi xem mặt bằng"], "funnel_stage": "tìm hiểu + xem thực địa" }
      ],
      "expected_blocks_hint": ["B18", "B21", "B16", "B09", "B12", "B20"]
    },
    {
      "id": "BR-B4",
      "brand_name": "EduPro",
      "industry": "education",
      "product": "Khoá học online Data Analyst",
      "campaign_objective": "lead_gen",
      "brand_positioning": "Học thực chiến, lộ trình rõ, hỗ trợ ra nghề",
      "key_messages": ["Học mọi lúc", "Có chứng chỉ", "Giảng viên thực chiến", "Học thử miễn phí"],
      "tone": ["friendly", "helpful"],
      "assets": ["instructor_photos", "curriculum_pdf"],
      "customer_segments": [
        { "name": "Trang", "age": 27, "gender": "nữ", "role": "Nhân viên muốn chuyển ngành sang Data", "income": "tự chi trả", "location": "Hà Nội", "pain_points": ["bận rộn", "không biết bắt đầu từ đâu", "sợ học xong không xin được việc"], "motivations": ["lộ trình rõ ràng", "bằng chứng học viên ra nghề", "linh hoạt thời gian"], "objections": ["học xong có việc không?", "có theo nổi không?"], "channels": ["Facebook", "Google", "review"], "funnel_stage": "cân nhắc, học thử trước" }
      ],
      "expected_blocks_hint": ["B05", "B18", "B09", "B10", "B20", "B22"]
    },
    {
      "id": "BR-B5",
      "brand_name": "HopeVN",
      "industry": "ngo",
      "product": "Chiến dịch bữa ăn cho trẻ em vùng cao",
      "campaign_objective": "conversion",
      "brand_positioning": "Minh bạch, tác động trực tiếp, đáng tin",
      "key_messages": ["1 bữa ăn = 15.000đ", "Minh bạch dòng tiền", "100% đến tay trẻ em"],
      "tone": ["emotional"],
      "assets": ["field_photos", "impact_report"],
      "customer_segments": [
        { "name": "Cô Mai", "age": 50, "gender": "nữ", "role": "Nhà hảo tâm", "income": "ổn định", "location": "TP.HCM", "pain_points": ["lo tiền không đến đúng nơi"], "motivations": ["tạo tác động thật", "minh bạch", "câu chuyện chạm cảm xúc"], "objections": ["tiền có minh bạch không?"], "channels": ["Facebook", "email", "báo chí"], "funnel_stage": "sẵn sàng đóng góp nếu tin tưởng" }
      ],
      "expected_blocks_hint": ["B23", "B01", "B12", "B09", "B22"]
    },
    {
      "id": "BR-C1",
      "brand_name": "MAISON",
      "industry": "luxury",
      "product": "Bộ sưu tập thời trang thu đông",
      "campaign_objective": "awareness",
      "brand_positioning": "Thủ công, phiên bản giới hạn, di sản",
      "key_messages": ["Thủ công tỉ mỉ", "Phiên bản giới hạn", "Di sản thương hiệu"],
      "tone": ["premium", "cinematic"],
      "assets": ["editorial_photos", "brand_film"],
      "customer_segments": [
        { "name": "Chị Vy", "age": 40, "gender": "nữ", "role": "Doanh nhân", "income": "rất cao", "location": "TP.HCM", "pain_points": ["khó tìm sản phẩm đủ đẳng cấp/độc bản"], "motivations": ["đẳng cấp", "độc bản", "câu chuyện thương hiệu"], "objections": ["ghét cảm giác rẻ tiền/đại trà"], "channels": ["Instagram", "tạp chí", "sự kiện"], "funnel_stage": "mua theo cảm xúc thương hiệu" }
      ],
      "expected_blocks_hint": ["B17", "B03", "B01", "B09"]
    },
    {
      "id": "BR-D1",
      "brand_name": "ABC Center",
      "industry": "education",
      "product": "",
      "campaign_objective": "",
      "brand_positioning": "",
      "key_messages": [],
      "tone": [],
      "assets": [],
      "customer_segments": [],
      "expected_blocks_hint": []
    },
    {
      "id": "BR-D2",
      "brand_name": "AgriTech Co",
      "industry": "nông nghiệp công nghệ cao",
      "product": "Tuyển dụng kỹ sư nông nghiệp",
      "campaign_objective": "tuyển dụng",
      "brand_positioning": "Nông nghiệp công nghệ cao",
      "key_messages": ["Tuyển kỹ sư nông nghiệp", "Môi trường hiện đại"],
      "tone": ["professional"],
      "assets": [],
      "customer_segments": [
        { "name": "Ứng viên kỹ sư", "age": 26, "gender": "nam", "role": "Kỹ sư nông nghiệp", "income": "khá", "location": "Lâm Đồng", "pain_points": ["tìm việc đúng chuyên môn"], "motivations": ["môi trường hiện đại", "lương tốt"], "objections": [], "channels": ["job board"], "funnel_stage": "tìm việc" }
      ],
      "expected_blocks_hint": []
    },
    {
      "id": "BR-D4",
      "brand_name": "LuxBudget",
      "industry": "fashion",
      "product": "Đồng hồ thiết kế cao cấp",
      "campaign_objective": "conversion",
      "brand_positioning": "Thiết kế cao cấp, đẳng cấp",
      "key_messages": ["Giá rẻ bất ngờ", "Sale sốc sinh viên", "Phong cách sang chảnh"],
      "tone": ["premium"],
      "assets": ["product_photos"],
      "customer_segments": [
        { "name": "Đức", "age": 20, "gender": "nam", "role": "Sinh viên", "income": "thấp", "location": "Hà Nội", "pain_points": ["muốn trông sang nhưng ít tiền"], "motivations": ["giá rẻ", "trông đẳng cấp"], "objections": ["có thật sự rẻ?"], "channels": ["TikTok", "Shopee"], "funnel_stage": "mua ngẫu hứng" }
      ],
      "expected_blocks_hint": ["B14", "B15", "B16", "B09"]
    }
  ]
}
```

> **BR-D4 là case bẫy** (tone "premium" >< persona sinh viên + key_messages "giá rẻ"):
> dùng để quan sát engine ưu tiên tín hiệu nào; `expected` ở đây thiên về thực tế
> (giá rẻ/sale) — nếu engine ra toàn block luxury thì lệch persona.

---

## 3. `test_expectations.json`

```json
{
  "version": "1.0",
  "default_k": 5,
  "cases": [
    { "id": "TC-A1", "brief_id": "BR-A1", "k": 5, "group": "persona-driven", "objective": "Persona enterprise (CFO): ưu tiên trust/ROI/demo", "expected_blocks": ["B19", "B08", "B10", "B13", "B07", "B12"], "pass_criteria": "Top-5 nghiêng enterprise (>=3 trong B08/B10/B13/B12/B19); B06 KHÔNG top", "expected_metrics": null },
    { "id": "TC-A2", "brief_id": "BR-A2", "k": 5, "group": "persona-driven", "objective": "Persona SMB founder: ưu tiên pricing/how-it-works", "expected_blocks": ["B02", "B06", "B05", "B04", "B09"], "pass_criteria": "B06 & B05 trong top-5; B13/B10/B08 xuống thấp; kết quả KHÁC RÕ so với TC-A1", "expected_metrics": null },
    { "id": "TC-B1", "brief_id": "BR-B1", "k": 5, "group": "funnel", "objective": "Flash sale fashion: urgency", "expected_blocks": ["B14", "B15", "B16", "B09", "B01"], "pass_criteria": "B14 top-2; B04/B06 saas không lọt top", "expected_metrics": null },
    { "id": "TC-B2", "brief_id": "BR-B2", "k": 5, "group": "funnel", "objective": "Fintech: niềm tin là rào cản", "expected_blocks": ["B13", "B12", "B09", "B24", "B20"], "pass_criteria": "B13 top-1/2; B14 countdown KHÔNG top (sai ngữ cảnh)", "expected_metrics": null },
    { "id": "TC-B3", "brief_id": "BR-B3", "k": 5, "group": "funnel", "objective": "BĐS local lead-gen", "expected_blocks": ["B18", "B21", "B16", "B09", "B12", "B20"], "pass_criteria": "B18 + B21 trong top", "expected_metrics": null },
    { "id": "TC-B4", "brief_id": "BR-B4", "k": 5, "group": "funnel", "objective": "Khoá học: lộ trình + lead", "expected_blocks": ["B05", "B18", "B09", "B10", "B20", "B22"], "pass_criteria": "B05 + B18 trong top", "expected_metrics": null },
    { "id": "TC-B5", "brief_id": "BR-B5", "k": 5, "group": "funnel", "objective": "NGO: cảm xúc + minh bạch", "expected_blocks": ["B23", "B01", "B12", "B09", "B22"], "pass_criteria": "B23 top-1; có B12 (impact stats)", "expected_metrics": null },
    { "id": "TC-C1", "brief_id": "BR-C1", "k": 5, "group": "tone-audience", "objective": "Luxury awareness: tone premium + affluent", "expected_blocks": ["B17", "B03", "B01", "B09"], "pass_criteria": "B17/B03 top; B14/B06/B15 KHÔNG xuất hiện", "expected_metrics": null },
    { "id": "TC-D1", "brief_id": "BR-D1", "k": 5, "group": "robustness", "objective": "Brief nghèo → không crash", "expected_blocks": [], "pass_criteria": "Trả kết quả, score hợp lệ 0..1, không NaN", "expected_metrics": null },
    { "id": "TC-D2", "brief_id": "BR-D2", "k": 5, "group": "negative", "objective": "No-match → MRR=0 (không chia 0)", "expected_blocks": [], "pass_criteria": "HitRate=0, MRR=0; mọi score thấp", "expected_metrics": { "precision_at_k": 0, "recall_at_k": 0, "hit_rate": 0, "mrr": 0 } },
    { "id": "TC-D3", "brief_id": "BR-A2", "k": 5, "group": "multilingual", "objective": "Brief VN + block embedding_text EN (nếu test trộn ngôn ngữ)", "expected_blocks": ["B02", "B06", "B05", "B04", "B09"], "pass_criteria": "Kết quả không sụp; nếu cosine tụt mạnh → cảnh báo sai model", "expected_metrics": null },
    { "id": "TC-D4", "brief_id": "BR-D4", "k": 5, "group": "trap", "objective": "Persona >< tone (sinh viên giá rẻ vs tone premium)", "expected_blocks": ["B14", "B15", "B16", "B09"], "pass_criteria": "Quan sát: nếu ra toàn block luxury (B17/B03) → engine bỏ qua persona", "expected_metrics": null },
    { "id": "TC-E1", "brief_id": "BR-A1", "k": 3, "group": "metric-boundary", "objective": "|E|>K: Recall trần", "expected_blocks": ["B19", "B08", "B10", "B13", "B07", "B12"], "pass_criteria": "Recall@3 tối đa = 3/6 = 0.5 dù engine hoàn hảo", "expected_metrics": null },
    { "id": "TC-E2", "brief_id": "BR-B5", "k": 5, "group": "metric-boundary", "objective": "|E|<K: Precision trần", "expected_blocks": ["B23"], "pass_criteria": "Precision@5 tối đa = 1/5 = 0.2; nên xem thêm Precision@|E|=1.0", "expected_metrics": null },
    { "id": "TC-E3", "group": "metric-unit-test", "objective": "Worked example — tính tay, fixture cố định", "k": 5, "fixture": { "ranked_results": ["B05", "B07", "B01", "B02", "B08"], "expected_blocks": ["B02", "B07", "B09"] }, "expected_metrics": { "precision_at_k": 0.40, "recall_at_k": 0.667, "hit_rate": 1, "mrr": 0.50, "ndcg_at_k": 0.498 }, "pass_criteria": "Output engine PHẢI khớp tuyệt đối các con số này" },
    { "id": "TC-F1", "brief_id": "BR-B4", "k": 5, "group": "active-learning", "objective": "Block đúng ngoài expected → chấm Đúng → cập nhật expected → recall tăng", "expected_blocks": ["B05", "B18", "B09", "B10", "B20", "B22"], "pass_criteria": "Nhãn manual lưu; expected cập nhật; (golden set tách riêng để so version)", "expected_metrics": null }
  ]
}
```

---

## 4. Ghi chú import
- `block_library.json` / `brand_briefs.json` import theo §4.1/§4.2 spec (đã thêm
  `audience_fit` trên block + `customer_segments` chi tiết trên brief).
- `test_expectations.json` là **golden để QA đối chiếu** (không phải input engine):
  chạy engine cho từng `brief_id`+`k`, so kết quả với `expected_blocks` + `pass_criteria`.
  Riêng `TC-E3` là unit-test thuần metric (cho thẳng `ranked_results`+`expected_blocks`).
- Khi đổi công thức/engine version → chạy lại toàn bộ, lưu vào `runs`, theo dõi "độ
  chính xác tổng thể"; cố định golden set (A1/A2/B*/C1) tách khỏi active-learning (F1).
