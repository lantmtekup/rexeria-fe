'use client';

import { ArrowRight, GitFork, Pencil, Route, Shuffle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import { routeCoverage } from '@/lib/portal-v2/campaigns/journeyLink';
import type {
  CampaignExperience,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type CampaignJourneyCardProps = {
  campaign: CampaignView;
  journey: Journey | null;
  /** The blueprint the fork came from, for the lineage line. */
  blueprint: Journey | null;
  experiences: CampaignExperience[];
  journeys: Journey[];
  onRoute: () => void;
  onCarryRoute: () => void;
};

/**
 * `.cjour` — the route this campaign runs on.
 *
 * A campaign does not own a journey; it owns a *fork* of one. The card says so
 * out loud: the blueprint it came from stays named, because editing here must
 * never feel like editing the library.
 */
export const CampaignJourneyCard = ({
  campaign,
  journey,
  blueprint,
  experiences,
  journeys,
  onRoute,
  onCarryRoute,
}: CampaignJourneyCardProps) => {
  const t = useTranslations('portalV2.campaigns');

  if (!journey) {
    return (
      <section
        className={cn(
          'rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
          'bg-[var(--pv2-paper)] px-5 py-5'
        )}
      >
        <h3 className='flex items-center gap-2 font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
          <Route
            className='size-4 text-[var(--pv2-faint)]'
            strokeWidth={2}
            aria-hidden
          />
          {t('journeyNoneTitle')}
        </h3>
        <p className='mt-1.5 mb-3.5 max-w-[52ch] text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('journeyNoneBody')}
        </p>
        <Button variant='primary' onClick={onRoute}>
          <GitFork className='size-[15px]' strokeWidth={2.2} aria-hidden />
          {t('journeyRoute')}
        </Button>
      </section>
    );
  }

  const coverage = routeCoverage(campaign, experiences, journeys);
  const flow = journey.nodes.slice(0, 5);

  return (
    <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-4.5'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='flex items-center gap-2 font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            <Route
              className='size-4 text-[var(--pv2-electric)]'
              strokeWidth={2}
              aria-hidden
            />
            <span className='truncate'>{journey.name}</span>
          </h3>
          <p className='mt-1 text-[12px] text-[var(--pv2-faint)]'>
            {blueprint
              ? t('journeyForkedFrom', { name: blueprint.name })
              : t('journeyForkOwn')}
          </p>
        </div>

        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <Button variant='ghost' onClick={onRoute}>
            <Shuffle className='size-[15px]' strokeWidth={2} aria-hidden />
            {t('journeyChange')}
          </Button>
          <Button variant='ghost' asChild>
            <Link href={`/portal-v2/journeys?edit=${journey.id}`}>
              <Pencil className='size-[15px]' strokeWidth={2} aria-hidden />
              {t('journeyOpen')}
            </Link>
          </Button>
        </div>
      </div>

      <ol className='mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2'>
        {flow.map((node, index) => (
          <li key={node.id} className='flex items-center gap-1.5'>
            <span className='rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 text-[11px] font-semibold text-[var(--pv2-mut)]'>
              {node.name}
            </span>
            {index < flow.length - 1 ? (
              <ArrowRight
                className='size-3 text-[var(--pv2-faint)]'
                strokeWidth={2.4}
                aria-hidden
              />
            ) : null}
          </li>
        ))}
        {journey.nodes.length > flow.length ? (
          <li className='text-[11px] font-semibold text-[var(--pv2-faint)]'>
            {t('journeyMoreNodes', {
              count: journey.nodes.length - flow.length,
            })}
          </li>
        ) : null}
      </ol>

      {coverage.total ? (
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--pv2-hair)] pt-3.5'>
          <p className='text-[12.5px] text-[var(--pv2-mut)]'>
            {t('journeyCoverage', {
              carried: coverage.carried,
              total: coverage.total,
            })}
          </p>
          {coverage.need.length ? (
            <Button variant='ghost' onClick={onCarryRoute}>
              <GitFork className='size-[15px]' strokeWidth={2.2} aria-hidden />
              {t('journeyCarry', { count: coverage.need.length })}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
