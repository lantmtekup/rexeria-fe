'use client';

import { BarChart3, Radio } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/molecules/portal-v2/Button';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { HealthBadge } from '@/components/molecules/portal-v2/campaigns-form';
import {
  LiftPill,
  Stat,
  VerdictStats,
  fmtMoney,
  fmtCount,
} from '@/components/organisms/portal-v2/campaigns/detail/VerdictStats';
import { cn } from '@/lib/cn';
import { TRUST_FLOOR } from '@/lib/portal-v2/campaigns/constants';
import { subjectName } from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignHealth,
  CampaignVerdict,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';

type RunPhaseProps = {
  campaign: CampaignView;
  verdict: CampaignVerdict | null;
  health: CampaignHealth;
  productNames: Record<string, string>;
};

/**
 * In market. What the campaign is doing right now, and whether the numbers
 * saying so can be believed — trust is shown beside the result, not buried in a
 * settings screen, because a 40% lift measured on 12% of the traffic is not a
 * 40% lift.
 */
export const RunPhase = ({
  campaign,
  verdict,
  health,
  productNames,
}: RunPhaseProps) => {
  const t = useTranslations('portalV2.campaigns');

  const liveItems = campaign.items.filter(item => item.status === 'live');

  if (!verdict) {
    return (
      <EmptyState
        icon={<Radio className='size-6' strokeWidth={1.8} aria-hidden />}
        title={t('runNoDataTitle')}
      >
        {t('runNoDataBody')}
      </EmptyState>
    );
  }

  const trustPct =
    verdict.trust !== null ? Math.round(verdict.trust * 100) : null;
  const untrusted = trustPct !== null && trustPct < TRUST_FLOOR * 100;

  return (
    <div className='flex flex-col gap-5'>
      <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4.5'>
        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            {t('runTitle')}
          </h3>
          <LiftPill lift={verdict.lift} />
          <HealthBadge health={health} withReason />
        </div>

        <VerdictStats verdict={verdict} />

        {untrusted ? (
          <p className='mt-4 rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-warning)_10%,transparent)] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
            {t('runUntrusted', { pct: trustPct })}
          </p>
        ) : null}
      </section>

      <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4.5'>
        <h3 className='mb-3.5 font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
          {t('runLiveTitle')}
        </h3>

        {liveItems.length ? (
          <ul className='flex flex-col gap-2'>
            {liveItems.map(item => (
              <li
                key={item.id}
                className='flex flex-wrap items-center justify-between gap-3 rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] px-3.5 py-2.5'
              >
                <span className='min-w-0 truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                  {subjectName(item, productNames) || t('untitledSubject')}
                </span>
                <span className='text-[11.5px] text-[var(--pv2-mut)]'>
                  {t('experienceCount', { count: item.expIds.length })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-[12.5px] text-[var(--pv2-faint)]'>
            {t('runNothingLive')}
          </p>
        )}
      </section>

      <section
        className={cn(
          'flex flex-wrap items-center justify-between gap-4 rounded-[var(--pv2-r)]',
          'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4.5'
        )}
      >
        <div className='grid flex-1 grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3'>
          <Stat
            label={t('metCac')}
            value={fmtMoney(verdict.cac)}
            hint={t('metCacHint')}
          />
          <Stat label={t('metLeads')} value={fmtCount(verdict.leads)} />
          <Stat
            label={t('metRoi')}
            value={`${Math.round(verdict.roi * 100)}%`}
            tone={verdict.roi > 0 ? 'good' : 'bad'}
          />
        </div>
        <Button variant='ghost' asChild>
          <Link href={`/portal-v2/analytics?campaign=${campaign.id}`}>
            <BarChart3 className='size-[15px]' strokeWidth={2} aria-hidden />
            {t('runOpenAnalytics')}
          </Link>
        </Button>
      </section>
    </div>
  );
};
