'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type {
  CampaignGap,
  CampaignReadiness,
} from '@/lib/portal-v2/campaigns/types';

type PlanGateProps = {
  readiness: CampaignReadiness;
  /** A closed campaign cannot be told to prepare — the gate becomes a record. */
  finished: boolean;
  onFix: (gap: CampaignGap) => void;
};

/**
 * `.cgate` — the eight questions a campaign has to answer before anybody builds.
 *
 * Every gap names itself and links to the screen that closes it, so the gate
 * reads as a to-do list. A gate that only said "not ready" would be worse than no
 * gate at all: people would learn to ignore it.
 */
export const PlanGate = ({ readiness, finished, onFix }: PlanGateProps) => {
  const t = useTranslations('portalV2.campaigns');
  const ready = readiness.gaps.length === 0;

  const title = ready
    ? t('gateReadyTitle')
    : finished
      ? t('gateHistoryTitle')
      : t('gateTitle');

  return (
    <section
      className={cn(
        'rounded-[var(--pv2-r)] border px-5 py-4.5',
        ready
          ? 'border-[color-mix(in_srgb,var(--pv2-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--pv2-success)_7%,transparent)]'
          : 'border-[color-mix(in_srgb,var(--pv2-warning)_40%,transparent)] bg-[color-mix(in_srgb,var(--pv2-warning)_7%,transparent)]'
      )}
    >
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h3 className='flex items-center gap-2 font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
          {ready ? (
            <CheckCircle2
              className='size-4 text-[var(--pv2-success)]'
              strokeWidth={2.2}
              aria-hidden
            />
          ) : null}
          {title}
        </h3>
        <span className='text-[12.5px] font-semibold text-[var(--pv2-mut)] tabular-nums'>
          {t('gateScore', { ok: readiness.ok, total: readiness.total })}
        </span>
      </div>

      <div className='mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--pv2-hair)]'>
        <div
          className='h-full rounded-full transition-[width] duration-300'
          style={{
            width: `${readiness.score}%`,
            background: ready ? 'var(--pv2-success)' : 'var(--pv2-warning)',
          }}
        />
      </div>

      {ready ? (
        <p className='mt-3 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('gateReadyBody')}
        </p>
      ) : (
        <ul className='mt-3.5 flex flex-col gap-1.5'>
          {readiness.gaps.map(gap => (
            <li key={gap.id}>
              <button
                type='button'
                onClick={() => onFix(gap)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 rounded-[var(--pv2-r-sm)] px-2.5 py-2 text-left',
                  'text-[12.5px] leading-relaxed text-[var(--pv2-ink)] transition-colors',
                  'hover:bg-[var(--pv2-paper)]',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                )}
              >
                <span
                  aria-hidden
                  className='size-1.5 shrink-0 rounded-full bg-[var(--pv2-warning)]'
                />
                <span className='min-w-0 flex-1'>
                  {t(gap.messageKey, gap.values)}
                </span>
                <ArrowRight
                  className='size-3.5 shrink-0 text-[var(--pv2-faint)]'
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
