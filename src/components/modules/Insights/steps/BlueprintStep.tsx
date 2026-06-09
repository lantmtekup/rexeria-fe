'use client';

import type { InsightReport } from '@/services/rexer/types';

/**
 * Placeholder — màn blueprint (4 section + assumptions + handoff, xử lý case
 * failed) sẽ được dựng đầy đủ ở Task 7. Prop contract dưới đây là contract
 * cuối cùng để `InsightsWizard` ổn định; Task 7 chỉ thay phần thân.
 */
export interface BlueprintStepProps {
  report: InsightReport | null;
  onRestart: () => void;
}

export function BlueprintStep(props: BlueprintStepProps) {
  void props;
  return null;
}
