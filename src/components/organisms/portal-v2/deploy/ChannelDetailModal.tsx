'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { ChannelBadge } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployNote } from '@/components/organisms/portal-v2/deploy/DeployNote';
import { HealthPill } from '@/components/organisms/portal-v2/deploy/HealthPill';
import {
  channelStats,
  formatCount,
  groupByCampaign,
} from '@/lib/portal-v2/deploy/helpers';
import type { DeployChannel, Deployment } from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type ChannelDetailModalProps = {
  channel: DeployChannel;
  live: Deployment[];
  onClose: () => void;
  onConnect: (channelId: string) => void;
};

/**
 * Everything flowing through one pipe — or, when it is closed, what it would
 * carry the moment it opened. A disconnected channel is not an empty screen:
 * it is an argument, which is why the not-connected branch still names the
 * work waiting behind it.
 */
export const ChannelDetailModal = ({
  channel,
  live,
  onClose,
  onConnect,
}: ChannelDetailModalProps) => {
  const t = useTranslations('portalV2.deploy');
  const stats = channelStats(channel.id, live);
  const groups = groupByCampaign(stats.rows);

  if (!channel.connected) {
    return (
      <Modal
        open
        wide
        onClose={onClose}
        title={channel.name}
        subtitle={t('channelClosedSub', { body: channel.body })}
        footer={
          <>
            <span className='flex-1' />
            <Button variant='ghost' size='sm' onClick={onClose}>
              {t('close')}
            </Button>
            <Button
              variant='primary'
              size='sm'
              onClick={() => onConnect(channel.id)}
            >
              {t('connectChannel', { name: channel.name })}
            </Button>
          </>
        }
      >
        <DeployNote>{t('channelClosedNote')}</DeployNote>
      </Modal>
    );
  }

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={channel.name}
      subtitle={channel.body}
      footer={
        <>
          <span className='flex-1' />
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('close')}
          </Button>
        </>
      }
    >
      <div className='flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
        <span className='inline-flex items-center gap-1.5'>
          <ChannelBadge channel={channel} />
          {t('channelLiveCount', { count: stats.rows.length })}
        </span>
        <span>
          <b className='font-[family-name:var(--pv2-disp)] text-[var(--pv2-ink)] tabular-nums'>
            {formatCount(stats.sessions)}
          </b>{' '}
          {t('sessions24h')}
        </span>
        <span
          className={cn(
            'font-semibold',
            stats.issues
              ? 'text-[var(--pv2-error)]'
              : 'text-[color-mix(in_srgb,var(--pv2-success)_78%,var(--pv2-ink))]'
          )}
        >
          {stats.issues
            ? t('issuesCount', { count: stats.issues })
            : t('noIssues')}
        </span>
        <span>{t('campaignsCount', { count: stats.campaigns })}</span>
      </div>

      {groups.length ? (
        <div className='mt-4 space-y-4'>
          {groups.map(group => (
            <section key={group.campaign.id}>
              <h3 className='mb-1.5 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
                {group.campaign.name}
              </h3>
              <ul className='divide-y divide-[var(--pv2-hair)] overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]'>
                {group.rows.map(row => (
                  <li
                    key={row.id}
                    className='flex flex-wrap items-center gap-3 px-3.5 py-2.5'
                  >
                    <span
                      className='size-7 shrink-0 rounded-[7px]'
                      style={{ background: row.experience.grad }}
                      aria-hidden
                    />
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {row.experience.name}
                      </span>
                      <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                        {row.subject.name} ·{' '}
                        {t('sessionsValue', {
                          count: formatCount(row.ops.sessions),
                        })}{' '}
                        · {row.ops.cvr}
                      </span>
                    </span>
                    <HealthPill health={row.ops.health} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className='mt-4 rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-6 text-center text-[13px] text-[var(--pv2-faint)]'>
          {t('channelNothingLive')}
        </p>
      )}

      <DeployNote className='mt-4'>{t('channelOpenNote')}</DeployNote>
    </Modal>
  );
};
