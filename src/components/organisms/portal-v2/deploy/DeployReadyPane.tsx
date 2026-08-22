'use client';

import { AlertTriangle, Rocket } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ChannelToggle } from '@/components/organisms/portal-v2/deploy/ChannelChip';
import { DeployEmpty } from '@/components/organisms/portal-v2/deploy/DeployEmpty';
import { DeployNote } from '@/components/organisms/portal-v2/deploy/DeployNote';
import { ownerName } from '@/lib/portal-v2/campaigns/helpers';
import type { CampaignTeamMember } from '@/lib/portal-v2/campaigns/types';
import { DEPLOY_REASON_KEY } from '@/lib/portal-v2/deploy/constants';
import { canDeploySelection } from '@/lib/portal-v2/deploy/helpers';
import type {
  DeployChannel,
  ReadyDeployRow,
} from '@/lib/portal-v2/deploy/types';

type DeployReadyPaneProps = {
  rows: ReadyDeployRow[];
  channels: DeployChannel[];
  team: CampaignTeamMember[];
  /** Channels staged per row, client-side only — the BE keeps no selection
   *  for an item that isn't live yet. */
  selections: Record<string, string[]>;
  onToggleChannel: (rowId: string, channelId: string) => void;
  onDeploy: (row: ReadyDeployRow) => void;
  deployingRow: string | null;
};

/**
 * The queue — what a campaign has finished and left waiting on a person.
 *
 * The channel picker sits on the card, not behind a dialog: choosing where
 * something goes is the decision this screen exists for. Domain choice does
 * NOT live here — a brand's Web channel is bound to one domain once, on the
 * Channels tab, not picked per deployment (see `types.ts`).
 */
export const DeployReadyPane = ({
  rows,
  channels,
  team,
  selections,
  onToggleChannel,
  onDeploy,
  deployingRow,
}: DeployReadyPaneProps) => {
  const t = useTranslations('portalV2.deploy');

  if (!rows.length) {
    return <DeployEmpty title={t('readyEmpty')} hint={t('readyEmptyHint')} />;
  }

  return (
    <div className='space-y-3'>
      <DeployNote>{t('readyNote')}</DeployNote>

      {rows.map(row => {
        const selected = selections[row.id] ?? [];
        /**
         * `canDeploySelection` already existed as a pure helper but was never
         * wired to the button — the click always reached the BE and came back
         * with a raw English 409 (e.g. "one or more selected channels are not
         * connected") even though the picked channel's disconnected state was
         * fully knowable client-side. Gating here turns that into a disabled
         * button instead of a surprise toast; anything it CAN'T know (no
         * active release, unresolved journey, media rights) still relies on
         * `row.blockers` — surfaced by the BE's Ready queue — or the 409.
         */
        const canDeploy = canDeploySelection(selected, channels, row.blockers);
        const owner = row.ownerId ? ownerName(row.ownerId, team) : '';

        return (
          <article
            key={row.id}
            className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
          >
            <header className='flex flex-wrap items-center gap-3 px-4 py-3.5'>
              <span
                className='size-10 shrink-0 rounded-[9px] bg-[var(--pv2-grad-primary)]'
                aria-hidden
              />

              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[14px] font-bold text-[var(--pv2-ink)]'>
                  {row.experiences[0]?.name ?? row.subjectName ?? t('untitled')}
                </span>
                <span className='block truncate text-[11.5px] text-[var(--pv2-faint)]'>
                  {row.campaign.name}
                  {row.subjectName ? ` · ${row.subjectName}` : ''} ·{' '}
                  {t(
                    row.kind === 'product' ? 'subjectProduct' : 'subjectTopic'
                  )}
                  {owner ? ` · ${t('ownerLabel', { name: owner })}` : ''}
                </span>
              </span>

              <Button
                variant='primary'
                size='sm'
                disabled={deployingRow === row.id || !canDeploy}
                onClick={() => onDeploy(row)}
                title={
                  !canDeploy && deployingRow !== row.id
                    ? selected.length === 0
                      ? t('deployNeedsChannel')
                      : t('deployNeedsConnectedChannel')
                    : undefined
                }
                aria-label={t('deployAria', {
                  name: row.experiences[0]?.name ?? row.subjectName ?? row.id,
                })}
              >
                <Rocket className='size-3.5' strokeWidth={2.2} aria-hidden />
                {deployingRow === row.id
                  ? t('deploying')
                  : t('deployToChannels', { count: selected.length })}
              </Button>
            </header>

            {row.blockers.length > 0 ? (
              <div className='flex items-start gap-2.5 border-t border-[var(--pv2-hair)] bg-[color-mix(in_srgb,var(--pv2-error)_8%,transparent)] px-4 py-2.5 text-[12px] leading-relaxed text-[var(--pv2-error)]'>
                <AlertTriangle
                  className='mt-px size-3.5 shrink-0'
                  strokeWidth={2.2}
                  aria-hidden
                />
                <span>
                  {row.blockers
                    .map(reason => {
                      const key = DEPLOY_REASON_KEY[reason];
                      return key ? t(key) : reason;
                    })
                    .join(' ')}
                </span>
              </div>
            ) : null}

            <div className='flex flex-wrap items-center gap-2 border-t border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3'>
              <span className='mr-1 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
                {t('channelsLabel')}
              </span>
              {channels.map(ch => (
                <ChannelToggle
                  key={ch.id}
                  channel={ch}
                  selected={selected.includes(ch.id)}
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
