'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import {
  INTEL_ACTION_META,
  INTEL_GROUPS,
} from '@/lib/portal-v2/intelligence/constants';
import type {
  IntelAction,
  IntelFocus,
} from '@/lib/portal-v2/intelligence/types';

const TONE_ACTIVE: Record<IntelAction, string> = {
  scale:
    'border-[var(--pv2-success)] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))]',
  fix: 'border-[var(--pv2-warning)] bg-[color-mix(in_srgb,var(--pv2-warning)_8%,var(--pv2-paper))]',
  instrument: 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]',
  refresh:
    'border-[#a855f7] bg-[color-mix(in_srgb,#a855f7_8%,var(--pv2-paper))]',
};

const TONE_DOT: Record<IntelAction, string> = {
  scale: 'bg-[var(--pv2-success)]',
  fix: 'bg-[var(--pv2-warning)]',
  instrument: 'bg-[var(--pv2-electric)]',
  refresh: 'bg-[#a855f7]',
};

type IntelActionTilesProps = {
  focus: IntelFocus;
  counts: Record<IntelAction, number>;
  onFocusChange: (focus: IntelFocus) => void;
};

export const IntelActionTiles = ({
  focus,
  counts,
  onFocusChange,
}: IntelActionTilesProps) => {
  const t = useTranslations('portalV2.intelligence');

  return (
    <div className='grid grid-cols-2 gap-2.5 md:grid-cols-4'>
      {INTEL_GROUPS.map(action => {
        const meta = INTEL_ACTION_META[action];
        const active = focus === action;

        return (
          <button
            key={action}
            type='button'
            onClick={() => onFocusChange(active ? 'all' : action)}
            className={cn(
              'flex flex-col gap-0.5 rounded-[var(--pv2-r-md)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3 text-left transition-[transform,border-color,background-color] hover:-translate-y-px hover:border-[var(--pv2-ink)]',
              active && TONE_ACTIVE[action]
            )}
          >
            <span className='flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[var(--pv2-ink)] uppercase'>
              <span
                className={cn('size-1.5 rounded-full', TONE_DOT[action])}
                aria-hidden
              />
              {t(meta.labelKey)}
            </span>
            <span className='font-[family-name:var(--pv2-disp)] text-[1.625rem] leading-none font-bold tracking-[-0.04em] text-[var(--pv2-ink)]'>
              {counts[action]}
            </span>
            <span className='text-[10.5px] text-[var(--pv2-faint)]'>
              {t(meta.descKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
