'use client';

import { Check, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import {
  CAMP_PHASES,
  CAMP_PHASE_ORDER,
} from '@/lib/portal-v2/campaigns/constants';
import { phaseIndex } from '@/lib/portal-v2/campaigns/phases';
import type { CampaignPhase } from '@/lib/portal-v2/campaigns/types';

type PhaseStripProps = {
  /** Where the work actually is — derived, and not necessarily what is shown. */
  derived: CampaignPhase;
  /** The phase being looked at. */
  active: CampaignPhase;
  onSelect: (phase: CampaignPhase) => void;
};

/**
 * `.clife` — Plan → Build → Run → Learn.
 *
 * Every phase stays reachable. The strip shows where the campaign *is*, but
 * looking back at the brief while the work is live is a normal thing to want, and
 * a strip that locked the past would be a strip people route around.
 */
export const PhaseStrip = ({ derived, active, onSelect }: PhaseStripProps) => {
  const t = useTranslations('portalV2.campaigns');
  const reached = phaseIndex(derived);

  return (
    <nav aria-label={t('phaseStripAria')}>
      <ol className='flex flex-wrap items-stretch gap-1'>
        {CAMP_PHASE_ORDER.map((phase, index) => {
          const on = phase === active;
          const past = index < reached;
          const now = phase === derived;

          return (
            <li key={phase} className='flex items-stretch'>
              <button
                type='button'
                aria-current={on ? 'step' : undefined}
                onClick={() => onSelect(phase)}
                className={cn(
                  'flex cursor-pointer flex-col items-start gap-0.5 rounded-[var(--pv2-r)] px-3.5 py-2 text-left transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                  on
                    ? 'bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                    : 'text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
                )}
              >
                <span className='flex items-center gap-1.5 text-[12.5px] font-bold tracking-[0.01em]'>
                  {past ? (
                    <Check
                      className={cn(
                        'size-3',
                        on
                          ? 'text-[var(--pv2-paper)]'
                          : 'text-[var(--pv2-success)]'
                      )}
                      strokeWidth={2.8}
                      aria-hidden
                    />
                  ) : null}
                  {t(CAMP_PHASES[phase].labelKey)}
                  {now ? (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-px text-[9px] font-bold tracking-[0.06em] uppercase',
                        on
                          ? 'bg-[color-mix(in_srgb,var(--pv2-paper)_25%,transparent)] text-[var(--pv2-paper)]'
                          : 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
                      )}
                    >
                      {t('phaseNow')}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    'text-[10.5px] leading-tight',
                    on
                      ? 'text-[var(--pv2-paper)]/70'
                      : 'text-[var(--pv2-faint)]'
                  )}
                >
                  {t(CAMP_PHASES[phase].hintKey)}
                </span>
              </button>

              {index < CAMP_PHASE_ORDER.length - 1 ? (
                <ChevronRight
                  className='my-auto size-3.5 shrink-0 text-[var(--pv2-faint)]'
                  strokeWidth={2.2}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
