'use client';

import { useTranslations } from 'next-intl';

import { LiftPill } from '@/components/organisms/portal-v2/campaigns/detail/VerdictStats';
import { HealthBadge } from '@/components/molecules/portal-v2/campaigns-form';
import { DrillBreadcrumb } from '@/components/organisms/portal-v2/analytics/DrillBreadcrumb';
import { LeakFunnelSection } from '@/components/organisms/portal-v2/analytics/LeakFunnelSection';
import { PulseFunnelChart } from '@/components/organisms/portal-v2/analytics/PulseFunnelChart';
import { PulseMetricHead } from '@/components/organisms/portal-v2/analytics/PulseMetricHead';
import { PulseRow } from '@/components/organisms/portal-v2/analytics/PulseRow';
import { HEALTH_RANK } from '@/lib/portal-v2/analytics/constants';
import {
  findFactRow,
  journeyPhasesForSubject,
} from '@/lib/portal-v2/analytics/drill';
import {
  pulseFactsForCampaign,
  trackingCoverage,
} from '@/lib/portal-v2/analytics/facts';
import {
  fmtAssist,
  fmtCount,
  fmtMoney,
  fmtPct,
  groupBySubject,
  leakFunnel,
  rollup,
  shortExperienceName,
} from '@/lib/portal-v2/analytics/helpers';
import {
  clearDrill,
  drillAtLevel,
  openCampaignDrill,
} from '@/lib/portal-v2/analytics/params';
import type { PulseViewState } from '@/lib/portal-v2/analytics/types';
import { campHealth, campVerdict } from '@/lib/portal-v2/campaigns/verdict';
import {
  MOCK_CAMPAIGNS,
  MOCK_CAMPAIGN_EXPERIENCES,
} from '@/lib/portal-v2/campaigns/mock';
import { MOCK_JOURNEYS } from '@/lib/portal-v2/journeys/mock';
import { cn } from '@/lib/cn';

type AnalyticsDrillPanelProps = {
  state: PulseViewState;
  onStateChange: (state: PulseViewState) => void;
  today: string;
};

export const AnalyticsDrillPanel = ({
  state,
  onStateChange,
  today,
}: AnalyticsDrillPanelProps) => {
  const t = useTranslations('portalV2.analytics');
  const tCampaigns = useTranslations('portalV2.campaigns');
  const { drill } = state;
  const rows = buildRows();
  const campaigns = MOCK_CAMPAIGNS.filter(
    campaign => pulseFactsForCampaign(campaign.id).length
  );

  function buildRows() {
    if (!drill.campaignId) return [];
    return pulseFactsForCampaign(drill.campaignId);
  }

  const campaign =
    drill.campaignId != null
      ? (MOCK_CAMPAIGNS.find(item => item.id === drill.campaignId) ?? null)
      : null;

  if (!campaign) {
    const cards = campaigns
      .map(item => ({
        campaign: item,
        health: campHealth(
          item,
          MOCK_CAMPAIGN_EXPERIENCES,
          today,
          MOCK_JOURNEYS
        ),
        verdict: campVerdict(item, MOCK_CAMPAIGN_EXPERIENCES),
      }))
      .sort((a, b) => {
        const rankA = HEALTH_RANK[a.health.state] ?? 9;
        const rankB = HEALTH_RANK[b.health.state] ?? 9;
        return rankA - rankB || (b.verdict?.roi ?? 0) - (a.verdict?.roi ?? 0);
      });

    return (
      <div>
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('drill.boardEyebrow')}
        </p>
        <div className='grid gap-3 md:grid-cols-2'>
          {cards.map(({ campaign: item, health, verdict }) => (
            <button
              key={item.id}
              type='button'
              onClick={() => onStateChange(openCampaignDrill(state, item.id))}
              className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4 text-left transition-colors hover:border-[var(--pv2-electric)]'
            >
              <div className='mb-2 flex items-start justify-between gap-3'>
                <strong className='font-[family-name:var(--pv2-disp)] text-[15px] text-[var(--pv2-ink)]'>
                  {item.name}
                </strong>
                <HealthBadge health={health} />
              </div>
              <p className='text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
                {tCampaigns(health.whyKey, health.values ?? {})}
              </p>
              {verdict ? (
                <p className='mt-3 text-[12.5px] text-[var(--pv2-ink)]'>
                  <em className='text-[var(--pv2-mut)] not-italic'>
                    {fmtMoney(verdict.revenue)} assisted
                  </em>{' '}
                  ·{' '}
                  <strong>
                    {verdict.roi >= 0 ? '+' : ''}
                    {Math.round(verdict.roi * 100)}% ROI
                  </strong>{' '}
                  <LiftPill lift={verdict.lift} />
                </p>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const crumbs = [
    {
      label: t('drill.allCampaigns'),
      onClick: () => onStateChange(clearDrill(state)),
    },
    {
      label: campaign.name,
      onClick: () =>
        onStateChange(
          drillAtLevel(state, {
            campaignId: campaign.id,
            subject: null,
            experienceId: null,
            blockIndex: null,
            componentEl: null,
          })
        ),
    },
  ];

  if (drill.subject) {
    crumbs.push({
      label: drill.subject,
      onClick: () =>
        onStateChange(
          drillAtLevel(state, {
            campaignId: campaign.id,
            subject: drill.subject,
            experienceId: null,
            blockIndex: null,
            componentEl: null,
          })
        ),
    });
  }

  if (drill.experienceId) {
    const row = findFactRow(campaign.id, drill.experienceId);
    crumbs.push({
      label: row ? shortExperienceName(row.experienceName) : drill.experienceId,
      onClick: () =>
        onStateChange(
          drillAtLevel(state, {
            campaignId: campaign.id,
            subject: drill.subject,
            experienceId: drill.experienceId,
            blockIndex: null,
            componentEl: null,
          })
        ),
    });
  }

  if (drill.blockIndex != null) {
    const row = findFactRow(campaign.id, drill.experienceId ?? '');
    const block = row?.blocks[drill.blockIndex];
    if (block) {
      crumbs.push({
        label: block.name,
        onClick: () =>
          onStateChange(
            drillAtLevel(state, {
              campaignId: campaign.id,
              subject: drill.subject,
              experienceId: drill.experienceId,
              blockIndex: drill.blockIndex,
              componentEl: null,
            })
          ),
      });
    }
  }

  if (drill.componentEl) {
    crumbs.push({
      label: drill.componentEl,
      onClick: () => undefined,
    });
  }

  const { pct: coveragePct } = trackingCoverage(rows);
  const total = rollup(rows);

  const renderBody = () => {
    if (
      drill.componentEl != null &&
      drill.blockIndex != null &&
      drill.experienceId
    ) {
      const row = findFactRow(campaign.id, drill.experienceId);
      const block = row?.blocks[drill.blockIndex];
      const component = block?.comps.find(
        item => item.el === drill.componentEl
      );
      if (!component || !block) return null;

      return (
        <div className='flex flex-col gap-5'>
          <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-4'>
            {[
              [fmtCount(component.signals), t('signal.signals')],
              [fmtAssist(component.assist), t('signal.lift')],
              [`${component.conf}%`, t('signal.confidence')],
              [component.kind, t('signal.kind')],
            ].map(([value, label]) => (
              <div key={label} className='bg-[var(--pv2-paper)] px-4 py-4'>
                <p className='text-[10px] font-bold tracking-[0.11em] text-[var(--pv2-faint)] uppercase'>
                  {label}
                </p>
                <strong className='mt-1 block text-xl text-[var(--pv2-ink)]'>
                  {value}
                </strong>
              </div>
            ))}
          </div>
          <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4'>
            <dl className='grid gap-3 sm:grid-cols-2'>
              {[
                [t('signal.meaning'), component.meaning],
                [t('signal.event'), component.event],
                [t('signal.object'), component.kind],
                [t('signal.strength'), '●'.repeat(component.strength)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className='text-[10px] font-bold tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
                    {label}
                  </dt>
                  <dd className='mt-1 text-[13px] text-[var(--pv2-ink)]'>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className='mt-4 text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
              {t('signal.disclaimer')}
            </p>
          </div>
        </div>
      );
    }

    if (drill.blockIndex != null && drill.experienceId) {
      const row = findFactRow(campaign.id, drill.experienceId);
      const block = row?.blocks[drill.blockIndex];
      if (!row || !block) return null;

      return (
        <div className='flex flex-col gap-5'>
          <div className='grid grid-cols-2 gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-4'>
            {[
              [fmtCount(block.views), t('block.views')],
              [fmtPct(block.interRate), t('block.interaction')],
              [fmtPct(block.exitRate), t('block.exit')],
              [`${block.dwell}s`, t('block.dwell')],
            ].map(([value, label]) => (
              <div key={label} className='bg-[var(--pv2-paper)] px-4 py-4'>
                <p className='text-[10px] font-bold tracking-[0.11em] text-[var(--pv2-faint)] uppercase'>
                  {label}
                </p>
                <strong className='mt-1 block text-xl text-[var(--pv2-ink)]'>
                  {value}
                </strong>
              </div>
            ))}
          </div>
          <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
            {block.comps.length ? (
              block.comps.map(component => (
                <PulseRow
                  key={component.el}
                  title={component.meaning || component.kind}
                  subtitle={`${component.kind} · ${component.event} · ${component.type}`}
                  metrics={[
                    `${fmtCount(component.signals)} signals`,
                    `${fmtAssist(component.assist)} assist`,
                  ]}
                  coverage={`${component.conf}% conf`}
                  onClick={() =>
                    onStateChange(
                      drillAtLevel(state, {
                        ...drill,
                        componentEl: component.el,
                      })
                    )
                  }
                />
              ))
            ) : (
              <p className='px-4 py-5 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('block.untracked')}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (drill.experienceId) {
      const row = findFactRow(campaign.id, drill.experienceId);
      if (!row) return null;
      const funnelValues = [
        row.sessions,
        row.engaged,
        row.explored,
        row.convinced,
        row.converted,
      ];
      const max = row.sessions || 1;

      return (
        <div className='flex flex-col gap-5'>
          <div>
            <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
              {t('drill.experienceFunnel', {
                name: shortExperienceName(row.experienceName),
              })}
            </p>
            <div className='space-y-2'>
              {funnelValues.map((value, index) => (
                <div
                  key={index}
                  className='grid grid-cols-[120px_1fr_auto] items-center gap-3'
                >
                  <span className='text-[12px] text-[var(--pv2-mut)]'>
                    {
                      [
                        'Sessions',
                        'Engaged',
                        'Explored',
                        'Convinced',
                        'Converted',
                      ][index]
                    }
                  </span>
                  <span className='h-2 overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
                    <span
                      className='block h-full rounded-full bg-[var(--pv2-electric)]'
                      style={{ width: `${Math.round((value / max) * 100)}%` }}
                    />
                  </span>
                  <span className='text-[12px] text-[var(--pv2-ink)] tabular-nums'>
                    {fmtCount(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
            {row.blocks.map(block => (
              <PulseRow
                key={block.index}
                title={block.name}
                subtitle={`${block.role} · ${block.comps.length} tracked`}
                metrics={[
                  `${fmtCount(block.views)} views`,
                  `${fmtPct(block.doneRate)} done · ${fmtPct(block.exitRate)} exit`,
                ]}
                coverage={
                  block.comps.length
                    ? `${fmtPct(block.interRate)} interact`
                    : t('rankings.untracked')
                }
                coverageLow={!block.comps.length}
                onClick={() =>
                  onStateChange(
                    drillAtLevel(state, {
                      ...drill,
                      blockIndex: block.index,
                      componentEl: null,
                    })
                  )
                }
              />
            ))}
          </div>
        </div>
      );
    }

    if (drill.subject) {
      const phases = journeyPhasesForSubject(campaign.id, drill.subject);
      return (
        <div className='flex flex-col gap-4'>
          {phases.map(phase => (
            <section
              key={phase.label}
              className={cn(
                'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
                phase.kind === 'off' && 'opacity-80'
              )}
            >
              <div className='flex items-center justify-between border-b border-[var(--pv2-hair)] px-4 py-3'>
                <div>
                  <strong className='text-[13.5px] text-[var(--pv2-ink)]'>
                    {phase.label}
                  </strong>
                  {phase.hint ? (
                    <p className='text-[11.5px] text-[var(--pv2-mut)]'>
                      {phase.hint}
                    </p>
                  ) : null}
                </div>
                <span className='text-[11px] text-[var(--pv2-faint)]'>
                  {t('drill.experienceCount', { count: phase.rows.length })}
                </span>
              </div>
              {phase.rows.length ? (
                <div>
                  {phase.rows.map(row => (
                    <PulseRow
                      key={`${row.experienceId}-${row.channel}`}
                      title={shortExperienceName(row.experienceName)}
                      subtitle={row.channel}
                      metrics={[
                        `${fmtCount(row.sessions)} sessions`,
                        `${fmtPct(row.cvr)} cvr`,
                      ]}
                      coverage={`${Math.round(row.coveragePct * 100)}% tracked`}
                      coverageLow={row.coveragePct < 0.5}
                      onClick={() =>
                        onStateChange(
                          drillAtLevel(state, {
                            ...drill,
                            experienceId: row.experienceId,
                            blockIndex: null,
                            componentEl: null,
                          })
                        )
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className='px-4 py-4 text-[12px] text-[var(--pv2-faint)]'>
                  {t('drill.emptyPhase')}
                </p>
              )}
            </section>
          ))}
        </div>
      );
    }

    const subjects = groupBySubject(rows);
    const { steps, leaks } = leakFunnel(rows);

    return (
      <div className='flex flex-col gap-5'>
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
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {subjects.map(subject => (
            <PulseRow
              key={subject.key}
              title={subject.key}
              subtitle={t('drill.experienceCount', {
                count: subject.rows.length,
              })}
              metrics={[
                `${fmtCount(subject.rollup.sessions)} sessions`,
                `${fmtPct(subject.rollup.cvr)} cvr`,
              ]}
              coverage={`${Math.round(
                (subject.rows.reduce(
                  (sum, row) => sum + row.coveragePct * row.sessions,
                  0
                ) /
                  Math.max(subject.rollup.sessions, 1)) *
                  100
              )}% tracked`}
              coverageLow={
                subject.rows.reduce(
                  (sum, row) => sum + row.coveragePct * row.sessions,
                  0
                ) /
                  Math.max(subject.rollup.sessions, 1) <
                0.5
              }
              onClick={() =>
                onStateChange(
                  drillAtLevel(state, {
                    campaignId: campaign.id,
                    subject: subject.key,
                    experienceId: null,
                    blockIndex: null,
                    componentEl: null,
                  })
                )
              }
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <DrillBreadcrumb crumbs={crumbs} />
      {renderBody()}
    </div>
  );
};
