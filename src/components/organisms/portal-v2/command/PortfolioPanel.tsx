'use client';

import Link from 'next/link';
import { Target } from 'lucide-react';

import { SectionHead } from '@/components/organisms/portal-v2/command/SectionHead';
import { KpiGrid } from '@/components/organisms/portal-v2/command/KpiGrid';
import {
  CAMP_STATUS_STYLE,
  COMMAND_LINKS,
  HEALTH_COLOR,
} from '@/lib/portal-v2/command/constants';
import { campProgress, formatRange } from '@/lib/portal-v2/command/helpers';
import type {
  CommandCampaign,
  CommandKpi,
  CommandSnapshot,
  CommandTabId,
  LiveExperience,
  UpcomingLaunch,
} from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type PortfolioPanelProps = {
  snapshot: CommandSnapshot;
  kpis: CommandKpi[];
  upcoming: UpcomingLaunch[];
  t: (key: string, values?: Record<string, string | number>) => string;
  onKpiClick?: (tabId: CommandTabId) => void;
};

const CampaignRow = ({
  campaign,
  t,
}: {
  campaign: CommandCampaign;
  t: PortfolioPanelProps['t'];
}) => {
  const progress = campProgress(campaign);
  const status =
    CAMP_STATUS_STYLE[campaign.status] ?? CAMP_STATUS_STYLE.planning!;
  const unowned = campaign.items.filter(i => i.owner === 'Unassigned').length;
  const liftLabel =
    campaign.sessions > 0
      ? `${campaign.lift >= 0 ? '+' : ''}${Math.round(campaign.lift * 100)}%`
      : '—';

  return (
    <Link
      href={COMMAND_LINKS.campaigns}
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 border-b border-[var(--pv2-hair)] py-3.5',
        'transition-colors last:border-b-0 hover:bg-[var(--pv2-canvas)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
        'sm:grid-cols-[auto_1fr_100px_72px_72px_72px]'
      )}
      aria-label={t('openCampaign', { name: campaign.name })}
    >
      <span
        className='flex size-8 shrink-0 items-center justify-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
        aria-hidden
      >
        <Target className='size-3.5' strokeWidth={2.2} />
      </span>

      <span className='min-w-0'>
        <span className='flex flex-wrap items-center gap-2'>
          <span className='text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
            {campaign.name}
          </span>
          <span
            className='rounded-md px-1.5 py-px text-[10.5px] font-semibold'
            style={{ background: status.bg, color: status.fg }}
          >
            {t(status.labelKey)}
          </span>
        </span>
        <span className='mt-0.5 block text-[12px] text-[var(--pv2-faint)]'>
          {formatRange(campaign.start, campaign.end)}
          {' · '}
          {campaign.owner}
          {' · '}
          {t('subjectCount', { count: campaign.items.length })}
          {unowned > 0 ? (
            <span className='font-semibold text-[var(--pv2-error)]'>
              {' · '}
              {t('unassignedCount', { count: unowned })}
            </span>
          ) : null}
        </span>
      </span>

      <span className='col-span-3 hidden sm:col-span-1 sm:block'>
        <span className='mb-1 block h-1.5 overflow-hidden rounded-full bg-[var(--pv2-hair)]'>
          <span
            className='block h-full rounded-full bg-[var(--pv2-electric)] transition-[width]'
            style={{ width: `${progress.pct}%` }}
          />
        </span>
        <span className='text-[11px] text-[var(--pv2-faint)] tabular-nums'>
          {progress.done}/{progress.total}{' '}
          <span className='text-[10px] uppercase'>{t('readyLabel')}</span>
        </span>
      </span>

      <span className='hidden text-right sm:block'>
        <span className='block text-[13px] font-semibold text-[var(--pv2-ink)] tabular-nums'>
          {campaign.sessions ? campaign.sessions.toLocaleString() : '—'}
        </span>
        <span className='text-[10px] text-[var(--pv2-faint)] uppercase'>
          {t('sessionsLabel')}
        </span>
      </span>

      <span className='hidden text-right sm:block'>
        <span
          className={cn(
            'block text-[13px] font-semibold tabular-nums',
            campaign.lift >= 0
              ? 'text-[var(--pv2-success)]'
              : 'text-[var(--pv2-error)]'
          )}
        >
          {liftLabel}
        </span>
        <span className='text-[10px] text-[var(--pv2-faint)] uppercase'>
          {t('vsControlLabel')}
        </span>
      </span>
    </Link>
  );
};

const UpcomingRow = ({
  item,
  t,
}: {
  item: UpcomingLaunch;
  t: PortfolioPanelProps['t'];
}) => (
  <Link
    href={COMMAND_LINKS.campaigns}
    className={cn(
      'flex items-center gap-3 border-b border-[var(--pv2-hair)] py-3 last:border-b-0',
      'transition-colors hover:bg-[var(--pv2-canvas)]',
      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
    )}
  >
    <span className='flex w-10 shrink-0 flex-col items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] py-1.5 tabular-nums'>
      <span className='text-[15px] leading-none font-bold text-[var(--pv2-ink)]'>
        {item.days}
      </span>
      <span className='text-[9px] font-semibold tracking-wide text-[var(--pv2-faint)] uppercase'>
        {t('daysLabel')}
      </span>
    </span>
    <span className='min-w-0 flex-1'>
      <span className='block text-[13px] font-semibold text-[var(--pv2-ink)]'>
        {item.campaignName}
      </span>
      <span className='text-[12px] text-[var(--pv2-faint)]'>
        {item.ready} {t('ofLabel')} {item.total} {t('readyLabel')}
      </span>
    </span>
    <span
      className={cn(
        'text-[11.5px] font-semibold',
        item.isReady ? 'text-[var(--pv2-success)]' : 'text-[var(--pv2-error)]'
      )}
    >
      {item.isReady ? t('launchReady') : t('launchNotReady')}
    </span>
  </Link>
);

const LiveRow = ({
  item,
  t,
}: {
  item: LiveExperience;
  t: PortfolioPanelProps['t'];
}) => (
  <Link
    href={COMMAND_LINKS.deploy}
    className={cn(
      'flex items-center gap-3 border-b border-[var(--pv2-hair)] py-3 last:border-b-0',
      'transition-colors hover:bg-[var(--pv2-canvas)]',
      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
    )}
  >
    <span
      className='size-2 shrink-0 rounded-full'
      style={{ background: HEALTH_COLOR[item.health] }}
      aria-hidden
    />
    <span className='min-w-0 flex-1'>
      <span className='block text-[13px] font-semibold text-[var(--pv2-ink)]'>
        {item.name}
      </span>
      <span className='text-[12px] text-[var(--pv2-faint)]'>
        {item.campaignName}
        {' · '}
        {t('channelCount', { count: item.channels })}
      </span>
    </span>
    <span className='text-right tabular-nums'>
      <span className='block text-[13px] font-semibold text-[var(--pv2-ink)]'>
        {item.sessions24h.toLocaleString()}
      </span>
      <span className='text-[10px] text-[var(--pv2-faint)] uppercase'>
        {t('hours24Label')}
      </span>
    </span>
  </Link>
);

export const PortfolioPanel = ({
  snapshot,
  kpis,
  upcoming,
  t,
  onKpiClick,
}: PortfolioPanelProps) => {
  const live = snapshot.liveExperiences;

  return (
    <div className='space-y-6'>
      <KpiGrid items={kpis} t={t} onKpiClick={onKpiClick} />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'>
        <section>
          <SectionHead
            title={t('campaignsHeading')}
            subtitle={t('campaignsSub')}
            className='mb-3'
          />
          <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
            {snapshot.campaigns.map(c => (
              <CampaignRow key={c.id} campaign={c} t={t} />
            ))}
          </div>
        </section>

        <aside className='space-y-6'>
          <section>
            <SectionHead
              title={t('upcomingHeading')}
              subtitle={t('upcomingSub')}
              className='mb-3'
            />
            <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
              {upcoming.length ? (
                upcoming.map(u => (
                  <UpcomingRow key={u.campaignId} item={u} t={t} />
                ))
              ) : (
                <div className='py-6 text-center'>
                  <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {t('upcomingEmptyTitle')}
                  </p>
                  <p className='mt-1 text-[12.5px] text-[var(--pv2-faint)]'>
                    {t('upcomingEmptyBody')}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <SectionHead
              title={t('liveHeading')}
              subtitle={t('liveSub')}
              className='mb-3'
            />
            <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
              {live.length ? (
                live
                  .slice(0, 5)
                  .map(item => <LiveRow key={item.id} item={item} t={t} />)
              ) : (
                <div className='py-6 text-center'>
                  <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {t('liveEmptyTitle')}
                  </p>
                  <p className='mt-1 text-[12.5px] text-[var(--pv2-faint)]'>
                    {t('liveEmptyBody')}
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
