/**
 * Nhãn + tóm tắt Experience Goal — tách riêng để tránh vòng import giữa
 * _InsightResultPanel (panel) và _InsightStepsDialog (popup).
 */

import type {
  ExperienceGoal,
  InsightBlueprintGoal,
  InsightReport,
} from '@/services/rexer/types';

export const GOAL_LABEL: Record<ExperienceGoal, string> = {
  product_discovery: 'Khám phá sản phẩm',
  interactive_story: 'Câu chuyện tương tác',
  comparison: 'So sánh lựa chọn',
  lead_excitement: 'Tạo lead / hứng khởi',
  brand_storytelling: 'Kể chuyện thương hiệu',
  guided_decision: 'Dẫn dắt quyết định',
};

/**
 * Snapshot nhẹ của kết quả AI lưu trong campaign.notes — để list card +
 * panel hiện ngay không cần poll BE.
 */
export interface InsightSummary {
  status?: string;
  goal?: ExperienceGoal;
  goalLabel?: string;
  journeyName?: string;
  blockCount?: number;
  /** Goal đã sửa tay (BE chưa nhận goal qua blueprint) — lưu trong notes. */
  goalEdit?: InsightBlueprintGoal;
}

export function deriveSummary(report: InsightReport): InsightSummary {
  const bp = report.blueprint;
  const goal = bp?.experience_goal?.primary_goal;
  return {
    status: report.status,
    goal,
    goalLabel: goal ? GOAL_LABEL[goal] : undefined,
    journeyName: bp?.customer_journey?.journey_pattern_name,
    blockCount:
      bp?.recommended_blocks?.blocks_by_stage?.reduce(
        (n, s) => n + s.blocks.length,
        0
      ) ?? undefined,
  };
}
