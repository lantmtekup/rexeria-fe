'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { AnalyticsDrillPanel } from '@/components/organisms/portal-v2/analytics/AnalyticsDrillPanel';
import { OverviewPanel } from '@/components/organisms/portal-v2/analytics/OverviewPanel';
import { PagesPanel } from '@/components/organisms/portal-v2/analytics/PagesPanel';
import { RankingsPanel } from '@/components/organisms/portal-v2/analytics/RankingsPanel';
import { PULSE_TABS } from '@/lib/portal-v2/analytics/constants';
import { writePulseViewState } from '@/lib/portal-v2/analytics/params';
import type { PulseBlockRow } from '@/lib/portal-v2/analytics/pulseView';
import type { PulseViewState } from '@/lib/portal-v2/analytics/types';
import type { PulseOverviewData } from '@/services/portal-v2/analyticsPulse';

type AnalyticsWorkspaceProps = {
  initialState: PulseViewState;
  /** Nạp ở server — tab đầu tiên không chớp một khung rỗng rồi mới có số. */
  overview: PulseOverviewData;
  blocks: PulseBlockRow[];
  brandId: string | null;
};

export const AnalyticsWorkspace = ({
  initialState,
  overview,
  blocks,
  brandId,
}: AnalyticsWorkspaceProps) => {
  const t = useTranslations('portalV2.analytics');
  const [state, setState] = useState<PulseViewState>(initialState);

  useEffect(() => {
    writePulseViewState(state);
  }, [state]);

  const tabItems = useMemo(
    () =>
      PULSE_TABS.map(tab => ({
        id: tab.id,
        label: t(tab.labelKey),
      })),
    [t]
  );

  const activeTab =
    PULSE_TABS.find(tab => tab.id === state.lens) ?? PULSE_TABS[0]!;

  const handleStateChange = (next: PulseViewState) => {
    setState(next);
  };

  const handleTabChange = (lens: string) => {
    setState(current => ({
      ...current,
      lens: lens as PulseViewState['lens'],
      insightObjectId: lens === 'insights' ? current.insightObjectId : null,
    }));
  };

  return (
    <div className='flex min-h-0 flex-col'>
      <header className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0 flex-1'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-3xl text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t(activeTab.subtitleKey)}
            </p>
          </div>

          <div className='max-w-sm shrink-0 pb-0.5 text-left md:max-w-xs md:text-right'>
            <p className='text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
              <span className='font-semibold text-[var(--pv2-ink)]'>
                {t('identity.title')}
              </span>{' '}
              <span className='hidden sm:inline'>{t('identity.body')}</span>
            </p>
            <Link
              href='/portal-v2/ai'
              className='mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--pv2-electric)] transition-colors hover:text-[var(--pv2-ink)]'
            >
              {t('identity.cta')}
              <ArrowRight className='size-3' strokeWidth={2.2} aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-5 md:px-8'>
          <Tabs
            items={tabItems}
            value={state.lens}
            onChange={handleTabChange}
            aria-label={t('tabs.aria')}
          />
        </div>
      </div>

      <div
        key={state.lens}
        role='tabpanel'
        className='mx-auto w-full px-5 py-8 md:px-8'
      >
        {state.lens === 'overview' ? (
          <OverviewPanel
            state={state}
            onStateChange={handleStateChange}
            data={overview}
            blocks={blocks}
          />
        ) : null}
        {state.lens === 'pages' ? <PagesPanel /> : null}
        {state.lens === 'analytics' ? (
          <AnalyticsDrillPanel
            state={state}
            onStateChange={handleStateChange}
            campaigns={overview.campaigns}
            brandId={brandId}
          />
        ) : null}
        {state.lens === 'insights' ? (
          <RankingsPanel
            state={state}
            onStateChange={handleStateChange}
            brandId={brandId}
          />
        ) : null}
      </div>
    </div>
  );
};
