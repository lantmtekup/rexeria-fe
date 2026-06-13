/**
 * Nhãn tiếng Việt cho 6 Experience Goal — tách riêng để tránh vòng import
 * giữa _InsightResultPanel (panel) và _InsightStepsDialog (popup).
 */

import type { ExperienceGoal } from '@/services/rexer/types';

export const GOAL_LABEL: Record<ExperienceGoal, string> = {
  product_discovery: 'Khám phá sản phẩm',
  interactive_story: 'Câu chuyện tương tác',
  comparison: 'So sánh lựa chọn',
  lead_excitement: 'Tạo lead / hứng khởi',
  brand_storytelling: 'Kể chuyện thương hiệu',
  guided_decision: 'Dẫn dắt quyết định',
};
