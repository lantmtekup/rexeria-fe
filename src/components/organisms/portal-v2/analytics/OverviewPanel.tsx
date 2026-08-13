'use client';

import {
  ArrowRight,
  BarChart3,
  Blocks,
  Map,
  Package,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { LiftPill } from '@/components/organisms/portal-v2/campaigns/detail/VerdictStats';
import { HealthBadge } from '@/components/molecules/portal-v2/campaigns-form';
import { ChannelMixChart } from '@/components/organisms/portal-v2/analytics/ChannelMixChart';
import { LeakFunnelSection } from '@/components/organisms/portal-v2/analytics/LeakFunnelSection';
import { PulseFunnelChart } from '@/components/organisms/portal-v2/analytics/PulseFunnelChart';
import { PulseMetricHead } from '@/components/organisms/portal-v2/analytics/PulseMetricHead';
import { PulseRow } from '@/components/organisms/portal-v2/analytics/PulseRow';
import { HEALTH_RANK } from '@/lib/portal-v2/analytics/constants';
import {
  buildPulseFacts,
  trackingCoverage,
} from '@/lib/portal-v2/analytics/facts';
import {
  channelMix,
  fmtAssist,
  fmtLift,
  fmtMoney,
  fmtPct,
  leakFunnel,
  rollup,
} from '@/lib/portal-v2/analytics/helpers';
import { insItems } from '@/lib/portal-v2/analytics/insights';
import {
  openCampaignDrill,
  openInsightCareer,
} from '@/lib/portal-v2/analytics/params';
import type {
  BlockInsightItem,
  ExperienceInsightItem,
  InsightType,
  JourneyInsightItem,
  ProductInsightItem,
  PulseViewState,
} from '@/lib/portal-v2/analytics/types';
import { campHealth, campVerdict } from '@/lib/portal-v2/campaigns/verdict';
import {
  MOCK_CAMPAIGNS,
  MOCK_CAMPAIGN_EXPERIENCES,
} from '@/lib/portal-v2/campaigns/mock';
import { MOCK_JOURNEYS } from '@/lib/portal-v2/journeys/mock';

type OverviewPanelProps = {
  state: PulseViewState;
  onStateChange: (state: PulseViewState) => void;
  today: string;
};

const LAYER_ICONS = {
  experiences: Sparkles,
  products: Package,
  journeys: Map,
  blocks: Blocks,
} as const;

export const OverviewPanel = ({
  state,
  onStateChange,
  today,
}: OverviewPanelProps) => {
  const t = useTranslations('portalV2.analytics');
  const rows = buildPulseFacts();
  const total = rollup(rows);
  const { pct: coveragePct } = trackingCoverage(rows);
  const { steps, leaks } = leakFunnel(rows);
  const channels = channelMix(rows);

  const campaignsWithData = MOCK_CAMPAIGNS.filter(campaign =>
    rows.some(row => row.campaignId === campaign.id)
  )
    .map(campaign => ({
      campaign,
      health: campHealth(
        campaign,
        MOCK_CAMPAIGN_EXPERIENCES,
        today,
        MOCK_JOURNEYS
      ),
      verdict: campVerdict(campaign, MOCK_CAMPAIGN_EXPERIENCES),
    }))
    .sort((a, b) => {
      const rankA = HEALTH_RANK[a.health.state] ?? 9;
      const rankB = HEALTH_RANK[b.health.state] ?? 9;
      return rankA - rankB || (b.verdict?.roi ?? 0) - (a.verdict?.roi ?? 0);
    });

  const needAttention = campaignsWithData.filter(
    item => item.health.state === 'risk' || item.health.state === 'delayed'
  ).length;

  const layers: {
    type: InsightType;
    title: string;
    sub: string;
    tone: string;
    items: { id: string; name: string; value: string }[];
  }[] = [
    {
      type: 'experiences',
      title: t('layers.experiences'),
      sub: t('layers.experiencesSub', {
        count: MOCK_CAMPAIGN_EXPERIENCES.filter(item => item.template).length,
      }),
      tone: 'var(--pv2-electric)',
      items: (insItems('experiences') as ExperienceInsightItem[])
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          name: item.name,
          value: `${fmtLift(item.rollup.lift)} lift`,
        })),
    },
    {
      type: 'products',
      title: t('layers.products'),
      sub: t('layers.productsSub', { count: insItems('products').length }),
      tone: 'var(--pv2-success)',
      items: (insItems('products') as ProductInsightItem[])
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          name: item.name,
          value: fmtMoney(item.rollup.revenue),
        })),
    },
    {
      type: 'journeys',
      title: t('layers.journeys'),
      sub: t('layers.journeysSub', { count: insItems('journeys').length }),
      tone: 'var(--pv2-warning)',
      items: (insItems('journeys') as JourneyInsightItem[])
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          name: item.name,
          value: `${fmtPct(item.rollup.cvr)} complete`,
        })),
    },
    {
      type: 'blocks',
      title: t('layers.blocks'),
      sub: t('layers.blocksSub', { count: insItems('blocks').length }),
      tone: 'var(--pv2-ink-2)',
      items: (insItems('blocks') as BlockInsightItem[])
        .slice(0, 3)
        .map(item => ({
          id: item.id,
          name: item.name,
          value:
            item.assist != null
              ? `${fmtAssist(item.assist)} assist`
              : t('rankings.untracked'),
        })),
    },
  ];

  return (
    <div className='flex flex-col gap-6'>
      <PulseMetricHead
        rollup={total}
        coveragePct={coveragePct}
        labels={{
          sessions: t('metrics.sessions'),
          conversion: t('metrics.conversion'),
          revenue: t('metrics.revenue'),
          roas: t('metrics.roas'),
          coverage: t('metrics.coverage'),
        }}
      />

      <LeakFunnelSection
        title={t('charts.funnelTitle')}
        hint={t('charts.funnelSub')}
        note={t('charts.funnelNote')}
      >
        <PulseFunnelChart
          steps={steps}
          leaks={leaks}
          ariaLabel={t('charts.funnelAria')}
          riskLabel={t('charts.riskLabel')}
        />
      </LeakFunnelSection>

      <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4 md:p-5'>
        <div className='mb-4'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold text-[var(--pv2-ink)]'>
            {t('charts.channelTitle')}
          </h3>
          <p className='mt-1 text-[12.5px] text-[var(--pv2-mut)]'>
            {t('charts.channelSub')}
          </p>
        </div>
        <ChannelMixChart rows={channels} />
      </section>

      <section>
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('layers.eyebrow')}
        </p>
        <div className='grid gap-3 lg:grid-cols-2'>
          {layers.map(layer => {
            const Icon = LAYER_ICONS[layer.type];
            return (
              <div
                key={layer.type}
                className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4'
              >
                <div className='mb-3 flex items-start gap-3'>
                  <span
                    className='grid size-8 place-items-center rounded-[var(--pv2-r-sm)] text-[var(--pv2-paper)]'
                    style={{ background: layer.tone }}
                  >
                    <Icon className='size-4' aria-hidden />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <strong className='block text-[14px] text-[var(--pv2-ink)]'>
                      {layer.title}
                    </strong>
                    <span className='text-[11.5px] text-[var(--pv2-mut)]'>
                      {layer.sub}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={() =>
                      onStateChange({
                        ...state,
                        lens: 'insights',
                        insightType: layer.type,
                        insightObjectId: null,
                        drill: {
                          campaignId: null,
                          subject: null,
                          experienceId: null,
                          blockIndex: null,
                          componentEl: null,
                        },
                      })
                    }
                    className='inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--pv2-electric)]'
                  >
                    {t('layers.seeAll')}
                    <ArrowRight className='size-3.5' aria-hidden />
                  </button>
                </div>
                <div className='flex flex-col gap-1.5'>
                  {layer.items.length ? (
                    layer.items.map(item => (
                      <button
                        key={item.id}
                        type='button'
                        onClick={() =>
                          onStateChange(
                            openInsightCareer(state, layer.type, item.id)
                          )
                        }
                        className='flex items-center justify-between rounded-[8px] px-2.5 py-2 text-left hover:bg-[var(--pv2-canvas)]'
                      >
                        <span className='truncate text-[12.5px] font-medium text-[var(--pv2-ink)]'>
                          {item.name}
                        </span>
                        <span className='shrink-0 text-[12px] text-[var(--pv2-mut)]'>
                          {item.value}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className='px-2.5 py-2 text-[12px] text-[var(--pv2-faint)]'>
                      {t('empty.layer')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        {needAttention ? (
          <div className='mb-3 flex items-center gap-2 rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-warning)_10%,transparent)] px-3 py-2 text-[12.5px] text-[var(--pv2-ink)]'>
            <BarChart3
              className='size-4 shrink-0 text-[var(--pv2-warning)]'
              aria-hidden
            />
            <span>{t('campaigns.attention', { count: needAttention })}</span>
          </div>
        ) : null}
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('campaigns.eyebrow')}
        </p>
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {campaignsWithData.map(({ campaign, health, verdict }) => (
            <div
              key={campaign.id}
              className='border-b border-[var(--pv2-hair)] last:border-b-0'
            >
              <div className='flex flex-wrap items-center gap-2 px-4 pt-3'>
                <HealthBadge health={health} />
                {verdict ? <LiftPill lift={verdict.lift} /> : null}
              </div>
              <PulseRow
                title={campaign.name}
                subtitle={`${campaign.type} · ${campaign.status}`}
                metrics={[
                  verdict ? fmtMoney(verdict.revenue) : '—',
                  verdict
                    ? `${verdict.roi >= 0 ? '+' : ''}${Math.round(verdict.roi * 100)}% ROI`
                    : '—',
                ]}
                onClick={() =>
                  onStateChange(openCampaignDrill(state, campaign.id))
                }
                className='border-b-0 md:grid-cols-[minmax(0,1.4fr)_auto_auto]'
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
