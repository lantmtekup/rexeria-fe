'use client';

import { PauseCircle, Target } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ChannelChip } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployEmpty } from '@/components/organisms/portal-v2/deploy/DeployEmpty';
import { HealthPill } from '@/components/organisms/portal-v2/deploy/HealthPill';
import { ownerName } from '@/lib/portal-v2/campaigns/helpers';
import type { CampaignTeamMember } from '@/lib/portal-v2/campaigns/types';
import { worstHealth } from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployCampaignGroup,
  LiveDeployRow,
} from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type DeployLivePaneProps = {
  groups: DeployCampaignGroup[];
  team: CampaignTeamMember[];
  onPause: (row: LiveDeployRow) => void;
  pausingRow: string | null;
  /** Opens the row's detail (live URL + product content) — the URL used to
   *  exist only in the deploy toast, gone for good after a reload. */
  onOpenRow: (rowId: string) => void;
};

const TH =
  'px-3 py-2 text-left text-[11px] font-semibold text-[var(--pv2-mut)]';
const TD = 'px-3 py-2.5 align-middle';

/**
 * What is out there, grouped by campaign — because that is how the work is
 * owned. Nobody answers for a row; somebody answers for a campaign.
 *
 * No sessions/CVR/trend columns: `GET /deploy/live` carries none at the item
 * grain (see `types.ts`). Health is shown PER CHANNEL — the same row can be
 * `ok` on Email and `broken` on the Web microsite at once — with a row-level
 * summary pill for the worst of them.
 */
export const DeployLivePane = ({
  groups,
  team,
  onPause,
  pausingRow,
  onOpenRow,
}: DeployLivePaneProps) => {
  const t = useTranslations('portalV2.deploy');

  if (!groups.length) {
    return <DeployEmpty title={t('liveEmpty')} hint={t('liveEmptyHint')} />;
  }

  return (
    <div className='space-y-4'>
      {groups.map(group => (
        <section
          key={group.campaign.id}
          className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
        >
          <header className='flex flex-wrap items-center gap-3 border-b border-[var(--pv2-hair)] px-4 py-3'>
            <span
              className='grid size-8 shrink-0 place-items-center rounded-[8px] text-white'
              style={{ background: 'var(--pv2-violet)' }}
              aria-hidden
            >
              <Target className='size-4' strokeWidth={2.2} />
            </span>

            <span className='min-w-0 flex-1'>
              <span className='block truncate text-[14px] font-bold text-[var(--pv2-ink)]'>
                {group.campaign.name}
              </span>
              <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                {t('rowsCount', { count: group.rows.length })}
              </span>
            </span>

            {group.issues ? (
              <span className='rounded-full bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--pv2-error)]'>
                {t('issuesCount', { count: group.issues })}
              </span>
            ) : null}

            <Button variant='ghost' size='sm' asChild>
              <Link href={`/portal-v2/campaigns?id=${group.campaign.id}`}>
                {t('openCampaign')}
              </Link>
            </Button>
          </header>

          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] border-collapse text-[12.5px]'>
              <thead className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]'>
                <tr>
                  <th className={TH}>{t('colExperience')}</th>
                  <th className={TH}>{t('colSubject')}</th>
                  <th className={TH}>{t('colOwner')}</th>
                  <th className={TH}>{t('colChannels')}</th>
                  <th className={TH}>{t('colHealth')}</th>
                  <th className={cn(TH, 'w-[90px] text-right')}>
                    <span className='sr-only'>{t('colActions')}</span>
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-[var(--pv2-hair)]'>
                {group.rows.map(row => {
                  const health = worstHealth(row.channels.map(c => c.health));
                  const owner = row.ownerId ? ownerName(row.ownerId, team) : '';

                  return (
                    <tr key={row.id} className='hover:bg-[var(--pv2-canvas)]'>
                      <td className={TD}>
                        <button
                          type='button'
                          onClick={() => onOpenRow(row.id)}
                          className='block max-w-full truncate text-left font-semibold text-[var(--pv2-ink)] hover:text-[var(--pv2-electric)] hover:underline'
                        >
                          {row.experiences[0]?.name ??
                            row.subjectName ??
                            t('untitled')}
                        </button>
                      </td>

                      <td className={TD}>
                        <span className='block text-[var(--pv2-slate-500)]'>
                          {row.subjectName ?? '—'}
                        </span>
                        <span className='mt-0.5 inline-block rounded-[4px] bg-[var(--pv2-canvas)] px-1.5 py-px text-[10px] font-bold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
                          {t(
                            row.kind === 'product'
                              ? 'subjectProduct'
                              : 'subjectTopic'
                          )}
                        </span>
                      </td>

                      <td
                        className={cn(
                          TD,
                          'whitespace-nowrap text-[var(--pv2-mut)]'
                        )}
                      >
                        {owner || '—'}
                      </td>

                      <td className={TD}>
                        <span className='flex flex-wrap gap-1'>
                          {row.channels.map(c => (
                            <ChannelChip
                              key={c.channelId}
                              channel={{
                                id: c.channelId,
                                kind: c.kind,
                                name: c.name,
                              }}
                              health={c.health}
                              healthReason={c.reason}
                            />
                          ))}
                        </span>
                      </td>

                      <td className={TD}>
                        <HealthPill health={health} />
                      </td>

                      <td className={cn(TD, 'text-right')}>
                        <Button
                          variant='danger'
                          size='sm'
                          disabled={pausingRow === row.id}
                          onClick={() => onPause(row)}
                          aria-label={t('pauseAria', {
                            name: row.experiences[0]?.name ?? row.id,
                          })}
                        >
                          <PauseCircle
                            className='size-3.5'
                            strokeWidth={2.2}
                            aria-hidden
                          />
                          {pausingRow === row.id ? t('pausing') : t('pause')}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
};
