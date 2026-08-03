'use client';

import { Rocket } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ChannelToggle } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployEmpty } from '@/components/organisms/portal-v2/deploy/DeployEmpty';
import { DeployNote } from '@/components/organisms/portal-v2/deploy/DeployNote';
import { DEPLOY_EXPERIENCE_CATEGORY } from '@/lib/portal-v2/deploy/constants';
import type { DeployChannel, Deployment } from '@/lib/portal-v2/deploy/types';

type DeployReadyPaneProps = {
  rows: Deployment[];
  channels: DeployChannel[];
  onToggleChannel: (rowId: string, channelId: string) => void;
  onDeploy: (row: Deployment) => void;
};

/**
 * The queue — what a campaign has finished and left waiting on a person.
 *
 * The channel picker sits on the card, not behind a dialog: choosing where
 * something goes is the decision this screen exists for, so it is never one
 * click away from the button that acts on it. Nothing about the experience
 * changes on the way out.
 */
export const DeployReadyPane = ({
  rows,
  channels,
  onToggleChannel,
  onDeploy,
}: DeployReadyPaneProps) => {
  const t = useTranslations('portalV2.deploy');

  if (!rows.length) {
    return <DeployEmpty title={t('readyEmpty')} hint={t('readyEmptyHint')} />;
  }

  return (
    <div className='space-y-3'>
      <DeployNote>{t('readyNote')}</DeployNote>

      {rows.map(row => {
        const count = row.channels.length;

        return (
          <article
            key={row.id}
            className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
          >
            <header className='flex flex-wrap items-center gap-3 px-4 py-3.5'>
              <span
                className='size-10 shrink-0 rounded-[9px]'
                style={{ background: row.experience.grad }}
                aria-hidden
              />

              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[14px] font-bold text-[var(--pv2-ink)]'>
                  {row.experience.name}
                </span>
                <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                  {row.campaign.name} · {row.subject.name} ·{' '}
                  {t(
                    row.subject.kind === 'product'
                      ? 'subjectProduct'
                      : 'subjectTopic'
                  )}{' '}
                  ·{' '}
                  {DEPLOY_EXPERIENCE_CATEGORY[row.experience.category] ??
                    row.experience.category}{' '}
                  · {t('ownerLabel', { name: row.owner })}
                </span>
              </span>

              <Button
                variant='primary'
                size='sm'
                disabled={count === 0}
                title={count === 0 ? t('deployNeedsChannel') : undefined}
                onClick={() => onDeploy(row)}
                aria-label={t('deployAria', { name: row.experience.name })}
              >
                <Rocket className='size-3.5' strokeWidth={2.2} aria-hidden />
                {t('deployToChannels', { count })}
              </Button>
            </header>

            <div className='flex flex-wrap items-center gap-2 border-t border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3'>
              <span className='mr-1 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
                {t('channelsLabel')}
              </span>
              {channels.map(channel => (
                <ChannelToggle
                  key={channel.id}
                  channel={channel}
                  selected={row.channels.includes(channel.id)}
                  onToggle={id => onToggleChannel(row.id, id)}
                  disabledHint={t('channelNotConnected')}
                />
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
};
