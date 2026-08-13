'use client';

import { ArrowRight, BarChart3, Blocks } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { LiftPill } from '@/components/organisms/portal-v2/campaigns/detail/VerdictStats';
import { ChannelMixChart } from '@/components/organisms/portal-v2/analytics/ChannelMixChart';
import { LeakFunnelSection } from '@/components/organisms/portal-v2/analytics/LeakFunnelSection';
import { PulseFunnelChart } from '@/components/organisms/portal-v2/analytics/PulseFunnelChart';
import { PulseMetricHead } from '@/components/organisms/portal-v2/analytics/PulseMetricHead';
import { PulseRow } from '@/components/organisms/portal-v2/analytics/PulseRow';
import { TierChip } from '@/components/organisms/portal-v2/analytics/TierChip';
import { fmtMoney, fmtPct } from '@/lib/portal-v2/analytics/helpers';
import { openCampaignDrill } from '@/lib/portal-v2/analytics/params';
import type { PulseBlockRow } from '@/lib/portal-v2/analytics/pulseView';
import type { PulseViewState } from '@/lib/portal-v2/analytics/types';
import type { PulseOverviewData } from '@/services/portal-v2/analyticsPulse';

type OverviewPanelProps = {
  state: PulseViewState;
  onStateChange: (state: PulseViewState) => void;
  data: PulseOverviewData;
  blocks: PulseBlockRow[];
};

const roiLabel = (roi: number | null): string =>
  roi == null ? '—' : `${roi >= 0 ? '+' : ''}${Math.round(roi * 100)}% ROI`;

export const OverviewPanel = ({
  state,
  onStateChange,
  data,
  blocks,
}: OverviewPanelProps) => {
  const t = useTranslations('portalV2.analytics');

  if (data.error || !data.totals) {
    return (
      <p className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
        {data.error ?? t('empty.measure')}
      </p>
    );
  }

  const { totals } = data;

  // "Cần chú ý" là một phát biểu ĐO ĐƯỢC: chạy dưới nhóm đối chứng. Bản trước
  // đếm theo tình trạng quy trình (trễ hạn/rủi ro) — thứ thuộc màn Chiến dịch,
  // và ở đây thì suy từ dữ liệu mẫu.
  const belowControl = data.campaigns.filter(
    campaign => campaign.lift != null && campaign.lift < 0
  ).length;

  return (
    <div className='flex flex-col gap-6'>
      <PulseMetricHead
        rollup={totals.rollup}
        coveragePct={data.coveragePct}
        revenueUnmeasured={!totals.revenueMeasured}
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
        {data.steps.length ? (
          <PulseFunnelChart
            steps={data.steps}
            leaks={data.leaks}
            ariaLabel={t('charts.funnelAria')}
            riskLabel={t('charts.riskLabel')}
          />
        ) : (
          <p className='text-[12.5px] text-[var(--pv2-faint)]'>
            {t('empty.measure')}
          </p>
        )}
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
        {/*
          Kênh là một chiều của `fact_daily`, nhưng §8 chỉ nhận nó làm BỘ LỌC —
          không endpoint nào gộp theo kênh. Để trống có ghi lý do; lấp bằng số
          băm từ tên kênh thì biểu đồ này đọc như một phép đo.
        */}
        <ChannelMixChart rows={[]} />
        <p className='text-[12.5px] text-[var(--pv2-faint)]'>
          {t('empty.noEndpoint')}
        </p>
      </section>

      <section>
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('layers.eyebrow')}
        </p>
        <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4'>
          <div className='mb-3 flex items-start gap-3'>
            <span className='grid size-8 place-items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-ink-2)] text-[var(--pv2-paper)]'>
              <Blocks className='size-4' aria-hidden />
            </span>
            <div className='min-w-0 flex-1'>
              <strong className='block text-[14px] text-[var(--pv2-ink)]'>
                {t('layers.blocks')}
              </strong>
              <span className='text-[11.5px] text-[var(--pv2-mut)]'>
                {t('layers.blocksSub', { count: blocks.length })}
              </span>
            </div>
            <button
              type='button'
              onClick={() =>
                onStateChange({
                  ...state,
                  lens: 'insights',
                  insightType: 'blocks',
                  insightObjectId: null,
                })
              }
              className='inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--pv2-electric)]'
            >
              {t('layers.seeAll')}
              <ArrowRight className='size-3.5' aria-hidden />
            </button>
          </div>
          <div className='flex flex-col gap-1.5'>
            {blocks.length ? (
              blocks.slice(0, 3).map(block => (
                <div
                  key={block.code}
                  className='flex items-center justify-between rounded-[8px] px-2.5 py-2'
                >
                  <span className='truncate text-[12.5px] font-medium text-[var(--pv2-ink)]'>
                    {block.code}
                  </span>
                  <span className='shrink-0 text-[12px] text-[var(--pv2-mut)]'>
                    {fmtPct(block.interRate)} interact
                  </span>
                </div>
              ))
            ) : (
              <p className='px-2.5 py-2 text-[12px] text-[var(--pv2-faint)]'>
                {t('empty.layer')}
              </p>
            )}
          </div>
        </div>
        {/*
          Ba thẻ còn lại (Trải nghiệm · Sản phẩm · Hành trình) cần một bảng xếp
          hạng theo brand — chưa endpoint nào trả. Gọi lẻ từng mục thì N+1 và
          vẫn thiếu doanh thu ở grain sản phẩm.
        */}
        <p className='mt-3 text-[11.5px] text-[var(--pv2-faint)]'>
          {t('empty.layersPending')}
        </p>
      </section>

      <section>
        {belowControl ? (
          <div className='mb-3 flex items-center gap-2 rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-warning)_10%,transparent)] px-3 py-2 text-[12.5px] text-[var(--pv2-ink)]'>
            <BarChart3
              className='size-4 shrink-0 text-[var(--pv2-warning)]'
              aria-hidden
            />
            <span>{t('campaigns.belowControl', { count: belowControl })}</span>
          </div>
        ) : null}
        <p className='mb-3 text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('campaigns.eyebrow')}
        </p>
        <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          {data.campaigns.length ? (
            data.campaigns.map(campaign => (
              <div
                key={campaign.id}
                className='border-b border-[var(--pv2-hair)] last:border-b-0'
              >
                <div className='flex flex-wrap items-center gap-2 px-4 pt-3'>
                  <TierChip tier={campaign.tier} />
                  {/* lift null = KHÔNG có đối chứng để so; "+0%" là một phát
                      biểu khác hẳn và là một phát biểu sai. */}
                  {campaign.lift != null ? (
                    <LiftPill lift={campaign.lift} />
                  ) : null}
                </div>
                <PulseRow
                  title={campaign.name}
                  subtitle={t('drill.sessionsCount', {
                    count: campaign.sessions,
                  })}
                  metrics={[fmtMoney(campaign.revenue), roiLabel(campaign.roi)]}
                  onClick={() =>
                    onStateChange(openCampaignDrill(state, campaign.id))
                  }
                  className='border-b-0 md:grid-cols-[minmax(0,1.4fr)_auto_auto]'
                />
              </div>
            ))
          ) : (
            <p className='px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
              {t('empty.campaigns')}
            </p>
          )}
        </div>
      </section>

      <p className='text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
        {t('rankings.disclaimer')}{' '}
        <Link
          href='/portal-v2/ai'
          className='font-semibold text-[var(--pv2-electric)]'
        >
          {t('identity.cta')}
        </Link>
      </p>
    </div>
  );
};
