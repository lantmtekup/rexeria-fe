import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import type { MiningStage, MiningStageId } from '@/lib/portal-v2/mining/types';

type CoverageMeterProps = {
  stages: MiningStage[];
  covered: Set<MiningStageId>;
  label: string;
  summary: string;
  tip?: ReactNode;
};

export const CoverageMeter = ({
  stages,
  covered,
  label,
  summary,
  tip,
}: CoverageMeterProps) => (
  <section
    aria-label={label}
    className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-3 md:px-8'
  >
    <div className='flex flex-wrap items-center gap-2'>
      <span className='mr-1 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
        {label}
      </span>
      {stages.map(stage => {
        const isCovered = covered.has(stage.id);
        return (
          <span
            key={stage.id}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold',
              isCovered
                ? 'border-[color-mix(in_srgb,var(--pv2-success)_24%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))] text-[var(--pv2-success)]'
                : 'border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
            )}
          >
            {isCovered ? <Check className='size-3' aria-hidden /> : null}
            {stage.label}
          </span>
        );
      })}
      <span className='ml-auto inline-flex items-center gap-1.5 text-[11px] text-[var(--pv2-mut)]'>
        {summary}
        {tip}
      </span>
    </div>
  </section>
);
