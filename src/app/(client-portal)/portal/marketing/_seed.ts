/**
 * Dữ liệu mẫu Happy City Cà Mau (đồng bộ với HAPPY_CITY_BRIEF của AI-Insights)
 * — để điền nhanh form Marketing khi test. Map sang shape brief Discovery/
 * Concept + campaign preset.
 */

import type { BriefState, CampaignState } from './_steps';

const field = (text: string) => ({ text, extras: [], files: [] });

export const HAPPY_CITY_BRIEF: BriefState = {
  discovery: {
    marketingConcept: field(
      'Khu đô thị kiểu mẫu đầu tiên tại Cà Mau, tiên phong kiến tạo chuẩn sống văn minh, kết nối và bền vững cho thế hệ mới. Tái định vị từ "Happy Home" (nơi bắt đầu cuộc sống) lên "Happy City" (nơi định hình tương lai). Đáng sống, Đáng tin, Đáng tự hào.'
    ),
    messageDevelopment: field(
      'Thông điệp chính: "Happy City: Nơi định hình tương lai". Tông giọng: Sang trọng · Tin cậy · Cảm xúc · Hiện đại. Nhấn mạnh chuẩn sống văn minh cho gia đình đa thế hệ và cam kết "Làm đúng, Làm đủ, Làm đến cùng".'
    ),
    creativeDirection: field(
      'Tông nâu trầm, kem, cam đất (terracotta), phong cách biên tập (editorial) cao cấp; hình ảnh gia đình đa thế hệ ấm áp, ánh sáng tự nhiên.'
    ),
    contentMap: field(
      'Nhận biết: câu chuyện tái định vị Happy Home → Happy City. Cân nhắc: quy hoạch, tiện ích giáo dục nội khu, cộng đồng văn minh. Quyết định: pháp lý minh bạch, tiềm năng tích sản; CTA nhận bảng giá / đặt chỗ.'
    ),
  },
  concept: {
    aboutConcept: field(
      'Khu đô thị kiểu mẫu đầu tiên tại Cà Mau (quy hoạch New CBD mở rộng): hạ tầng & tiện ích đồng bộ, giáo dục nội khu (mầm non, cấp 1, cấp 2), cảnh quan nâng tầm, cộng đồng cư dân chọn lọc. Chuẩn sống văn minh, an toàn, đủ đầy; tài sản bền vững để truyền lại cho thế hệ sau.'
    ),
    targetAudience: field(
      'Nhóm Upper Middle 32-55 tuổi (cán bộ quản lý, chủ doanh nghiệp vừa, người có vốn tích lũy) và nhóm Elite định hình chuẩn sống mới. Nỗi đau: Cà Mau chưa có khu đô thị đủ chuẩn để tự hào ở lại; lo môi trường sống & giáo dục cho con; cần nơi an cư đáng tin về pháp lý để truyền lại.'
    ),
    plan: field(
      'Mục tiêu: Ra mắt · Nhận biết · Thu lead. Bối cảnh: Cà Mau bước vào chu kỳ tăng trưởng mới đến 2030 sau sáp nhập hành chính. Kỳ vọng thị trường: đô thị kiểu mẫu, quy hoạch chỉn chu, cộng đồng văn minh. Kênh ưu tiên mobile-first.'
    ),
  },
};

export const HAPPY_CITY_CAMPAIGN: Partial<CampaignState> = {
  name: 'Happy City Cà Mau - Ra mắt',
  objective: 'awareness',
  channels: ['Facebook', 'Zalo'],
  budget: '300000000',
  currency: 'VND',
};
