'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { ChannelDetailModal } from '@/components/organisms/portal-v2/deploy/ChannelDetailModal';
import { DeployChannelsPane } from '@/components/organisms/portal-v2/deploy/DeployChannelsPane';
import { DeployKpis } from '@/components/organisms/portal-v2/deploy/DeployKpis';
import { DeployLivePane } from '@/components/organisms/portal-v2/deploy/DeployLivePane';
import { DeployReadyPane } from '@/components/organisms/portal-v2/deploy/DeployReadyPane';
import {
  DEPLOY_DEFAULT_TAB,
  DEPLOY_TABS,
} from '@/lib/portal-v2/deploy/constants';
import {
  deployTotals,
  deploymentsByStatus,
  findChannel,
  markLive,
  markReady,
  resolveChannels,
  toggleChannel,
  toggleRowChannel,
} from '@/lib/portal-v2/deploy/helpers';
import {
  MOCK_DEPLOY_BOARD,
  cloneDeployBoard,
} from '@/lib/portal-v2/deploy/mock';
import type {
  DeployBoard,
  DeployTabId,
  Deployment,
} from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

/**
 * Deploy — the publish hub the plan says is missing.
 *
 * §`#mod-deploy` is explicit that LIVE happens in exactly one place: a journey
 * has no deploy button of its own, and a campaign marking work `ready` is a
 * hand-off, not a publish. That rule is the reason this route holds the whole
 * board in one state object — the transition `ready → live` is a single
 * assignment here, and there is nowhere else it could be written from.
 *
 * P0 is mock (`lib/portal-v2/deploy/mock.ts`): deploying and pausing move a
 * row and toast the payload that a `/v1/deployments` call would carry. Nothing
 * is persisted, and nothing pretends to be.
 */
export const DeployWorkspace = () => {
  const t = useTranslations('portalV2.deploy');

  const [board, setBoard] = useState<DeployBoard>(() =>
    cloneDeployBoard(MOCK_DEPLOY_BOARD)
  );
  const [tab, setTab] = useState<DeployTabId>(DEPLOY_DEFAULT_TAB);
  /** The channel whose detail is open, by id. */
  const [openChannel, setOpenChannel] = useState<string | null>(null);

  const live = useMemo(() => deploymentsByStatus(board, 'live'), [board]);
  const ready = useMemo(() => deploymentsByStatus(board, 'ready'), [board]);
  const totals = useMemo(() => deployTotals(board), [board]);

  /**
   * The badge counts what its label names. The prototype put the ISSUE count
   * on the Live tab, which works there because it is styled as a warning —
   * in this neutral chip "Live now · 1" would read as one live row when eight
   * are out. Issues have their own KPI, and it is a button.
   */
  const tabs = useMemo(
    () =>
      DEPLOY_TABS.map(item => ({
        id: item.id,
        label: t(item.labelKey),
        count:
          item.id === 'live'
            ? totals.live || undefined
            : item.id === 'ready'
              ? totals.ready || undefined
              : undefined,
      })),
    [t, totals.live, totals.ready]
  );

  const activeTab =
    DEPLOY_TABS.find(item => item.id === tab) ?? DEPLOY_TABS[0]!;

  const handleToggleRowChannel = useCallback(
    (rowId: string, channelId: string) => {
      setBoard(prev => ({
        ...prev,
        deployments: toggleRowChannel(prev.deployments, rowId, channelId),
      }));
    },
    []
  );

  const handleDeploy = useCallback(
    (row: Deployment) => {
      if (!row.channels.length) return;

      /* Clock only inside a handler — a render on this route is pure. */
      const since = new Date().toISOString().slice(0, 10);
      const names = resolveChannels(board.channels, row.channels).map(
        c => c.name
      );

      setBoard(prev => ({
        ...prev,
        deployments: markLive(prev.deployments, row.id, since),
      }));
      setTab('live');

      toast.success(t('deployedToast', { name: row.experience.name }), {
        description: t('deployedToastBody', {
          channels: names.join(', '),
          campaign: row.campaign.name,
        }),
      });
    },
    [board.channels, t]
  );

  const handlePause = useCallback(
    (row: Deployment) => {
      setBoard(prev => ({
        ...prev,
        deployments: markReady(prev.deployments, row.id),
      }));
      toast(t('pausedToast', { name: row.experience.name }), {
        description: t('pausedToastBody'),
      });
    },
    [t]
  );

  /**
   * The toast is raised here, not inside the updater — a `setState` callback
   * runs twice under StrictMode, and a side effect in it would double-fire.
   */
  const handleToggleChannel = useCallback(
    (channelId: string) => {
      const target = findChannel(board.channels, channelId);
      if (!target) return;

      setBoard(prev => toggleChannel(prev, channelId));

      toast(
        target.connected
          ? t('channelDisconnectedToast', { name: target.name })
          : t('channelConnectedToast', { name: target.name })
      );
    },
    [board.channels, t]
  );

  const channel = openChannel ? findChannel(board.channels, openChannel) : null;

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            {/* The subtitle is the question the open tab answers. */}
            <p className='mt-1 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t(activeTab.questionKey)}
            </p>
          </div>

          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--pv2-hair)]',
              'bg-[var(--pv2-canvas)] px-3 py-1.5 text-[12px] font-semibold text-[var(--pv2-slate-500)]'
            )}
          >
            <span
              className='size-1.5 rounded-full bg-[var(--pv2-success)]'
              aria-hidden
            />
            {t('liveChip', {
              live: totals.live,
              channels: totals.channels,
            })}
          </span>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <div className='sticky top-0 z-10 -mx-5 mb-4 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
          <Tabs
            items={tabs}
            value={tab}
            onChange={id => setTab(id as DeployTabId)}
            aria-label={t('tabsAria')}
          />
        </div>

        <DeployKpis totals={totals} onOpenIssues={() => setTab('live')} />

        <div className='mt-4'>
          {tab === 'live' ? (
            <DeployLivePane
              rows={live}
              channels={board.channels}
              onPause={handlePause}
            />
          ) : null}

          {tab === 'ready' ? (
            <DeployReadyPane
              rows={ready}
              channels={board.channels}
              onToggleChannel={handleToggleRowChannel}
              onDeploy={handleDeploy}
            />
          ) : null}

          {tab === 'channels' ? (
            <DeployChannelsPane
              channels={board.channels}
              live={live}
              onToggle={handleToggleChannel}
              onOpen={setOpenChannel}
            />
          ) : null}
        </div>
      </div>

      {channel ? (
        <ChannelDetailModal
          key={channel.id}
          channel={channel}
          live={live}
          onClose={() => setOpenChannel(null)}
          onConnect={id => {
            handleToggleChannel(id);
            setOpenChannel(null);
          }}
        />
      ) : null}
    </div>
  );
};
