'use client';

import { Award, BookmarkPlus, CheckCircle2, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import {
  LiftPill,
  VerdictStats,
  fmtMoney,
} from '@/components/organisms/portal-v2/campaigns/detail/VerdictStats';
import { cn } from '@/lib/cn';
import { earnedBar } from '@/lib/portal-v2/campaigns/verdict';
import type {
  CampaignVerdict,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type LearnPhaseProps = {
  campaign: CampaignView;
  verdict: CampaignVerdict | null;
  journey: Journey | null;
  onPromoteJourney: () => void;
};

/**
 * What it earned, and what the next campaign inherits.
 *
 * The point of finishing is not the report — it is that the route which worked
 * becomes a blueprint anyone can start from. A campaign that ends without
 * promoting anything taught the platform nothing.
 */
export const LearnPhase = ({
  campaign,
  verdict,
  journey,
  onPromoteJourney,
}: LearnPhaseProps) => {
  const t = useTranslations('portalV2.campaigns');

  if (!verdict) {
    return (
      <EmptyState
        icon={<Award className='size-6' strokeWidth={1.8} aria-hidden />}
        title={t('learnNoDataTitle')}
      >
        {t('learnNoDataBody')}
      </EmptyState>
    );
  }

  const bar = earnedBar();
  const beatBar = verdict.lift >= bar;
  const earned = verdict.revenue - verdict.spend;

  return (
    <div className='flex flex-col gap-5'>
      <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4.5'>
        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            {t('learnTitle')}
          </h3>
          <LiftPill lift={verdict.lift} />
        </div>

        <VerdictStats verdict={verdict} />

        <div className='mt-4 border-t border-[var(--pv2-hair)] pt-3.5'>
          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <p className='text-[12.5px] text-[var(--pv2-mut)]'>
              {t('learnEarnedLabel')}
            </p>
            <p
              className={cn(
                'font-[family-name:var(--pv2-disp)] text-[1.125rem] font-bold tabular-nums',
                earned >= 0
                  ? 'text-[var(--pv2-success)]'
                  : 'text-[var(--pv2-error)]'
              )}
            >
              {fmtMoney(earned)}
            </p>
          </div>

          <div
            className='mt-2.5 flex h-2 overflow-hidden rounded-full bg-[var(--pv2-hair)]'
            role='img'
            aria-label={t('learnBarAria', {
              lift: Math.round(verdict.lift * 100),
              bar: Math.round(bar * 100),
            })}
          >
            <span
              className='h-full rounded-full'
              style={{
                width: `${Math.min(Math.max(verdict.lift, 0) * 100, 100)}%`,
                background: beatBar
                  ? 'var(--pv2-success)'
                  : 'var(--pv2-warning)',
              }}
            />
          </div>
          <p className='mt-2 text-[11.5px] text-[var(--pv2-faint)]'>
            {t('learnBarNote', {
              lift: Math.round(verdict.lift * 100),
              bar: Math.round(bar * 100),
            })}
          </p>
        </div>
      </section>

      {verdict.best || verdict.worst ? (
        <section className='grid gap-3 sm:grid-cols-2'>
          {verdict.best ? (
            <div className='rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-success)_35%,transparent)] bg-[color-mix(in_srgb,var(--pv2-success)_6%,transparent)] px-4.5 py-4'>
              <p className='flex items-center gap-1.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
                <Trophy className='size-3' strokeWidth={2.2} aria-hidden />
                {t('learnBest')}
              </p>
              <p className='mt-1.5 truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                {verdict.best.name}
              </p>
              <p className='mt-1'>
                <LiftPill lift={verdict.best.lift} />
              </p>
            </div>
          ) : null}
          {verdict.worst ? (
            <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4.5 py-4'>
              <p className='text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
                {t('learnWorst')}
              </p>
              <p className='mt-1.5 truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                {verdict.worst.name}
              </p>
              <p className='mt-1'>
                <LiftPill lift={verdict.worst.lift} />
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section
        className={cn(
          'rounded-[var(--pv2-r)] border px-5 py-4.5',
          campaign.promoted
            ? 'border-[color-mix(in_srgb,var(--pv2-success)_35%,transparent)] bg-[color-mix(in_srgb,var(--pv2-success)_6%,transparent)]'
            : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
        )}
      >
        <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
          {t('learnPromoteTitle')}
        </h3>

        {!journey ? (
          <p className='mt-1.5 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('learnPromoteNoJourney')}
          </p>
        ) : campaign.promoted ? (
          <p className='mt-2 flex items-center gap-2 text-[12.5px] text-[var(--pv2-mut)]'>
            <CheckCircle2
              className='size-4 shrink-0 text-[var(--pv2-success)]'
              strokeWidth={2.2}
              aria-hidden
            />
            {t('learnPromoteDone', { name: journey.name })}
          </p>
        ) : (
          <>
            <p className='mt-1.5 mb-3.5 max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('learnPromoteBody', { name: journey.name })}
            </p>
            <Button variant='primary' onClick={onPromoteJourney}>
              <BookmarkPlus
                className='size-[15px]'
                strokeWidth={2.2}
                aria-hidden
              />
              {t('learnPromoteAction')}
            </Button>
          </>
        )}
      </section>
    </div>
  );
};
