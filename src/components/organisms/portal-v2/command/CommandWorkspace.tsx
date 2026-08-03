'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { MyWorkPanel } from '@/components/organisms/portal-v2/command/MyWorkPanel';
import { PortfolioPanel } from '@/components/organisms/portal-v2/command/PortfolioPanel';
import { RecommendationsPanel } from '@/components/organisms/portal-v2/command/RecommendationsPanel';
import { COMMAND_TABS } from '@/lib/portal-v2/command/constants';
import {
  countMyWork,
  deriveKpis,
  deriveTasks,
  deriveUpcoming,
} from '@/lib/portal-v2/command/helpers';
import { MOCK_COMMAND } from '@/lib/portal-v2/command/mock';
import type {
  CommandRecommendation,
  CommandTabId,
  CommandTask,
} from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

export const CommandWorkspace = () => {
  const t = useTranslations('portalV2.command');
  const [tab, setTab] = useState<CommandTabId>('portfolio');

  const snapshot = MOCK_COMMAND;

  const tasks = useMemo(() => deriveTasks(snapshot), [snapshot]);
  const upcoming = useMemo(
    () => deriveUpcoming(snapshot.campaigns),
    [snapshot.campaigns]
  );
  const kpis = useMemo(
    () => deriveKpis(snapshot, tasks, upcoming),
    [snapshot, tasks, upcoming]
  );
  const myWorkCount = useMemo(() => countMyWork(tasks), [tasks]);
  const liveCampaigns = snapshot.campaigns.filter(
    c => c.status === 'live'
  ).length;

  const tabMeta = COMMAND_TABS.find(x => x.id === tab) ?? COMMAND_TABS[0]!;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const part =
      h < 12
        ? t('greetingMorning')
        : h < 18
          ? t('greetingAfternoon')
          : t('greetingEvening');
    const first = snapshot.user.name.split(' ')[0] ?? snapshot.user.name;
    return `${part}, ${first}`;
  }, [snapshot.user.name, t]);

  const tabItems = useMemo(
    () =>
      COMMAND_TABS.map(x => ({
        id: x.id,
        label: t(x.labelKey),
        count: x.id === 'mywork' && myWorkCount > 0 ? myWorkCount : undefined,
      })),
    [myWorkCount, t]
  );

  const handleKpiTab = (tabId: CommandTabId) => {
    setTab(tabId);
  };

  const handleTaskAction = (task: CommandTask) => {
    window.alert(
      JSON.stringify(
        {
          action: 'command.task',
          taskId: task.id,
          kind: task.kind,
          campaignId: task.campaignId,
        },
        null,
        2
      )
    );
  };

  const handleRecAction = (rec: CommandRecommendation) => {
    window.alert(
      JSON.stringify(
        {
          action: 'command.recommendation',
          recommendationId: rec.id,
          href: rec.actionHref,
        },
        null,
        2
      )
    );
  };

  const handleTabChange = (id: string) => {
    setTab(id as CommandTabId);
  };

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-4 py-5 md:px-5'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {greeting}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {snapshot.org.name}
              {' · '}
              {t(tabMeta.descKey)}
            </p>
          </div>

          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border border-[var(--pv2-hair)]',
              'bg-[var(--pv2-canvas)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--pv2-ink)]'
            )}
            aria-label={t('liveChipAria', { count: liveCampaigns })}
          >
            <span
              className='size-2 rounded-full bg-[var(--pv2-success)]'
              aria-hidden
            />
            {t('liveChip', { count: liveCampaigns })}
          </div>
        </div>
      </div>

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-4 md:px-5'>
          <Tabs
            items={tabItems}
            value={tab}
            onChange={handleTabChange}
            aria-label={t('tabsAria')}
          />
        </div>
      </div>

      <div className='mx-auto w-full px-4 py-5 md:px-5'>
        {tab === 'portfolio' ? (
          <PortfolioPanel
            snapshot={snapshot}
            kpis={kpis}
            upcoming={upcoming}
            t={t}
            onKpiClick={handleKpiTab}
          />
        ) : null}

        {tab === 'mywork' ? (
          <MyWorkPanel
            tasks={tasks}
            activity={snapshot.activity}
            userName={snapshot.user.name}
            t={t}
            onTaskAction={handleTaskAction}
          />
        ) : null}

        {tab === 'recs' ? (
          <RecommendationsPanel
            recommendations={snapshot.recommendations}
            t={t}
            onAction={handleRecAction}
          />
        ) : null}
      </div>
    </div>
  );
};
