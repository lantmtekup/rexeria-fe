'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ChannelBadge } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployNote } from '@/components/organisms/portal-v2/deploy/DeployNote';
import { DEPLOY_CHANNEL_KIND } from '@/lib/portal-v2/deploy/constants';
import { channelStats } from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployChannel,
  LiveDeployRow,
} from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type DeployChannelsPaneProps = {
  channels: DeployChannel[];
  live: LiveDeployRow[];
  onOpen: (channelId: string) => void;
};

/**
 * Where things go, and whether the pipes are open.
 *
 * Connect/disconnect both happen inside the detail modal now, not an inline
 * switch here — connecting the `web` kind needs a domain, `shopify` needs a
 * shop + token, and neither fits a single click. Every card just opens the
 * modal; what happens next depends on the kind.
 */
export const DeployChannelsPane = ({
  channels,
  live,
  onOpen,
}: DeployChannelsPaneProps) => {
  const t = useTranslations('portalV2.deploy');

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-3'>
        {channels.map(channel => {
          const stats = channelStats(channel.id, live);
          const style = DEPLOY_CHANNEL_KIND[channel.kind];

          return (
            <button
              key={channel.id}
              type='button'
              onClick={() => onOpen(channel.id)}
              className={cn(
                'flex cursor-pointer flex-col overflow-hidden rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)] text-left',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                channel.connected
                  ? 'border-[var(--pv2-hair)]'
                  : 'border-dashed border-[var(--pv2-hair)]'
              )}
            >
              <div className='flex items-start gap-2.5 px-4 pt-4'>
                <ChannelBadge channel={channel} size='md' />
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[14px] font-bold text-[var(--pv2-ink)]'>
                    {channel.name}
                  </span>
                  <span
                    className={cn(
                      'block truncate text-[11.5px]',
                      channel.status === 'error'
                        ? 'text-[var(--pv2-error)]'
                        : channel.connected
                          ? 'text-[color-mix(in_srgb,var(--pv2-success)_78%,var(--pv2-ink))]'
                          : 'text-[var(--pv2-faint)]'
                    )}
                  >
                    {channel.status === 'error'
                      ? t('channelStatusError')
                      : channel.connected
                        ? t('channelLiveCount', { count: stats.rows.length })
                        : t('channelNotConnectedShort')}
                  </span>
                </span>
              </div>

              <p className='mt-2.5 flex-1 px-4 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t(style.bodyKey)}
              </p>

              <span className='mt-3 flex items-center gap-1 px-4 pb-3 text-[12px] font-semibold text-[var(--pv2-electric)]'>
                {channel.connected ? t('viewChannel') : t('seeTheCase')}
                <ArrowRight
                  className='size-3.5'
                  strokeWidth={2.2}
                  aria-hidden
                />
              </span>

              {channel.connected ? (
                <div className='flex items-center justify-between gap-2 border-t border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-2.5 text-[11.5px]'>
                  <span className='text-[var(--pv2-mut)]'>
                    {t('channelRowsCount', { count: stats.rows.length })}
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
                      : t('healthy')}
                  </span>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      <DeployNote>{t('channelsNote')}</DeployNote>
    </div>
  );
};
