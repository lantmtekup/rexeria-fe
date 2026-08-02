'use client';

import { Check, X } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { JourneyCheck } from '@/lib/portal-v2/journeys/types';

type JourneyCheckRowProps = {
  check: JourneyCheck;
};

/** One rule from the journey contract, and whether this graph keeps it. */
export const JourneyCheckRow = ({ check }: JourneyCheckRowProps) => (
  <div className='flex items-center gap-2.5 text-[12px] text-[var(--pv2-slate-500)]'>
    <span
      className={cn(
        'grid size-4 shrink-0 place-items-center rounded-full',
        check.ok
          ? 'bg-[color-mix(in_srgb,var(--pv2-success)_16%,transparent)] text-[#0e9d6e]'
          : 'bg-[color-mix(in_srgb,var(--pv2-error)_14%,transparent)] text-[#9a2436]'
      )}
    >
      {check.ok ? (
        <Check className='size-2.5' strokeWidth={3.4} aria-hidden />
      ) : (
        <X className='size-2.5' strokeWidth={3.4} aria-hidden />
      )}
    </span>
    <span className={cn(!check.ok && 'font-semibold text-[var(--pv2-ink)]')}>
      {check.msg}
    </span>
  </div>
);
