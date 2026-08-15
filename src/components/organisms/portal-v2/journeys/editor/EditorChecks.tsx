'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { JourneyCheckRow } from '@/components/organisms/portal-v2/journeys/JourneyCheckRow';
import { cn } from '@/lib/cn';
import { JOURNEY_KINDS } from '@/lib/portal-v2/journeys/constants';
import {
  journeyGaps,
  journeyReadiness,
} from '@/lib/portal-v2/journeys/helpers';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type EditorChecksProps = {
  draft: Journey;
  /** Clicking a gap selects the node it belongs to. */
  onSelectNode: (nodeId: string) => void;
};

/**
 * The contract, live, under the inspector.
 *
 * Same functions the detail modal's Requirements tab calls — `validateJourney`
 * through `journeyReadiness`, plus `journeyGaps`. Nothing is cached, so the
 * verdict here cannot disagree with the one the reader sees after Save.
 *
 * Failures come first and the list opens on them; a passing contract collapses
 * to one line, because a green wall of nine rules is noise.
 */
export const EditorChecks = ({ draft, onSelectNode }: EditorChecksProps) => {
  const t = useTranslations('portalV2.journeys');
  const readiness = useMemo(() => journeyReadiness(draft, t), [draft, t]);
  const gaps = useMemo(() => journeyGaps(draft, t), [draft, t]);
  const [open, setOpen] = useState(true);

  const failing = readiness.checks.filter(c => !c.ok);

  return (
    <section className='shrink-0 border-t border-[var(--pv2-hair)]'>
      <button
        type='button'
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left',
          'hover:bg-[var(--pv2-canvas)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
        )}
      >
        <span className='text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
          {t('tabReady')}
        </span>
        <span className='flex-1' />
        <span className='text-[11px] text-[var(--pv2-faint)]'>
          {failing.length
            ? t('readyMissing', { count: failing.length })
            : t('readyAll')}
        </span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 text-[var(--pv2-faint)] transition-transform',
            open && 'rotate-180'
          )}
          strokeWidth={2.2}
          aria-hidden
        />
      </button>

      {open ? (
        <div className='max-h-[240px] overflow-y-auto px-4 pb-3.5'>
          <div className='flex flex-col gap-1.5'>
            {failing.length ? (
              failing.map(check => (
                <JourneyCheckRow key={check.msg} check={check} />
              ))
            ) : (
              <JourneyCheckRow check={{ ok: true, msg: t('checksAllPass') }} />
            )}
          </div>

          {gaps.length ? (
            <>
              <h3 className='mt-3.5 mb-1 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
                {t('readyNeedsTitle')}
              </h3>
              {gaps.map(gap => (
                <button
                  key={`${gap.node.id}-${gap.need}`}
                  type='button'
                  onClick={() => onSelectNode(gap.node.id)}
                  className={cn(
                    'flex w-full cursor-pointer flex-col rounded-[8px] px-2 py-1.5 text-left',
                    'hover:bg-[var(--pv2-canvas)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                  )}
                >
                  <span className='flex items-center gap-1.5'>
                    <span className='truncate text-[11.5px] font-semibold text-[var(--pv2-ink)]'>
                      {gap.node.name}
                    </span>
                    <span className='shrink-0 text-[9.5px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
                      {JOURNEY_KINDS[gap.node.kind].name}
                    </span>
                  </span>
                  <span className='text-[11px] text-[var(--pv2-mut)]'>
                    {gap.need}
                  </span>
                </button>
              ))}
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
