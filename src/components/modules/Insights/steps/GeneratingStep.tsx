'use client';

import type { InsightReport } from '@/services/rexer/types';

/**
 * Placeholder — màn "đang tạo blueprint" (checklist 5 bước + spinner +
 * skeleton) sẽ được dựng đầy đủ ở Task 6. Prop contract dưới đây là contract
 * cuối cùng để `InsightsWizard` ổn định; Task 6 chỉ thay phần thân.
 */
export interface GeneratingStepProps {
  report: InsightReport | null;
}

export function GeneratingStep(props: GeneratingStepProps) {
  void props;
  return null;
}
