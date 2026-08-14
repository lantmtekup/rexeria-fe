'use client';

import { PauseCircle, Target, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ChannelChip } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployEmpty } from '@/components/organisms/portal-v2/deploy/DeployEmpty';
import { DomainStatusPill } from '@/components/organisms/portal-v2/deploy/DomainField';
import { HealthPill } from '@/components/organisms/portal-v2/deploy/HealthPill';
import {
  DEPLOY_CAMPAIGN_TYPE,
  DEPLOY_EXPERIENCE_CATEGORY,
} from '@/lib/portal-v2/deploy/constants';
import {
  findDomain,
  formatCount,
  formatDate,
  formatRange,
  groupByCampaign,
  resolveChannels,
} from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployBrandDomain,
  DeployChannel,
  Deployment,
} from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type DeployLivePaneProps = {
  rows: Deployment[];
  channels: DeployChannel[];
  domains: DeployBrandDomain[];
  onPause: (row: Deployment) => void;
};

const TH =
  'px-3 py-2 text-left text-[11px] font-semibold text-[var(--pv2-mut)]';
const TD = 'px-3 py-2.5 align-middle';

/**
 * What is out there, grouped by campaign — because that is how the work is
 * owned. Nobody answers for a row; somebody answers for a campaign.
 */
export const DeployLivePane = ({
  rows,
  channels,
  domains,
  onPause,
}: DeployLivePaneProps) => {
  const t = useTranslations('portalV2.deploy');
  const groups = groupByCampaign(rows);

  if (!groups.length) {
    return <DeployEmpty title={t('liveEmpty')} hint={t('liveEmptyHint')} />;
  }

  return (
    <div className='space-y-4'>
      {groups.map(group => {
        const type = DEPLOY_CAMPAIGN_TYPE[group.campaign.type];

        return (
          <section
            key={group.campaign.id}
            className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
          >
            <header className='flex flex-wrap items-center gap-3 border-b border-[var(--pv2-hair)] px-4 py-3'>
              <span
                className='grid size-8 shrink-0 place-items-center rounded-[8px] text-white'
                style={{ background: type.tint }}
                aria-hidden
              >
                <Target className='size-4' strokeWidth={2.2} />
              </span>

              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[14px] font-bold text-[var(--pv2-ink)]'>
                  {group.campaign.name}
                </span>
                <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                  {t(type.labelKey)} ·{' '}
                  {formatRange(
                    group.campaign.start,
                    group.campaign.end,
                    t('ongoing')
                  )}{' '}
                  · {group.campaign.owner}
                </span>
              </span>

              <span className='text-right'>
                <span className='block font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)] tabular-nums'>
                  {formatCount(group.sessions)}
                </span>
                <span className='block text-[11px] text-[var(--pv2-faint)]'>
                  {t('sessions24h')}
                </span>
              </span>

              {group.issues ? (
                <span className='rounded-full bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--pv2-error)]'>
                  {t('issuesCount', { count: group.issues })}
                </span>
              ) : null}

              {/* The mock board's campaign ids are not in the `/v1/campaigns`
                  store the detail route reads, so this lands on the list. */}
              <Button variant='ghost' size='sm' asChild>
                <Link href='/portal-v2/campaigns'>{t('openCampaign')}</Link>
              </Button>
            </header>

            <div className='overflow-x-auto'>
              <table className='w-full min-w-[1000px] border-collapse text-[12.5px]'>
                <thead className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]'>
                  <tr>
                    <th className={TH}>{t('colExperience')}</th>
                    <th className={TH}>{t('colSubject')}</th>
                    <th className={TH}>{t('colChannels')}</th>
                    <th className={TH}>{t('colDomain')}</th>
                    <th className={TH}>{t('colSince')}</th>
                    <th className={cn(TH, 'text-right')}>{t('colSessions')}</th>
                    <th className={cn(TH, 'text-right')}>{t('colCvr')}</th>
                    <th className={cn(TH, 'text-right')}>{t('colTrend')}</th>
                    <th className={TH}>{t('colHealth')}</th>
                    <th className={cn(TH, 'w-[90px] text-right')}>
                      <span className='sr-only'>{t('colActions')}</span>
                    </th>
                  </tr>
                </thead>

                <tbody className='divide-y divide-[var(--pv2-hair)]'>
                  {group.rows.map(row => {
                    const up = row.ops.trend >= 0;
                    const Trend = up ? TrendingUp : TrendingDown;
                    const measured = row.ops.sessions > 0;
                    const domain = row.domainId
                      ? findDomain(domains, row.domainId)
                      : null;

                    return (
                      <tr key={row.id} className='hover:bg-[var(--pv2-canvas)]'>
                        <td className={TD}>
                          <span className='flex items-center gap-2.5'>
                            <span
                              className='size-7 shrink-0 rounded-[7px]'
                              style={{ background: row.experience.grad }}
                              aria-hidden
                            />
                            <span className='min-w-0'>
                              <span className='block truncate font-semibold text-[var(--pv2-ink)]'>
                                {row.experience.name}
                              </span>
                              <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                                {DEPLOY_EXPERIENCE_CATEGORY[
                                  row.experience.category
                                ] ?? row.experience.category}
                              </span>
                            </span>
                          </span>
                        </td>

                        <td className={TD}>
                          <span className='block text-[var(--pv2-slate-500)]'>
                            {row.subject.name}
                          </span>
                          <span className='mt-0.5 inline-block rounded-[4px] bg-[var(--pv2-canvas)] px-1.5 py-px text-[10px] font-bold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
                            {t(
                              row.subject.kind === 'product'
                                ? 'subjectProduct'
                                : 'subjectTopic'
                            )}
                          </span>
                        </td>

                        <td className={TD}>
                          <span className='flex flex-wrap gap-1'>
                            {resolveChannels(channels, row.channels).map(ch => (
                              <ChannelChip key={ch.id} channel={ch} />
                            ))}
                          </span>
                        </td>

                        <td className={TD}>
                          {domain ? (
                            <span className='flex flex-col items-start gap-1'>
                              <span className='block max-w-[150px] truncate text-[var(--pv2-slate-500)]'>
                                {domain.domain}
                              </span>
                              <DomainStatusPill status={domain.status} />
                            </span>
                          ) : (
                            <span className='text-[var(--pv2-faint)]'>—</span>
                          )}
                        </td>

                        <td
                          className={cn(
                            TD,
                            'text-[11.5px] whitespace-nowrap text-[var(--pv2-faint)]'
                          )}
                        >
                          {formatDate(row.since) ?? '—'}
                        </td>

                        <td
                          className={cn(
                            TD,
                            'text-right font-[family-name:var(--pv2-disp)] font-bold text-[var(--pv2-ink)] tabular-nums'
                          )}
                        >
                          {measured ? formatCount(row.ops.sessions) : '—'}
                        </td>

                        <td
                          className={cn(
                            TD,
                            'text-right text-[var(--pv2-slate-500)] tabular-nums'
                          )}
                        >
                          {row.ops.cvr}
                        </td>

                        <td className={cn(TD, 'text-right')}>
                          {measured ? (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 font-semibold tabular-nums',
                                up
                                  ? 'text-[color-mix(in_srgb,var(--pv2-success)_78%,var(--pv2-ink))]'
                                  : 'text-[var(--pv2-error)]'
                              )}
                            >
                              <Trend
                                className='size-3.5'
                                strokeWidth={2.4}
                                aria-hidden
                              />
                              {Math.abs(row.ops.trend)}%
                            </span>
                          ) : (
                            <span className='text-[var(--pv2-faint)]'>—</span>
                          )}
                        </td>

                        <td className={TD}>
                          <HealthPill
                            health={row.ops.health}
                            errors={row.ops.errors}
                          />
                        </td>

                        <td className={cn(TD, 'text-right')}>
                          <Button
                            variant='danger'
                            size='sm'
                            onClick={() => onPause(row)}
                            aria-label={t('pauseAria', {
                              name: row.experience.name,
                            })}
                          >
                            <PauseCircle
                              className='size-3.5'
                              strokeWidth={2.2}
                              aria-hidden
                            />
                            {t('pause')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
};
