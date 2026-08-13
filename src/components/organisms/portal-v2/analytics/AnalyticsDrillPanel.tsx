'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { LiftPill } from '@/components/organisms/portal-v2/campaigns/detail/VerdictStats';
import { DrillBreadcrumb } from '@/components/organisms/portal-v2/analytics/DrillBreadcrumb';
import { LeakFunnelSection } from '@/components/organisms/portal-v2/analytics/LeakFunnelSection';
import { PulseFunnelChart } from '@/components/organisms/portal-v2/analytics/PulseFunnelChart';
import { PulseMetricHead } from '@/components/organisms/portal-v2/analytics/PulseMetricHead';
import { PulseRow } from '@/components/organisms/portal-v2/analytics/PulseRow';
import { TierChip } from '@/components/organisms/portal-v2/analytics/TierChip';
import { fmtCount, fmtMoney, fmtPct } from '@/lib/portal-v2/analytics/helpers';
import {
  clearDrill,
  drillAtLevel,
  openCampaignDrill,
} from '@/lib/portal-v2/analytics/params';
import type {
  PulseCampaignCard,
  PulseSubjectRow,
} from '@/lib/portal-v2/analytics/pulseView';
import type { PulseViewState } from '@/lib/portal-v2/analytics/types';
import {
  fetchPulseCampaign,
  fetchPulseExperience,
  type PulseCampaignData,
  type PulseExperienceData,
} from '@/services/portal-v2/analyticsPulse';

type AnalyticsDrillPanelProps = {
  state: PulseViewState;
  onStateChange: (state: PulseViewState) => void;
  /** Bảng chiến dịch đã nạp sẵn ở server — tầng 0 không phải đợi gọi lại. */
  campaigns: PulseCampaignCard[];
  brandId: string | null;
};

const roiLabel = (roi: number | null): string =>
  roi == null ? '—' : `${roi >= 0 ? '+' : ''}${Math.round(roi * 100)}% ROI`;

export const AnalyticsDrillPanel = ({
  state,
  onStateChange,
  campaigns,
  brandId,
}: AnalyticsDrillPanelProps) => {
  const t = useTranslations('portalV2.analytics');
  const { drill } = state;

  const [campaignData, setCampaignData] = useState<PulseCampaignData | null>(
    null
  );
  const [experienceData, setExperienceData] =
    useState<PulseExperienceData | null>(null);
  const [loading, setLoading] = useState(false);

  const campaignId = drill.campaignId;
  const experienceId = drill.experienceId;

  // Mỗi tầng nạp riêng khi mở, không nạp trước cả cây: một chiến dịch có thể
  // có hàng chục trải nghiệm và người dùng chỉ mở một.
  useEffect(() => {
    if (!campaignId) {
      setCampaignData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchPulseCampaign(campaignId, brandId)
      .then(data => {
        if (alive) setCampaignData(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [campaignId, brandId]);

  useEffect(() => {
    if (!experienceId) {
      setExperienceData(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchPulseExperience(experienceId, brandId)
      .then(data => {
        if (alive) setExperienceData(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [experienceId, brandId]);

  /* ── tầng 0: chọn chiến dịch ────────────────────────────────────────────── */

  if (!campaignId) {
    return (
      <div>
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('drill.boardEyebrow')}
        </p>
        {campaigns.length ? (
          <div className='grid gap-3 md:grid-cols-2'>
            {campaigns.map(campaign => (
              <button
                key={campaign.id}
                type='button'
                onClick={() =>
                  onStateChange(openCampaignDrill(state, campaign.id))
                }
                className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4 text-left transition-colors hover:border-[var(--pv2-electric)]'
              >
                <div className='mb-2 flex items-start justify-between gap-3'>
                  <strong className='font-[family-name:var(--pv2-disp)] text-[15px] text-[var(--pv2-ink)]'>
                    {campaign.name}
                  </strong>
                  <TierChip tier={campaign.tier} />
                </div>
                <p className='text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
                  {t('drill.sessionsCount', { count: campaign.sessions })} ·{' '}
                  {fmtPct(campaign.cvr)} cvr
                </p>
                <p className='mt-3 flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--pv2-ink)]'>
                  <em className='text-[var(--pv2-mut)] not-italic'>
                    {fmtMoney(campaign.revenue)}
                  </em>
                  <strong>{roiLabel(campaign.roi)}</strong>
                  {campaign.lift != null ? (
                    <LiftPill lift={campaign.lift} />
                  ) : null}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
            {t('empty.campaigns')}
          </p>
        )}
      </div>
    );
  }

  /* ── breadcrumb ─────────────────────────────────────────────────────────── */

  const campaign = campaignData?.campaign ?? null;
  const subject: PulseSubjectRow | null =
    campaign && drill.subject
      ? (campaign.subjects.find(item => item.itemId === drill.subject) ?? null)
      : null;
  const experienceRow =
    subject && experienceId
      ? (subject.experiences.find(item => item.pageId === experienceId) ?? null)
      : null;

  const crumbs: { label: string; onClick: () => void }[] = [
    {
      label: t('drill.allCampaigns'),
      onClick: () => onStateChange(clearDrill(state)),
    },
    {
      label: campaign?.name ?? campaignId,
      onClick: () =>
        onStateChange(
          drillAtLevel(state, {
            campaignId,
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
      label: subject?.name ?? drill.subject,
      onClick: () =>
        onStateChange(
          drillAtLevel(state, {
            campaignId,
            subject: drill.subject,
            experienceId: null,
            blockIndex: null,
            componentEl: null,
          })
        ),
    });
  }

  if (experienceId) {
    crumbs.push({
      label: experienceRow?.name ?? experienceId,
      onClick: () => undefined,
    });
  }

  const busy = (
    <p className='px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
      {t('loading')}
    </p>
  );

  const renderBody = () => {
    /* ── tầng 3: một trải nghiệm → phễu riêng + bảng block ────────────────── */

    if (experienceId) {
      if (loading && !experienceData) return busy;
      if (!experienceData) return null;
      if (experienceData.error) {
        return (
          <p className='px-4 py-8 text-center text-[13px] text-[var(--pv2-error)]'>
            {experienceData.error}
          </p>
        );
      }
      if (!experienceData.measured) {
        return (
          <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
            {t('empty.unmeasured')}
          </p>
        );
      }

      const maximum = experienceData.steps[0]?.value || 1;

      return (
        <div className='flex flex-col gap-5'>
          <div className='flex flex-wrap items-center gap-2'>
            <TierChip tier={experienceData.tier} />
            {experienceData.lift != null ? (
              <LiftPill lift={experienceData.lift} />
            ) : null}
            <span className='text-[12px] text-[var(--pv2-mut)]'>
              {experienceData.coveragePct == null
                ? t('rankings.untracked')
                : t('drill.coverage', { pct: experienceData.coveragePct })}
            </span>
          </div>

          <div>
            <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
              {t('drill.experienceFunnel', {
                name: experienceRow?.name ?? '',
              })}
            </p>
            {experienceData.steps.length ? (
              <div className='space-y-2'>
                {experienceData.steps.map(step => (
                  <div
                    key={step.label}
                    className='grid grid-cols-[120px_1fr_auto] items-center gap-3'
                  >
                    <span className='text-[12px] text-[var(--pv2-mut)]'>
                      {step.label}
                    </span>
                    <span className='h-2 overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
                      <span
                        className='block h-full rounded-full bg-[var(--pv2-electric)]'
                        style={{
                          width: `${Math.round((step.value / maximum) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className='text-[12px] text-[var(--pv2-ink)] tabular-nums'>
                      {fmtCount(step.value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-[12.5px] text-[var(--pv2-faint)]'>
                {t('empty.measure')}
              </p>
            )}
          </div>

          <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
            {experienceData.blocks.length ? (
              experienceData.blocks.map(block => (
                <PulseRow
                  key={block.code}
                  title={block.code}
                  subtitle={`${block.role} · ${
                    block.topComponent
                      ? block.topComponent.meaning || block.topComponent.key
                      : t('rankings.untracked')
                  }`}
                  metrics={[
                    `${fmtCount(block.views)} views`,
                    `${fmtPct(block.doneRate)} done · ${fmtPct(block.exitRate)} exit`,
                  ]}
                  coverage={`${fmtPct(block.interRate)} interact`}
                />
              ))
            ) : (
              <p className='px-4 py-5 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('block.untracked')}
              </p>
            )}
          </div>

          {/*
            Khoan xuống component dừng ở đây: `/intel/blocks` chỉ trả MỘT
            component mạnh nhất mỗi loại khối, và không trả `block_key` để hỏi
            tiếp. Dữ liệu có sẵn trong `fact_daily` (component_key/signals/
            assists) — chỉ thiếu endpoint.
          */}
          <p className='text-[11.5px] text-[var(--pv2-faint)]'>
            {t('empty.componentDrill')}
          </p>
        </div>
      );
    }

    if (loading && !campaignData) return busy;
    if (campaignData?.error) {
      return (
        <p className='px-4 py-8 text-center text-[13px] text-[var(--pv2-error)]'>
          {campaignData.error}
        </p>
      );
    }
    if (!campaignData || !campaign) return null;

    /* ── tầng 2: một hạng mục → các trải nghiệm ───────────────────────────── */

    if (subject) {
      return (
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {subject.experiences.length ? (
            subject.experiences.map(row => (
              <PulseRow
                key={row.pageId}
                title={row.name}
                subtitle={t('drill.sessionsCount', { count: row.sessions })}
                metrics={[
                  `${fmtPct(row.cvr)} cvr`,
                  row.lift == null
                    ? t('rankings.untracked')
                    : `${row.lift >= 0 ? '+' : '−'}${Math.abs(Math.round(row.lift * 100))}% lift`,
                ]}
                coverage={row.tier}
                onClick={() =>
                  onStateChange(
                    drillAtLevel(state, {
                      ...drill,
                      experienceId: row.pageId,
                      blockIndex: null,
                      componentEl: null,
                    })
                  )
                }
              />
            ))
          ) : (
            <p className='px-4 py-4 text-[12px] text-[var(--pv2-faint)]'>
              {t('drill.emptyPhase')}
            </p>
          )}
        </div>
      );
    }

    /* ── tầng 1: một chiến dịch → các hạng mục ────────────────────────────── */

    return (
      <div className='flex flex-col gap-5'>
        {campaignData.totals ? (
          <PulseMetricHead
            rollup={campaignData.totals.rollup}
            coveragePct={null}
            revenueUnmeasured={!campaignData.totals.revenueMeasured}
            labels={{
              sessions: t('metrics.sessions'),
              conversion: t('metrics.conversion'),
              revenue: t('metrics.revenue'),
              roas: t('metrics.roas'),
              coverage: t('metrics.coverage'),
            }}
          />
        ) : null}

        <LeakFunnelSection
          title={t('charts.funnelTitle')}
          hint={t('charts.funnelSub')}
          note={t('charts.funnelNote')}
        >
          {campaignData.steps.length ? (
            <PulseFunnelChart
              steps={campaignData.steps}
              leaks={campaignData.leaks}
              ariaLabel={t('charts.funnelAria')}
              riskLabel={t('charts.riskLabel')}
            />
          ) : (
            <p className='text-[12.5px] text-[var(--pv2-faint)]'>
              {t('empty.measure')}
            </p>
          )}
        </LeakFunnelSection>

        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {campaign.subjects.length ? (
            campaign.subjects.map(item => (
              <PulseRow
                key={item.itemId}
                title={item.name}
                subtitle={t('drill.experienceCount', {
                  count: item.experiences.length,
                })}
                metrics={[
                  t('drill.sessionsCount', { count: item.sessions }),
                  `${fmtPct(item.cvr)} cvr`,
                ]}
                coverage={item.tier}
                onClick={() =>
                  onStateChange(
                    drillAtLevel(state, {
                      campaignId,
                      subject: item.itemId,
                      experienceId: null,
                      blockIndex: null,
                      componentEl: null,
                    })
                  )
                }
              />
            ))
          ) : (
            <p className='px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
              {t('empty.measure')}
            </p>
          )}
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
