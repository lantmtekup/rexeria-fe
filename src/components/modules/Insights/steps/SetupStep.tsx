'use client';

import type { CreateInsightReportBody } from '@/services/rexer/types';

/**
 * Placeholder — màn setup (chọn workspace/product/campaign, prefill context,
 * điền field chiến lược còn thiếu) sẽ được dựng đầy đủ ở Task 5. Prop contract
 * dưới đây là contract cuối cùng để `InsightsWizard` ổn định; Task 5 chỉ thay
 * phần thân.
 */
export interface SetupStepProps {
  submitting: boolean;
  onRun: (body: CreateInsightReportBody) => void;
  brandLocked: boolean;
}

export function SetupStep(props: SetupStepProps) {
  void props;
  return null;
}
