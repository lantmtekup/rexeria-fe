'use client';

import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';

import { Spinner } from '@/components/atoms/spinner';
import { Skeleton } from '@/components/atoms/skeleton';
import { StatusDot } from '@/components/atoms/status-dot';
import { cn } from '@/lib/cn';
import type {
  InsightReport,
  InsightStepKey,
  InsightStepStatus,
} from '@/services/rexer/types';

/** Thứ tự 5 bước cố định của engine — luôn hiển thị đủ, không phụ thuộc dữ liệu. */
const STEP_ORDER: InsightStepKey[] = [
  'understand_context',
  'classify_goal',
  'recommend_journey',
  'recommend_blocks',
  'recommend_templates',
];

/**
 * Màn "AI đang phân tích": checklist 5 bước trực tiếp + spinner ở bước đang chạy
 * + skeleton preview của blueprint trong lúc dựng. Đây là loading state thật cho
 * suốt quá trình inference (polling do `InsightsWizard` điều phối).
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

  return (
    <div className='space-y-8' aria-busy='true'>
      <header className='flex items-center gap-3'>
        <Spinner size={20} className='text-primary' />
        <h1 className='text-xl font-semibold'>{t('generating.heading')}</h1>
      </header>

      <ol className='space-y-3'>
        {STEP_ORDER.map(key => {
          const status = statusByKey.get(key) ?? 'queued';
          const isDone = status === 'succeeded';
          const isActive = status === 'running';

          return (
            <li key={key} className='flex items-center gap-3'>
              <span className='flex size-5 items-center justify-center'>
                <StepIcon status={status} />
              </span>
              <span
                className={cn(
                  'text-sm',
                  isDone && 'text-content',
                  isActive && 'text-content font-medium',
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
            className='border-border space-y-3 rounded-lg border p-4'
          >
            <Skeleton className='h-4 w-1/3' />
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-4/5' />
          </div>
        ))}
      </div>
    </div>
  );
}
