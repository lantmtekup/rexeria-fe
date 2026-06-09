'use client';

import { useTranslations } from 'next-intl';
import { Check, Sparkles, X } from 'lucide-react';

import { Spinner } from '@/components/atoms/spinner';
import { Skeleton } from '@/components/atoms/skeleton';
import { StatusDot } from '@/components/atoms/status-dot';
import { cn } from '@/lib/cn';
import type {
  InsightReport,
  InsightStepKey,
  InsightStepStatus,
} from '@/services/rexer/types';
import { AiOrb } from './ui';

/** Thứ tự 5 bước cố định của engine — luôn hiển thị đủ, không phụ thuộc dữ liệu. */
const STEP_ORDER: InsightStepKey[] = [
  'understand_context',
  'classify_goal',
  'recommend_journey',
  'recommend_blocks',
  'recommend_templates',
];

/**
 * Màn "AI đang phân tích": orb AI thở + thanh tiến độ theo số bước hoàn thành +
 * timeline 5 bước (spinner ở bước đang chạy) + skeleton preview của blueprint.
 * Đây là loading state thật cho suốt quá trình inference (polling do
 * `InsightsWizard` điều phối).
 *
 * `report` có thể `null` ở nhịp poll đầu → mặc định mọi bước về `queued` để màn
 * không bao giờ trống.
 */
export interface GeneratingStepProps {
  report: InsightReport | null;
}

/** Render icon trạng thái cho từng bước, tách riêng cho dễ đọc. */
function StepIcon({ status }: { status: InsightStepStatus }) {
  switch (status) {
    case 'succeeded':
      return <Check className='text-success size-4' aria-hidden />;
    case 'running':
      return <Spinner size={16} className='text-primary' />;
    case 'failed':
      return <X className='text-danger size-4' aria-hidden />;
    case 'skipped':
      return <StatusDot tone='warning' />;
    default:
      return <StatusDot tone='neutral' />;
  }
}

export function GeneratingStep({ report }: GeneratingStepProps) {
  const t = useTranslations('insights');

  // Map step_key -> status để tra cứu nhanh; thiếu thì coi như chưa chạy (queued).
  const statusByKey = new Map<InsightStepKey, InsightStepStatus>(
    (report?.steps ?? []).map(step => [step.step_key, step.status])
  );
  const doneCount = STEP_ORDER.filter(
    k => statusByKey.get(k) === 'succeeded'
  ).length;
  const pct = Math.round((doneCount / STEP_ORDER.length) * 100);

  return (
    <div className='space-y-8' aria-busy='true'>
      {/* Hero trạng thái: orb thở + thanh tiến độ */}
      <div className='border-border bg-card flex flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm'>
        <AiOrb
          size={64}
          pulse
          icon={<Sparkles className='size-7' aria-hidden />}
        />
        <div className='space-y-1'>
          <h2 className='text-content-main text-lg font-semibold'>
            {t('generating.heading')}
          </h2>
          <p className='text-content-muted text-sm'>
            {t('generating.subheading')}
          </p>
        </div>
        <div className='w-full max-w-xs space-y-1.5'>
          <div className='bg-muted h-1.5 w-full overflow-hidden rounded-full'>
            <div
              className='h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#60a5fa)] transition-[width] duration-700 ease-out'
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className='text-content-muted text-xs font-medium'>
            {t('generating.progress', {
              done: doneCount,
              total: STEP_ORDER.length,
            })}
          </p>
        </div>
      </div>

      {/* Timeline 5 bước với đường nối */}
      <ol className='space-y-0'>
        {STEP_ORDER.map((key, i) => {
          const status = statusByKey.get(key) ?? 'queued';
          const isDone = status === 'succeeded';
          const isActive = status === 'running';
          const isLast = i === STEP_ORDER.length - 1;

          return (
            <li key={key} className='flex items-stretch gap-3'>
              <div className='flex flex-col items-center'>
                <span
                  className={cn(
                    'bg-card inline-flex size-7 items-center justify-center rounded-full border transition',
                    isDone && 'border-success/30 bg-success-bg',
                    isActive && 'border-primary ring-primary/15 ring-4',
                    !isDone && !isActive && 'border-border'
                  )}
                >
                  <StepIcon status={status} />
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      'my-1 w-px flex-1 transition-colors',
                      isDone ? 'bg-success/40' : 'bg-border'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'pt-1 pb-4 text-sm',
                  isDone && 'text-content-main',
                  isActive && 'text-content-main font-medium',
                  !isDone && !isActive && 'text-content-muted'
                )}
              >
                {t(`generating.steps.${key}`)}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Skeleton preview của blueprint trong lúc engine còn dựng kết quả. */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className='border-border bg-card space-y-3 rounded-2xl border p-4'
          >
            <div className='flex items-center gap-2'>
              <Skeleton className='size-8 rounded-xl' />
              <Skeleton className='h-4 w-1/3' />
            </div>
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-4/5' />
          </div>
        ))}
      </div>
    </div>
  );
}
