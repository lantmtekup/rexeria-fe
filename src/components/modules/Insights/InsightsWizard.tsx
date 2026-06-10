'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { useInsightReport } from '@/services/rexer/use-rexer';
import { useInsightsFlow } from './useInsightsFlow';
import { IntakeWizard } from './intake/IntakeWizard';
import { GeneratingStep } from './steps/GeneratingStep';
import { BlueprintStep } from './steps/BlueprintStep';
import { WizardProgress } from './steps/WizardProgress';
import { AiOrb } from './steps/ui';

/**
 * Container điều phối wizard AI-Insights (form/wizard có cấu trúc, KHÔNG chatbot).
 * Dựng chrome dùng chung (header thương hiệu + orb AI + stepper 3 phase) rồi render
 * phase hiện tại; tự chuyển sang `blueprint` khi report đạt terminal.
 *
 * - `brandLocked=true` (portal): brand khoá theo active workspace.
 * - `brandLocked=false` (admin): màn setup phải cho chọn brand tường minh.
 *
 * Chỉ poll khi đang ở phase `generating`/`blueprint` (truyền `null` cho
 * `useInsightReport` ở `setup` để hook nghỉ → không dựng timer thừa).
 */
export function InsightsWizard({
  brandLocked = true,
}: {
  brandLocked?: boolean;
}) {
  const t = useTranslations('insights');
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

  let content;
  if (flow.phase === 'setup') {
    content = (
      <IntakeWizard
        submitting={flow.submitting}
        onRun={flow.run}
        brandLocked={brandLocked}
      />
    );
  } else if (flow.phase === 'generating') {
    content = <GeneratingStep report={report} />;
  } else {
    content = <BlueprintStep report={report} onRestart={flow.reset} />;
  }

  return (
    <div className='space-y-8'>
      <header className='flex items-center gap-4'>
        <AiOrb size={48} pulse={flow.phase === 'generating'} />
        <div className='min-w-0 space-y-0.5'>
          <h1 className='text-content-main truncate text-2xl font-semibold tracking-tight'>
            {t('title')}
          </h1>
          <p className='text-content-muted text-sm'>{t('subtitle')}</p>
        </div>
      </header>

      <WizardProgress phase={flow.phase} />

      {/* `key` đổi theo phase để re-trigger hiệu ứng xuất hiện mỗi lần chuyển màn. */}
      <div
        key={flow.phase}
        className='animate-in fade-in slide-in-from-bottom-3 duration-500'
      >
        {content}
      </div>
    </div>
  );
}
