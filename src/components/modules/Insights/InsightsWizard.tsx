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
  // Tách `setPhase` ra biến riêng: setter của useState ổn định giữa các render
  // nên dùng làm dependency được, tránh phải đưa cả object `flow` vào deps.
  const { setPhase } = flow;
  // Giữ `reportId` ở cả phase `generating` lẫn `blueprint`: hook tự dừng poll khi
  // report đạt terminal (không tái lập timer), nên màn blueprint vẫn còn dữ liệu
  // report để render. Chỉ truyền `null` ở `setup` (chưa có report) để hook nghỉ.
  const { report } = useInsightReport(
    flow.phase === 'setup' ? null : flow.reportId
  );

  // Khi report về terminal (succeeded|failed) thì sang màn blueprint.
  useEffect(() => {
    if (report?.status === 'succeeded' || report?.status === 'failed') {
      setPhase('blueprint');
    }
  }, [report?.status, setPhase]);

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
