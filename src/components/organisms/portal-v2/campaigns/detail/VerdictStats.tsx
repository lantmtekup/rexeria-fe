'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type { CampaignVerdict } from '@/lib/portal-v2/campaigns/types';

export const fmtCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));

export const fmtMoney = (n: number): string =>
  n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`;

export const fmtPct = (ratio: number): string => `${Math.round(ratio * 100)}%`;

/** One figure and what it is. Tabular so a column of them stays readable. */
export const Stat = ({
  label,
  value,
  hint,
  tone = 'ink',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'ink' | 'good' | 'bad';
}) => (
  <div className='min-w-0'>
    <p className='text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </p>
    <p
      className={cn(
        'mt-1 font-[family-name:var(--pv2-disp)] text-[1.375rem] font-bold tracking-[-0.02em] tabular-nums',
        tone === 'good' && 'text-[var(--pv2-success)]',
        tone === 'bad' && 'text-[var(--pv2-error)]',
        tone === 'ink' && 'text-[var(--pv2-ink)]'
      )}
    >
      {value}
    </p>
    {hint ? (
      <p className='mt-0.5 text-[11px] text-[var(--pv2-faint)]'>{hint}</p>
    ) : null}
  </div>
);

/** Lift against the control, with the direction said out loud. */
export const LiftPill = ({ lift }: { lift: number }) => {
  const t = useTranslations('portalV2.campaigns');
  const up = lift >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold tabular-nums',
        up
          ? 'bg-[color-mix(in_srgb,var(--pv2-success)_14%,transparent)] text-[color-mix(in_srgb,var(--pv2-success)_80%,var(--pv2-ink))]'
          : 'bg-[color-mix(in_srgb,var(--pv2-error)_12%,transparent)] text-[var(--pv2-error)]'
      )}
    >
      <Icon className='size-3' strokeWidth={2.4} aria-hidden />
      {t(up ? 'liftAbove' : 'liftBelow', {
        pct: Math.abs(Math.round(lift * 100)),
      })}
    </span>
  );
};

/** The five figures every phase past Build shows in the same order. */
export const VerdictStats = ({ verdict }: { verdict: CampaignVerdict }) => {
  const t = useTranslations('portalV2.campaigns');
  return (
    <div className='grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 lg:grid-cols-5'>
      <Stat label={t('metSessions')} value={fmtCount(verdict.sessions)} />
      <Stat
        label={t('metCvr')}
        value={fmtPct(verdict.cvr)}
        hint={t('metCvrHint', { count: fmtCount(verdict.converted) })}
      />
      <Stat label={t('metRevenue')} value={fmtMoney(verdict.revenue)} />
      <Stat
        label={t('metRoas')}
        value={`${verdict.roas.toFixed(1)}×`}
        hint={t('metSpendHint', { spend: fmtMoney(verdict.spend) })}
        tone={verdict.roi > 0 ? 'good' : 'bad'}
      />
      <Stat
        label={t('metTrust')}
        value={fmtPct(verdict.trust)}
        hint={t('metTrustHint')}
      />
    </div>
  );
};
