'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { useInsightReport } from '@/services/rexer/use-rexer';
import { useInsightsFlow } from './useInsightsFlow';
import { IntakeWizard } from './intake/IntakeWizard';
import { QuickIntake } from './intake/QuickIntake';
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
 * Màn setup có hai chế độ nhập; `generating` và `blueprint` dùng chung, không
 * đổi gì theo chế độ:
 *
 * - `guided` (mặc định): wizard 10 bước, user tự chốt goal + journey rồi gửi
 *   kèm `selections` → engine skip 2 bước tương ứng.
 * - `quick`: một ô text, engine tự chạy đủ 5 bước. Xem `QuickIntake`.
 *
 * Mặc định là `guided` để người quen luồng cũ không bị hụt; đổi chế độ chỉ
 * cho phép ở `setup` vì sang `generating` là report đã enqueue rồi.
 *
 * Chỉ poll khi đang ở phase `generating`/`blueprint` (truyền `null` cho
 * `useInsightReport` ở `setup` để hook nghỉ → không dựng timer thừa).
 */
export function InsightsWizard({
  brandLocked = true,
  fromReportId,
}: {
  brandLocked?: boolean;
  fromReportId?: string;
}) {
  const t = useTranslations('insights');
  const flow = useInsightsFlow();
  const [mode, setMode] = useState<IntakeMode>('guided');
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
    content =
      mode === 'quick' ? (
        <QuickIntake
          submitting={flow.submitting}
          onRun={flow.run}
          brandLocked={brandLocked}
        />
      ) : (
        <IntakeWizard
          submitting={flow.submitting}
          onRun={flow.run}
          brandLocked={brandLocked}
          fromReportId={fromReportId}
        />
      );
  } else if (flow.phase === 'generating') {
    content = <GeneratingStep report={report} />;
  } else {
    content = <BlueprintStep report={report} onRestart={flow.reset} />;
  }

  return (
    <div className='space-y-8'>
      <header className='flex flex-wrap items-center gap-4'>
        <AiOrb size={48} pulse={flow.phase === 'generating'} />
        <div className='min-w-0 flex-1 space-y-0.5'>
          <h1 className='text-content-main truncate text-2xl font-semibold tracking-tight'>
            {t('title')}
          </h1>
          <p className='text-content-muted text-sm'>{t('subtitle')}</p>
        </div>
        {/* Chỉ đổi được ở `setup`. `fromReportId` khoá về guided vì chế độ
            nhập nhanh không chứa nổi brief có cấu trúc hydrate từ report cũ. */}
        {flow.phase === 'setup' && !fromReportId && (
          <ModeSwitch mode={mode} onChange={setMode} />
        )}
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

type IntakeMode = 'guided' | 'quick';

const MODE_BTN =
  'rounded-pill px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap';

/** Segmented 2 lựa chọn cho màn nhập liệu. */
function ModeSwitch({
  mode,
  onChange,
}: {
  mode: IntakeMode;
  onChange: (m: IntakeMode) => void;
}) {
  const t = useTranslations('insights');
  return (
    <div className='border-border bg-muted flex shrink-0 gap-1 rounded-full border p-1'>
      {(['guided', 'quick'] as const).map(m => (
        <button
          key={m}
          type='button'
          aria-pressed={mode === m}
          onClick={() => onChange(m)}
          className={cn(
            MODE_BTN,
            mode === m
              ? 'bg-background text-content-main shadow-sm'
              : 'text-content-muted hover:text-content-main'
          )}
        >
          {t(`mode.${m}`)}
        </button>
      ))}
    </div>
  );
}
