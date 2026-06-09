'use client';

import { useEffect } from 'react';
import { useInsightReport } from '@/services/rexer/use-rexer';
import { useInsightsFlow } from './useInsightsFlow';
import { SetupStep } from './steps/SetupStep';
import { GeneratingStep } from './steps/GeneratingStep';
import { BlueprintStep } from './steps/BlueprintStep';

/**
 * Container điều phối wizard AI-Insights (form/wizard có cấu trúc, KHÔNG chatbot).
 * Render phase hiện tại và tự chuyển sang `blueprint` khi report đạt terminal.
 *
 * - `brandLocked=true` (portal): brand khoá theo active workspace.
 * - `brandLocked=false` (admin): màn setup phải cho chọn brand tường minh.
 *
 * Chỉ poll khi đang ở phase `generating` (truyền `null` cho `useInsightReport`
 * để tạm dừng ở các phase khác → hook tự dọn timer).
 */
export function InsightsWizard({
  brandLocked = true,
}: {
  brandLocked?: boolean;
}) {
  const flow = useInsightsFlow();
  const { report } = useInsightReport(
    flow.phase === 'generating' ? flow.reportId : null
  );

  // Khi report về terminal (succeeded|failed) thì sang màn blueprint.
  useEffect(() => {
    if (report?.status === 'succeeded' || report?.status === 'failed') {
      flow.setPhase('blueprint');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.status]);

  if (flow.phase === 'setup') {
    return (
      <SetupStep
        submitting={flow.submitting}
        onRun={flow.run}
        brandLocked={brandLocked}
      />
    );
  }

  if (flow.phase === 'generating') {
    return <GeneratingStep report={report} />;
  }

  return <BlueprintStep report={report} onRestart={flow.reset} />;
}
