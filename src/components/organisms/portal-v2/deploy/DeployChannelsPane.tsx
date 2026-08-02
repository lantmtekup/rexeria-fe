'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ChannelBadge } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployNote } from '@/components/organisms/portal-v2/deploy/DeployNote';
import { channelStats, formatCount } from '@/lib/portal-v2/deploy/helpers';
import type { DeployChannel, Deployment } from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type DeployChannelsPaneProps = {
  channels: DeployChannel[];
  /** Live rows only — a closed pipe still shows what it would carry. */
  live: Deployment[];
  onToggle: (channelId: string) => void;
  onOpen: (channelId: string) => void;
};

type SwitchProps = {
  on: boolean;
  label: string;
  onToggle: () => void;
};

const Switch = ({ on, label, onToggle }: SwitchProps) => (
  <button
    type='button'
    role='switch'
    aria-checked={on}
    aria-label={label}
    onClick={onToggle}
    className={cn(
      'relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors',
      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
      on ? 'bg-[var(--pv2-electric)]' : 'bg-[var(--pv2-slate-300)]'
    )}
  >
    <span
      aria-hidden
      className={cn(
        'absolute top-0.5 size-4 rounded-full bg-white shadow-[var(--pv2-sh-sm)] transition-[left]',
        on ? 'left-[18px]' : 'left-0.5'
      )}
    />
  </button>
);

/** Where things go, and whether the pipes are open. */
export const DeployChannelsPane = ({
  channels,
  live,
  onToggle,
  onOpen,
}: DeployChannelsPaneProps) => {
  const t = useTranslations('portalV2.deploy');

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-3'>
        {channels.map(channel => {
          const stats = channelStats(channel.id, live);

          return (
            <article
              key={channel.id}
              className={cn(
                'flex flex-col overflow-hidden rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)]',
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
                      channel.connected
                        ? 'text-[color-mix(in_srgb,var(--pv2-success)_78%,var(--pv2-ink))]'
                        : 'text-[var(--pv2-faint)]'
                    )}
                  >
                    {channel.connected
                      ? t('channelLiveCount', { count: stats.rows.length })
                      : t('channelNotConnectedShort')}
                  </span>
                </span>
                <Switch
                  on={channel.connected}
                  label={t('channelToggleAria', { name: channel.name })}
                  onToggle={() => onToggle(channel.id)}
                />
              </div>

              <p className='mt-2.5 flex-1 px-4 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {channel.body}
              </p>

              <button
                type='button'
                onClick={() => onOpen(channel.id)}
                className={cn(
                  'mt-3 flex cursor-pointer items-center gap-1 px-4 pb-3 text-left',
                  'text-[12px] font-semibold text-[var(--pv2-electric)]',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                )}
              >
                {channel.connected ? t('viewChannel') : t('seeTheCase')}
                <ArrowRight
                  className='size-3.5'
                  strokeWidth={2.2}
                  aria-hidden
                />
              </button>

              {channel.connected ? (
                <div className='flex items-center justify-between gap-2 border-t border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-2.5 text-[11.5px]'>
                  <span className='text-[var(--pv2-mut)]'>
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
                      : t('healthy')}
                  </span>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <DeployNote>{t('channelsNote')}</DeployNote>
    </div>
  );
};
