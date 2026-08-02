import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import type { KpiDelta } from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type TrendChipProps = {
  delta: KpiDelta;
  label: string;
  className?: string;
};

const ICON = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
};

/**
 * A number with no comparison is a number nobody can act on, so every producing
 * KPI carries its move against the previous window. Colour follows `good`, not
 * direction: blocked work going up is not a win.
 */
export const TrendChip = ({ delta, label, className }: TrendChipProps) => {
  const Icon = ICON[delta.dir];

  return (
    <span
      title={label}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1 py-px',
        'text-[11px] font-semibold tabular-nums',
        delta.dir === 'flat'
          ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
          : delta.good
            ? 'bg-[color-mix(in_srgb,var(--pv2-success)_12%,transparent)] text-[var(--pv2-success)]'
            : 'bg-[color-mix(in_srgb,var(--pv2-error)_12%,transparent)] text-[var(--pv2-error)]',
        className
      )}
    >
      <Icon className='size-3' strokeWidth={2.4} aria-hidden />
      {delta.dir === 'flat' ? '0' : delta.pct}%
      <span className='sr-only'>{label}</span>
    </span>
  );
};
