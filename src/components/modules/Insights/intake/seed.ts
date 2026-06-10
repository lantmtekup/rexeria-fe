import type { InsightBrief } from '@/services/rexer/types';

/**
 * Brief rỗng — baseline khi muốn bắt đầu trắng.
 */
export const EMPTY_BRIEF: InsightBrief = {
  brand: { tone: [] },
  product: { features: [] },
  objective: { campaign_objectives: [] },
  audience: { pain_points: [], device: 'mobile' },
  market: {},
  assets: { items: [] },
  challenges: [],
};

/**
 * Brief mẫu prefill từ deck "Tái định vị Khu đô thị Happy Home → Happy City
 * Cà Mau" (CIT Group / Flos.Q, 07/2025). Dùng làm dữ liệu khởi tạo cho wizard
 * để user mở lên là có sẵn rồi tự sửa.
 *
 * Các giá trị chip (tone/objective/challenges) khớp đúng hằng số trong logic.ts
 * để hiển thị "đã chọn".
 */
export const HAPPY_CITY_BRIEF: InsightBrief = {
  brand: {
    name: 'Happy City Cà Mau',
    positioning:
      'Khu đô thị kiểu mẫu đầu tiên tại Cà Mau — tiên phong kiến tạo chuẩn sống văn minh, kết nối và bền vững cho thế hệ mới. Tái định vị từ "Happy Home" (nơi bắt đầu cuộc sống) lên "Happy City" (nơi định hình tương lai). Đáng sống – Đáng tin – Đáng tự hào.',
    tone: ['Sang trọng', 'Tin cậy', 'Cảm xúc', 'Hiện đại'],
    visual_identity:
      'Tông nâu trầm – kem – cam đất (terracotta), phong cách biên tập (editorial) cao cấp; hình ảnh gia đình đa thế hệ ấm áp, ánh sáng tự nhiên.',
  },
  product: {
    features: [
      'Khu đô thị kiểu mẫu đầu tiên tại Cà Mau (quy hoạch New CBD mở rộng)',
      'Hạ tầng giao thông & tiện ích đô thị đồng bộ',
      'Tiện ích giáo dục nội khu: mầm non, cấp 1, cấp 2',
      'Cảnh quan – kiến trúc – không gian sống nâng tầm',
      'Cộng đồng cư dân văn minh, chọn lọc',
      'Tiềm năng tăng giá ổn định, giữ giá trị tích sản lâu dài',
    ],
    benefits:
      'Chuẩn sống văn minh, an toàn, đủ đầy cho gia đình đa thế hệ; môi trường tốt để con cái lớn lên; tài sản bền vững để truyền lại cho thế hệ sau.',
    pricing: [
      'Hấp dẫn giá bậc nhất phân khúc BĐS Tây Nam Bộ',
      'Tiềm năng tăng giá ổn định, giữ giá trị tích sản lâu dài',
    ],
    use_cases: [
      'Gia đình an cư đa thế hệ (ở thực)',
      'Nhà đầu tư tích sản dài hạn',
    ],
  },
  objective: {
    campaign_objectives: ['Ra mắt', 'Nhận biết', 'Thu lead'],
  },
  audience: {
    persona:
      'Nhóm Upper Middle — trụ cột đang lên của đô thị mới (cán bộ quản lý, chủ doanh nghiệp quy mô vừa, người có vốn tích lũy); và nhóm Elite định hình chuẩn sống mới.',
    age_range: '32 – 55',
    behaviours:
      'Sự nghiệp ổn định, tư duy tiến bộ & thực dụng; chọn lọc kỹ trong từng quyết định; ưu tiên môi trường sống văn minh cho con cái; cân nhắc cả giá trị an cư lẫn tiềm năng sinh lời.',
    pain_points: [
      'Cà Mau chưa có khu đô thị đủ chuẩn sống văn minh để tự hào ở lại',
      'Lo môi trường sống & giáo dục cho con cái chưa đủ tốt/hiện đại',
      'Khu dân cư hiện hữu tự phát, manh mún, thiếu quy hoạch & tiện ích',
      'Cần nơi an cư đáng tin cậy về pháp lý & chất lượng để truyền lại',
    ],
    motivations:
      'Một không gian sống đáng tin cậy, đáng tự hào, đáng để truyền lại; nâng tầm chất lượng sống ngay trên chính quê hương, không phải ly hương.',
    device: 'mobile',
  },
  market: {
    competitors:
      'Các khu dân cư/khu đô thị tự phát, manh mún hiện hữu tại Cà Mau; dự án BĐS cùng phân khúc khu vực Tây Nam Bộ / ĐBSCL.',
    trends:
      'Cà Mau chuyển mình sau sáp nhập hành chính, bước vào chu kỳ tăng trưởng mới đến 2030; nhu cầu hệ sinh thái sống văn minh, hiện đại, kết nối của tầng lớp trung lưu mới.',
    expectations:
      'Đô thị kiểu mẫu, quy hoạch chỉn chu, cộng đồng văn minh; cam kết "Làm đúng – Làm đủ – Làm đến cùng" (làm trước rồi mới nói).',
  },
  assets: {
    items: [
      'FQ_HH_NGHIEM THU_PL2.pdf (deck tái định vị)',
      'Hình ảnh gia đình đa thế hệ',
      'Phối cảnh quy hoạch & tiện ích nội khu',
    ],
  },
  challenges: ['Giá trị sản phẩm chưa rõ', 'Chu kỳ bán dài'],
};
