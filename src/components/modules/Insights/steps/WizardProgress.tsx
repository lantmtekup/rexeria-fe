'use client';

import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

/** 3 phase của wizard theo đúng thứ tự dòng chảy: nhập liệu → phân tích → blueprint. */
const PHASES = ['setup', 'generating', 'blueprint'] as const;
export type WizardPhase = (typeof PHASES)[number];

/**
 * Stepper hiển thị tiến độ 3 phase của wizard AI-Insights, dùng chung cho cả 3 màn
 * để tạo cảm giác liền mạch. Phase đã qua → tích xanh; phase hiện tại → viền primary
 * nổi bật; phase chưa tới → mờ. Đường nối giữa các bước cũng đổi màu theo tiến độ.
 */
export function WizardProgress({ phase }: { phase: WizardPhase }) {
  const t = useTranslations('insights');
  const current = PHASES.indexOf(phase);

  return (
    <ol className='flex items-center'>
      {PHASES.map((p, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === PHASES.length - 1;
        return (
          <li
            key={p}
            className={cn('flex items-center gap-2.5', !isLast && 'flex-1')}
          >
            <span
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition',
                done && 'bg-primary border-transparent text-white',
                active && 'border-primary text-primary ring-primary/15 ring-4',
                !done && !active && 'border-border text-content-muted'
              )}
            >
              {done ? <Check className='size-4' aria-hidden /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden text-sm font-medium whitespace-nowrap sm:inline',
                active ? 'text-content-main' : 'text-content-muted'
              )}
            >
              {t(`phases.${p}`)}
            </span>
            {!isLast && (
              <span
                className={cn(
                  'mx-1.5 h-px flex-1 transition-colors',
                  done ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
